import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Calendar, Trophy, TrendingUp, Target, Swords, Hash, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateTotalPoints, getPlayerBreakdown, historicalScores, historicalEventNames } from '../utils/scoring';
import { getPlayerBadges, RARITY_ORDER, RARITY_CONFIG, BADGE_DEFINITIONS, STANDARD_BADGE_COUNT } from '../utils/badges';
import PlayerAvatar from '../components/PlayerAvatar';
import BadgeCard from '../components/BadgeCard';
import BadgeModal from '../components/BadgeModal';

const PlayerProfileView = () => {
  const { players, sortedEvents, events, setCurrentView, setSelectedEvent } = useApp();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Get player name from URL-like state or context
  const { selectedPlayerName } = useApp();
  const player = players.find(p => p.name === selectedPlayerName);

  if (!player) {
    return (
      <div className="min-h-screen arena-bg pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[--text-muted] text-lg">Player not found.</p>
          <button onClick={() => setCurrentView('standings')} className="mt-4 text-[--gold] text-sm hover:underline">
            Back to Standings
          </button>
        </div>
      </div>
    );
  }

  const totalPoints = calculateTotalPoints(player, sortedEvents);
  const breakdown = getPlayerBreakdown(player, sortedEvents);
  const badges = getPlayerBadges(player, events, players);

  // Calculate rank
  const allPlayerNames = useMemo(() => {
    const fp = players.map(p => p.name);
    const hp = Object.values(historicalScores).flatMap(s => Object.keys(s));
    return [...new Set([...fp, ...hp])];
  }, [players]);

  const globalRank = useMemo(() => {
    const sorted = allPlayerNames
      .map(name => {
        const po = players.find(p => p.name === name) || { name, id: name };
        return { name, points: calculateTotalPoints(po, sortedEvents) };
      })
      .sort((a, b) => b.points - a.points);
    return sorted.findIndex(p => p.name === player.name) + 1;
  }, [allPlayerNames, players, sortedEvents, player.name]);

  // Stats
  const eventsPlayed = breakdown.length;
  const totalCorrect = breakdown.reduce((sum, e) => sum + e.score, 0);
  const totalMatches = breakdown.reduce((sum, e) => sum + e.totalMatches, 0);
  const accuracy = totalMatches > 0 ? Math.round((totalCorrect / totalMatches) * 100) : 0;
  const bestEvent = breakdown.length > 0
    ? breakdown.reduce((best, e) => (e.totalMatches > 0 && (e.score / e.totalMatches) > (best.score / (best.totalMatches || 1))) ? e : best, breakdown[0])
    : null;

  // Event wins
  const eventWins = breakdown.filter(entry => {
    if (entry.type === 'historical') {
      const scores = historicalScores[entry.eventName];
      if (!scores) return false;
      const maxScore = Math.max(...Object.values(scores));
      return scores[player.name] === maxScore;
    }
    const event = sortedEvents.find(e => e.name === entry.eventName);
    if (!event?.matches) return false;
    let playerScore = entry.score;
    let isWinner = true;
    players.forEach(p => {
      if (p.name === player.name) return;
      let otherScore = 0;
      event.matches.forEach(m => {
        if (m.winner && p.picks?.[`${event.id}-${m.id}`] === m.winner) otherScore++;
      });
      if (otherScore > playerScore) isWinner = false;
    });
    return isWinner && playerScore > 0;
  }).length;

  // Count only standard (non-secret) badges for the displayed total
  const standardBadgeCount = badges.filter(b => b.rarity !== 'secret-rare').length;

  // Group badges by rarity
  const badgesByRarity = RARITY_ORDER.reduce((acc, rarity) => {
    const rarityBadges = badges.filter(b => b.rarity === rarity);
    if (rarityBadges.length > 0) acc.push({ rarity, badges: rarityBadges });
    return acc;
  }, []);

  // Locked badges (not earned) — excludes secret rares
  const earnedIds = new Set(badges.map(b => b.id));
  const lockedBadges = BADGE_DEFINITIONS.filter(b => !earnedIds.has(b.id) && b.autoEarn && b.rarity !== 'secret-rare');

  // All standard badges grouped by rarity (for "See All" view)
  const allStandardByRarity = RARITY_ORDER.filter(r => r !== 'secret-rare').reduce((acc, rarity) => {
    const all = BADGE_DEFINITIONS.filter(b => b.rarity === rarity);
    if (all.length > 0) acc.push({ rarity, badges: all });
    return acc;
  }, []);

  return (
    <div className="min-h-screen profile-hero-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => setCurrentView('standings')}
          className="mb-8 text-[--text-muted] hover:text-white flex items-center gap-2 text-sm font-medium transition-all animate-fadeIn"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Standings
        </button>

        {/* ════════ HERO SECTION ════════ */}
        <div className="relative rounded-2xl border border-[--border] overflow-hidden mb-8 animate-fadeInUp" style={{ background: 'var(--bg-surface)' }}>
          {/* Top gold accent */}
          <div className="h-1 gold-bar-shimmer" />

          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="absolute -inset-2 rounded-full opacity-20 blur-xl"
                  style={{ background: globalRank <= 3 ? '#d4af37' : 'var(--gold-dark)' }}
                />
                <div className="relative">
                  <PlayerAvatar player={player} size="lg" />
                  {/* Rank badge overlay */}
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-bebas border-2"
                    style={{
                      background: globalRank === 1 ? '#d4af37' : globalRank === 2 ? '#a1a1aa' : globalRank === 3 ? '#b45309' : 'var(--bg-elevated)',
                      color: globalRank <= 3 ? '#0a0a0a' : 'var(--text-secondary)',
                      borderColor: globalRank <= 3 ? 'transparent' : 'var(--border)',
                    }}
                  >
                    {globalRank}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-bebas text-5xl sm:text-6xl tracking-wide text-white leading-none">
                  {player.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-[--gold] font-semibold">
                    <Trophy className="w-4 h-4" />
                    {totalPoints} points
                  </span>
                  <span className="text-[--border-light]">|</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary]">
                    <Hash className="w-3.5 h-3.5" />
                    Rank {globalRank}
                  </span>
                  <span className="text-[--border-light]">|</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary]">
                    <Target className="w-3.5 h-3.5" />
                    {accuracy}% accuracy
                  </span>
                </div>

                {/* Inline badge preview */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                    {badges.slice(0, 8).map(badge => (
                      <BadgeCard key={badge.id} badge={badge} size="sm" onClick={() => setSelectedBadge(badge)} />
                    ))}
                    {badges.length > 8 && (
                      <span className="text-xs text-[--text-muted] font-medium ml-1">+{badges.length - 8} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { label: 'Events', value: eventsPlayed, icon: Calendar },
                { label: 'Event Wins', value: eventWins, icon: Trophy },
                { label: 'Correct Picks', value: totalCorrect, icon: Target },
                { label: 'Badges', value: `${standardBadgeCount}/${STANDARD_BADGE_COUNT}`, icon: Swords },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[--border] p-4 text-center animate-fadeInUp"
                  style={{ background: 'var(--bg-elevated)', animationDelay: `${i * 80}ms` }}
                >
                  <stat.icon className="w-4 h-4 text-[--gold] mx-auto mb-2" />
                  <p className="font-bebas text-2xl text-white">{stat.value}</p>
                  <p className="text-[10px] text-[--text-muted] uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ BADGES SECTION ════════ */}
        <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
              <Swords className="w-4 h-4 text-[--bg-deep]" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="font-bebas text-3xl tracking-wide text-white">Achievements</h2>
                <span className="font-bebas text-xl tracking-wide text-[--gold]">{standardBadgeCount}/{STANDARD_BADGE_COUNT}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.round((standardBadgeCount / STANDARD_BADGE_COUNT) * 100)}%`,
                      background: standardBadgeCount === STANDARD_BADGE_COUNT
                        ? 'var(--emerald)'
                        : 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
                    }}
                  />
                </div>
                <span className="text-[10px] text-[--text-muted] font-medium tabular-nums whitespace-nowrap">
                  {Math.round((standardBadgeCount / STANDARD_BADGE_COUNT) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Earned badges by rarity */}
          {badgesByRarity.map(({ rarity, badges: rarityBadges }) => (
            <div key={rarity} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: RARITY_CONFIG[rarity].color }}
                />
                <h3
                  className="text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: RARITY_CONFIG[rarity].color }}
                >
                  {RARITY_CONFIG[rarity].label}
                </h3>
                <div className="flex-1 h-px" style={{ background: `${RARITY_CONFIG[rarity].color}20` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {rarityBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    size="md"
                    onClick={() => setSelectedBadge(badge)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Locked badges */}
          {lockedBadges.length > 0 && !showAllBadges && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full opacity-50" style={{ background: 'var(--text-secondary)' }} />
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-secondary]">
                  Locked
                </h3>
                <div className="flex-1 h-px bg-[--border]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {lockedBadges.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className="rounded-2xl border border-[--border] p-5 flex flex-col items-center gap-3 text-center opacity-50 hover:opacity-70 transition-all cursor-pointer"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
                      <span className="text-2xl text-[--text-secondary]">?</span>
                    </div>
                    <div>
                      <p className="font-bebas text-lg tracking-wide text-[--text-secondary] leading-tight">{badge.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: RARITY_CONFIG[badge.rarity].color, opacity: 0.7 }}>
                        {RARITY_CONFIG[badge.rarity].label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* See All Badges button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[--border-light] text-sm font-medium text-[--text-secondary] hover:text-[--gold] hover:border-[--gold-dark] transition-all"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <Eye className="w-4 h-4" />
              {showAllBadges ? 'Hide Full Collection' : 'See All Badges'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllBadges ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* See All Badges expanded view */}
          {showAllBadges && (
            <div className="mt-6 animate-fadeInUp">
              {allStandardByRarity.map(({ rarity, badges: allRarityBadges }) => (
                <div key={rarity} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: RARITY_CONFIG[rarity].color }}
                    />
                    <h3
                      className="text-xs font-bold uppercase tracking-[0.15em]"
                      style={{ color: RARITY_CONFIG[rarity].color }}
                    >
                      {RARITY_CONFIG[rarity].label}
                    </h3>
                    <span className="text-[10px] text-[--text-muted] font-medium">
                      {allRarityBadges.filter(b => earnedIds.has(b.id)).length}/{allRarityBadges.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: `${RARITY_CONFIG[rarity].color}20` }} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allRarityBadges.map(badge => {
                      const isEarned = earnedIds.has(badge.id);
                      if (isEarned) {
                        return (
                          <BadgeCard
                            key={badge.id}
                            badge={badge}
                            size="md"
                            onClick={() => setSelectedBadge(badge)}
                          />
                        );
                      }
                      return (
                        <button
                          key={badge.id}
                          onClick={() => setSelectedBadge(badge)}
                          className="rounded-2xl border border-[--border] p-5 flex flex-col items-center gap-3 text-center opacity-50 hover:opacity-70 transition-all cursor-pointer"
                          style={{ background: 'var(--bg-elevated)' }}
                        >
                          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
                            <span className="text-2xl text-[--text-secondary]">?</span>
                          </div>
                          <div>
                            <p className="font-bebas text-lg tracking-wide text-[--text-secondary] leading-tight">{badge.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: RARITY_CONFIG[badge.rarity].color, opacity: 0.7 }}>
                              {RARITY_CONFIG[badge.rarity].label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {badges.length === 0 && lockedBadges.length === 0 && (
            <div className="text-center py-12 rounded-xl border border-[--border]" style={{ background: 'var(--bg-surface)' }}>
              <Swords className="w-12 h-12 text-[--text-muted] mx-auto mb-3" />
              <p className="text-[--text-secondary]">No badges yet. Start making picks!</p>
            </div>
          )}
        </div>

        {/* ════════ EVENT HISTORY ════════ */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-input))' }}>
              <TrendingUp className="w-4 h-4 text-[--gold]" />
            </div>
            <h2 className="font-bebas text-3xl tracking-wide text-white">Event History</h2>
          </div>

          <div className="space-y-2">
            {breakdown.length === 0 ? (
              <p className="text-[--text-muted] text-center py-8 text-sm">No event history yet.</p>
            ) : (
              [...breakdown].reverse().map((entry, idx) => {
                const pct = entry.totalMatches > 0 ? Math.round((entry.score / entry.totalMatches) * 100) : 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[--border] gold-border-glow transition-all animate-fadeInUp"
                    style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{entry.eventName}</p>
                      <p className="text-[10px] text-[--text-muted] uppercase tracking-wider mt-0.5">
                        {entry.type === 'historical' ? 'Past Season' : 'Current Season'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-20 sm:w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: pct === 100 ? 'var(--emerald)' : pct >= 70 ? 'var(--gold)' : 'var(--gold-dark)',
                          }}
                        />
                      </div>
                      <span className={`text-sm font-bold tabular-nums w-14 text-right ${entry.score > 0 ? 'text-[--gold]' : 'text-[--text-muted]'}`}>
                        {entry.score}/{entry.totalMatches}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            {(player.bonusPoints || 0) !== 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-[--gold-dark]/20" style={{ background: 'rgba(201,168,76,0.04)' }}>
                <span className="text-sm text-[--gold] font-medium">Bonus Points</span>
                <span className="text-sm font-bold text-[--gold]">+{player.bonusPoints}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge detail modal */}
      <BadgeModal
        badge={selectedBadge}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
};

export default PlayerProfileView;
