import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Calendar, Plus, Edit2, Trash2, Save, Award, Lock, Unlock, Users, ChevronUp, ChevronDown, X } from 'lucide-react';
// Import Firebase and your configuration
// You will need to create a firebase.js file with your project's config
import { db, storage } from './firebase'; // Assuming you have a firebase.js file
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const AddMatchForm = ({ eventId, onAddMatch }) => {
    const [newMatch, setNewMatch] = useState({ title: '', options: ['', ''] });
  
    const handleAddMatch = () => {
      onAddMatch(eventId, newMatch);
      setNewMatch({ title: '', options: ['', ''] }); // Reset form after submission
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const storageRef = ref(storage, `events/${event.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setLocalData(prev => ({ ...prev, bannerImage: downloadURL }));
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
                  {event.matches.map(match => (
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


  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);

  const [editingEvent, setEditingEvent] = useState(null);
  const [editingHoF, setEditingHoF] = useState(null);

  // Fetch data from Firestore on component mount
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
    
    // Cleanup subscriptions on unmount
    return () => {
        unsubscribeEvents();
        unsubscribePlayers();
        unsubscribeHoF();
    };
  }, []);


  useEffect(() => {
    const newParticles = Array.from({ length: 100 }, (_, i) => ({ // Increased to 100 particles
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3, // Slightly larger base size
      duration: Math.random() * 13 + 9, // Increased speed by ~10%
      delay: Math.random() * 7,
      initialDirectionX: (Math.random() - 0.5) * 2, // -1 to 1
      initialDirectionY: (Math.random() - 0.5) * 2, // -1 to 1
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (players.length > 0 && !currentUser) {
      setCurrentUser(players[0].name);
    }
  }, [players, currentUser]);
  
  const calculateTotalPoints = (player, allEvents) => {
    let totalScore = 0;
    allEvents.forEach(event => {
        if (event.status === 'completed' || event.status === 'live') {
            event.matches.forEach(match => {
                const pickKey = `${event.id}-${match.id}`;
                if (match.winner && player.picks[pickKey] === match.winner) {
                    totalScore += 1;
                }
            });
        }
    });
    return totalScore;
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

  const handleAdminLogin = () => {
    if (adminPassword === 'ssj') {
      setIsAdmin(true);
      setCurrentView('admin');
    } else {
      alert('Incorrect password');
    }
  };

  const createNewEvent = async () => {
    const newEvent = {
      name: 'NEW EVENT',
      date: 'TBD',
      status: 'upcoming',
      bannerImage: null,
      matches: [],
      submittedPlayers: []
    };
    const newEventRef = doc(collection(db, "events"));
    await setDoc(newEventRef, newEvent);
    setEditingEvent(newEventRef.id);
  };

  const updateEvent = async (eventId, updates) => {
    const eventRef = doc(db, "events", eventId);
    await setDoc(eventRef, updates, { merge: true });
  };

  const deleteEvent = async (eventId) => {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    if (editingEvent === eventId) {
      setEditingEvent(null);
    }
  };

  const addMatch = async (eventId, newMatch) => {
    if (newMatch.title && newMatch.options.filter(o => o).length >= 2) {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const newMatchData = {
        id: (event.matches.length > 0 ? Math.max(...event.matches.map(m => m.id)) : 0) + 1,
        title: newMatch.title,
        options: newMatch.options.filter(o => o),
        winner: null
      };
      
      const updatedMatches = [...event.matches, newMatchData];
      await updateEvent(eventId, { matches: updatedMatches });
    }
  };
  
  const submitPick = async (eventId, matchId, pick) => {
    if (!currentUser) {
        alert("Please select a player before making picks.");
        return;
    }
    const player = players.find(p => p.name === currentUser);
    if (player) {
      const playerRef = doc(db, "players", player.id);
      const updatedPicks = { ...player.picks, [`${eventId}-${matchId}`]: pick };
      await setDoc(playerRef, { picks: updatedPicks }, { merge: true });
    }
  };

  const deletePlayer = async (playerId) => {
    const playerToDelete = players.find(p => p.id === playerId);
    if(playerToDelete && playerToDelete.name === currentUser){
        setCurrentUser(players.length > 1 ? players.find(p => p.id !== playerId).name : null);
    }
    const playerRef = doc(db, "players", playerId);
    await deleteDoc(playerRef);
  };

  const addHallOfFameEntry = async (newEntry) => {
    const newEntryRef = doc(collection(db, "hallOfFame"));
    await setDoc(newEntryRef, newEntry);
  };

  const updateHallOfFameEntry = async (id, updates) => {
    const hofRef = doc(db, "hallOfFame", id);
    await setDoc(hofRef, updates, { merge: true });
  };

  const deleteHallOfFameEntry = async (id) => {
    const hofRef = doc(db, "hallOfFame", id);
    await deleteDoc(hofRef);
  };
    // ...The rest of your component code remains the same...
    // (FloatingParticles, Navigation, HomeView, MakePicksView, etc.)
    // ...
};

export default FantasyWrestlingApp;