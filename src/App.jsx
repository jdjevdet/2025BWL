import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Calendar, Plus, Edit2, Trash2, Save, Award, Lock, Unlock, Users, ChevronUp, ChevronDown, X, Menu, Crown, Zap, Target, Shield, Star, ChevronRight, Hash, TrendingUp, Eye, EyeOff, Camera, KeyRound, Loader2, Check, Minus, Swords, Clock, Activity } from 'lucide-react';

import { db, storage } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ──────────────────────────────────────────────
   PLAYER AVATAR
   ────────────────────────────────────────────── */
const PlayerAvatar = ({ player, size = 'sm' }) => {
  const sizes = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  const sizeClass = sizes[size] || sizes.sm;

  if (player?.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt={player.name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border border-[--border]`}
      />
    );
  }

  const colors = ['#c9a84c', '#6366f1', '#ef233c', '#10b981', '#eab308', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#14b8a6'];
  const colorIndex = (player?.name || '').charCodeAt(0) % colors.length;

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 font-bold font-outfit`}
      style={{ background: colors[colorIndex], color: '#0a0a0a' }}
    >
      {(player?.name || '?')[0].toUpperCase()}
    </div>
  );
};

/* ──────────────────────────────────────────────
   ADMIN: Add Match Form
   ────────────────────────────────────────────── */
const AddMatchForm = ({ eventId, onAddMatch }) => {
  const [newMatch, setNewMatch] = useState({ title: '', options: ['', ''] });

  const handleAddMatch = () => {
    onAddMatch(eventId, newMatch);
    setNewMatch({ title: '', options: ['', ''] });
  };

  return (
    <div className="mt-5 rounded-xl border border-dashed border-[--border-light] p-5" style={{ background: 'var(--bg-input)' }}>
      <h5 className="font-outfit font-semibold text-sm text-[--text-secondary] uppercase tracking-wider mb-4">Add New Match</h5>
      <input
        type="text"
        placeholder="Match title"
        value={newMatch.title}
        onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-[--text-muted] border border-[--border] transition-all"
        style={{ background: 'var(--bg-surface)' }}
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
          className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-[--text-muted] border border-[--border] mt-2 transition-all"
          style={{ background: 'var(--bg-surface)' }}
        />
      ))}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setNewMatch({ ...newMatch, options: [...newMatch.options, ''] })}
          className="px-4 py-2 rounded-lg text-xs font-medium border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--text-secondary] transition-all"
          style={{ background: 'var(--bg-elevated)' }}
        >
          + Option
        </button>
        <button
          onClick={handleAddMatch}
          className="btn-gold px-5 py-2 rounded-lg text-xs font-bold"
        >
          Add Match
        </button>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   ADMIN: Event Editor Card
   ────────────────────────────────────────────── */
