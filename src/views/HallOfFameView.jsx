import React from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HallOfFameView = () => {
  const { hallOfFameEntries } = useApp();

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
            {latestWinner && (
              <div className="relative mb-16 rounded-2xl overflow-hidden border border-[--gold-dark]/30 animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-1/3 h-full opacity-10"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--gold-light), transparent)', animation: 'spotlight 4s linear infinite' }}
                  />
                </div>
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

export default HallOfFameView;
