import React, { useState } from 'react';
import { ChevronRight, Calendar, Lock, Target, KeyRound, Loader2, Camera } from 'lucide-react';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { isExclusivePicksEvent, isExclusivePicksMatch, isExemptFromExclusive, getOtherPickers, getPicksTakenByOthers } from '../utils/helpers';
import PlayerAvatar from '../components/PlayerAvatar';
import CountdownBadge from '../components/CountdownBadge';
import Modal from '../components/Modal';

const MakePicksView = () => {
  const {
    selectedEvent, setCurrentView, currentUser, setCurrentUser,
    players, authenticatedPlayerId, setAuthenticatedPlayerId,
    avatarUploading, uploadAvatar, submitPick, handlePicksSubmitted,
  } = useApp();

  const player = players.find(p => p.name === currentUser) || { picks: {} };
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinMode, setPinMode] = useState(null);

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

  const handlePlayerSelect = (name) => {
    setCurrentUser(name);
    const selectedPlayer = players.find(p => p.name === name);
    if (selectedPlayer && authenticatedPlayerId === selectedPlayer.id) return;
    setPinInput('');
    setPinError('');
    if (selectedPlayer?.pin) setPinMode('verify');
    else setPinMode('create');
  };

  const handlePinSubmit = (selectedPlayer) => {
    if (pinMode === 'verify') {
      if (pinInput === selectedPlayer.pin) { setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null); }
      else setPinError('Wrong PIN. Try again.');
    } else if (pinMode === 'create') {
      if (/^\d{4}$/.test(pinInput)) {
        setDoc(doc(db, "players", selectedPlayer.id), { pin: pinInput }, { merge: true });
        setAuthenticatedPlayerId(selectedPlayer.id); setPinInput(''); setPinError(''); setPinMode(null);
      } else setPinError('PIN must be exactly 4 digits.');
    }
  };

  return (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentView('home')}
          className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Events
        </button>

        {selectedEvent.deadline && <CountdownBadge deadline={selectedEvent.deadline} variant="bar" />}

        <div className="rounded-2xl border border-[--border] overflow-hidden animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-[--border]" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))' }}>
            {selectedEvent.status === 'open' && (
              <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-[--gold-dark]/40" style={{ background: 'rgba(201, 168, 76, 0.03)' }}>
                <label className="block text-xs font-bold uppercase tracking-widest text-[--gold] mb-2 text-center">
                  Select Your Name
                </label>
                <select
                  value={currentUser || ''}
                  onChange={(e) => handlePlayerSelect(e.target.value)}
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xs mx-auto">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            pattern="[0-9]*"
                            autoComplete="off"
                            value={pinInput}
                            onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                            onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit(selectedPlayer)}
                            placeholder="••••"
                            className="flex-1 px-4 py-2.5 rounded-lg text-white text-center text-lg tracking-[0.5em] font-mono border border-[--border] transition-all"
                            style={{ background: 'var(--bg-input)' }}
                            autoFocus
                          />
                          <button
                            onClick={() => handlePinSubmit(selectedPlayer)}
                            className="btn-gold px-5 py-2.5 rounded-lg text-sm font-bold"
                          >
                            {pinMode === 'verify' ? 'Go' : 'Set PIN'}
                          </button>
                        </div>
                        {pinError && <p className="text-red-400 text-xs text-center mt-2 animate-fadeIn">{pinError}</p>}
                      </div>
                    );
                  }

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

          {/* Matches */}
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
                  const takenPicks = isExclusive ? getPicksTakenByOthers(players, selectedEvent.id, match.id, currentUser) : {};

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
                          const otherPickersList = isExclusive && isOtherOption
                            ? getOtherPickers(players, selectedEvent.id, match.id, currentUser)
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

                          const deadlinePassed = selectedEvent.deadline && new Date(selectedEvent.deadline) < new Date();
                          const isDisabled = selectedEvent.status !== 'open' || isBlocked || deadlinePassed;

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
                                {isOtherOption && otherPickersList.length > 0 && (
                                  <span className="text-[10px] text-[--text-muted]">{otherPickersList.join(', ')}</span>
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

            {selectedEvent.status === 'open' && !(selectedEvent.deadline && new Date(selectedEvent.deadline) < new Date()) && (
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

export default MakePicksView;
