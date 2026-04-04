import React, { useState } from 'react';
import { Trophy, Award, Star, Crown, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ──────────────────────────────────────────────
   Inductee Card — prestigious winner display
   ────────────────────────────────────────────── */
const InducteeCard = ({ entry, index, isLatest, category }) => {
  const isPredictamania = category === 'mr-predictamania';

  if (isLatest) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden animate-fadeInUp"
        style={{
          background: 'var(--bg-surface)',
          border: isPredictamania ? '2px solid var(--gold-dark)' : '1px solid var(--border-light)',
          animationDelay: `${index * 120}ms`,
        }}
      >
        {/* Spotlight sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 w-1/3 h-full opacity-10"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--gold-light), transparent)',
              animation: 'spotlight 4s linear infinite',
            }}
          />
        </div>

        {/* Gold top bar */}
        <div className="h-1 gold-bar-shimmer" />

        <div className="p-6 sm:p-10">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[--gold]">
              <Star className="w-3 h-3" /> Reigning Champion <Star className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Image */}
            <div className="md:w-1/2 w-full">
              {entry.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden hof-image-frame group">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[--gold]/40 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[--gold]/40 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[--gold]/40 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[--gold]/40 rounded-br-xl" />
                </div>
              ) : (
                <div className="w-full h-64 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                  {isPredictamania
                    ? <Crown className="w-20 h-20 text-[--gold]/30" />
                    : <Trophy className="w-20 h-20 text-[--gold]/30" />}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-1/2 text-center md:text-left">
              {entry.season && (
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[--gold] border border-[--gold-dark]/40 mb-4"
                  style={{ background: 'rgba(201, 168, 76, 0.06)' }}>
                  Season {entry.season}
                </span>
              )}
              <h3 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide mb-2 leading-none">
                {entry.title}
              </h3>
              {entry.description && (
                <p className="text-lg text-[--text-secondary] font-outfit mt-3 leading-relaxed">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Past winners — compact card
  return (
    <div
      className="group rounded-xl overflow-hidden border border-[--border] gold-border-glow hover-lift animate-fadeInUp flex flex-col"
      style={{ background: 'var(--bg-surface)', animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-56 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {isPredictamania
              ? <Crown className="w-14 h-14 text-[--text-muted]/40" />
              : <Trophy className="w-14 h-14 text-[--text-muted]/40" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[--bg-surface] via-transparent to-transparent opacity-90" />
        {entry.season && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider glass-card text-[--gold]">
              {entry.season}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          {isPredictamania
            ? <Crown className="w-6 h-6 text-[--gold]" style={{ animation: 'float 3s ease-in-out infinite' }} />
            : <Award className="w-6 h-6 text-[--gold]" style={{ animation: 'float 3s ease-in-out infinite' }} />}
        </div>
      </div>
      <div className="p-5 text-center flex-1 flex flex-col justify-center">
        <h4 className="font-bebas text-2xl text-white tracking-wide">{entry.title}</h4>
        {entry.description && (
          <p className="text-[--text-secondary] text-sm mt-1.5 font-outfit">{entry.description}</p>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Category Section
   ────────────────────────────────────────────── */
const CategorySection = ({ title, subtitle, icon: Icon, entries, accentClass }) => {
  // Sort by season descending so latest is first
  const sorted = [...entries].sort((a, b) => (b.season || '').localeCompare(a.season || ''));
  const latest = sorted[0];
  const past = sorted.slice(1);

  return (
    <div className="mb-20 last:mb-0">
      {/* Category header */}
      <div className="text-center mb-10 animate-fadeInUp">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${accentClass}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="font-bebas text-5xl sm:text-6xl tracking-wide text-white leading-none mb-2">
          {title}
        </h3>
        <p className="font-outfit text-[--text-secondary] text-sm max-w-md mx-auto">{subtitle}</p>
        <div className="rope-divider max-w-[200px] mx-auto mt-5" />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 animate-fadeIn">
          <Icon className="w-12 h-12 text-[--text-muted]/40 mx-auto mb-3" />
          <p className="text-[--text-muted] text-sm font-outfit">No inductees yet. The throne awaits.</p>
        </div>
      ) : (
        <>
          {/* Latest winner — hero treatment */}
          {latest && (
            <div className="mb-8">
              <InducteeCard entry={latest} index={0} isLatest={true} category={latest.category} />
            </div>
          )}

          {/* Past winners — grid */}
          {past.length > 0 && (
            <>
              <div className="text-center mb-6 mt-12">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[--text-muted]">
                  <span className="w-8 h-px bg-[--border-light]" />
                  Previous Champions
                  <span className="w-8 h-px bg-[--border-light]" />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {past.map((entry, idx) => (
                  <InducteeCard
                    key={entry.id}
                    entry={entry}
                    index={idx + 1}
                    isLatest={false}
                    category={entry.category}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────
   Hall of Fame View
   ────────────────────────────────────────────── */
const HallOfFameView = () => {
  const { hallOfFameEntries } = useApp();
  const [activeTab, setActiveTab] = useState('mr-predictamania');

  const predictamaniaEntries = hallOfFameEntries.filter(e => e.category === 'mr-predictamania');
  const regularSeasonEntries = hallOfFameEntries.filter(e => e.category === 'bwl-regular-season');

  // Legacy entries without a category default to mr-predictamania
  const uncategorized = hallOfFameEntries.filter(e => !e.category);
  if (uncategorized.length > 0) {
    predictamaniaEntries.push(...uncategorized);
  }

  const tabs = [
    { id: 'mr-predictamania', label: 'Mr. Predictamania', icon: Crown, entries: predictamaniaEntries },
    { id: 'bwl-regular-season', label: 'Regular Season', icon: Trophy, entries: regularSeasonEntries },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen hof-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero header */}
        <div className="text-center mb-12 animate-slideDown">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--gold-dark]/30 text-xs font-medium text-[--gold] mb-6"
            style={{ background: 'rgba(201, 168, 76, 0.04)' }}
          >
            <Sparkles className="w-3 h-3" />
            Legends of BWL
          </div>
          <h2 className="font-bebas text-7xl sm:text-8xl lg:text-9xl tracking-wide leading-none mb-3">
            <span className="text-white">HALL OF </span>
            <span className="gold-shimmer">FAME</span>
          </h2>
          <p className="font-outfit text-[--text-secondary] max-w-lg mx-auto">
            Where legends are immortalized. The greatest predictors in BWL history.
          </p>
          <div className="rope-divider max-w-xs mx-auto mt-6" />

          {/* Category tabs */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'btn-gold shadow-lg shadow-[--gold-glow]'
                    : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'
                }`}
                style={activeTab !== tab.id ? { background: 'var(--bg-elevated)' } : undefined}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'mr-predictamania' ? 'Predictamania' : 'Regular'}</span>
                {tab.entries.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-black/20 text-inherit'
                      : 'bg-white/5 text-[--text-muted]'
                  }`}>
                    {tab.entries.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active category content */}
        <CategorySection
          key={activeTabData.id}
          title={activeTabData.id === 'mr-predictamania' ? 'MR. PREDICTAMANIA' : 'BWL REGULAR SEASON'}
          subtitle={
            activeTabData.id === 'mr-predictamania'
              ? 'The ultimate prize — awarded to the supreme predictor each season.'
              : 'Crowned for regular season dominance across all events.'
          }
          icon={activeTabData.icon}
          entries={activeTabData.entries}
          accentClass={
            activeTabData.id === 'mr-predictamania'
              ? 'hof-icon-predictamania'
              : 'hof-icon-regular'
          }
        />
      </div>
    </div>
  );
};

export default HallOfFameView;
