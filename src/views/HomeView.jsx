import React from 'react';
import { Trophy, Calendar, Target, Users, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountdownBadge from '../components/CountdownBadge';

const HomeView = () => {
  const { sortedEvents, setSelectedEvent, setCurrentView, selectedSeason, setSelectedSeason } = useApp();

  return (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="font-bebas text-6xl sm:text-8xl lg:text-9xl tracking-tight leading-none mb-4">
            <span className="text-white">BELLEND</span>
            <br />
            <span className="gold-shimmer">WRESTLING LEAGUE</span>
          </h1>
          <p className="font-outfit text-lg text-[--text-secondary] max-w-md mx-auto">
            Fantasy Picks &mdash; Make your predictions and prove you know wrestling better than everyone else.
          </p>
          <div className="rope-divider max-w-xs mx-auto mt-8" />

          {/* Season selector */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {['2025/2026', '2026/2027'].map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  selectedSeason === season
                    ? 'btn-gold'
                    : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'
                }`}
                style={selectedSeason !== season ? { background: 'var(--bg-elevated)' } : undefined}
              >
                Season {season}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event, idx) => {
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[--bg-surface] via-transparent to-transparent opacity-80" />
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
                  <p className="text-sm text-[--text-muted] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </p>
                  {event.status === 'open' && event.deadline ? (
                    <div className="mt-1.5 mb-4"><CountdownBadge deadline={event.deadline} /></div>
                  ) : <div className="mb-5" />}

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

        {sortedEvents.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <Calendar className="w-16 h-16 text-[--text-muted] mx-auto mb-4" />
            <p className="text-[--text-secondary] text-lg">No events yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
