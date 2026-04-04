import React, { useState, useMemo } from 'react';
import { ChevronRight, Swords, Zap, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPlayerBreakdown, historicalScores } from '../utils/scoring';
import PlayerAvatar from '../components/PlayerAvatar';

const HeadToHeadView = () => {
  const { players, sortedEvents, setCurrentView } = useApp();
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

        {playerA && playerB && (
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 border border-[--border]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <PlayerAvatar player={playerAObj} size="lg" />
                  <span className="font-bebas text-lg sm:text-xl text-white truncate max-w-full">{playerA}</span>
                </div>
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
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <PlayerAvatar player={playerBObj} size="lg" />
                  <span className="font-bebas text-lg sm:text-xl text-white truncate max-w-full">{playerB}</span>
                </div>
              </div>
              {comparisons.length === 0 && (
                <p className="text-center text-[--text-muted] text-sm mt-6">No shared events found between these players.</p>
              )}
            </div>

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

export default HeadToHeadView;
