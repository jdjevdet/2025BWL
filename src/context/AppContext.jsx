import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { db, storage } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { isExclusivePicksMatch, isExemptFromExclusive, getPicksTakenByOthers } from '../utils/helpers';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [minimizedEvents, setMinimizedEvents] = useState([]);
  const [isPlayerManagementMinimized, setIsPlayerManagementMinimized] = useState(false);
  const [isHallOfFameMinimized, setIsHallOfFameMinimized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [authenticatedPlayerId, setAuthenticatedPlayerId] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedPlayerName, setSelectedPlayerName] = useState(null);

  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('2025/2026');

  // Firebase subscriptions
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubscribePlayers = onSnapshot(collection(db, "players"), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubscribeHoF = onSnapshot(collection(db, "hallOfFame"), (snapshot) => {
      setHallOfFameEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubscribeEvents(); unsubscribePlayers(); unsubscribeHoF(); };
  }, []);

  const allSortedEvents = useMemo(() => [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const validA = !isNaN(dateA);
    const validB = !isNaN(dateB);
    if (!validA && !validB) return 0;
    if (!validA) return 1;
    if (!validB) return -1;
    return dateA - dateB;
  }), [events]);

  const sortedEvents = useMemo(() =>
    allSortedEvents.filter(e => (e.season || '2025/2026') === selectedSeason),
    [allSortedEvents, selectedSeason]);

  // Auto-transition open events past deadline to live
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const autoTransitionedRef = useRef(new Set());
  useEffect(() => {
    const timer = setInterval(() => {
      eventsRef.current.forEach(event => {
        if (event.status === 'open' && event.deadline && new Date(event.deadline) <= new Date() && !autoTransitionedRef.current.has(event.id)) {
          autoTransitionedRef.current.add(event.id);
          updateEvent(event.id, { status: 'live' });
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleMinimizeEvent = (eventId) => {
    setMinimizedEvents(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
  };

  // Firebase CRUD
  const handlePicksSubmitted = async (eventId, playerName) => {
    const eventRef = doc(db, "events", eventId);
    const event = events.find(e => e.id === eventId);
    if (event) {
      const submittedPlayers = event.submittedPlayers || [];
      if (!submittedPlayers.includes(playerName)) {
        await setDoc(eventRef, { submittedPlayers: [...submittedPlayers, playerName] }, { merge: true });
      }
    }
  };

  const resetPlayerPick = async (eventId, matchId, playerName) => {
    if (!isAdmin) { alert("Only admins can reset picks."); return; }
    const player = players.find(p => p.name === playerName);
    if (!player) { alert("Player not found."); return; }
    const event = events.find(e => e.id === eventId);
    const match = event?.matches?.find(m => m.id === matchId);
    const matchTitle = match?.title || 'this match';
    if (!window.confirm(`Reset ${playerName}'s pick for "${matchTitle}"?`)) return;
    try {
      const pickKey = `${eventId}-${matchId}`;
      await setDoc(doc(db, "players", player.id), { picks: { [pickKey]: deleteField() } }, { merge: true });
      alert(`${playerName}'s pick for "${matchTitle}" has been reset.`);
    } catch (error) {
      console.error("Error resetting player pick: ", error);
      alert("Failed to reset pick.");
    }
  };

  const resetAllPlayerPicks = async (eventId, playerName) => {
    if (!isAdmin) { alert("Only admins can reset picks."); return; }
    const player = players.find(p => p.name === playerName);
    if (!player) { alert("Player not found."); return; }
    if (!window.confirm(`Reset ALL picks for ${playerName} for this event?`)) return;
    try {
      const picksToDelete = {};
      Object.keys(player.picks || {}).forEach(key => {
        if (key.startsWith(`${eventId}-`)) picksToDelete[key] = deleteField();
      });
      if (Object.keys(picksToDelete).length > 0) {
        await setDoc(doc(db, "players", player.id), { picks: picksToDelete }, { merge: true });
      }
      const event = events.find(e => e.id === eventId);
      if (event?.submittedPlayers?.includes(playerName)) {
        await setDoc(doc(db, "events", eventId), { submittedPlayers: event.submittedPlayers.filter(name => name !== playerName) }, { merge: true });
      }
      alert(`All picks for ${playerName} have been reset.`);
    } catch (error) {
      console.error("Error resetting player picks: ", error);
      alert("Failed to reset picks.");
    }
  };

  const handleAdminLogin = (password) => {
    if (password === 'ssj') { setIsAdmin(true); setCurrentView('admin'); return true; }
    else { alert('Incorrect password'); return false; }
  };

  const createNewEvent = async () => {
    try {
      const docRef = await addDoc(collection(db, "events"), { name: 'NEW EVENT', date: 'TBD', status: 'upcoming', season: selectedSeason, bannerImage: null, matches: [], submittedPlayers: [] });
      setEditingEvent(docRef.id);
    } catch (error) {
      console.error("Error creating new event:", error);
      alert("Could not create new event.");
    }
  };

  const updateEvent = async (eventId, dataFromState) => {
    try {
      const eventDataToSave = { ...dataFromState };
      if (dataFromState.imageFile) {
        const imageFile = dataFromState.imageFile;
        const storageRef = ref(storage, `event_banners/${eventId}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        eventDataToSave.bannerImage = await getDownloadURL(uploadResult.ref);
      }
      delete eventDataToSave.imageFile;
      delete eventDataToSave.id;
      await setDoc(doc(db, "events", eventId), eventDataToSave, { merge: true });
    } catch (error) {
      console.error("ERROR UPDATING EVENT:", error);
      alert(`Failed to save event. Error: ${error.message}`);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      if (editingEvent === eventId) setEditingEvent(null);
    } catch (error) { console.error("Error deleting event: ", error); alert("Failed to delete event."); }
  };

  const addMatch = async (eventId, newMatch) => {
    if (newMatch.title && newMatch.options.filter(o => o).length >= 2) {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      const newMatchData = { id: Date.now().toString(), title: newMatch.title, options: newMatch.options.filter(o => o), winner: null };
      try {
        await setDoc(doc(db, "events", eventId), { matches: [...(event.matches || []), newMatchData] }, { merge: true });
      } catch (error) { console.error("Error adding match: ", error); alert("Failed to add match."); }
    }
  };

  const addOptionToMatch = async (eventId, matchId, newOption) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const match = event.matches?.find(m => m.id === matchId);
    if (!match) return;
    if (match.options.includes(newOption)) { alert("This option already exists."); return; }
    const updatedMatches = event.matches.map(m => m.id === matchId ? { ...m, options: [...m.options, newOption] } : m);
    try {
      await setDoc(doc(db, "events", eventId), { matches: updatedMatches }, { merge: true });
    } catch (error) { console.error("Error adding option to match: ", error); alert("Failed to add option."); }
  };

  const submitPick = async (eventId, matchId, pick) => {
    if (!currentUser) { alert("Please select a player before making picks."); return; }
    const authedPlayer = players.find(p => p.name === currentUser);
    if (authedPlayer?.pin && authenticatedPlayerId !== authedPlayer.id) { alert("Please enter your PIN first."); return; }
    const event = events.find(e => e.id === eventId);
    const match = event?.matches?.find(m => m.id === matchId);
    if (isExclusivePicksMatch(event, match?.title) && !isExemptFromExclusive(pick)) {
      const takenPicks = getPicksTakenByOthers(players, eventId, matchId, currentUser);
      if (takenPicks[pick]) { alert(`This pick has already been taken by ${takenPicks[pick]}.`); return; }
    }
    const player = players.find(p => p.name === currentUser);
    if (player) {
      try {
        await setDoc(doc(db, "players", player.id), { picks: { ...player.picks, [`${eventId}-${matchId}`]: pick } }, { merge: true });
      } catch (error) { console.error("Error submitting pick: ", error); alert("Failed to submit pick."); }
    }
  };

  const deletePlayer = async (playerId) => {
    try {
      const playerToDelete = players.find(p => p.id === playerId);
      if (playerToDelete?.name === currentUser) {
        const otherPlayers = players.filter(p => p.id !== playerId);
        setCurrentUser(otherPlayers.length > 0 ? otherPlayers[0].name : null);
      }
      await deleteDoc(doc(db, "players", playerId));
    } catch (error) { console.error("Error deleting player: ", error); alert("Failed to delete player."); }
  };

  const addPlayer = async (playerName) => {
    if (playerName.trim()) {
      try { await addDoc(collection(db, "players"), { name: playerName.trim(), picks: {} }); }
      catch (error) { console.error("Error adding player: ", error); alert("Failed to add player."); }
    }
  };

  const adjustBonusPoints = async (playerId, adjustment) => {
    if (!isAdmin) { alert("Only admins can adjust points."); return; }
    const player = players.find(p => p.id === playerId);
    if (!player) { alert("Player not found."); return; }
    try {
      await setDoc(doc(db, "players", playerId), { bonusPoints: (player.bonusPoints || 0) + adjustment }, { merge: true });
    } catch (error) { console.error("Error adjusting bonus points: ", error); alert("Failed to adjust points."); }
  };

  const uploadAvatar = async (playerId, file) => {
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB."); return; }
    setAvatarUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${playerId}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "players", playerId), { avatarUrl: url }, { merge: true });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar.");
    }
    setAvatarUploading(false);
  };

  const removeAvatar = async (playerId) => {
    try {
      await setDoc(doc(db, "players", playerId), { avatarUrl: deleteField() }, { merge: true });
    } catch (error) {
      console.error("Error removing avatar:", error);
      alert("Failed to remove avatar.");
    }
  };

  const addHallOfFameEntry = async (newEntry) => {
    try {
      const { imageFile, ...rest } = newEntry;
      let imageUrl = newEntry.imageUrl || null;
      if (imageFile) {
        const storageRef = ref(storage, `hall_of_fame/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      delete rest.imageUrl;
      await addDoc(collection(db, "hallOfFame"), { ...rest, imageUrl });
    } catch (error) { console.error("Error adding Hall of Fame entry: ", error); alert("Failed to add Hall of Fame entry."); }
  };

  const updateHallOfFameEntry = async (id, updates) => {
    try {
      const { imageFile, ...rest } = updates;
      let imageUrl = updates.imageUrl || null;
      if (imageFile) {
        const storageRef = ref(storage, `hall_of_fame/${id}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      delete rest.imageUrl;
      await setDoc(doc(db, "hallOfFame", id), { ...rest, imageUrl }, { merge: true });
    } catch (error) { console.error("Error updating Hall of Fame entry: ", error); alert("Failed to update."); }
  };

  const deleteHallOfFameEntry = async (id) => {
    try { await deleteDoc(doc(db, "hallOfFame", id)); }
    catch (error) { console.error("Error deleting Hall of Fame entry: ", error); alert("Failed to delete."); }
  };

  const navigateToPlayer = (playerName) => {
    setSelectedPlayerName(playerName);
    setCurrentView('player-profile');
  };

  const awardBadge = async (playerId, badgeId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const currentBadges = player.manualBadges || [];
    if (currentBadges.includes(badgeId)) return;
    try {
      await setDoc(doc(db, "players", playerId), { manualBadges: [...currentBadges, badgeId] }, { merge: true });
    } catch (error) { console.error("Error awarding badge:", error); alert("Failed to award badge."); }
  };

  const revokeBadge = async (playerId, badgeId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const currentBadges = player.manualBadges || [];
    try {
      await setDoc(doc(db, "players", playerId), { manualBadges: currentBadges.filter(b => b !== badgeId) }, { merge: true });
    } catch (error) { console.error("Error revoking badge:", error); alert("Failed to revoke badge."); }
  };


  const value = {
    currentView, setCurrentView,
    isAdmin, setIsAdmin,
    selectedEvent, setSelectedEvent,
    currentUser, setCurrentUser,
    minimizedEvents, toggleMinimizeEvent,
    isPlayerManagementMinimized, setIsPlayerManagementMinimized,
    isHallOfFameMinimized, setIsHallOfFameMinimized,
    isMenuOpen, setIsMenuOpen,
    authenticatedPlayerId, setAuthenticatedPlayerId,
    avatarUploading, setAvatarUploading,
    events, players, hallOfFameEntries, sortedEvents, allSortedEvents,
    selectedSeason, setSelectedSeason,
    editingEvent, setEditingEvent,
    handlePicksSubmitted, resetPlayerPick, resetAllPlayerPicks,
    handleAdminLogin, createNewEvent, updateEvent, deleteEvent,
    addMatch, addOptionToMatch, submitPick,
    deletePlayer, addPlayer, adjustBonusPoints,
    uploadAvatar, removeAvatar,
    addHallOfFameEntry, updateHallOfFameEntry, deleteHallOfFameEntry,
    selectedPlayerName, setSelectedPlayerName, navigateToPlayer,
    awardBadge, revokeBadge,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
