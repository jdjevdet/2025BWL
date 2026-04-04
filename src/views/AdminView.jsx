import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, Save, Award, Users, ChevronUp, ChevronDown, X, Shield, Camera, KeyRound } from 'lucide-react';
import { doc, setDoc, deleteField } from "firebase/firestore";
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { calculateTotalPoints } from '../utils/scoring';
import PlayerAvatar from '../components/PlayerAvatar';

/* ──────────────────────────────────────────────
   Add Match Form
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
   Event Editor Card
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

      <div className={`collapse-section ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
        <div className="p-5">
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
              <div>
                <label className="block text-[10px] text-[--text-muted] uppercase tracking-wider mb-1 font-medium">Pick Deadline (optional)</label>
                <input
                  type="datetime-local"
                  value={localData.deadline || ''}
                  onChange={(e) => setLocalData({ ...localData, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white border border-[--border] transition-all"
                  style={{ background: 'var(--bg-input)', colorScheme: 'dark' }}
                />
              </div>
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

/* ──────────────────────────────────────────────
   Player Management
   ────────────────────────────────────────────── */
const PlayerManagement = () => {
  const {
    players, sortedEvents, isPlayerManagementMinimized, setIsPlayerManagementMinimized,
    deletePlayer, addPlayer, adjustBonusPoints, uploadAvatar, removeAvatar,
  } = useApp();
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
        onClick={() => setIsPlayerManagementMinimized(p => !p)}
      >
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-[--gold]" />
          <h3 className="font-bebas text-xl tracking-wide text-white">Player Management</h3>
          <span className="text-xs text-[--text-muted] font-medium">{players.length} players</span>
        </div>
        <button className="p-1.5 rounded-md text-[--text-muted]">
          {isPlayerManagementMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      <div className={`collapse-section ${isPlayerManagementMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
        <div className="p-5">
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

                  <div className="flex items-center gap-2 px-3.5 pb-3 flex-wrap">
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

/* ──────────────────────────────────────────────
   Hall of Fame Management
   ────────────────────────────────────────────── */
const HallOfFameManagement = () => {
  const {
    hallOfFameEntries, isHallOfFameMinimized, setIsHallOfFameMinimized,
    addHallOfFameEntry, updateHallOfFameEntry, deleteHallOfFameEntry,
  } = useApp();
  const [newEntry, setNewEntry] = useState({ title: '', description: '', imageFile: null, imageUrl: '' });
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [localEditingData, setLocalEditingData] = useState(null);

  useEffect(() => {
    if (editingEntryId) {
      const entry = hallOfFameEntries.find(e => e.id === editingEntryId);
      setLocalEditingData(entry ? { ...entry } : null);
    } else setLocalEditingData(null);
  }, [editingEntryId, hallOfFameEntries]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      if (editingEntryId) setLocalEditingData(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
      else setNewEntry(prev => ({ ...prev, imageFile: file, imageUrl: localUrl }));
    }
  };

  const handleAddOrUpdate = () => {
    if (editingEntryId) { updateHallOfFameEntry(editingEntryId, localEditingData); setEditingEntryId(null); }
    else {
      if (newEntry.title && newEntry.imageFile) { addHallOfFameEntry(newEntry); setNewEntry({ title: '', description: '', imageFile: null, imageUrl: '' }); }
      else alert('Please provide a title and image.');
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-[--border] card-gold-accent" style={{ background: 'var(--bg-surface)' }}>
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer border-b border-[--border] hover:bg-white/[0.02] transition-all"
        onClick={() => setIsHallOfFameMinimized(p => !p)}
      >
        <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-[--gold]" />
          <h3 className="font-bebas text-xl tracking-wide text-white">Hall of Fame</h3>
          <span className="text-xs text-[--text-muted] font-medium">{hallOfFameEntries.length} entries</span>
        </div>
        <button className="p-1.5 rounded-md text-[--text-muted]">
          {isHallOfFameMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      <div className={`collapse-section ${isHallOfFameMinimized ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
        <div className="p-5">
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

          <div className="space-y-2">
            {hallOfFameEntries.length === 0 ? (
              <p className="text-[--text-muted] text-center py-8 text-sm">No entries yet.</p>
            ) : (
              hallOfFameEntries.map((entry) => (
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
                      onClick={() => deleteHallOfFameEntry(entry.id)}
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

/* ──────────────────────────────────────────────
   Admin View (main)
   ────────────────────────────────────────────── */
const AdminView = () => {
  const {
    sortedEvents, players, editingEvent, setEditingEvent, minimizedEvents, toggleMinimizeEvent,
    createNewEvent, updateEvent, deleteEvent, addMatch, addOptionToMatch,
    resetPlayerPick, resetAllPlayerPicks,
  } = useApp();

  return (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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

        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
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

        <PlayerManagement />
        <HallOfFameManagement />
      </div>
    </div>
  );
};

export default AdminView;
