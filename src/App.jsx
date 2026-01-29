import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Calendar, Plus, Edit2, Trash2, Save, Award, Lock, Unlock, Users, ChevronUp, ChevronDown, X, Menu } from 'lucide-react';

// Import Firebase and your configuration
import { db, storage } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddMatchForm = ({ eventId, onAddMatch }) => {
    const [newMatch, setNewMatch] = useState({ title: '', options: ['', ''] });

    const handleAddMatch = () => {
      onAddMatch(eventId, newMatch);
      setNewMatch({ title: '', options: ['', ''] });
    };

    return (
      <div className="mt-4 bg-black p-4 rounded-lg border border-gray-800">
        <h5 className="text-white font-semibold mb-3">Add New Match</h5>
        <input
          type="text"
          placeholder="Match title"
          value={newMatch.title}
          onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white mb-2 border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
        />
        {newMatch.options.map((option, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={option}
            onChange={(e) => {
              const newOptions = [...newMatch.options];
              newOptions[idx] = e.target.value;
              setNewMatch({ ...newMatch, options: newOptions });
            }}
            className="w-full px-3 py-2 rounded bg-gray-900 text-white mb-2 border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
          />
        ))}
        <div className="flex space-x-2">
          <button
            onClick={() => setNewMatch({ ...newMatch, options: [...newMatch.options, ''] })}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-all duration-300 border border-gray-700"
          >
            + Add Option
          </button>
          <button
            onClick={handleAddMatch}
            className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded text-sm transition-all duration-300 transform hover:scale-105"
          >
            Add Match
          </button>
        </div>
      </div>
    );
};