const EventEditorCard = ({
  event, isEditing, onSave, onSetEditing, onDelete, onUpdateEvent,
  onAddMatch, onAddOptionToMatch, onResetPlayerPick, onResetAllPlayerPicks,
  players, animationDelay, isMinimized, onToggleMinimize,
}) => {
  const [localData, setLocalData] = useState(event);
  const [addingOptionToMatch, setAddingOptionToMatch] = useState(null);
  const [newOptionText, setNewOptionText] = useState('');

  useEffect(() => { setLocalData(event); }, [event]);

  const handleSave = () => { onSave(event.id, localData); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localImageUrl = URL.createObjectURL(file);
      setLocalData(prev => ({ ...prev, bannerImage: localImageUrl, imageFile: file }));
    }
  };

  const handleAddOption = (matchId) => {
    if (newOptionText.trim()) {
      onAddOptionToMatch(event.id, matchId, newOptionText.trim());
      setNewOptionText('');
      setAddingOptionToMatch(null);
    }
  };

  const statusColors = {
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    live: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    open: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    upcoming: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  };
  const status = statusColors[event.status] || statusColors.upcoming;

  return (
    <div
      className="rounded-xl border border-[--border] card-gold-accent animate-fadeInUp"
      style={{ background: 'var(--bg-surface)', animationDelay }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => onToggleMinimize(event.id)}
            className="p-1.5 rounded-md hover:bg-white/5 text-[--text-muted] hover:text-white transition-all flex-shrink-0"
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <div className="min-w-0">
            <h3 className="font-bebas text-xl tracking-wide text-white truncate">{event.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[--text-muted]">{event.date}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'live' ? 'bg-red-400 animate-pulse' : event.status === 'open' ? 'bg-amber-400' : event.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                {event.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => isEditing ? handleSave() : onSetEditing(event.id)}
            className={`p-2 rounded-lg transition-all ${isEditing ? 'btn-gold' : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'}`}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      <div className={`collapse-section ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
        <div className="p-5">
          {/* Edit form */}
          {isEditing && (
            <div className="space-y-3 mb-6 p-4 rounded-lg border border-[--border]" style={{ background: 'var(--bg-elevated)' }}>
              <input
                type="text" value={localData.name}
                onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] transition-all"
                style={{ background: 'var(--bg-input)' }}
                placeholder="Event name"
              />
              <input
                type="text" value={localData.date}
                onChange={(e) => setLocalData({ ...localData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] transition-all"
                style={{ background: 'var(--bg-input)' }}
                placeholder="Event date"
              />
              <select
                value={localData.status}
                onChange={(e) => setLocalData({ ...localData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] transition-all appearance-none"
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="open">Open for Picks</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
              <label className="block border-2 border-dashed border-[--border-light] rounded-lg p-4 text-center cursor-pointer hover:border-[--gold-dark] transition-all">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {localData.bannerImage ? (
                  <div>
                    <img src={localData.bannerImage} alt="Preview" className="w-full h-28 object-cover rounded-md mb-2" />
                    <p className="text-xs text-[--text-muted]">Click to change banner</p>
                  </div>
                ) : (
                  <p className="text-sm text-[--text-muted]">Click to upload banner image</p>
                )}
              </label>
            </div>
          )}

          {/* Matches */}
          <div>
            <h4 className="font-outfit font-semibold text-xs uppercase tracking-widest text-[--text-muted] mb-3">
              Matches ({event.matches?.length || 0})
            </h4>
            <div className="space-y-2">
              {event.matches && event.matches.map(match => (
                <div key={match.id} className="rounded-lg border border-[--border] p-4" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-white font-medium text-sm mb-2">{match.title}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {match.options.map((option, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium border border-[--border-light] text-[--text-secondary]" style={{ background: 'var(--bg-input)' }}>
                        {option}
                      </span>
                    ))}
                    {isEditing && (
                      <button
                        onClick={() => setAddingOptionToMatch(addingOptionToMatch === match.id ? null : match.id)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  {isEditing && addingOptionToMatch === match.id && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text" placeholder="New option name" value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddOption(match.id)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs text-white border border-[--border] transition-all"
                        style={{ background: 'var(--bg-input)' }}
                        autoFocus
                      />
                      <button onClick={() => handleAddOption(match.id)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all">Add</button>
                      <button onClick={() => { setAddingOptionToMatch(null); setNewOptionText(''); }} className="px-3 py-2 rounded-lg text-xs text-[--text-secondary] hover:text-white border border-[--border] transition-all" style={{ background: 'var(--bg-input)' }}>Cancel</button>
                    </div>
                  )}
                  {(event.status === 'completed' || event.status === 'live') && (
                    <select
                      value={match.winner || ''}
                      onChange={(e) => {
                        const updatedMatches = event.matches.map(m => m.id === match.id ? { ...m, winner: e.target.value } : m);
                        onUpdateEvent(event.id, { matches: updatedMatches });
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs text-white border border-[--border] mt-2 appearance-none transition-all"
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <option value="">Select winner...</option>
                      {match.options.map((option, idx) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {match.winner && (
                    <p className="text-emerald-400 mt-2 text-xs font-medium flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Winner: {match.winner}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {isEditing && <AddMatchForm eventId={event.id} onAddMatch={onAddMatch} />}
          </div>

          {/* Reset picks section */}
          {event.status === 'open' && players && players.length > 0 && (
            <div className="mt-6 p-4 rounded-lg border border-red-500/20" style={{ background: 'rgba(239, 35, 60, 0.04)' }}>
              <h4 className="font-outfit font-semibold text-xs uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Reset Player Picks
              </h4>

              {event.submittedPlayers && event.submittedPlayers.length > 0 && (() => {
                const playersWithMissingPicks = event.submittedPlayers.filter(playerName => {
                  const player = players.find(p => p.name === playerName);
                  if (!player) return true;
                  const picksForEvent = Object.keys(player.picks || {}).filter(key => key.startsWith(`${event.id}-`));
                  return picksForEvent.length === 0 || (event.matches && picksForEvent.length < event.matches.length);
                });
                if (playersWithMissingPicks.length === 0) return null;
                return (
                  <div className="mb-4 p-3 rounded-lg border border-amber-500/20" style={{ background: 'rgba(234, 179, 8, 0.04)' }}>
                    <p className="text-amber-400 text-xs font-semibold mb-2">Submitted but missing picks:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {playersWithMissingPicks.map(playerName => {
                        const player = players.find(p => p.name === playerName);
                        const pickCount = player ? Object.keys(player.picks || {}).filter(key => key.startsWith(`${event.id}-`)).length : 0;
                        return (
                          <span key={playerName} className="px-2.5 py-1 rounded-md text-[10px] font-medium border border-amber-500/20 text-amber-300" style={{ background: 'rgba(234, 179, 8, 0.08)' }}>
                            {playerName} ({pickCount}/{event.matches?.length || 0})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {event.matches && event.matches.map(match => {
                const playersWithPicks = players.filter(p => p.picks && p.picks[`${event.id}-${match.id}`]);
                if (playersWithPicks.length === 0) return null;
                return (
                  <div key={match.id} className="mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                    <p className="text-white text-xs font-medium mb-2">{match.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {playersWithPicks.map(player => (
                        <button
                          key={player.id}
                          onClick={() => onResetPlayerPick(event.id, match.id, player.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-all"
                          title={`Reset ${player.name}'s pick: ${player.picks[`${event.id}-${match.id}`]}`}
                        >
                          {player.name}: {player.picks[`${event.id}-${match.id}`]}
                          <X className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {event.submittedPlayers && event.submittedPlayers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-500/10">
                  <p className="text-[--text-muted] text-xs mb-2">Reset all picks & allow re-submission:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {event.submittedPlayers.map(playerName => (
                      <button
                        key={playerName}
                        onClick={() => onResetAllPlayerPicks(event.id, playerName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        Reset: {playerName} <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════
   MAIN APP COMPONENT
   ══════════════════════════════════════════════ */
const FantasyWrestlingApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [minimizedEvents, setMinimizedEvents] = useState([]);
  const [isPlayerManagementMinimized, setIsPlayerManagementMinimized] = useState(false);
  const [isHallOfFameMinimized, setIsHallOfFameMinimized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // PIN auth state
  const [authenticatedPlayerId, setAuthenticatedPlayerId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinMode, setPinMode] = useState(null); // null | 'verify' | 'create'
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(null);

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

  // ── Firebase subscriptions ──
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

  const sortedEvents = useMemo(() => [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const validA = !isNaN(dateA);
    const validB = !isNaN(dateB);
    if (!validA && !validB) return 0;
    if (!validA) return 1;
    if (!validB) return -1;
    return dateA - dateB;
  }), [events]);

  // ── Exclusive picks helpers (Royal Rumble) ──
  const isExclusivePicksEvent = (event) => event?.name?.toLowerCase().includes('royal rumble');

  const isExclusivePicksMatch = (event, matchTitle) => {
    if (!isExclusivePicksEvent(event)) return false;
    const normalizedTitle = matchTitle?.toLowerCase().replace(/['''`´]/g, "'").trim();
    return ["men's royal rumble match", "women's royal rumble match"].includes(normalizedTitle);
  };

  const isExemptFromExclusive = (option) => option?.toLowerCase() === 'other';

  const getOtherPickers = (eventId, matchId, currentPlayerName) => {
    const pickKey = `${eventId}-${matchId}`;
    const otherPickers = [];
    players.forEach(player => {
      if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
        if (isExemptFromExclusive(player.picks[pickKey])) otherPickers.push(player.name);
      }
    });
    return otherPickers;
  };

  const getPicksTakenByOthers = (eventId, matchId, currentPlayerName) => {
    const pickKey = `${eventId}-${matchId}`;
    const takenPicks = {};
    players.forEach(player => {
      if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
        const pick = player.picks[pickKey];
        if (!isExemptFromExclusive(pick)) takenPicks[pick] = player.name;
      }
    });
    return takenPicks;
  };

  // ── Score calculations ──
  const calculateTotalPoints = (player, allEvents) => {
    let historicalTotal = 0;
    if (player.name) {
      historicalEventNames.forEach(eventName => {
        if (historicalScores[eventName]?.[player.name] !== undefined)
          historicalTotal += historicalScores[eventName][player.name];
      });
    }
    let firebaseTotal = 0;
    allEvents.forEach(event => {
      if (!historicalEventNames.includes(event.name.toUpperCase())) {
        if ((event.status === 'completed' || event.status === 'live') && event.matches) {
          event.matches.forEach(match => {
            const pickKey = `${event.id}-${match.id}`;
            if (match.winner && player.picks && player.picks[pickKey] === match.winner) firebaseTotal += 1;
          });
        }
      }
    });
    return historicalTotal + firebaseTotal + (player.bonusPoints || 0);
  };

  const getPlayerBreakdown = (player, allEvents) => {
    const breakdown = [];
    historicalEventNames.forEach(eventName => {
      const score = historicalScores[eventName]?.[player.name];
      if (score !== undefined) {
        const maxScore = Math.max(...Object.values(historicalScores[eventName]));
        breakdown.push({ eventName, score, totalMatches: maxScore, type: 'historical' });
      }
    });
    allEvents.forEach(event => {
      if (!historicalEventNames.includes(event.name.toUpperCase())) {
        if ((event.status === 'completed' || event.status === 'live') && event.matches) {
          let score = 0;
          event.matches.forEach(match => {
            const pickKey = `${event.id}-${match.id}`;
            if (match.winner && player.picks?.[pickKey] === match.winner) score += 1;
          });
          breakdown.push({ eventName: event.name, score, totalMatches: event.matches.length, type: 'firebase' });
        }
      }
    });
    return breakdown;
  };

  const toggleMinimizeEvent = (eventId) => {
    setMinimizedEvents(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
  };

  // ── Firebase CRUD ──
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

  const handleAdminLogin = () => {
    if (adminPassword === 'ssj') { setIsAdmin(true); setCurrentView('admin'); }
    else alert('Incorrect password');
  };

  const createNewEvent = async () => {
    try {
      const docRef = await addDoc(collection(db, "events"), { name: 'NEW EVENT', date: 'TBD', status: 'upcoming', bannerImage: null, matches: [], submittedPlayers: [] });
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
      const takenPicks = getPicksTakenByOthers(eventId, matchId, currentUser);
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


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVIGATION
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const Navigation = () => {
    const navItems = [
      { key: 'home', label: 'Events', icon: Calendar },
      { key: 'standings', label: 'Standings', icon: TrendingUp },
      { key: 'halloffame', label: 'Hall of Fame', icon: Crown },
    ];

    return (
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(7, 7, 11, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
                <Zap className="w-4 h-4 text-[--bg-deep]" />
              </div>
              <span className="font-bebas text-2xl tracking-wider">
                <span className="text-white">BWL</span>
                <span className="text-[--gold] ml-1">FANTASY</span>
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.key || (item.key === 'home' && ['home', 'event-standings', 'event-predictions', 'make-picks', 'live-results'].includes(currentView));
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentView(item.key)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-[--gold]' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin + mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => isAdmin ? setCurrentView('admin') : setCurrentView('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isAdmin
                    ? 'btn-gold'
                    : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'
                }`}
              >
                {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-white/5 transition-all"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[--border] animate-fadeIn" style={{ background: 'var(--bg-surface)' }}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setCurrentView(item.key); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'text-[--gold] bg-[--gold]/5' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HOME VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const HomeView = ({ events }) => (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--border-light] text-xs font-medium text-[--text-secondary] mb-6" style={{ background: 'var(--bg-elevated)' }}>
            <Zap className="w-3 h-3 text-[--gold]" />
            Season 2025/2026
          </div>
          <h1 className="font-bebas text-6xl sm:text-8xl lg:text-9xl tracking-tight leading-none mb-4">
            <span className="text-white">BELLEND</span>
            <br />
            <span className="gold-shimmer">WRESTLING LEAGUE</span>
          </h1>
          <p className="font-outfit text-lg text-[--text-secondary] max-w-md mx-auto">
            Fantasy Picks &mdash; Make your predictions and prove you know wrestling better than everyone else.
          </p>
          <div className="rope-divider max-w-xs mx-auto mt-8" />
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => {
            const statusConfig = {
              completed: { dot: 'status-dot-completed', label: 'Completed', color: 'text-emerald-400' },
              live: { dot: 'status-dot-live', label: 'Live Now', color: 'text-red-400' },
              open: { dot: 'status-dot-open', label: 'Open', color: 'text-amber-400' },
              upcoming: { dot: 'status-dot-upcoming', label: 'Upcoming', color: 'text-slate-400' },
            };
            const sc = statusConfig[event.status] || statusConfig.upcoming;

            return (
              <div
                key={event.id}
                className="group rounded-xl overflow-hidden border border-[--border] gold-border-glow hover-lift card-gold-accent animate-fadeInUp flex flex-col"
                style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 80}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden spotlight-overlay" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-deep))' }}>
                  {event.bannerImage ? (
                    <img
                      src={event.bannerImage} alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-bebas text-4xl text-white/80 tracking-wider text-center px-4">{event.name}</h3>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[--bg-surface] via-transparent to-transparent opacity-80" />
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider glass-card">
                      <span className={`status-dot ${sc.dot}`} />
                      <span className={sc.color}>{sc.label}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bebas text-2xl tracking-wide text-white mb-1">{event.name}</h3>
                  <p className="text-sm text-[--text-muted] mb-5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </p>

                  <div className="space-y-2 mt-auto">
                    {event.status === 'live' && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('live-results'); }}
                        className="btn-gold w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Live Results Tracker
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedEvent(event); setCurrentView('event-standings'); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark] transition-all duration-300"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <Trophy className="w-4 h-4" />
                      View Standings
                    </button>
                    {(event.status === 'live' || event.status === 'completed') && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('event-predictions'); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all duration-300"
                      >
                        <Users className="w-4 h-4" />
                        View Predictions
                      </button>
                    )}
                    {event.status === 'open' && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('make-picks'); }}
                        className="btn-gold w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Make Picks
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <Calendar className="w-16 h-16 text-[--text-muted] mx-auto mb-4" />
            <p className="text-[--text-secondary] text-lg">No events yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODAL
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const Modal = ({ isOpen, onClose, message, type = 'success', autoCloseSeconds = null }) => {
    const [countdown, setCountdown] = useState(autoCloseSeconds);

    useEffect(() => {
      if (!isOpen || !autoCloseSeconds) { setCountdown(autoCloseSeconds); return; }
      setCountdown(autoCloseSeconds);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); onClose(); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [isOpen, autoCloseSeconds, onClose]);

    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className={`relative rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4 animate-scaleIn border ${isSuccess ? 'border-emerald-500/30' : 'border-red-500/30'}`} style={{ background: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
          {/* Glow */}
          <div className={`absolute -inset-px rounded-2xl opacity-20 blur-xl ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <div className="relative">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {isSuccess
                ? <Lock className="w-10 h-10 text-emerald-400" />
                : <X className="w-10 h-10 text-red-400" />
              }
            </div>
            <p className="text-lg font-semibold text-white mb-6 leading-relaxed">{message}</p>
            {autoCloseSeconds && countdown > 0 && (
              <p className="text-[--text-muted] text-sm mb-4">Redirecting in {countdown}s...</p>
            )}
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              {autoCloseSeconds ? 'Go Home Now' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MAKE PICKS VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const MakePicksView = () => {
    const player = players.find(p => p.name === currentUser) || { picks: {} };
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const totalMatches = selectedEvent.matches?.length || 0;
    const pickedCount = Object.keys(player.picks || {}).filter(key => key.startsWith(`${selectedEvent.id}-`)).length;

    const handleLockInPicks = () => {
      const authedPlayer = players.find(p => p.name === currentUser);
      if (authedPlayer?.pin && authenticatedPlayerId !== authedPlayer.id) { alert("Please enter your PIN first."); return; }
      const playerPicksForEvent = Object.keys(player.picks || {}).filter(key => key.startsWith(`${selectedEvent.id}-`));
      if (selectedEvent.matches && selectedEvent.matches.length > 0 && playerPicksForEvent.length < selectedEvent.matches.length) {
        setShowErrorModal(true);
      } else {
        handlePicksSubmitted(selectedEvent.id, currentUser);
        setShowSubmitModal(true);
      }
    };

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setCurrentView('home')}
            className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Events
          </button>

          <div className="rounded-2xl border border-[--border] overflow-hidden animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-[--border]" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))' }}>
              {/* Player selector + PIN auth + Avatar */}
              {selectedEvent.status === 'open' && (
                <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-[--gold-dark]/40" style={{ background: 'rgba(201, 168, 76, 0.03)' }}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[--gold] mb-2 text-center">
                    Select Your Name
                  </label>
                  <select
                    value={currentUser || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCurrentUser(name);
                      const selectedPlayer = players.find(p => p.name === name);
                      if (selectedPlayer && authenticatedPlayerId === selectedPlayer.id) return;
                      setPinInput('');
                      setPinError('');
                      if (selectedPlayer?.pin) setPinMode('verify');
                      else setPinMode('create');
                    }}
                    className="w-full px-4 py-3 rounded-xl text-white text-center text-lg font-semibold border border-[--border] appearance-none cursor-pointer transition-all"
                    style={{ background: 'var(--bg-input)' }}
                  >
                    <option value="" disabled>-- Select Your Name --</option>
                    {players.map(p => {
                      const hasSubmitted = selectedEvent.submittedPlayers?.includes(p.name);
                      return (
                        <option key={p.id} value={p.name} disabled={hasSubmitted}>
                          {p.name} {hasSubmitted ? '(Submitted)' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* PIN Entry */}
                  {currentUser && (() => {
                    const selectedPlayer = players.find(p => p.name === currentUser);
                    if (!selectedPlayer) return null;
                    const isAuthed = authenticatedPlayerId === selectedPlayer.id;

                    if (!isAuthed && pinMode) {
                      return (
                        <div className="mt-4 p-4 rounded-xl border border-[--border] animate-fadeInUp" style={{ background: 'var(--bg-elevated)' }}>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <KeyRound className="w-4 h-4 text-[--gold]" />
                            <span className="text-sm font-semibold text-white">
                              {pinMode === 'verify' ? 'Enter your 4-digit PIN' : 'Create a 4-digit PIN to protect your picks'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 max-w-xs mx-auto">
                            <input
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              pattern="[0-9]*"
                              autoComplete="off"
                              value={pinInput}
                              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  if (pinMode === 'verify') {
                                    if (pinInput === selectedPlayer.pin) { setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null); }
                                    else setPinError('Wrong PIN. Try again.');
                                  } else if (pinMode === 'create' && /^\d{4}$/.test(pinInput)) {
                                    setDoc(doc(db, "players", selectedPlayer.id), { pin: pinInput }, { merge: true });
                                    setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null);
                                  } else setPinError('PIN must be exactly 4 digits.');
                                }
                              }}
                              placeholder="••••"
                              className="flex-1 px-4 py-2.5 rounded-lg text-white text-center text-lg tracking-[0.5em] font-mono border border-[--border] transition-all"
                              style={{ background: 'var(--bg-input)' }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (pinMode === 'verify') {
                                  if (pinInput === selectedPlayer.pin) { setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null); }
                                  else setPinError('Wrong PIN. Try again.');
                                } else if (pinMode === 'create') {
                                  if (/^\d{4}$/.test(pinInput)) {
                                    setDoc(doc(db, "players", selectedPlayer.id), { pin: pinInput }, { merge: true });
                                    setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null);
                                  } else setPinError('PIN must be exactly 4 digits.');
                                }
                              }}
                              className="btn-gold px-5 py-2.5 rounded-lg text-sm font-bold flex-shrink-0"
                            >
                              {pinMode === 'verify' ? 'Go' : 'Set PIN'}
                            </button>
                          </div>
                          {pinError && <p className="text-red-400 text-xs text-center mt-2 animate-fadeIn">{pinError}</p>}
                        </div>
                      );
                    }

                    /* Avatar section - shown after authentication */
                    if (isAuthed) {
                      return (
                        <div className="mt-4 flex items-center justify-center gap-3 animate-fadeIn">
                          <PlayerAvatar player={selectedPlayer} size="lg" />
                          <div className="text-left">
                            <p className="text-white font-semibold">{selectedPlayer.name}</p>
                            <label className="inline-flex items-center gap-1 text-[10px] font-medium text-[--text-muted] hover:text-[--gold] cursor-pointer transition-colors mt-0.5">
                              <Camera className="w-3 h-3" />
                              {avatarUploading ? 'Uploading...' : (selectedPlayer.avatarUrl ? 'Change Avatar' : 'Add Avatar')}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) uploadAvatar(selectedPlayer.id, file);
                                }}
                                disabled={avatarUploading}
                              />
                            </label>
                          </div>
                          {avatarUploading && <Loader2 className="w-4 h-4 text-[--gold] animate-spin" />}
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              )}

              <h2 className="font-bebas text-4xl sm:text-5xl tracking-wide text-white">{selectedEvent.name}</h2>
              <p className="text-[--text-muted] mt-1">{selectedEvent.date}</p>

              {/* Progress bar */}
              {totalMatches > 0 && selectedEvent.status === 'open' && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[--text-muted]">Picks progress</span>
                    <span className={`font-bold ${pickedCount === totalMatches ? 'text-emerald-400' : 'text-[--gold]'}`}>
                      {pickedCount}/{totalMatches}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 gold-bar-shimmer"
                      style={{ width: `${totalMatches > 0 ? (pickedCount / totalMatches) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Matches - gated behind PIN auth for open events */}
            <div className="p-6 sm:p-8">
              {selectedEvent.status === 'open' && currentUser && (() => {
                const sp = players.find(p => p.name === currentUser);
                return sp && authenticatedPlayerId !== sp.id;
              })() ? (
                <div className="text-center py-16 animate-fadeIn">
                  <KeyRound className="w-14 h-14 text-[--text-muted] mx-auto mb-4" />
                  <p className="text-[--text-secondary] text-lg">Enter your PIN above to view and make picks</p>
                </div>
              ) : !selectedEvent.matches || selectedEvent.matches.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-14 h-14 text-[--text-muted] mx-auto mb-4" />
                  <p className="text-[--text-secondary] text-lg">Matches not yet announced</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exclusive picks notice */}
                  {isExclusivePicksEvent(selectedEvent) && selectedEvent.status === 'open' && (
                    <div className="p-4 rounded-xl border border-indigo-500/20" style={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                      <p className="text-indigo-300 text-sm text-center flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        <span><strong>Exclusive Picks:</strong> Each wrestler can only be picked once for Rumble matches.</span>
                      </p>
                    </div>
                  )}

                  {selectedEvent.matches.map((match, matchIdx) => {
                    const pickKey = `${selectedEvent.id}-${match.id}`;
                    const playerPick = player.picks?.[pickKey];
                    const hasWinner = !!match.winner;
                    const isExclusive = isExclusivePicksMatch(selectedEvent, match.title);
                    const takenPicks = isExclusive ? getPicksTakenByOthers(selectedEvent.id, match.id, currentUser) : {};

                    return (
                      <div
                        key={match.id}
                        className={`rounded-xl border p-5 transition-all duration-300 animate-fadeInUp ${
                          isExclusive ? 'border-indigo-500/20' : 'border-[--border]'
                        }`}
                        style={{ background: 'var(--bg-elevated)', animationDelay: `${matchIdx * 60}ms` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bebas text-lg text-[--text-muted]">{matchIdx + 1}</span>
                            <h3 className="font-outfit font-semibold text-white">{match.title}</h3>
                          </div>
                          {isExclusive && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-indigo-500/30 text-indigo-300" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                              Exclusive
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {match.options.map((option, idx) => {
                            const isPicked = playerPick === option;
                            const isWinner = match.winner === option;
                            const takenByOther = takenPicks[option];
                            const isBlocked = isExclusive && takenByOther && !isPicked;
                            const isOtherOption = isExemptFromExclusive(option);
                            const otherPickers = isExclusive && isOtherOption
                              ? getOtherPickers(selectedEvent.id, match.id, currentUser)
                              : [];

                            let style = 'border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]/50';
                            let bg = 'var(--bg-input)';
                            if (hasWinner) {
                              if (isWinner) { style = 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'; bg = 'rgba(16, 185, 129, 0.08)'; }
                              else if (isPicked && !isWinner) { style = 'border-red-500 text-red-400 shadow-lg shadow-red-500/10'; bg = 'rgba(239, 35, 60, 0.08)'; }
                            } else if (isPicked) {
                              style = 'border-[--gold] text-[--gold] shadow-lg shadow-[--gold-glow]'; bg = 'rgba(201, 168, 76, 0.06)';
                            } else if (isBlocked) {
                              style = 'border-[--border] text-[--text-muted] opacity-50 cursor-not-allowed';
                            }

                            const isDisabled = selectedEvent.status !== 'open' || isBlocked;

                            return (
                              <button
                                key={idx}
                                onClick={() => !isDisabled && submitPick(selectedEvent.id, match.id, option)}
                                disabled={isDisabled}
                                className={`relative p-3.5 rounded-xl font-semibold text-sm border transition-all duration-300 ${style} ${!isDisabled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
                                style={{ background: bg }}
                                title={isBlocked ? `Picked by ${takenByOther}` : ''}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span>{option}</span>
                                  {isPicked && !hasWinner && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-[--gold]">Your Pick</span>
                                  )}
                                  {isWinner && <span className="text-xs">Winner</span>}
                                  {isBlocked && (
                                    <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" /> {takenByOther}
                                    </span>
                                  )}
                                  {isOtherOption && otherPickers.length > 0 && (
                                    <span className="text-[10px] text-[--text-muted]">{otherPickers.join(', ')}</span>
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

              {/* Lock In button */}
              {selectedEvent.status === 'open' && (
                <button
                  onClick={handleLockInPicks}
                  className="w-full mt-8 btn-gold py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Lock In Picks
                </button>
              )}
            </div>
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
          onClose={() => { setShowSubmitModal(false); setCurrentView('home'); }}
          message="Say your prayers and eat your vitamins. Your picks have been submitted, brother."
          type="success"
          autoCloseSeconds={5}
        />
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     EVENT STANDINGS VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const EventStandingsView = () => {
    if (!selectedEvent) return null;
    const isHistorical = historicalEventNames.includes(selectedEvent.name.toUpperCase());

    const playerScores = useMemo(() => {
      let scores;
      if (isHistorical) {
        const eventScores = historicalScores[selectedEvent.name.toUpperCase()];
        scores = Object.keys(eventScores).map(playerName => ({ id: playerName, name: playerName, eventScore: eventScores[playerName] }));
      } else {
        scores = players.map(player => {
          let score = 0;
          if (selectedEvent.matches) {
            selectedEvent.matches.forEach(match => {
              const pickKey = `${selectedEvent.id}-${match.id}`;
              if (match.winner && player.picks && player.picks[pickKey] === match.winner) score += 1;
            });
          }
          return { ...player, eventScore: score };
        });
      }
      return scores.sort((a, b) => b.eventScore - a.eventScore);
    }, [selectedEvent, players]);

    const maxScore = playerScores.length > 0 ? playerScores[0].eventScore : 1;

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setCurrentView('home')} className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Events
          </button>

          <div className="text-center mb-10 animate-slideDown">
            <h2 className="font-bebas text-5xl sm:text-6xl tracking-wide text-white mb-2">{selectedEvent.name}</h2>
            <p className="text-[--text-secondary]">Event Standings</p>
            <div className="rope-divider max-w-xs mx-auto mt-4" />
          </div>

          <div className="space-y-2.5">
            {playerScores.map((player, idx) => {
              const isTop3 = idx < 3;
              const rankStyles = [
                'podium-gold shadow-lg shadow-yellow-500/10',
                'podium-silver shadow-lg shadow-gray-400/10',
                'podium-bronze shadow-lg shadow-orange-500/10',
              ];
              const isExpanded = expandedPlayer === player.id;

              return (
                <div key={player.id} className="animate-fadeInUp" style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Player row */}
                  <div
                    onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl transition-all cursor-pointer ${
                      isTop3 ? rankStyles[idx] : 'border border-[--border] gold-border-glow'
                    } ${isExpanded && !isTop3 ? 'border-[--gold-dark]/40' : ''}`}
                    style={{ ...(!isTop3 ? { background: 'var(--bg-surface)' } : {}) }}
                  >
                    <span className={`font-bebas text-3xl sm:text-4xl w-12 text-center flex-shrink-0 ${isTop3 ? 'text-white' : 'text-[--text-muted]'}`}>
                      {idx + 1}
                    </span>
                    <PlayerAvatar player={players.find(p => p.name === player.name) || player} size={isTop3 ? 'md' : 'sm'} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-outfit font-bold text-lg sm:text-xl truncate ${isTop3 ? 'text-white' : 'text-white'}`}>
                        {player.name}
                      </p>
                      <div className="w-full h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: isTop3 ? 'rgba(255,255,255,0.15)' : 'var(--bg-elevated)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${maxScore > 0 ? (player.eventScore / maxScore) * 100 : 0}%`,
                            background: idx === 0 ? '#d4af37' : idx === 1 ? '#a1a1aa' : idx === 2 ? '#b45309' : 'var(--gold-dark)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {idx === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                      <span className={`font-bebas text-3xl sm:text-4xl ${isTop3 ? 'text-white' : 'text-white'}`}>
                        {player.eventScore}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isTop3 ? 'text-white/60' : 'text-[--text-muted]'} ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Match breakdown panel */}
                  {isExpanded && (
                    <div className="mt-1 rounded-xl border border-[--border] overflow-hidden animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
                      <div className="p-4 space-y-1">
                        {isHistorical ? (
                          <p className="text-[--text-secondary] text-sm text-center py-3">
                            Historical event — scored {player.eventScore} point{player.eventScore !== 1 ? 's' : ''} (match-level data not available)
                          </p>
                        ) : selectedEvent.matches && selectedEvent.matches.length > 0 ? (
                          selectedEvent.matches.map((match) => {
                            const pickKey = `${selectedEvent.id}-${match.id}`;
                            const playerPick = player.picks?.[pickKey];
                            const winner = match.winner;
                            const isCorrect = winner && playerPick === winner;
                            const isWrong = winner && playerPick && playerPick !== winner;
                            const noPick = !playerPick;
                            const pending = !winner;

                            return (
                              <div key={match.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-all gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-white font-medium truncate">{match.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-[--text-muted]">Pick:</span>
                                    <span className={`text-xs font-medium ${noPick ? 'text-[--text-muted] italic' : isCorrect ? 'text-emerald-400' : isWrong ? 'text-red-400' : 'text-white'}`}>
                                      {noPick ? 'No pick' : playerPick}
                                    </span>
                                    {winner && (
                                      <>
                                        <span className="text-xs text-[--text-muted]">Winner:</span>
                                        <span className="text-xs font-medium text-white">{winner}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {isCorrect && <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-400" /></div>}
                                  {isWrong && <div className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></div>}
                                  {noPick && <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"><Minus className="w-3.5 h-3.5 text-[--text-muted]" /></div>}
                                  {pending && !noPick && <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"><span className="text-[10px] text-[--text-muted]">TBD</span></div>}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[--text-muted] text-sm text-center py-3">No matches in this event.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {playerScores.length === 0 && (
              <p className="text-[--text-muted] text-center py-12">No standings data available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LIVE RESULTS TRACKER VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const LiveResultsView = () => {
    const liveEvent = events.find(e => e.id === selectedEvent?.id) || selectedEvent;
    if (!liveEvent) return null;

    const [expandedMatch, setExpandedMatch] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [scoreFlash, setScoreFlash] = useState({});

    const myPlayer = currentUser ? players.find(p => p.name === currentUser) : null;

    const playerScores = useMemo(() => {
      return players.map(player => {
        let score = 0;
        if (liveEvent.matches) {
          liveEvent.matches.forEach(match => {
            const pickKey = `${liveEvent.id}-${match.id}`;
            if (match.winner && player.picks?.[pickKey] === match.winner) score += 1;
          });
        }
        return { ...player, eventScore: score };
      }).sort((a, b) => b.eventScore - a.eventScore);
    }, [liveEvent, players]);

    const myScore = myPlayer ? (playerScores.find(p => p.id === myPlayer.id)?.eventScore || 0) : 0;
    const prevMyScoreRef = useRef(myScore);

    useEffect(() => {
      if (myScore > prevMyScoreRef.current) {
        const decidedList = liveEvent.matches?.filter(m => m.winner) || [];
        const latest = decidedList[decidedList.length - 1];
        if (latest) {
          const pickKey = `${liveEvent.id}-${latest.id}`;
          if (myPlayer?.picks?.[pickKey] === latest.winner) {
            setScoreFlash(prev => ({ ...prev, [latest.id]: 'correct' }));
            setTimeout(() => setScoreFlash(prev => { const n = { ...prev }; delete n[latest.id]; return n; }), 2500);
          }
        }
      }
      prevMyScoreRef.current = myScore;
    }, [myScore]);

    const decidedMatches = liveEvent.matches?.filter(m => m.winner) || [];
    const totalMatches = liveEvent.matches?.length || 0;
    const progress = totalMatches > 0 ? (decidedMatches.length / totalMatches) * 100 : 0;
    const allDecided = totalMatches > 0 && decidedMatches.length === totalMatches;
    const isCompleted = liveEvent.status === 'completed';

    const LeaderboardContent = () => (
      <div className="space-y-1">
        {playerScores.map((player, idx) => {
          const isMe = player.name === currentUser;
          return (
            <div key={player.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${isMe ? 'border border-[--gold-dark]/40' : ''}`}
              style={{ background: isMe ? 'rgba(201,168,76,0.06)' : 'transparent' }}>
              <span className={`font-bebas text-lg w-6 text-center ${idx < 3 ? 'text-[--gold]' : 'text-[--text-muted]'}`}>{idx + 1}</span>
              <PlayerAvatar player={player} size="xs" />
              <span className={`text-sm font-medium flex-1 truncate ${isMe ? 'text-[--gold]' : 'text-white'}`}>
                {player.name}{isMe ? ' (You)' : ''}
              </span>
              <span className="font-bebas text-lg text-white">{player.eventScore}</span>
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slideDown">
            <button onClick={() => setCurrentView('home')} className="inline-flex items-center gap-1 text-[--text-secondary] hover:text-[--gold] text-sm mb-6 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Events
            </button>

            {isCompleted || allDecided ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-4 ml-4" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Event Complete</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-4 ml-4" style={{ background: 'rgba(239, 35, 60, 0.08)' }}>
                <span className="status-dot status-dot-live" />
                <span className="text-red-400">Live</span>
              </div>
            )}

            <h2 className="font-bebas text-5xl sm:text-6xl tracking-wide text-white mb-2">{liveEvent.name}</h2>

            {/* Progress bar */}
            <div className="max-w-xs mx-auto mt-4">
              <div className="flex justify-between text-xs text-[--text-muted] mb-1">
                <span>{decidedMatches.length} of {totalMatches} decided</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full transition-all duration-700 gold-bar-shimmer" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Player selector */}
            {!currentUser ? (
              <div className="mt-6 max-w-xs mx-auto">
                <select value="" onChange={e => setCurrentUser(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-center text-sm font-semibold border border-[--gold-dark]/40 appearance-none cursor-pointer"
                  style={{ background: 'var(--bg-input)' }}>
                  <option value="" disabled>Who are you? (optional)</option>
                  {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            ) : (
              <p className="text-sm text-[--text-secondary] mt-3">
                Tracking as <span className="text-[--gold] font-semibold">{currentUser}</span>
                <button onClick={() => setCurrentUser(null)} className="ml-2 text-[--text-muted] hover:text-white text-xs underline transition-colors">change</button>
              </p>
            )}

            {/* Your score summary */}
            {myPlayer && (
              <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-[--gold-dark]/30" style={{ background: 'rgba(201,168,76,0.06)' }}>
                <PlayerAvatar player={myPlayer} size="sm" />
                <span className="font-bebas text-3xl text-[--gold]">{myScore}</span>
                <span className="text-xs text-[--text-secondary]">/ {totalMatches}</span>
              </div>
            )}

            <div className="rope-divider max-w-sm mx-auto mt-6" />
          </div>

          {/* Mobile leaderboard toggle */}
          <div className="lg:hidden mb-4">
            <button onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[--border] text-sm font-medium text-[--text-secondary] transition-all"
              style={{ background: 'var(--bg-surface)' }}>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[--gold]" /> Leaderboard</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} />
            </button>
            {showLeaderboard && (
              <div className="mt-2 rounded-xl border border-[--border] p-3 animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
                <LeaderboardContent />
              </div>
            )}
          </div>

          {/* Two-column layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Match Feed */}
            <div className="lg:col-span-2 space-y-3">
              {(!liveEvent.matches || liveEvent.matches.length === 0) && (
                <div className="glass-card rounded-xl p-8 text-center border border-[--border]">
                  <p className="text-[--text-muted]">No matches in this event yet.</p>
                </div>
              )}

              {liveEvent.matches?.map((match, idx) => {
                const isDecided = !!match.winner;
                const pickKey = `${liveEvent.id}-${match.id}`;
                const myPick = myPlayer?.picks?.[pickKey];
                const isCorrect = isDecided && myPick === match.winner;
                const isWrong = isDecided && myPick && myPick !== match.winner;
                const noPick = !myPick;
                const isFlashing = scoreFlash[match.id] === 'correct';

                if (isDecided) {
                  return (
                    <div key={match.id} className={`rounded-xl border overflow-hidden animate-fadeInUp card-gold-accent ${isFlashing ? 'border-emerald-500/50' : 'border-[--border]'}`}
                      style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 60}ms` }}>
                      {/* Match header */}
                      <div className="px-5 py-3 border-b border-[--border] flex items-center justify-between" style={{ background: 'var(--bg-elevated)' }}>
                        <h3 className="font-bebas text-lg tracking-wide text-white">{match.title}</h3>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-500/30 text-emerald-400" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                          <Check className="w-3 h-3" /> Decided
                        </span>
                      </div>

                      <div className="p-5">
                        {/* Winner */}
                        <div className="flex items-center gap-3 mb-3">
                          <Trophy className="w-5 h-5 text-[--gold]" />
                          <span className="font-outfit font-bold text-lg text-white">{match.winner}</span>
                        </div>

                        {/* Your pick result */}
                        {myPlayer && (
                          <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                            noPick ? 'text-[--text-muted] border border-[--border]' :
                            isCorrect ? 'text-emerald-400 border border-emerald-500/30' :
                            'text-red-400 border border-red-500/30'
                          }`} style={{ background: noPick ? 'var(--bg-elevated)' : isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,35,60,0.08)' }}>
                            {isCorrect ? <Check className="w-4 h-4" /> : isWrong ? <X className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            {noPick ? 'No pick' : `You picked: ${myPick}`}
                            {isCorrect && <span className="font-bold ml-1">+1</span>}
                            {isFlashing && (
                              <span className="absolute -top-3 -right-3 text-emerald-400 font-bebas text-2xl animate-scorePopUp">+1</span>
                            )}
                          </div>
                        )}

                        {/* Expand to see all picks */}
                        <button onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                          className="mt-3 text-xs text-[--text-secondary] hover:text-white flex items-center gap-1 transition-all">
                          <Users className="w-3.5 h-3.5" />
                          {expandedMatch === match.id ? 'Hide' : 'Show'} all picks
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedMatch === match.id ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedMatch === match.id && (
                          <div className="mt-3 space-y-2 animate-fadeInUp">
                            {match.options.map(option => {
                              const pickers = players.filter(p => p.picks?.[pickKey] === option);
                              const isWinningOption = option === match.winner;
                              return (
                                <div key={option} className={`p-3 rounded-lg border ${isWinningOption ? 'border-emerald-500/30' : 'border-[--border]'}`}
                                  style={{ background: isWinningOption ? 'rgba(16,185,129,0.05)' : 'var(--bg-elevated)' }}>
                                  <div className="flex justify-between items-center">
                                    <span className={`text-sm font-medium ${isWinningOption ? 'text-emerald-400' : 'text-white'}`}>
                                      {isWinningOption && <Trophy className="w-3 h-3 inline mr-1" />}{option}
                                    </span>
                                    <span className="text-xs text-[--text-muted]">{pickers.length} pick{pickers.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  {pickers.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {pickers.map(p => (
                                        <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-[--border-light] text-[--text-secondary]" style={{ background: 'var(--bg-input)' }}>
                                          <PlayerAvatar player={p} size="xs" />{p.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                {/* Pending match */}
                return (
                  <div key={match.id} className="rounded-xl border border-[--border] overflow-hidden opacity-60 animate-fadeInUp"
                    style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 60}ms` }}>
                    <div className="px-5 py-3 border-b border-[--border] flex items-center justify-between" style={{ background: 'var(--bg-elevated)' }}>
                      <h3 className="font-bebas text-lg tracking-wide text-white">{match.title}</h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-[--border-light] text-[--text-muted]" style={{ background: 'var(--bg-elevated)' }}>
                        <Clock className="w-3 h-3" /> Awaiting
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {match.options.map(option => (
                          <span key={option} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[--border-light] text-[--text-secondary]" style={{ background: 'var(--bg-input)' }}>
                            {option}
                          </span>
                        ))}
                      </div>
                      {myPlayer && (
                        myPick ? (
                          <p className="mt-3 text-xs text-[--text-muted]">Your pick: <span className="text-white font-medium">{myPick}</span></p>
                        ) : (
                          <p className="mt-3 text-xs text-[--text-muted] italic">No pick made</p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Leaderboard Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-[--border] overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                <div className="px-4 py-3 border-b border-[--border] flex items-center gap-2" style={{ background: 'var(--bg-elevated)' }}>
                  <TrendingUp className="w-4 h-4 text-[--gold]" />
                  <h3 className="font-bebas text-lg tracking-wide text-white">Leaderboard</h3>
                </div>
                <div className="p-3 max-h-[60vh] overflow-y-auto">
                  <LeaderboardContent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     EVENT PREDICTIONS VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const EventPredictionsView = ({ selectedEvent, players, onBack }) => {
    if (!selectedEvent || !selectedEvent.matches) return null;

    const predictions = selectedEvent.matches.map(match => {
      const picksByOption = match.options.reduce((acc, option) => { acc[option] = []; return acc; }, {});
      players.forEach(player => {
        const pickKey = `${selectedEvent.id}-${match.id}`;
        const playerPick = player.picks?.[pickKey];
        if (playerPick && picksByOption.hasOwnProperty(playerPick)) picksByOption[playerPick].push(player.name);
      });
      return { matchTitle: match.title, picks: picksByOption, winner: match.winner };
    });

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={onBack} className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Events
          </button>

          <div className="text-center mb-10 animate-slideDown">
            <h2 className="font-bebas text-5xl sm:text-6xl tracking-wide text-white mb-2">{selectedEvent.name}</h2>
            <p className="text-[--text-secondary]">Player Predictions</p>
            <div className="rope-divider max-w-xs mx-auto mt-4" />
          </div>

          <div className="space-y-6">
            {predictions.map((prediction, idx) => (
              <div key={idx} className="rounded-xl border border-[--border] card-gold-accent overflow-hidden animate-fadeInUp" style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 80}ms` }}>
                <div className="px-5 py-4 border-b border-[--border]" style={{ background: 'var(--bg-elevated)' }}>
                  <h3 className="font-bebas text-xl tracking-wide text-white">{prediction.matchTitle}</h3>
                </div>
                <div className="p-5 space-y-2">
                  {Object.entries(prediction.picks).map(([option, playerNames]) => {
                    const isWinner = prediction.winner === option;
                    return (
                      <div
                        key={option}
                        className={`p-3.5 rounded-lg border transition-all ${
                          isWinner ? 'border-emerald-500/40' : 'border-[--border]'
                        }`}
                        style={{ background: isWinner ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-elevated)' }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className={`font-semibold text-sm ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                            {isWinner && <Trophy className="w-3.5 h-3.5 inline mr-1.5" />}
                            {option}
                          </p>
                          <span className="text-xs text-[--text-muted] font-medium">{playerNames.length} pick{playerNames.length !== 1 ? 's' : ''}</span>
                        </div>
                        {playerNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {playerNames.map(name => {
                              const p = players.find(pl => pl.name === name);
                              return (
                                <span key={name} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border border-[--border-light] text-[--text-secondary]" style={{ background: 'var(--bg-input)' }}>
                                  <PlayerAvatar player={p || { name }} size="xs" />
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-[--text-muted] mt-1">No players picked this.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {predictions.length === 0 && <p className="text-[--text-muted] text-center py-12">No matches available for this event.</p>}
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     GLOBAL STANDINGS VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const StandingsView = () => {
    const allPlayerNames = useMemo(() => {
      const firestorePlayers = players.map(p => p.name);
      const historicalPlayers = Object.values(historicalScores).flatMap(scores => Object.keys(scores));
      return [...new Set([...firestorePlayers, ...historicalPlayers])];
    }, [players]);

    const sortedPlayers = allPlayerNames
      .map(name => {
        const playerObject = players.find(p => p.name === name) || { name, id: name };
        return { ...playerObject, totalPoints: calculateTotalPoints(playerObject, sortedEvents) };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const maxPoints = sortedPlayers.length > 0 ? sortedPlayers[0].totalPoints : 1;

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-slideDown">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--border-light] text-xs font-medium text-[--text-secondary] mb-6" style={{ background: 'var(--bg-elevated)' }}>
              <TrendingUp className="w-3 h-3 text-[--gold]" />
              All-Time Rankings
            </div>
            <h2 className="font-bebas text-6xl sm:text-7xl tracking-wide text-white mb-2">
              GLOBAL <span className="gold-shimmer">STANDINGS</span>
            </h2>
            <p className="text-[--text-secondary]">Combined scores across all events</p>
            <div className="rope-divider max-w-xs mx-auto mt-6" />
            <button
              onClick={() => setCurrentView('head-to-head')}
              className="mt-6 btn-gold px-6 py-2.5 rounded-lg text-sm font-bold inline-flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Head to Head
            </button>
          </div>

          <div className="space-y-2.5">
            {sortedPlayers.map((player, idx) => {
              const isTop3 = idx < 3;
              const rankStyles = [
                'podium-gold shadow-lg shadow-yellow-500/10',
                'podium-silver shadow-lg shadow-gray-400/10',
                'podium-bronze shadow-lg shadow-orange-500/10',
              ];
              const isExpanded = expandedPlayer === player.id;
              const breakdown = isExpanded ? getPlayerBreakdown(player, sortedEvents) : [];
              const bonusPoints = player.bonusPoints || 0;

              return (
                <div key={player.id} className="animate-fadeInUp" style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Player row */}
                  <div
                    onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl transition-all cursor-pointer ${
                      isTop3 ? rankStyles[idx] : 'border border-[--border] gold-border-glow'
                    } ${isExpanded && !isTop3 ? 'border-[--gold-dark]/40' : ''}`}
                    style={{ ...(!isTop3 ? { background: 'var(--bg-surface)' } : {}) }}
                  >
                    <span className={`font-bebas text-3xl sm:text-4xl w-12 text-center flex-shrink-0 ${isTop3 ? 'text-white' : 'text-[--text-muted]'}`}>
                      {idx + 1}
                    </span>
                    <PlayerAvatar player={players.find(p => p.name === player.name) || player} size={isTop3 ? 'md' : 'sm'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-outfit font-bold text-lg sm:text-xl text-white truncate">{player.name}</p>
                      <div className="w-full h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: isTop3 ? 'rgba(255,255,255,0.15)' : 'var(--bg-elevated)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${maxPoints > 0 ? (player.totalPoints / maxPoints) * 100 : 0}%`,
                            background: idx === 0 ? '#d4af37' : idx === 1 ? '#a1a1aa' : idx === 2 ? '#b45309' : 'var(--gold-dark)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {idx === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                      <span className="font-bebas text-3xl sm:text-4xl text-white">{player.totalPoints}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isTop3 ? 'text-white/60' : 'text-[--text-muted]'} ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Breakdown panel */}
                  {isExpanded && (
                    <div className="mt-1 rounded-xl border border-[--border] overflow-hidden animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
                      <div className="p-4 space-y-1">
                        {breakdown.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-all">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm text-white font-medium truncate">{entry.eventName}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${entry.totalMatches > 0 ? (entry.score / entry.totalMatches) * 100 : 0}%`,
                                    background: entry.score > 0 ? 'var(--gold)' : 'var(--text-muted)',
                                  }}
                                />
                              </div>
                              <span className={`text-sm font-bold tabular-nums w-12 text-right ${entry.score > 0 ? 'text-[--gold]' : 'text-[--text-muted]'}`}>
                                {entry.score}/{entry.totalMatches}
                              </span>
                            </div>
                          </div>
                        ))}
                        {bonusPoints !== 0 && (
                          <div className="flex items-center justify-between py-2 px-3 rounded-lg border-t border-[--border] mt-1 pt-3">
                            <span className="text-sm text-[--gold] font-medium">Bonus Points</span>
                            <span className="text-sm font-bold text-[--gold] w-12 text-right">+{bonusPoints}</span>
                          </div>
                        )}
                        {breakdown.length === 0 && (
                          <p className="text-[--text-muted] text-sm text-center py-4">No event data available for this player.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HEAD TO HEAD VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const HeadToHeadView = () => {
    const [playerA, setPlayerA] = useState(null);
    const [playerB, setPlayerB] = useState(null);

    const allPlayerNames = useMemo(() => {
      const firestorePlayers = players.map(p => p.name);
      const historicalPlayers = Object.values(historicalScores).flatMap(scores => Object.keys(scores));
      return [...new Set([...firestorePlayers, ...historicalPlayers])].sort();
    }, [players]);

    const getPlayerObject = (name) => players.find(p => p.name === name) || { name, id: name };

    const comparisons = useMemo(() => {
      if (!playerA || !playerB) return [];
      const breakdownA = getPlayerBreakdown(getPlayerObject(playerA), sortedEvents);
      const breakdownB = getPlayerBreakdown(getPlayerObject(playerB), sortedEvents);
      const results = [];
      breakdownA.forEach(a => {
        const b = breakdownB.find(e => e.eventName.toUpperCase() === a.eventName.toUpperCase());
        if (b) {
          results.push({ eventName: a.eventName, scoreA: a.score, scoreB: b.score, totalMatches: Math.max(a.totalMatches, b.totalMatches) });
        }
      });
      return results;
    }, [playerA, playerB, players, sortedEvents]);

    const record = useMemo(() => {
      let aWins = 0, bWins = 0, ties = 0;
      comparisons.forEach(c => {
        if (c.scoreA > c.scoreB) aWins++;
        else if (c.scoreB > c.scoreA) bWins++;
        else ties++;
      });
      return { aWins, bWins, ties };
    }, [comparisons]);

    const biggestBlowout = useMemo(() => {
      if (comparisons.length === 0) return null;
      return comparisons.reduce((max, c) => Math.abs(c.scoreA - c.scoreB) > Math.abs(max.scoreA - max.scoreB) ? c : max, comparisons[0]);
    }, [comparisons]);

    const closestMatch = useMemo(() => {
      if (comparisons.length === 0) return null;
      const nonZero = comparisons.filter(c => c.scoreA !== c.scoreB);
      if (nonZero.length === 0) {
        return comparisons.length > 0 ? { ...comparisons[0], isTie: true } : null;
      }
      return nonZero.reduce((min, c) => Math.abs(c.scoreA - c.scoreB) < Math.abs(min.scoreA - min.scoreB) ? c : min, nonZero[0]);
    }, [comparisons]);

    const playerAObj = playerA ? getPlayerObject(playerA) : null;
    const playerBObj = playerB ? getPlayerObject(playerB) : null;

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-slideDown">
            <button onClick={() => setCurrentView('standings')} className="inline-flex items-center gap-1 text-[--text-secondary] hover:text-[--gold] text-sm mb-6 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Standings
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--border-light] text-xs font-medium text-[--text-secondary] mb-6 ml-4" style={{ background: 'var(--bg-elevated)' }}>
              <Swords className="w-3 h-3 text-[--gold]" />
              Compare Players
            </div>
            <h2 className="font-bebas text-6xl sm:text-7xl tracking-wide text-white mb-2">
              HEAD TO <span className="gold-shimmer">HEAD</span>
            </h2>
            <p className="text-[--text-secondary]">Pick two players and see who dominates</p>
            <div className="rope-divider max-w-xs mx-auto mt-6" />
          </div>

          {/* Player Selectors */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fadeInUp">
            <div className="flex-1">
              <label className="block text-xs text-[--text-secondary] mb-2 font-medium uppercase tracking-wider">Player A</label>
              <select
                value={playerA || ''}
                onChange={e => setPlayerA(e.target.value || null)}
                className="w-full px-4 py-3 rounded-lg text-sm font-outfit text-white"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)' }}
              >
                <option value="">Select Player</option>
                {allPlayerNames.filter(n => n !== playerB).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-center pb-3">
              <Swords className="w-6 h-6 text-[--gold]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[--text-secondary] mb-2 font-medium uppercase tracking-wider">Player B</label>
              <select
                value={playerB || ''}
                onChange={e => setPlayerB(e.target.value || null)}
                className="w-full px-4 py-3 rounded-lg text-sm font-outfit text-white"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)' }}
              >
                <option value="">Select Player</option>
                {allPlayerNames.filter(n => n !== playerA).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {playerA && playerB && (
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              {/* Record Summary */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 border border-[--border]">
                <div className="flex items-center justify-between gap-4">
                  {/* Player A */}
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <PlayerAvatar player={playerAObj} size="lg" />
                    <span className="font-bebas text-lg sm:text-xl text-white truncate max-w-full">{playerA}</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <span className={`font-bebas text-4xl sm:text-5xl ${record.aWins > record.bWins ? 'text-[--gold]' : record.aWins < record.bWins ? 'text-[--text-muted]' : 'text-white'}`}>
                      {record.aWins}
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-[--text-muted] text-xs">-</span>
                      <span className="font-bebas text-2xl sm:text-3xl text-[--text-secondary]">{record.ties}</span>
                      <span className="text-[--text-muted] text-xs">-</span>
                    </div>
                    <span className={`font-bebas text-4xl sm:text-5xl ${record.bWins > record.aWins ? 'text-[--gold]' : record.bWins < record.aWins ? 'text-[--text-muted]' : 'text-white'}`}>
                      {record.bWins}
                    </span>
                  </div>

                  {/* Player B */}
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <PlayerAvatar player={playerBObj} size="lg" />
                    <span className="font-bebas text-lg sm:text-xl text-white truncate max-w-full">{playerB}</span>
                  </div>
                </div>

                {comparisons.length === 0 && (
                  <p className="text-center text-[--text-muted] text-sm mt-6">No shared events found between these players.</p>
                )}
              </div>

              {/* Event-by-Event Breakdown */}
              {comparisons.length > 0 && (
                <div className="space-y-3 mb-8">
                  <h3 className="font-bebas text-2xl text-white mb-4 tracking-wide">Event Breakdown</h3>
                  {comparisons.map((c, idx) => {
                    const total = c.scoreA + c.scoreB || 1;
                    const pctA = (c.scoreA / total) * 100;
                    const aWon = c.scoreA > c.scoreB;
                    const bWon = c.scoreB > c.scoreA;
                    const tied = c.scoreA === c.scoreB;

                    return (
                      <div key={idx} className="glass-card rounded-xl p-4 border border-[--border] gold-border-glow animate-fadeInUp" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="text-center mb-3">
                          <span className="text-xs text-[--text-secondary] font-medium uppercase tracking-wider">{c.eventName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bebas text-2xl w-8 text-right ${aWon ? 'text-[--gold]' : tied ? 'text-[--text-secondary]' : 'text-[--text-muted]'}`}>
                            {c.scoreA}
                          </span>
                          {/* Tug of war bar */}
                          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
                            <div className="h-full flex">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${tied ? 50 : pctA}%`,
                                  background: aWon ? 'var(--gold)' : tied ? 'var(--text-muted)' : 'var(--text-muted)',
                                  borderRadius: '9999px 0 0 9999px',
                                }}
                              />
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${tied ? 50 : 100 - pctA}%`,
                                  background: bWon ? 'var(--royal)' : tied ? 'var(--text-muted)' : 'var(--text-muted)',
                                  borderRadius: '0 9999px 9999px 0',
                                }}
                              />
                            </div>
                          </div>
                          <span className={`font-bebas text-2xl w-8 ${bWon ? 'text-[--royal]' : tied ? 'text-[--text-secondary]' : 'text-[--text-muted]'}`}>
                            {c.scoreB}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fun Callouts */}
              {comparisons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                  {biggestBlowout && Math.abs(biggestBlowout.scoreA - biggestBlowout.scoreB) > 0 && (
                    <div className="glass-card rounded-xl p-5 border border-[--border]">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[--gold]" />
                        <span className="text-xs text-[--text-secondary] font-medium uppercase tracking-wider">Biggest Blowout</span>
                      </div>
                      <p className="font-bebas text-xl text-white">{biggestBlowout.eventName}</p>
                      <p className="text-sm text-[--text-secondary]">
                        <span className={biggestBlowout.scoreA > biggestBlowout.scoreB ? 'text-[--gold]' : 'text-[--royal]'}>
                          {biggestBlowout.scoreA > biggestBlowout.scoreB ? playerA : playerB}
                        </span>
                        {' '}won by {Math.abs(biggestBlowout.scoreA - biggestBlowout.scoreB)}
                      </p>
                    </div>
                  )}
                  {closestMatch && (
                    <div className="glass-card rounded-xl p-5 border border-[--border]">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-[--gold]" />
                        <span className="text-xs text-[--text-secondary] font-medium uppercase tracking-wider">Closest Match</span>
                      </div>
                      <p className="font-bebas text-xl text-white">{closestMatch.eventName}</p>
                      <p className="text-sm text-[--text-secondary]">
                        {closestMatch.isTie || closestMatch.scoreA === closestMatch.scoreB
                          ? 'Dead even — tied!'
                          : <>Won by just {Math.abs(closestMatch.scoreA - closestMatch.scoreB)}</>
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HALL OF FAME VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const HallOfFameView = () => {
    const latestWinner = hallOfFameEntries.length > 0 ? hallOfFameEntries[hallOfFameEntries.length - 1] : null;
    const previousWinners = hallOfFameEntries.length > 1 ? hallOfFameEntries.slice(0, hallOfFameEntries.length - 1).reverse() : [];

    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slideDown">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--gold-dark]/30 text-xs font-medium text-[--gold] mb-6" style={{ background: 'rgba(201, 168, 76, 0.04)' }}>
              <Award className="w-3 h-3" />
              Legends of BWL
            </div>
            <h2 className="font-bebas text-6xl sm:text-7xl tracking-wide leading-none mb-2">
              <span className="text-white">HALL OF </span>
              <span className="gold-shimmer">FAME</span>
            </h2>
            <div className="rope-divider max-w-xs mx-auto mt-6" />
          </div>

          {hallOfFameEntries.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <Award className="w-16 h-16 text-[--text-muted] mx-auto mb-4" />
              <p className="text-[--text-secondary] text-lg">The Hall of Fame is empty. A new legend awaits their coronation.</p>
            </div>
          ) : (
            <>
              {/* Latest inductee spotlight */}
              {latestWinner && (
                <div className="relative mb-16 rounded-2xl overflow-hidden border border-[--gold-dark]/30 animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
                  {/* Spotlight sweep */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className="absolute top-0 left-0 w-1/3 h-full opacity-10"
                      style={{ background: 'linear-gradient(90deg, transparent, var(--gold-light), transparent)', animation: 'spotlight 4s linear infinite' }}
                    />
                  </div>
                  {/* Gold top border */}
                  <div className="h-1 gold-bar-shimmer" />

                  <div className="p-8 sm:p-12">
                    <div className="text-center mb-8">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[--gold]">
                        <Star className="w-3 h-3" /> Latest Inductee <Star className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                      <div className="md:w-1/2 relative">
                        {latestWinner.imageUrl && (
                          <div className="relative rounded-xl overflow-hidden border-2 border-[--gold-dark]/40 shadow-2xl shadow-black/50">
                            <img src={latestWinner.imageUrl} alt={latestWinner.title} className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                        )}
                      </div>
                      <div className="md:w-1/2 text-center md:text-left">
                        <h3 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide mb-3">{latestWinner.title}</h3>
                        {latestWinner.description && (
                          <p className="text-xl text-[--gold] font-semibold">{latestWinner.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Previous champions */}
              {previousWinners.length > 0 && (
                <>
                  <div className="text-center mb-8">
                    <h3 className="font-bebas text-3xl tracking-wide text-white">Previous Champions</h3>
                    <div className="rope-divider max-w-xs mx-auto mt-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {previousWinners.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="group rounded-xl overflow-hidden border border-[--border] gold-border-glow hover-lift animate-fadeInUp flex flex-col"
                        style={{ background: 'var(--bg-surface)', animationDelay: `${index * 100}ms` }}
                      >
                        <div className="relative h-64 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          {entry.imageUrl ? (
                            <img src={entry.imageUrl} alt={entry.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Trophy className="w-16 h-16 text-[--text-muted]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[--bg-surface] via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <Award className="w-8 h-8 text-[--gold]" style={{ animation: 'float 3s ease-in-out infinite' }} />
                          </div>
                        </div>
                        <div className="p-5 text-center">
                          <h4 className="font-bebas text-2xl text-white tracking-wide">{entry.title}</h4>
                          {entry.description && <p className="text-[--gold] text-sm mt-1">{entry.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ADMIN LOGIN VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const AdminLoginView = () => {
    const [localPassword, setLocalPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
      if (localPassword === 'ssj') {
        setIsAdmin(true); setCurrentView('admin');
        setAdminPassword(''); setLocalPassword('');
      } else alert('Incorrect password');
    };

    return (
      <div className="min-h-screen arena-bg flex items-center justify-center px-4">
        <div className="rounded-2xl border border-[--border] p-8 max-w-sm w-full animate-scaleIn" style={{ background: 'var(--bg-surface)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-input))' }}>
              <Shield className="w-8 h-8 text-[--gold]" />
            </div>
            <h2 className="font-bebas text-3xl tracking-wide text-white">Admin Access</h2>
            <p className="text-sm text-[--text-muted] mt-1">Enter your password to continue</p>
          </div>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-xl text-white border border-[--border] pr-10 transition-all"
              style={{ background: 'var(--bg-input)' }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="btn-gold w-full py-3 rounded-xl font-bold text-sm"
          >
            Login
          </button>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ADMIN: Player Management
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const PlayerManagement = ({ isMinimized, onToggleMinimize }) => {
    const [localPlayerName, setLocalPlayerName] = useState('');
    const [settingPinFor, setSettingPinFor] = useState(null);
    const [adminPinInput, setAdminPinInput] = useState('');

    const handleAddPlayer = () => { addPlayer(localPlayerName); setLocalPlayerName(''); };

    const handleAdminSetPin = async (playerId) => {
      if (!/^\d{4}$/.test(adminPinInput)) { alert('PIN must be exactly 4 digits.'); return; }
      await setDoc(doc(db, "players", playerId), { pin: adminPinInput }, { merge: true });
      setSettingPinFor(null);
      setAdminPinInput('');
    };

    return (
      <div className="mt-6 rounded-xl border border-[--border] card-gold-accent" style={{ background: 'var(--bg-surface)' }}>
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer border-b border-[--border] hover:bg-white/[0.02] transition-all"
          onClick={onToggleMinimize}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-[--gold]" />
            <h3 className="font-bebas text-xl tracking-wide text-white">Player Management</h3>
            <span className="text-xs text-[--text-muted] font-medium">{players.length} players</span>
          </div>
          <button className="p-1.5 rounded-md text-[--text-muted]">
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <div className={`collapse-section ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
          <div className="p-5">
            {/* Add player */}
            <div className="flex gap-2 mb-5">
              <input
                type="text" placeholder="Player name" value={localPlayerName}
                onChange={(e) => setLocalPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] transition-all"
                style={{ background: 'var(--bg-input)' }}
              />
              <button onClick={handleAddPlayer} className="btn-gold px-5 py-2.5 rounded-lg text-sm font-bold">
                Add
              </button>
            </div>

            {/* Player list */}
            <div className="space-y-2">
              {players.length === 0 ? (
                <p className="text-[--text-muted] text-center py-8 text-sm">No players yet.</p>
              ) : (
                players.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-lg border border-[--border] hover:border-[--border-light] transition-all overflow-hidden"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {/* Top row: avatar, name, points, +/- */}
                    <div className="flex items-center justify-between p-3.5 gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PlayerAvatar player={player} size="sm" />
                        <div className="min-w-0">
                          <span className="text-white font-medium text-sm truncate block">{player.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[--text-muted] text-[10px]">{player.pin ? 'PIN set' : 'No PIN'}</span>
                            <span className="text-[--text-muted] text-[10px]">|</span>
                            <span className="text-[--text-muted] text-[10px]">{player.avatarUrl ? 'Has avatar' : 'No avatar'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold text-sm">{calculateTotalPoints(player, sortedEvents)} pts</span>
                          {player.bonusPoints !== undefined && player.bonusPoints !== 0 && (
                            <span className="text-[10px] text-[--gold] font-medium">+{player.bonusPoints}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => adjustBonusPoints(player.id, -1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                          >-</button>
                          <button
                            onClick={() => adjustBonusPoints(player.id, 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >+</button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: admin actions */}
                    <div className="flex items-center gap-2 px-3.5 pb-3 flex-wrap">
                      {/* Avatar: Upload / Remove */}
                      <label className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-[--border-light] text-[--text-secondary] hover:text-[--gold] hover:border-[--gold-dark] transition-all flex items-center gap-1.5 cursor-pointer">
                        <Camera className="w-3 h-3" />
                        {player.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) uploadAvatar(player.id, file);
                          }}
                        />
                      </label>
                      {player.avatarUrl && (
                        <button
                          onClick={() => removeAvatar(player.id)}
                          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-all flex items-center gap-1.5"
                        >
                          <X className="w-3 h-3" />
                          Remove Avatar
                        </button>
                      )}

                      {/* PIN: Set / Reset */}
                      {player.pin ? (
                        <button
                          onClick={() => setDoc(doc(db, "players", player.id), { pin: deleteField() }, { merge: true })}
                          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3 h-3" />
                          Reset PIN
                        </button>
                      ) : (
                        <>
                          {settingPinFor === player.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                pattern="[0-9]*"
                                placeholder="4-digit PIN"
                                value={adminPinInput}
                                onChange={(e) => setAdminPinInput(e.target.value.replace(/\D/g, ''))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdminSetPin(player.id)}
                                className="w-24 px-2 py-1.5 rounded-md text-[11px] text-white border border-[--border] transition-all text-center"
                                style={{ background: 'var(--bg-input)' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleAdminSetPin(player.id)}
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                              >Save</button>
                              <button
                                onClick={() => { setSettingPinFor(null); setAdminPinInput(''); }}
                                className="px-2 py-1.5 rounded-md text-[11px] text-[--text-muted] hover:text-white border border-[--border] transition-all"
                              >Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setSettingPinFor(player.id); setAdminPinInput(''); }}
                              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-[--border-light] text-[--text-secondary] hover:text-[--gold] hover:border-[--gold-dark] transition-all flex items-center gap-1.5"
                            >
                              <KeyRound className="w-3 h-3" />
                              Set PIN
                            </button>
                          )}
                        </>
                      )}

                      {/* Delete player */}
                      <button
                        onClick={() => deletePlayer(player.id)}
                        className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-all ml-auto"
                      >
                        Delete Player
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ADMIN: Hall of Fame Management
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const HallOfFameManagement = ({ entries, onAddEntry, onUpdateEntry, onDeleteEntry, isMinimized, onToggleMinimize }) => {
    const [newEntry, setNewEntry] = useState({ title: '', description: '', imageFile: null, imageUrl: '' });
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [localEditingData, setLocalEditingData] = useState(null);

    useEffect(() => {
      if (editingEntryId) {
        const entry = entries.find(e => e.id === editingEntryId);
        setLocalEditingData(entry ? { ...entry } : null);
      } else setLocalEditingData(null);
    }, [editingEntryId, entries]);

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const localUrl = URL.createObjectURL(file);
        if (editingEntryId) setLocalEditingData(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
        else setNewEntry(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
      }
    };

    const handleAddOrUpdate = () => {
      if (editingEntryId) { onUpdateEntry(editingEntryId, localEditingData); setEditingEntryId(null); }
      else {
        if (newEntry.title && newEntry.imageFile) { onAddEntry(newEntry); setNewEntry({ title: '', description: '', imageFile: null, imageUrl: '' }); }
        else alert('Please provide a title and image.');
      }
    };

    return (
      <div className="mt-6 rounded-xl border border-[--border] card-gold-accent" style={{ background: 'var(--bg-surface)' }}>
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer border-b border-[--border] hover:bg-white/[0.02] transition-all"
          onClick={onToggleMinimize}
        >
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-[--gold]" />
            <h3 className="font-bebas text-xl tracking-wide text-white">Hall of Fame</h3>
            <span className="text-xs text-[--text-muted] font-medium">{entries.length} entries</span>
          </div>
          <button className="p-1.5 rounded-md text-[--text-muted]">
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <div className={`collapse-section ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
          <div className="p-5">
            {/* Add/Edit form */}
            <div className="p-4 rounded-lg border border-[--border] mb-5" style={{ background: 'var(--bg-elevated)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-3">
                {editingEntryId ? 'Edit Entry' : 'Add New Entry'}
              </h4>
              <input
                type="text"
                placeholder="Title (e.g., 2025 Mr. Predictamania | Johnny)"
                value={editingEntryId ? (localEditingData?.title || '') : newEntry.title}
                onChange={(e) => editingEntryId ? setLocalEditingData(prev => ({ ...prev, title: e.target.value })) : setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] mb-2 transition-all"
                style={{ background: 'var(--bg-input)' }}
              />
              <textarea
                placeholder="Description (optional)"
                value={editingEntryId ? (localEditingData?.description || '') : newEntry.description}
                onChange={(e) => editingEntryId ? setLocalEditingData(prev => ({ ...prev, description: e.target.value })) : setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                rows="2"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] mb-2 resize-y transition-all"
                style={{ background: 'var(--bg-input)' }}
              />
              <label className="block border-2 border-dashed border-[--border-light] rounded-lg p-4 text-center cursor-pointer hover:border-[--gold-dark] transition-all mb-3">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {(editingEntryId ? localEditingData?.imageUrl : newEntry.imageUrl) ? (
                  <div>
                    <img src={editingEntryId ? localEditingData.imageUrl : newEntry.imageUrl} alt="Preview" className="w-full h-28 object-cover rounded-md mb-2" />
                    <p className="text-xs text-[--text-muted]">Click to change image</p>
                  </div>
                ) : (
                  <p className="text-sm text-[--text-muted]">Click to upload image</p>
                )}
              </label>
              <div className="flex gap-2">
                <button onClick={handleAddOrUpdate} className="flex-1 btn-gold py-2.5 rounded-lg text-sm font-bold">
                  {editingEntryId ? 'Save Changes' : 'Add Entry'}
                </button>
                {editingEntryId && (
                  <button
                    onClick={() => setEditingEntryId(null)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[--border-light] text-[--text-secondary] hover:text-white transition-all"
                    style={{ background: 'var(--bg-input)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Entries list */}
            <div className="space-y-2">
              {entries.length === 0 ? (
                <p className="text-[--text-muted] text-center py-8 text-sm">No entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-[--border] hover:border-[--border-light] transition-all"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {entry.imageUrl && <img src={entry.imageUrl} alt={entry.title} className="w-10 h-10 object-cover rounded-lg border border-[--border] flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{entry.title}</p>
                        {entry.description && <p className="text-[--text-muted] text-xs truncate">{entry.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 ml-3">
                      <button
                        onClick={() => setEditingEntryId(entry.id)}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium border border-[--border-light] text-[--text-secondary] hover:text-white transition-all"
                      >Edit</button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all"
                      >Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ADMIN VIEW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const AdminView = ({ events }) => (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slideDown">
          <div>
            <h2 className="font-bebas text-4xl tracking-wide text-white flex items-center gap-3">
              <Shield className="w-7 h-7 text-[--gold]" />
              Admin Panel
            </h2>
            <p className="text-sm text-[--text-muted] mt-1">Manage events, players, and hall of fame</p>
          </div>
          <button
            onClick={createNewEvent}
            className="btn-gold px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>

        {/* Events list */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <EventEditorCard
              key={event.id}
              event={event}
              isEditing={editingEvent === event.id}
              onSetEditing={setEditingEvent}
              onSave={async (id, data) => { await updateEvent(id, data); setEditingEvent(null); }}
              onDelete={deleteEvent}
              onUpdateEvent={updateEvent}
              onAddMatch={addMatch}
              onAddOptionToMatch={addOptionToMatch}
              onResetPlayerPick={resetPlayerPick}
              onResetAllPlayerPicks={resetAllPlayerPicks}
              players={players}
              animationDelay={`${index * 80}ms`}
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


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navigation />
      {currentView === 'home' && <HomeView events={sortedEvents} />}
      {currentView === 'make-picks' && <MakePicksView />}
      {currentView === 'event-standings' && <EventStandingsView />}
      {currentView === 'event-predictions' && <EventPredictionsView selectedEvent={selectedEvent} players={players} onBack={() => setCurrentView('home')} />}
      {currentView === 'live-results' && <LiveResultsView />}
      {currentView === 'standings' && <StandingsView />}
      {currentView === 'head-to-head' && <HeadToHeadView />}
      {currentView === 'halloffame' && <HallOfFameView />}
      {currentView === 'login' && <AdminLoginView />}
      {currentView === 'admin' && isAdmin && <AdminView events={sortedEvents} />}
    </div>
  );
};

export default FantasyWrestlingApp;
