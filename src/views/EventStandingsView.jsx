import React, { useState, useMemo } from 'react';
import { Trophy, Crown, ChevronRight, ChevronDown, Check, X, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { historicalScores, historicalEventNames } from '../utils/scoring';
import PlayerAvatar from '../components/PlayerAvatar';

const EventStandingsView = () => {
  const { selectedEvent, setCurrentView, players, navigateToPlayer } = useApp();
  const [expandedPlayer, setExpandedPlayer] = useState(null);

  if (!selectedEvent) return null;
  const isHistorical = historicalEventNames.includes(selectedEvent.name.toUpperCase());
  const picksVisible = selectedEvent.status === 'live' || selectedEvent.status === 'completed' || isHistorical;

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
                <div
                  onClick={() => picksVisible && setExpandedPlayer(isExpanded ? null : player.id)}
                  className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl transition-all ${picksVisible ? 'cursor-pointer' : 'cursor-default'} ${
                    isTop3 ? rankStyles[idx] : 'border border-[--border] gold-border-glow'
                  } ${isExpanded && !isTop3 ? 'border-[--gold-dark]/40' : ''}`}
                  style={{ ...(!isTop3 ? { background: 'var(--bg-surface)' } : {}) }}
                >
                  <span className={`font-bebas text-3xl sm:text-4xl w-12 text-center flex-shrink-0 ${isTop3 ? 'text-white' : 'text-[--text-muted]'}`}>
                    {idx + 1}
                  </span>
                  <PlayerAvatar player={players.find(p => p.name === player.name) || player} size={isTop3 ? 'md' : 'sm'} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-outfit font-bold text-lg sm:text-xl truncate hover:text-[--gold] transition-colors cursor-pointer ${isTop3 ? 'text-white' : 'text-white'}`}
                      onClick={(e) => { e.stopPropagation(); navigateToPlayer(player.name); }}
                    >
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
                    {picksVisible && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isTop3 ? 'text-white/60' : 'text-[--text-muted]'} ${isExpanded ? 'rotate-180' : ''}`} />}
                  </div>
                </div>

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

export default EventStandingsView;
