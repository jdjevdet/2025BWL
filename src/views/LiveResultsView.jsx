import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, ChevronRight, ChevronDown, Check, X, Minus, Clock, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';

const LiveResultsView = () => {
  const { selectedEvent, setCurrentView, currentUser, setCurrentUser, players, events } = useApp();
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

          <div className="max-w-xs mx-auto mt-4">
            <div className="flex justify-between text-xs text-[--text-muted] mb-1">
              <span>{decidedMatches.length} of {totalMatches} decided</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-full rounded-full transition-all duration-700 gold-bar-shimmer" style={{ width: `${progress}%` }} />
            </div>
          </div>

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
                    <div className="px-5 py-3 border-b border-[--border] flex items-center justify-between" style={{ background: 'var(--bg-elevated)' }}>
                      <h3 className="font-bebas text-lg tracking-wide text-white">{match.title}</h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-500/30 text-emerald-400" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                        <Check className="w-3 h-3" /> Decided
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-5 h-5 text-[--gold]" />
                        <span className="font-outfit font-bold text-lg text-white">{match.winner}</span>
                      </div>

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

export default LiveResultsView;
