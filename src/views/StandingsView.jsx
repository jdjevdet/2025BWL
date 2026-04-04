import React, { useState, useMemo } from 'react';
import { Crown, ChevronDown, TrendingUp, Swords } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateTotalPoints, getPlayerBreakdown, historicalScores } from '../utils/scoring';
import PlayerAvatar from '../components/PlayerAvatar';

const StandingsView = () => {
  const { players, sortedEvents, setCurrentView } = useApp();
  const [expandedPlayer, setExpandedPlayer] = useState(null);

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

export default StandingsView;
