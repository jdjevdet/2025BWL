import React from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';

const EventPredictionsView = () => {
  const { selectedEvent, players, setCurrentView } = useApp();

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
        <button onClick={() => setCurrentView('home')} className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn">
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

export default EventPredictionsView;