const EventEditorCard = ({
    event,
    isEditing,
    onSave,
    onSetEditing,
    onDelete,
    onUpdateEvent,
    onAddMatch,
    onResetPlayerPick,
    onResetAllPlayerPicks,
    players,
    animationDelay,
    isMinimized,
    onToggleMinimize,
}) => {
    const [localData, setLocalData] = useState(event);

    useEffect(() => {
        setLocalData(event);
    }, [event]);

    const handleSave = () => {
        onSave(event.id, localData);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const localImageUrl = URL.createObjectURL(file);
            setLocalData(prev => ({ ...prev, bannerImage: localImageUrl, imageFile: file }));
        }
    };

    return (
        <div
          className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              {isEditing && !isMinimized ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={localData.name}
                    onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
                    placeholder="Event name"
                  />
                  <input
                    type="text"
                    value={localData.date}
                    onChange={(e) => setLocalData({ ...localData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
                    placeholder="Event date"
                  />
                  <select
                    value={localData.status}
                    onChange={(e) => setLocalData({ ...localData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="open">Open for Picks</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-white transition-all duration-300">
                    <label className="cursor-pointer block text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="text-gray-400 hover:text-white transition-colors">
                        {localData.bannerImage ? (
                          <div>
                            <img src={localData.bannerImage} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                            <p className="text-sm">Click to change banner image</p>
                          </div>
                        ) : (
                          <p>Click to upload banner image</p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                  <p className="text-gray-400">{event.date}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                    event.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                    event.status === 'live' ? 'border-red-500 text-red-500 bg-red-500/10' :
                    event.status === 'open' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                    'border-gray-500 text-gray-500 bg-gray-500/10'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                  {event.bannerImage && !isMinimized && (
                    <div className="mt-3">
                      <img src={event.bannerImage} alt={event.name} className="w-48 h-24 object-cover rounded border border-gray-700" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-2 flex-shrink-0">
               <button
                onClick={() => onToggleMinimize(event.id)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300"
              >
                {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
              <button
                onClick={() => isEditing ? handleSave() : onSetEditing(event.id)}
                className="p-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-all duration-300"
              >
                {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMinimized ? 'max-h-0' : 'max-h-screen'}`}>
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">Matches</h4>
                <div className="space-y-3">
                  {event.matches && event.matches.map(match => (
                    <div key={match.id} className="bg-black p-4 rounded-lg border border-gray-800">
                      <p className="text-white font-semibold mb-2">{match.title}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {match.options.map((option, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                            {option}
                          </span>
                        ))}
                      </div>
                      {(event.status === 'completed' || event.status === 'live') && (
                        <select
                          value={match.winner || ''}
                          onChange={(e) => {
                            const updatedMatches = event.matches.map(m =>
                              m.id === match.id ? { ...m, winner: e.target.value } : m
                            );
                            onUpdateEvent(event.id, { matches: updatedMatches });
                          }}
                          className="w-full px-3 py-2 rounded bg-gray-900 text-white text-sm border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
                        >
                          <option value="">Select winner...</option>
                          {match.options.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {match.winner && (
                        <p className="text-green-400 mt-2 text-sm">Winner: {match.winner}</p>
                      )}
                    </div>
                  ))}
                </div>
                { isEditing && <AddMatchForm eventId={event.id} onAddMatch={onAddMatch} /> }
              </div>

              {/* Reset Player Picks Section - Only show for open events */}
              {event.status === 'open' && players && players.length > 0 && (
                <div className="mt-6 bg-red-900/20 p-4 rounded-lg border border-red-800">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Reset Player Picks</h4>
                  
                  {/* Per-match pick reset */}
                  {event.matches && event.matches.map(match => {
                    // Find all players who have picked for this match
                    const playersWithPicks = players.filter(p => 
                      p.picks && p.picks[`${event.id}-${match.id}`]
                    );
                    
                    if (playersWithPicks.length === 0) return null;
                    
                    return (
                      <div key={match.id} className="mb-4 bg-black/50 p-3 rounded-lg">
                        <p className="text-white text-sm font-semibold mb-2">{match.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {playersWithPicks.map(player => (
                            <button
                              key={player.id}
                              onClick={() => onResetPlayerPick(event.id, match.id, player.name)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-all duration-300 flex items-center space-x-1"
                              title={`Reset ${player.name}'s pick: ${player.picks[`${event.id}-${match.id}`]}`}
                            >
                              <span>{player.name}: {player.picks[`${event.id}-${match.id}`]}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Reset all picks for a player */}
                  {event.submittedPlayers && event.submittedPlayers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-800">
                      <p className="text-gray-400 text-sm mb-2">Reset ALL picks & allow re-submission:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.submittedPlayers.map(playerName => (
                          <button
                            key={playerName}
                            onClick={() => onResetAllPlayerPicks(event.id, playerName)}
                            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm transition-all duration-300 flex items-center space-x-2"
                          >
                            <span>Reset All: {playerName}</span>
                            <X className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
    );
};


const FantasyWrestlingApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [particles, setParticles] = useState([]);
  const [minimizedEvents, setMinimizedEvents] = useState([]);
  const [isPlayerManagementMinimized, setIsPlayerManagementMinimized] = useState(false);
  const [isHallOfFameMinimized, setIsHallOfFameMinimized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);

  const [editingEvent, setEditingEvent] = useState(null);

  const historicalScores = {
    'BACKLASH': { 'Erik': 5, 'Albert': 5, 'Johnny': 4, 'Jordan': 4, 'Matt': 4, 'Derick': 4, 'Marcus': 4, 'Jaydan': 3, 'George': 3, 'Rob': 2 },
    'MONEY IN THE BANK': { 'Matt': 4, 'Johnny': 3, 'Jaydan': 3, 'Erik': 3, 'Albert': 3, 'Rob': 3, 'Marcus': 3, 'Jordan': 2, 'George': 2, 'Derick': 2 },
    'NIGHT OF CHAMPIONS': { 'Jordan': 6, 'Johnny': 5, 'Jaydan': 5, 'Matt': 5, 'George': 5, 'Derick': 5, 'Rob': 5, 'Erik': 4, 'Albert': 4, 'Marcus': 3 },
    'SUMMERSLAM': { 'Johnny': 9, 'Erik': 9, 'Jordan': 8, 'Rob': 8, 'Jaydan': 7, 'Matt': 7, 'Albert': 7, 'George': 6, 'Derick': 6, 'Marcus': 6 },
    'CLASH IN PARIS': { 'Johnny': 6, 'Matt': 6, 'Erik': 6, 'George': 6, 'Albert': 6, 'Jordan': 5, 'Jaydan': 5, 'Derick': 5, 'Marcus': 5, 'Rob': 5 },
    'WRESTLEPALOOZA': { 'Johnny': 4, 'Jordan': 4, 'Jaydan': 4, 'Erik': 4, 'Derick': 4, 'Albert': 4, 'Matt': 3, 'George': 3, 'Rob': 1, 'Marcus': 0 },
    'CROWN JEWEL': { 'Derick': 5, 'Johnny': 4, 'Erik': 4, 'George': 4, 'Albert': 4, 'Matt': 3, 'Rob': 2, 'Jordan': 0, 'Jaydan': 0, 'Marcus': 0 }
  };
  const historicalEventNames = Object.keys(historicalScores);

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
    });

    const unsubscribePlayers = onSnapshot(collection(db, "players"), (snapshot) => {
        const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData);
    });

    const unsubscribeHoF = onSnapshot(collection(db, "hallOfFame"), (snapshot) => {
        const hofData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHallOfFameEntries(hofData);
    });
    
    return () => {
        unsubscribeEvents();
        unsubscribePlayers();
        unsubscribeHoF();
    };
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  // Helper function to check if an event is the Royal Rumble (exclusive picks mode)
  const isExclusivePicksEvent = (event) => {
    return event?.name?.toLowerCase().includes('royal rumble');
  };

  // Helper function to check if a specific match should use exclusive picks mode
  const isExclusivePicksMatch = (event, matchTitle) => {
    if (!isExclusivePicksEvent(event)) return false;
    
    // Normalize the match title: lowercase and replace all types of quotes/apostrophes with regular apostrophe
    const normalizedTitle = matchTitle?.toLowerCase()
      .replace(/['''`´]/g, "'")  // Replace all quote variants with regular apostrophe
      .trim();
    
    const exclusiveMatchTitles = [
      "men's royal rumble match",
      "women's royal rumble match"
    ];
    return exclusiveMatchTitles.includes(normalizedTitle);
  };

  // Helper function to check if an option is exempt from exclusive picks (e.g., "OTHER")
  const isExemptFromExclusive = (option) => {
    return option?.toLowerCase() === 'other';
  };

  // Helper function to get all players who picked OTHER for a specific match (excluding current user)
  const getOtherPickers = (eventId, matchId, currentPlayerName) => {
    const pickKey = `${eventId}-${matchId}`;
    const otherPickers = [];
    
    players.forEach(player => {
      if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
        if (isExemptFromExclusive(player.picks[pickKey])) {
          otherPickers.push(player.name);
        }
      }
    });
    
    return otherPickers; // Returns array of player names who picked OTHER
  };

  // Helper function to get picks taken by OTHER players for a specific match
  const getPicksTakenByOthers = (eventId, matchId, currentPlayerName) => {
    const pickKey = `${eventId}-${matchId}`;
    const takenPicks = {};
    
    players.forEach(player => {
      if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
        const pick = player.picks[pickKey];
        // Don't mark exempt options (like "OTHER") as taken
        if (!isExemptFromExclusive(pick)) {
          takenPicks[pick] = player.name;
        }
      }
    });
    
    return takenPicks; // Returns { "option": "playerName who picked it" }
  };

  useEffect(() => {
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 13 + 9,
      delay: Math.random() * 7,
      initialDirectionX: (Math.random() - 0.5) * 2,
      initialDirectionY: (Math.random() - 0.5) * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Removed auto-selection of first player - users must explicitly select their name
  // This ensures exclusive picks show correctly for all players
  
  const calculateTotalPoints = (player, allEvents) => {
    let historicalTotal = 0;
    if(player.name){
        historicalEventNames.forEach(eventName => {
            if (historicalScores[eventName] && historicalScores[eventName][player.name] !== undefined) {
                historicalTotal += historicalScores[eventName][player.name];
            }
        });
    }

    let firebaseTotal = 0;
    allEvents.forEach(event => {
        if (!historicalEventNames.includes(event.name.toUpperCase())) {
            if ((event.status === 'completed' || event.status === 'live') && event.matches) {
                event.matches.forEach(match => {
                    const pickKey = `${event.id}-${match.id}`;
                    if (match.winner && player.picks && player.picks[pickKey] === match.winner) {
                        firebaseTotal += 1;
                    }
                });
            }
        }
    });

    return historicalTotal + firebaseTotal;
  }

  const toggleMinimizeEvent = (eventId) => {
    setMinimizedEvents(prev => 
        prev.includes(eventId) 
            ? prev.filter(id => id !== eventId)
            : [...prev, eventId]
    );
  };

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

  // Admin function to reset a player's pick for a specific match
  const resetPlayerPick = async (eventId, matchId, playerName) => {
    if (!isAdmin) {
        alert("Only admins can reset picks.");
        return;
    }
    
    const player = players.find(p => p.name === playerName);
    if (!player) {
        alert("Player not found.");
        return;
    }

    const event = events.find(e => e.id === eventId);
    const match = event?.matches?.find(m => m.id === matchId);
    const matchTitle = match?.title || 'this match';

    const confirmReset = window.confirm(`Are you sure you want to reset ${playerName}'s pick for "${matchTitle}"?`);
    if (!confirmReset) return;

    try {
        // Remove only the specific pick for this match using deleteField()
        const pickKey = `${eventId}-${matchId}`;
        
        const playerRef = doc(db, "players", player.id);
        await setDoc(playerRef, { 
            picks: { 
                [pickKey]: deleteField() 
            } 
        }, { merge: true });

        alert(`${playerName}'s pick for "${matchTitle}" has been reset.`);
    } catch (error) {
        console.error("Error resetting player pick: ", error);
        alert("Failed to reset pick.");
    }
  };

  // Admin function to reset ALL of a player's picks for an event and allow re-submission
  const resetAllPlayerPicks = async (eventId, playerName) => {
    if (!isAdmin) {
        alert("Only admins can reset picks.");
        return;
    }
    
    const player = players.find(p => p.name === playerName);
    if (!player) {
        alert("Player not found.");
        return;
    }

    const confirmReset = window.confirm(`Are you sure you want to reset ALL picks for ${playerName} for this event? This will also allow them to re-submit their picks.`);
    if (!confirmReset) return;

    try {
        // Build an object with deleteField() for each pick to remove
        const picksToDelete = {};
        Object.keys(player.picks || {}).forEach(key => {
            if (key.startsWith(`${eventId}-`)) {
                picksToDelete[key] = deleteField();
            }
        });
        
        // Only update if there are picks to delete
        if (Object.keys(picksToDelete).length > 0) {
            const playerRef = doc(db, "players", player.id);
            await setDoc(playerRef, { picks: picksToDelete }, { merge: true });
        }

        // Remove player from submittedPlayers list for this event
        const event = events.find(e => e.id === eventId);
        if (event && event.submittedPlayers?.includes(playerName)) {
            const eventRef = doc(db, "events", eventId);
            const updatedSubmitted = event.submittedPlayers.filter(name => name !== playerName);
            await setDoc(eventRef, { submittedPlayers: updatedSubmitted }, { merge: true });
        }

        alert(`All picks for ${playerName} have been reset. They can now make new picks.`);
    } catch (error) {
        console.error("Error resetting player picks: ", error);
        alert("Failed to reset picks.");
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'ssj') {
      setIsAdmin(true);
      setCurrentView('admin');
    } else {
      alert('Incorrect password');
    }
  };

  const createNewEvent = async () => {
    const newEventData = {
      name: 'NEW EVENT',
      date: 'TBD',
      status: 'upcoming',
      bannerImage: null,
      matches: [],
      submittedPlayers: []
    };
    try {
        const docRef = await addDoc(collection(db, "events"), newEventData);
        setEditingEvent(docRef.id);
    } catch (error) {
        console.error("Error creating new event:", error);
        alert("Could not create new event. Check Firestore security rules and console for details.");
    }
  };
  
  const updateEvent = async (eventId, dataFromState) => {
    try {
        const eventDataToSave = { ...dataFromState };
        const eventRef = doc(db, "events", eventId);

        if (dataFromState.imageFile) {
            const imageFile = dataFromState.imageFile;
            const storageRef = ref(storage, `event_banners/${eventId}_${imageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            eventDataToSave.bannerImage = downloadURL;
        }

        delete eventDataToSave.imageFile;
        delete eventDataToSave.id;

        await setDoc(eventRef, eventDataToSave, { merge: true });

    } catch (error) {
        console.error("ERROR UPDATING EVENT:", error);
        alert(`Failed to save event. Check Firestore security rules. Error: ${error.message}`);
    }
  };


  const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, "events", eventId));
        if (editingEvent === eventId) {
            setEditingEvent(null);
        }
    } catch (error) {
        console.error("Error deleting event: ", error);
        alert("Failed to delete event.");
    }
  };

  const addMatch = async (eventId, newMatch) => {
    if (newMatch.title && newMatch.options.filter(o => o).length >= 2) {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const newMatchData = {
        id: Date.now().toString(),
        title: newMatch.title,
        options: newMatch.options.filter(o => o),
        winner: null
      };
      
      const updatedMatches = [...(event.matches || []), newMatchData];
      try {
        await setDoc(doc(db, "events", eventId), { matches: updatedMatches }, { merge: true });
      } catch (error) {
        console.error("Error adding match: ", error);
        alert("Failed to add match.");
      }
    }
  };
  
  const submitPick = async (eventId, matchId, pick) => {
    if (!currentUser) {
        alert("Please select a player before making picks.");
        return;
    }
    
    // Check if this is an exclusive picks match and if the pick is already taken
    // (exempt options like "OTHER" can be picked by multiple people)
    const event = events.find(e => e.id === eventId);
    const match = event?.matches?.find(m => m.id === matchId);
    if (isExclusivePicksMatch(event, match?.title) && !isExemptFromExclusive(pick)) {
        const takenPicks = getPicksTakenByOthers(eventId, matchId, currentUser);
        if (takenPicks[pick]) {
            alert(`This pick has already been taken by ${takenPicks[pick]}. Please choose another option.`);
            return;
        }
    }
    
    const player = players.find(p => p.name === currentUser);
    if (player) {
        try {
            const playerRef = doc(db, "players", player.id);
            const updatedPicks = { ...player.picks, [`${eventId}-${matchId}`]: pick };
            await setDoc(playerRef, { picks: updatedPicks }, { merge: true });
        } catch (error) {
            console.error("Error submitting pick: ", error);
            alert("Failed to submit pick.");
        }
    }
  };

  const deletePlayer = async (playerId) => {
    try {
        const playerToDelete = players.find(p => p.id === playerId);
        if(playerToDelete && playerToDelete.name === currentUser){
            const otherPlayers = players.filter(p => p.id !== playerId);
            setCurrentUser(otherPlayers.length > 0 ? otherPlayers[0].name : null);
        }
        await deleteDoc(doc(db, "players", playerId));
    } catch (error) {
        console.error("Error deleting player: ", error);
        alert("Failed to delete player.");
    }
  };
  
  const addPlayer = async (playerName) => {
    if (playerName.trim()) {
        const newPlayer = {
          name: playerName.trim(),
          picks: {}
        };
        try {
            await addDoc(collection(db, "players"), newPlayer);
        } catch (error) {
            console.error("Error adding player: ", error);
            alert("Failed to add player.");
        }
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
    } catch(error) {
        console.error("Error adding Hall of Fame entry: ", error);
        alert("Failed to add Hall of Fame entry.");
    }
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
    } catch (error) {
        console.error("Error updating Hall of Fame entry: ", error);
        alert("Failed to update Hall of Fame entry.");
    }
  };

  const deleteHallOfFameEntry = async (id) => {
    try {
        await deleteDoc(doc(db, "hallOfFame", id));
    } catch (error) {
        console.error("Error deleting Hall of Fame entry: ", error);
        alert("Failed to delete Hall of Fame entry.");
    }
  };

  const FloatingParticles = React.memo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gray-800"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `drift-${p.id} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: '0.9',
          }}
        />
      ))}
      <style>{`
        ${particles.map(p => `
            @keyframes drift-${p.id} {
                0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.8; }
                25% { transform: translate3d(${p.initialDirectionX * 50}px, ${p.initialDirectionY * 50}px, 0) scale(1.5); opacity: 0.4; }
                50% { transform: translate3d(${-p.initialDirectionX * 40}px, ${-p.initialDirectionY * 40}px, 0) scale(1.8); opacity: 1; }
                75% { transform: translate3d(${p.initialDirectionX * 30}px, ${p.initialDirectionY * 30}px, 0) scale(1.2); opacity: 0.6; }
                100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.8; }
            }
        `).join('')}
      `}</style>
    </div>
  ));

  const Navigation = () => (
    <nav className="bg-black text-white shadow-xl border-b border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setCurrentView('home')} className="text-xl font-bold tracking-wider hover:text-gray-400 transition-all duration-300">
                        BWL <span className="text-gray-400">FANTASY</span>
                    </button>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-2 ml-4">
                        <button onClick={() => setCurrentView('home')} className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm ${currentView === 'home' ? 'bg-white text-black' : 'hover:bg-gray-900'}`}>Events</button>
                        <button onClick={() => setCurrentView('standings')} className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm ${currentView === 'standings' ? 'bg-white text-black' : 'hover:bg-gray-900'}`}>Standings</button>
                        <button onClick={() => setCurrentView('halloffame')} className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm ${currentView === 'halloffame' ? 'bg-white text-black' : 'hover:bg-gray-900'}`}>Hall of Fame</button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => isAdmin ? setCurrentView('admin') : setCurrentView('login')} className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-300 text-sm">
                        {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>Admin</span>
                    </button>
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'home' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Events</button>
                    <button onClick={() => { setCurrentView('standings'); setIsMenuOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'standings' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Standings</button>
                    <button onClick={() => { setCurrentView('halloffame'); setIsMenuOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'halloffame' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Hall of Fame</button>
                </div>
            </div>
        )}
    </nav>
);

  const HomeView = ({ events }) => (
    <div className="min-h-screen bg-black p-8 relative">
      <FloatingParticles />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            BWL <span className="text-gray-400">2025/2026</span>
          </h1>
          <p className="text-xl text-gray-400">Bellend Wrestling League Fantasy Picks</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-white transition-all duration-500 transform hover:scale-105 hover:shadow-white/20 flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-800 to-black overflow-hidden group">
                {event.bannerImage ? (
                  <img 
                    src={event.bannerImage} 
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <h3 className="text-3xl font-bold text-white text-center p-2">{event.name}</h3>
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    event.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                    event.status === 'live' ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' :
                    event.status === 'open' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                    'border-gray-500 text-gray-500 bg-gray-500/10'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-400 mb-4 text-sm">{event.date}</p>
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setCurrentView('event-standings');
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border border-gray-700 hover:border-gray-500"
                  >
                    View Standings
                  </button>
                   {(event.status === 'live' || event.status === 'completed') && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setCurrentView('event-predictions');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border border-blue-500 flex items-center justify-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Predictions</span>
                    </button>
                  )}
                  {event.status === 'open' && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setCurrentView('make-picks');
                      }}
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Make Picks
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

    const Modal = ({ isOpen, onClose, message, type = 'success' }) => {
        if (!isOpen) return null;

        const styles = {
            success: {
                borderColor: 'border-green-500',
                icon: <Lock className="w-20 h-20 mx-auto mb-6 text-green-400 animate-pulse" />,
                buttonColor: 'bg-green-500 hover:bg-green-600'
            },
            error: {
                borderColor: 'border-red-500',
                icon: <X className="w-20 h-20 mx-auto mb-6 text-red-400" />,
                buttonColor: 'bg-red-500 hover:bg-red-600'
            }
        };

        const currentStyle = styles[type];

        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            >
                <div 
                    className={`bg-gray-900 rounded-2xl p-8 shadow-2xl border-2 ${currentStyle.borderColor} text-center transform transition-all duration-300 animate-fadeInUp max-w-sm w-full mx-4`}
                    onClick={e => e.stopPropagation()}
                >
                    {currentStyle.icon}
                    <p className="text-xl font-bold text-white mb-8">{message}</p>
                    <button
                        onClick={onClose}
                        className={`w-full ${currentStyle.buttonColor} text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105`}
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    };

  const MakePicksView = () => {
    const player = players.find(p => p.name === currentUser) || { picks: {} };
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    
    const handleLockInPicks = () => {
        const playerPicksForEvent = Object.keys(player.picks || {}).filter(key => key.startsWith(`${selectedEvent.id}-`));

        if (selectedEvent.matches && selectedEvent.matches.length > 0 && playerPicksForEvent.length < selectedEvent.matches.length) {
            setShowErrorModal(true);
        } else {
            handlePicksSubmitted(selectedEvent.id, currentUser);
            setShowSubmitModal(true);
        }
    };

    return (
      <div className="min-h-screen bg-black p-8 relative">
        <FloatingParticles />
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => setCurrentView('home')}
            className="mb-6 text-gray-400 hover:text-white flex items-center space-x-2 transition-all duration-300"
          >
            <span>← Back to Events</span>
          </button>
          
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800">
            { selectedEvent.status === 'open' &&
                <div className="mb-8 p-4 bg-black rounded-lg border-2 border-dashed border-yellow-500">
                    <label className="block text-yellow-400 text-sm font-bold mb-2 text-center" htmlFor="player-select">
                        SELECT YOUR NAME TO MAKE PICKS
                    </label>
                    <select 
                        id="player-select"
                        value={currentUser || ''} 
                        onChange={(e) => setCurrentUser(e.target.value)}
                        className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-500 text-lg text-center appearance-none"
                    >
                        <option value="" disabled>-- Select Your Name --</option>
                        {players.map(p => {
                           const hasSubmitted = selectedEvent.submittedPlayers?.includes(p.name);
                           return (
                               <option 
                                   key={p.id} 
                                   value={p.name} 
                                   disabled={hasSubmitted}
                                   className={hasSubmitted ? 'text-gray-500' : ''}
                                >
                                   {p.name} {hasSubmitted ? '(Picks Submitted)' : ''}
                               </option>
                           );
                        })}
                    </select>
                </div>
            }

            <h2 className="text-4xl font-bold text-white mb-2">{selectedEvent.name}</h2>
            <p className="text-gray-400 mb-8">{selectedEvent.date}</p>
            
            {!selectedEvent.matches || selectedEvent.matches.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Matches not yet announced</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Show exclusive picks notice for Royal Rumble */}
                {isExclusivePicksEvent(selectedEvent) && selectedEvent.status === 'open' && (
                  <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 mb-4">
                    <p className="text-purple-300 text-sm text-center">
                      <span className="font-bold">🎯 Exclusive Picks Mode:</span> For the Men's and Women's Royal Rumble matches, each wrestler can only be picked once across all players.
                    </p>
                  </div>
                )}
                {selectedEvent.matches.map((match) => {
                    const pickKey = `${selectedEvent.id}-${match.id}`;
                    const playerPick = (player && player.picks) ? player.picks[pickKey] : undefined;
                    const hasWinner = !!match.winner;
                    
                    // Get picks taken by other players (only relevant for specific Royal Rumble matches)
                    const isExclusive = isExclusivePicksMatch(selectedEvent, match.title);
                    const takenPicks = isExclusive ? getPicksTakenByOthers(selectedEvent.id, match.id, currentUser) : {};
                  
                    return (
                        <div 
                            key={match.id} 
                            className={`bg-black rounded-lg p-6 border transition-all duration-300 ${isExclusive ? 'border-purple-800 hover:border-purple-600' : 'border-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white">{match.title}</h3>
                                {isExclusive && (
                                    <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-700">
                                        🎯 Exclusive
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                            {match.options.map((option, idx) => {
                                const isPicked = playerPick === option;
                                const isWinner = match.winner === option;
                                const takenByOther = takenPicks[option]; // Name of player who took this pick, or undefined
                                const isBlocked = isExclusive && takenByOther && !isPicked;
                                const isOtherOption = isExemptFromExclusive(option);
                                
                                // Get list of players who picked OTHER (for display purposes)
                                const otherPickers = isExclusive && isOtherOption 
                                    ? getOtherPickers(selectedEvent.id, match.id, currentUser) 
                                    : [];

                                let buttonClass = 'bg-gray-900 text-gray-300 hover:bg-gray-800 border-gray-700 hover:border-gray-500';
                                if (hasWinner) {
                                    if (isWinner) {
                                        buttonClass = 'bg-green-500 text-black border-green-400 shadow-lg shadow-green-500/50';
                                    } else if (isPicked && !isWinner) {
                                        buttonClass = 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/50';
                                    }
                                } else if (isPicked) {
                                    buttonClass = 'bg-white text-black border-white shadow-lg';
                                } else if (isBlocked) {
                                    // Blocked by another player - show as unavailable
                                    buttonClass = 'bg-gray-800 text-gray-500 border-gray-700 opacity-60 cursor-not-allowed';
                                }
                                
                                const isDisabled = selectedEvent.status !== 'open' || isBlocked;
                                
                                return (
                                <button
                                    key={idx}
                                    onClick={() => !isDisabled && submitPick(selectedEvent.id, match.id, option)}
                                    disabled={isDisabled}
                                    className={`p-4 rounded-lg font-semibold transition-all duration-300 border ${buttonClass} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer transform hover:scale-105'}`}
                                    title={isBlocked ? `Picked by ${takenByOther}` : ''}
                                >
                                    <div className="flex flex-col items-center">
                                        <span>{option}</span>
                                        {isWinner && <span className="text-sm mt-1">✓</span>}
                                        {isBlocked && (
                                            <span className="text-xs mt-1 text-purple-400">
                                                🔒 {takenByOther}
                                            </span>
                                        )}
                                        {/* Show who picked OTHER (not locked, just informational) */}
                                        {isOtherOption && otherPickers.length > 0 && (
                                            <span className="text-xs mt-1 text-gray-400">
                                                {otherPickers.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                );
                            })}
                            </div>
                        </div>
                    );
                })}
              </div>
            )}
            {selectedEvent.status === 'open' && (
                <button
                    onClick={handleLockInPicks}
                    className="w-full mt-8 bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
                >
                    Lock In Picks
                </button>
            )}
          </div>
        </div>
        <Modal 
            isOpen={showErrorModal} 
            onClose={() => setShowErrorModal(false)} 
            message="The Rock says this: There is no way. And The Rock means NO. WAY. That you forgot to make a pick for a match. Go back and check your picks, jabroni."
            type="error"
        />
        <Modal 
            isOpen={showSubmitModal} 
            onClose={() => setShowSubmitModal(false)} 
            message="Say your prayers and eat your vitamins. Your picks have been submitted, brother." 
            type="success"
        />
      </div>
    );
  };

  const PlayerManagement = ({ isMinimized, onToggleMinimize }) => {
    const [localPlayerName, setLocalPlayerName] = useState('');
    
    const handleAddPlayer = () => {
      addPlayer(localPlayerName);
      setLocalPlayerName('');
    };
    
    return (
      <div className="mt-8 bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
        <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={onToggleMinimize}>
            <h3 className="text-2xl font-bold text-white">Player Management</h3>
            <button
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300"
            >
              {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMinimized ? 'max-h-0' : 'max-h-screen'}`}>
            <div className="mb-6 bg-black p-4 rounded-lg border border-gray-800">
              <h4 className="text-white font-semibold mb-3">Add New Player</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Player name"
                  value={localPlayerName}
                  onChange={(e) => setLocalPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-white focus:outline-none transition-all duration-300"
                />
                <button
                  onClick={handleAddPlayer}
                  className="px-6 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Add Player
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {players.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No players yet. Add your first player above!</p>
              ) : (
                players.map((player) => (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between bg-black p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300"
                  >
                    <span className="text-white font-semibold">{player.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-bold">{calculateTotalPoints(player, sortedEvents)} pts</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deletePlayer(player.id)}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-all duration-300 transform hover:scale-110 border border-gray-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    );
  };

  const HallOfFameManagement = ({ 
    entries, 
    onAddEntry, 
    onUpdateEntry, 
    onDeleteEntry,
    isMinimized,
    onToggleMinimize,
  }) => {
    const [newEntry, setNewEntry] = useState({ title: '', description: '', imageFile: null, imageUrl: '' });
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [localEditingData, setLocalEditingData] = useState(null);

    useEffect(() => {
        if (editingEntryId) {
            const entry = entries.find(e => e.id === editingEntryId);
            setLocalEditingData(entry ? { ...entry } : null);
        } else {
            setLocalEditingData(null);
        }
    }, [editingEntryId, entries]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const localUrl = URL.createObjectURL(file);
            if (editingEntryId) {
                setLocalEditingData(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
            } else {
                setNewEntry(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
            }
        }
    };

    const handleAddOrUpdate = () => {
        if (editingEntryId) {
            onUpdateEntry(editingEntryId, localEditingData);
            setEditingEntryId(null);
        } else {
            if (newEntry.title && newEntry.imageFile) {
                onAddEntry(newEntry);
                setNewEntry({ title: '', description: '', imageFile: null, imageUrl: '' });
            } else {
                alert('Please provide a title and image for the Hall of Fame entry.');
            }
        }
    };

    return (
      <div className="mt-8 bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
        <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={onToggleMinimize}>
          <h3 className="text-2xl font-bold text-white">Hall of Fame Management</h3>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300">
            {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMinimized ? 'max-h-0' : 'max-h-screen'}`}>
          <div className="mb-6 bg-black p-4 rounded-lg border border-gray-800">
            <h4 className="text-white font-semibold mb-3">{editingEntryId ? 'Edit Hall of Famer' : 'Add New Hall of Famer'}</h4>
            <input
              type="text"
              placeholder="Title (e.g., 2025 Mr. Predictamania | Johnny)"
              value={editingEntryId ? (localEditingData?.title || '') : newEntry.title}
              onChange={(e) => editingEntryId ? setLocalEditingData(prev => ({ ...prev, title: e.target.value })) : setNewEntry(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-white focus:outline-none mb-3 transition-all duration-300"
            />
            <textarea
                placeholder="Description (optional, e.g., 145 Points)"
                value={editingEntryId ? (localEditingData?.description || '') : newEntry.description}
                onChange={(e) => editingEntryId ? setLocalEditingData(prev => ({ ...prev, description: e.target.value })) : setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-white focus:outline-none mb-3 resize-y transition-all duration-300"
            ></textarea>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-white transition-all duration-300 mb-4">
              <label className="cursor-pointer block text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-gray-400 hover:text-white transition-colors">
                  {(editingEntryId ? localEditingData?.imageUrl : newEntry.imageUrl) ? (
                    <div>
                      <img src={editingEntryId ? localEditingData.imageUrl : newEntry.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                      <p className="text-sm">Click to change image</p>
                    </div>
                  ) : (
                    <p>Click to upload image</p>
                  )}
                </div>
              </label>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={handleAddOrUpdate}
                    className="flex-1 px-6 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    {editingEntryId ? 'Save Changes' : 'Add Hall of Famer'}
                </button>
                {editingEntryId && (
                    <button
                        onClick={() => setEditingEntryId(null)}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                        Cancel
                    </button>
                )}
            </div>
          </div>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No Hall of Fame entries yet. Add one above!</p>
            ) : (
              entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between bg-black p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    {entry.imageUrl && <img src={entry.imageUrl} alt={entry.title} className="w-12 h-12 object-cover rounded-full border border-gray-700" />}
                    <div>
                        <p className="text-white font-semibold">{entry.title}</p>
                        {entry.description && <p className="text-gray-400 text-sm">{entry.description}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEntryId(entry.id)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-all duration-300 transform hover:scale-110 border border-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-sm transition-all duration-300 transform hover:scale-110 border border-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const EventStandingsView = () => {
    if (!selectedEvent) return null;

    const isHistorical = historicalEventNames.includes(selectedEvent.name.toUpperCase());

    const playerScores = useMemo(() => {
        let scores;
        if (isHistorical) {
            const eventScores = historicalScores[selectedEvent.name.toUpperCase()];
            scores = Object.keys(eventScores).map(playerName => ({
                id: playerName,
                name: playerName,
                eventScore: eventScores[playerName]
            }));
        } else {
            scores = players.map(player => {
                let score = 0;
                if(selectedEvent.matches){
                    selectedEvent.matches.forEach(match => {
                        const pickKey = `${selectedEvent.id}-${match.id}`;
                        if (match.winner && player.picks && player.picks[pickKey] === match.winner) {
                          score += 1;
                        }
                    });
                }
                return { ...player, eventScore: score };
            });
        }
        return scores.sort((a, b) => b.eventScore - a.eventScore);
    }, [selectedEvent, players]);

    return (
      <div className="min-h-screen bg-black p-8 relative">
        <FloatingParticles />
        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => setCurrentView('home')}
            className="mb-6 text-gray-400 hover:text-white flex items-center space-x-2 transition-all duration-300"
          >
            <span>← Back to Events</span>
          </button>
          <h2 className="text-5xl font-bold text-white mb-12 text-center animate-slideDown">
            {selectedEvent.name} Standings
          </h2>
          <div className="space-y-3 animate-fadeIn">
            {playerScores.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-6 rounded-xl transition-all duration-500 transform hover:scale-102 animate-fadeInUp border-2 ${
                  idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 shadow-2xl shadow-yellow-500/50' :
                  idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300 shadow-xl shadow-gray-400/30' :
                  idx === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 shadow-xl shadow-orange-600/30' :
                  'bg-gray-900 border-gray-700 hover:border-gray-500'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center space-x-6">
                  <span className={`text-5xl font-black ${idx < 3 ? 'text-white' : 'text-gray-400'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-3xl font-bold text-white">
                    {player.name}
                  </span>
                </div>
                <span className="text-4xl font-black text-white">
                  {player.eventScore}
                </span>
              </div>
            ))}
             {playerScores.length === 0 && (
                <p className="text-gray-400 text-center py-8">No players have made picks for this event yet, or results are not in.</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const EventPredictionsView = ({ selectedEvent, players, onBack }) => {
    if (!selectedEvent || !selectedEvent.matches) return null;

    const predictions = selectedEvent.matches.map(match => {
        const picksByOption = match.options.reduce((acc, option) => {
            acc[option] = [];
            return acc;
        }, {});

        players.forEach(player => {
            const pickKey = `${selectedEvent.id}-${match.id}`;
            const playerPick = player.picks ? player.picks[pickKey] : undefined;
            if (playerPick && picksByOption.hasOwnProperty(playerPick)) {
                picksByOption[playerPick].push(player.name);
            }
        });

        return {
            matchTitle: match.title,
            picks: picksByOption,
            winner: match.winner
        };
    });

    return (
        <div className="min-h-screen bg-black p-8 relative">
            <FloatingParticles />
            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={onBack}
                    className="mb-6 text-gray-400 hover:text-white flex items-center space-x-2 transition-all duration-300"
                >
                    <span>← Back to Events</span>
                </button>
                <h2 className="text-5xl font-bold text-white mb-4 text-center">
                    {selectedEvent.name}
                </h2>
                <p className="text-gray-400 mb-12 text-center">Player Predictions</p>

                <div className="space-y-8">
                    {predictions.map((prediction, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
                            <h3 className="text-2xl font-bold text-white mb-4">{prediction.matchTitle}</h3>
                            <div className="space-y-3">
                                {Object.entries(prediction.picks).map(([option, playerNames]) => (
                                    <div key={option} className={`p-4 rounded-lg border transition-all duration-300 ${prediction.winner === option ? 'bg-green-900/50 border-green-500' : 'bg-black border-gray-800'}`}>
                                        <p className={`font-semibold ${prediction.winner === option ? 'text-green-400' : 'text-white'}`}>{option}</p>
                                        {playerNames.length > 0 ? (
                                            <p className="text-gray-400 mt-1 text-sm">
                                                Picked by: {playerNames.join(', ')}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 mt-1 text-sm">
                                                No players picked this option.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {predictions.length === 0 && (
                         <p className="text-gray-400 text-center py-8">No matches available for this event yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


  const StandingsView = () => {
    const allPlayerNames = useMemo(() => {
        const firestorePlayers = players.map(p => p.name);
        const historicalPlayers = Object.values(historicalScores).flatMap(scores => Object.keys(scores));
        return [...new Set([...firestorePlayers, ...historicalPlayers])];
    }, [players]);


    const sortedPlayers = allPlayerNames
      .map(name => {
        const playerObject = players.find(p => p.name === name) || { name: name, id: name };
        return {
            ...playerObject,
            totalPoints: calculateTotalPoints(playerObject, sortedEvents)
        }
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
    
    return (
      <div className="min-h-screen bg-black p-8 relative">
        <FloatingParticles />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-white mb-12 text-center animate-slideDown">
            Global Standings
          </h2>
          
          <div className="space-y-3 animate-fadeIn">
            {sortedPlayers.map((player, idx) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-6 rounded-xl transition-all duration-500 transform hover:scale-102 animate-fadeInUp border-2 ${
                  idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 shadow-2xl shadow-yellow-500/50' :
                  idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300 shadow-xl shadow-gray-400/30' :
                  idx === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 shadow-xl shadow-orange-600/30' :
                  'bg-gray-900 border-gray-700 hover:border-gray-500'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center space-x-6">
                  <span className={`text-5xl font-black ${
                    idx < 3 ? 'text-white' : 'text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`text-3xl font-bold ${
                    idx < 3 ? 'text-white' : 'text-white'
                  }`}>
                    {player.name}
                  </span>
                </div>
                <span className={`text-4xl font-black ${
                  idx < 3 ? 'text-white' : 'text-white'
                }`}>
                  {player.totalPoints}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AdminLoginView = () => {
    const [localPassword, setLocalPassword] = useState('');
    
    const handleLogin = () => {
      if (localPassword === 'ssj') {
        setIsAdmin(true);
        setCurrentView('admin');
        setAdminPassword('');
        setLocalPassword('');
      } else {
        alert('Incorrect password');
      }
    };
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 relative">
        <FloatingParticles />
        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl max-w-md w-full border border-gray-800 relative z-10 animate-fadeIn">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-lg bg-black text-white border border-gray-700 focus:border-white focus:outline-none mb-4 transition-all duration-300"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  };

  const AdminView = ({ events }) => (
    <div className="min-h-screen bg-black p-8 relative">
      <FloatingParticles />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 animate-slideDown">
          <h2 className="text-4xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={createNewEvent}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        </div>

        <div className="space-y-6">
          {events.map((event, index) => (
             <EventEditorCard
                key={event.id}
                event={event}
                isEditing={editingEvent === event.id}
                onSetEditing={setEditingEvent}
                onSave={async (id, data) => {
                  await updateEvent(id, data);
                  setEditingEvent(null);
                }}
                onDelete={deleteEvent}
                onUpdateEvent={updateEvent}
                onAddMatch={addMatch}
                onResetPlayerPick={resetPlayerPick}
                onResetAllPlayerPicks={resetAllPlayerPicks}
                players={players}
                animationDelay={`${index * 100}ms`}
                isMinimized={minimizedEvents.includes(event.id)}
                onToggleMinimize={toggleMinimizeEvent}
            />
          ))}
        </div>

        <PlayerManagement 
            isMinimized={isPlayerManagementMinimized}
            onToggleMinimize={() => setIsPlayerManagementMinimized(p => !p)}
        />
        <HallOfFameManagement
            entries={hallOfFameEntries}
            onAddEntry={addHallOfFameEntry}
            onUpdateEntry={updateHallOfFameEntry}
            onDeleteEntry={deleteHallOfFameEntry}
            isMinimized={isHallOfFameMinimized}
            onToggleMinimize={() => setIsHallOfFameMinimized(p => !p)}
        />
      </div>
    </div>
  );

  const HallOfFameView = () => {
    const latestWinner = hallOfFameEntries.length > 0 ? hallOfFameEntries[hallOfFameEntries.length - 1] : null;
    const previousWinners = hallOfFameEntries.length > 1 ? hallOfFameEntries.slice(0, hallOfFameEntries.length - 1).reverse() : [];

    return (
    <div className="min-h-screen bg-black p-8 relative">
      <FloatingParticles />
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-5xl font-bold text-white mb-8 flex items-center justify-center space-x-4 animate-slideDown">
          <Award className="w-12 h-12 text-yellow-400" />
          <span>Hall of Fame</span>
          <Award className="w-12 h-12 text-yellow-400" />
        </h2>
        
        {hallOfFameEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-16 text-xl">The Hall of Fame is empty. A new legend awaits their coronation!</p>
        ) : (
            <>
                {latestWinner && (
                     <div className="mb-12 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 shadow-2xl border-2 border-yellow-500/50 relative overflow-hidden group animate-fadeInUp">
                         <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 animate-spotlight"></div>
                         <div className="text-center mb-6">
                            <h3 className="text-4xl font-bold text-white tracking-wider">LATEST INDUCTEE</h3>
                         </div>
                         <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className="md:w-1/2 relative">
                                 <img src={latestWinner.imageUrl} alt={latestWinner.title} className="rounded-xl shadow-2xl w-full h-auto object-cover border-4 border-yellow-400"/>
                                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300"></div>
                             </div>
                             <div className="md:w-1/2 text-center md:text-left">
                                 <h4 className="text-5xl font-black text-white mb-3">{latestWinner.title}</h4>
                                 <p className="text-2xl text-yellow-400 font-semibold">{latestWinner.description}</p>
                             </div>
                         </div>
                     </div>
                )}
                
                {previousWinners.length > 0 && (
                    <>
                        <h3 className="text-3xl font-bold text-white text-center my-12 border-t border-b border-gray-700 py-4">Previous Champions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {previousWinners.map((entry, index) => (
                              <div 
                                key={entry.id}
                                className="bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-yellow-400 transition-all duration-500 transform hover:scale-105 hover:shadow-yellow-400/20 flex flex-col group"
                                style={{ animationDelay: `${index * 150}ms` }}
                              >
                                <div className="relative h-72 bg-black overflow-hidden">
                                  {entry.imageUrl ? (
                                    <img 
                                      src={entry.imageUrl} 
                                      alt={entry.title}
                                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Trophy className="w-20 h-20 text-gray-600" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0"></div>
                                   <div className="absolute bottom-4 left-4">
                                        <Trophy className="w-10 h-10 text-yellow-500 animate-pulse"/>
                                   </div>
                                </div>
                                <div className="p-6 text-center bg-gray-900">
                                  <h4 className="text-2xl font-bold text-white mb-1">{entry.title}</h4>
                                  {entry.description && <p className="text-yellow-500">{entry.description}</p>}
                                </div>
                              </div>
                            ))}
                        </div>
                    </>
                )}
            </>
        )}
      </div>
       <style>{`
            @keyframes spotlight {
                0% { transform: translateX(-100%) skewX(-15deg); }
                100% { transform: translateX(200%) skewX(-15deg); }
            }
            .animate-spotlight {
                animation: spotlight 3s linear infinite;
            }
        `}</style>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      {currentView === 'home' && <HomeView events={sortedEvents} />}
      {currentView === 'make-picks' && <MakePicksView />}
      {currentView === 'event-standings' && <EventStandingsView />}
      {currentView === 'event-predictions' && <EventPredictionsView selectedEvent={selectedEvent} players={players} onBack={() => setCurrentView('home')} />}
      {currentView === 'standings' && <StandingsView />}
      {currentView === 'halloffame' && <HallOfFameView />}
      {currentView === 'login' && <AdminLoginView />}
      {currentView === 'admin' && isAdmin && <AdminView events={sortedEvents} />}
    </div>
  );
};

export default FantasyWrestlingApp;