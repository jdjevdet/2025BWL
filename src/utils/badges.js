import { historicalScores, historicalEventNames, calculateTotalPoints, getPlayerBreakdown } from './scoring';

/* ══════════════════════════════════════════════
   BADGE DEFINITIONS
   ══════════════════════════════════════════════ */

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: '#8a8a9a',
    glow: 'rgba(138, 138, 154, 0.3)',
    bg: 'linear-gradient(145deg, #2a2a35, #1e1e28)',
    border: '#3a3a48',
  },
  uncommon: {
    label: 'Uncommon',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.35)',
    bg: 'linear-gradient(145deg, #0c2d3a, #0a1f2a)',
    border: '#0e4a5e',
  },
  rare: {
    label: 'Rare',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    bg: 'linear-gradient(145deg, #2d1a4e, #1a0e30)',
    border: '#5b2d8e',
  },
  epic: {
    label: 'Epic',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    bg: 'linear-gradient(145deg, #3d1e08, #2a1205)',
    border: '#b45309',
  },
  legendary: {
    label: 'Legendary',
    color: '#d4af37',
    glow: 'rgba(212, 175, 55, 0.5)',
    bg: 'linear-gradient(145deg, #3d2e0a, #2a1f05)',
    border: '#c9a84c',
  },
};

export const BADGE_DEFINITIONS = [
  // ── COMMON ──
  {
    id: 'first-pick',
    name: 'First Pick',
    description: 'Submit picks for your very first event.',
    flavor: '"Every legend starts with a single prediction."',
    rarity: 'common',
    icon: 'Target',
    autoEarn: true,
  },
  {
    id: 'full-card',
    name: 'Full Card',
    description: 'Submit a pick for every match in an event.',
    flavor: '"No match left behind."',
    rarity: 'common',
    icon: 'ClipboardCheck',
    autoEarn: true,
  },
  {
    id: 'on-the-board',
    name: 'On the Board',
    description: 'Get at least 1 correct pick in an event.',
    flavor: '"Even a broken clock is right twice a day."',
    rarity: 'common',
    icon: 'ThumbsUp',
    autoEarn: true,
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Participate in 3 or more events.',
    flavor: '"Showing up is half the battle."',
    rarity: 'common',
    icon: 'CalendarCheck',
    autoEarn: true,
  },
  // ── UNCOMMON ──
  {
    id: 'hat-trick',
    name: 'Hat Trick',
    description: 'Get 3 correct picks in a row within a single event.',
    flavor: '"Three for three — you\'re on fire!"',
    rarity: 'uncommon',
    icon: 'Flame',
    autoEarn: true,
  },
  {
    id: 'iron-man',
    name: 'Iron Man',
    description: 'Participate in every single event of a season without missing one.',
    flavor: '"No days off. No excuses."',
    rarity: 'uncommon',
    icon: 'ShieldCheck',
    autoEarn: true,
  },
  {
    id: 'majority-rules',
    name: 'Majority Rules',
    description: 'Correctly pick the fan-favorite winner 5 or more times in a single event.',
    flavor: '"The people\'s champion knows what the people want."',
    rarity: 'uncommon',
    icon: 'Users',
    autoEarn: true,
  },
  {
    id: 'against-the-grain',
    name: 'Against the Grain',
    description: 'Be the only player to correctly pick a match winner.',
    flavor: '"They all laughed... until the bell rang."',
    rarity: 'uncommon',
    icon: 'Fingerprint',
    autoEarn: true,
  },
  // ── RARE ──
  {
    id: 'perfect-card',
    name: 'Perfect Card',
    description: 'Get every single pick correct in an event.',
    flavor: '"Flawless victory. Absolute perfection."',
    rarity: 'rare',
    icon: 'Gem',
    autoEarn: true,
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Finish in the top 3 for 3 consecutive events.',
    flavor: '"Consistency is the mark of a true champion."',
    rarity: 'rare',
    icon: 'TrendingUp',
    autoEarn: true,
  },
  {
    id: 'dominator',
    name: 'Dominator',
    description: 'Win an event by 3 or more points over second place.',
    flavor: '"Total. Absolute. Domination."',
    rarity: 'rare',
    icon: 'Swords',
    autoEarn: true,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Participate in 10 or more events across all time.',
    flavor: '"A grizzled veteran of the prediction game."',
    rarity: 'rare',
    icon: 'Medal',
    autoEarn: true,
  },
  // ── EPIC ──
  {
    id: 'the-oracle',
    name: 'The Oracle',
    description: 'Achieve 2 or more Perfect Cards in your career.',
    flavor: '"They don\'t predict the future — they see it."',
    rarity: 'epic',
    icon: 'Eye',
    autoEarn: true,
  },
  {
    id: 'dynasty',
    name: 'Dynasty',
    description: 'Win 3 or more events in a single season.',
    flavor: '"An empire built on foresight."',
    rarity: 'epic',
    icon: 'Castle',
    autoEarn: true,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Hold the #1 global ranking for 3 or more consecutive events.',
    flavor: '"Sitting on the throne and nobody can reach them."',
    rarity: 'epic',
    icon: 'ShieldOff',
    autoEarn: true,
  },
  // ── LEGENDARY (admin-only) ──
  {
    id: 'mr-predictamania',
    name: 'Mr. Predictamania',
    description: 'Awarded to the season champion — the ultimate predictor.',
    flavor: '"The undisputed champion of predictions. All hail."',
    rarity: 'legendary',
    icon: 'Crown',
    autoEarn: false,
  },
  {
    id: 'bwl-winner',
    name: 'BWL Winner',
    description: 'Awarded for winning BWL overall — the highest honor.',
    flavor: '"The greatest to ever do it. Period."',
    rarity: 'legendary',
    icon: 'Trophy',
    autoEarn: false,
  },
];

export const getBadgeById = (id) => BADGE_DEFINITIONS.find(b => b.id === id);

/* ══════════════════════════════════════════════
   AUTO-EARN CALCULATION ENGINE
   ══════════════════════════════════════════════ */

export function calculateEarnedBadges(player, allEvents, allPlayers) {
  const earned = [];
  if (!player || !player.name) return earned;

  // Helper: get completed/live firebase events (non-historical)
  const fbEvents = allEvents.filter(e =>
    !historicalEventNames.includes(e.name.toUpperCase()) &&
    (e.status === 'completed' || e.status === 'live') &&
    e.matches && e.matches.length > 0
  );

  // Helper: count events participated in
  const getParticipatedEvents = () => {
    let count = 0;
    // Historical
    historicalEventNames.forEach(name => {
      if (historicalScores[name]?.[player.name] !== undefined) count++;
    });
    // Firebase
    allEvents.forEach(event => {
      if (!historicalEventNames.includes(event.name.toUpperCase())) {
        const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
        const isSubmitted = event.submittedPlayers?.includes(player.name);
        if (hasPicks || isSubmitted) count++;
      }
    });
    return count;
  };

  // Helper: get event score for a player in a firebase event
  const getEventScore = (p, event) => {
    let score = 0;
    event.matches?.forEach(match => {
      if (match.winner && p.picks?.[`${event.id}-${match.id}`] === match.winner) score++;
    });
    return score;
  };

  // Helper: get ranked results for an event
  const getEventRankings = (event) => {
    const isHistorical = historicalEventNames.includes(event.name?.toUpperCase?.());
    if (isHistorical) {
      const scores = historicalScores[event.name.toUpperCase()];
      if (!scores) return [];
      return Object.entries(scores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);
    }
    return allPlayers
      .map(p => ({ name: p.name, score: getEventScore(p, event) }))
      .sort((a, b) => b.score - a.score);
  };

  const participatedCount = getParticipatedEvents();

  // ── FIRST PICK ──
  if (participatedCount >= 1) earned.push('first-pick');

  // ── REGULAR (3+ events) ──
  if (participatedCount >= 3) earned.push('regular');

  // ── VETERAN (10+ events) ──
  if (participatedCount >= 10) earned.push('veteran');

  // ── FULL CARD ──
  let hasFullCard = false;
  fbEvents.forEach(event => {
    const pickCount = event.matches.filter(m => player.picks?.[`${event.id}-${m.id}`]).length;
    if (pickCount >= event.matches.length) hasFullCard = true;
  });
  if (hasFullCard) earned.push('full-card');

  // ── ON THE BOARD ──
  let onBoard = false;
  fbEvents.forEach(event => {
    if (getEventScore(player, event) >= 1) onBoard = true;
  });
  if (!onBoard) {
    historicalEventNames.forEach(name => {
      if ((historicalScores[name]?.[player.name] || 0) >= 1) onBoard = true;
    });
  }
  if (onBoard) earned.push('on-the-board');

  // ── HAT TRICK (3 correct in a row within an event) ──
  let hasHatTrick = false;
  fbEvents.forEach(event => {
    let streak = 0;
    event.matches.forEach(match => {
      if (match.winner && player.picks?.[`${event.id}-${match.id}`] === match.winner) {
        streak++;
        if (streak >= 3) hasHatTrick = true;
      } else {
        streak = 0;
      }
    });
  });
  if (hasHatTrick) earned.push('hat-trick');

  // ── IRON MAN (all firebase events that are completed) ──
  const completedFbEvents = allEvents.filter(e =>
    !historicalEventNames.includes(e.name.toUpperCase()) &&
    (e.status === 'completed' || e.status === 'live')
  );
  if (completedFbEvents.length >= 2) {
    const participatedAll = completedFbEvents.every(event => {
      const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
      const isSubmitted = event.submittedPlayers?.includes(player.name);
      return hasPicks || isSubmitted;
    });
    if (participatedAll) earned.push('iron-man');
  }

  // ── MAJORITY RULES (correct fan-favorite pick 5+ times in one event) ──
  let hasMajority = false;
  fbEvents.forEach(event => {
    let majorityCorrect = 0;
    event.matches.forEach(match => {
      if (!match.winner) return;
      // Find most-picked option
      const pickCounts = {};
      match.options.forEach(o => pickCounts[o] = 0);
      allPlayers.forEach(p => {
        const pick = p.picks?.[`${event.id}-${match.id}`];
        if (pick && pickCounts[pick] !== undefined) pickCounts[pick]++;
      });
      const maxPicks = Math.max(...Object.values(pickCounts));
      const majorityOption = Object.entries(pickCounts).find(([, c]) => c === maxPicks)?.[0];
      // Did this player pick the majority AND was it correct?
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      if (playerPick === majorityOption && playerPick === match.winner) majorityCorrect++;
    });
    if (majorityCorrect >= 5) hasMajority = true;
  });
  if (hasMajority) earned.push('majority-rules');

  // ── AGAINST THE GRAIN (sole correct picker) ──
  let hasAgainstGrain = false;
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      if (!match.winner) return;
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      if (playerPick !== match.winner) return;
      // Count how many picked the winner
      const winnerPickers = allPlayers.filter(p =>
        p.picks?.[`${event.id}-${match.id}`] === match.winner
      );
      if (winnerPickers.length === 1 && winnerPickers[0].name === player.name) {
        hasAgainstGrain = true;
      }
    });
  });
  if (hasAgainstGrain) earned.push('against-the-grain');

  // ── PERFECT CARD ──
  let perfectCardCount = 0;
  fbEvents.forEach(event => {
    const totalMatches = event.matches.filter(m => m.winner).length;
    if (totalMatches === 0) return;
    const correctPicks = event.matches.filter(m =>
      m.winner && player.picks?.[`${event.id}-${m.id}`] === m.winner
    ).length;
    if (correctPicks === totalMatches && totalMatches === event.matches.length) perfectCardCount++;
  });
  // Check historical too
  historicalEventNames.forEach(name => {
    const scores = historicalScores[name];
    if (!scores) return;
    const playerScore = scores[player.name];
    if (playerScore === undefined) return;
    const maxScore = Math.max(...Object.values(scores));
    if (playerScore === maxScore && maxScore > 0) {
      // Historical "perfect" = top score (approximation since we don't have match data)
      // Only count if they actually got the max possible
    }
  });
  if (perfectCardCount >= 1) earned.push('perfect-card');
  if (perfectCardCount >= 2) earned.push('the-oracle');

  // ── STREAK MASTER (top 3 in 3 consecutive events) ──
  const allOrderedEvents = [
    ...historicalEventNames.map(name => ({ name, type: 'historical' })),
    ...allEvents
      .filter(e => !historicalEventNames.includes(e.name.toUpperCase()) && (e.status === 'completed' || e.status === 'live'))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => ({ ...e, type: 'firebase' })),
  ];
  let streakTop3 = 0;
  let hasStreakMaster = false;
  allOrderedEvents.forEach(event => {
    let rankings;
    if (event.type === 'historical') {
      rankings = Object.entries(historicalScores[event.name] || {})
        .map(([n, s]) => ({ name: n, score: s }))
        .sort((a, b) => b.score - a.score);
    } else {
      rankings = getEventRankings(event);
    }
    const playerRank = rankings.findIndex(r => r.name === player.name);
    const participated = playerRank !== -1;
    if (participated && playerRank < 3) {
      streakTop3++;
      if (streakTop3 >= 3) hasStreakMaster = true;
    } else {
      streakTop3 = 0;
    }
  });
  if (hasStreakMaster) earned.push('streak-master');

  // ── DOMINATOR (win event by 3+) ──
  let hasDominator = false;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length >= 2 && rankings[0].name === player.name) {
      if (rankings[0].score - rankings[1].score >= 3) hasDominator = true;
    }
  });
  historicalEventNames.forEach(name => {
    const scores = historicalScores[name];
    if (!scores || scores[player.name] === undefined) return;
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (sorted[0][0] === player.name && sorted.length >= 2) {
      if (sorted[0][1] - sorted[1][1] >= 3) hasDominator = true;
    }
  });
  if (hasDominator) earned.push('dominator');

  // ── DYNASTY (win 3+ firebase events) ──
  let fbWins = 0;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length > 0 && rankings[0].name === player.name) fbWins++;
  });
  if (fbWins >= 3) earned.push('dynasty');

  // ── UNTOUCHABLE (#1 global for 3+ consecutive events) ──
  let globalStreak = 0;
  let hasUntouchable = false;
  allOrderedEvents.forEach((event, idx) => {
    // Calculate global standings up to this event
    const eventsUpToNow = allOrderedEvents.slice(0, idx + 1);
    const globalScores = {};
    eventsUpToNow.forEach(e => {
      if (e.type === 'historical') {
        const scores = historicalScores[e.name] || {};
        Object.entries(scores).forEach(([n, s]) => {
          globalScores[n] = (globalScores[n] || 0) + s;
        });
      } else {
        allPlayers.forEach(p => {
          const score = getEventScore(p, e);
          globalScores[p.name] = (globalScores[p.name] || 0) + score;
        });
      }
    });
    const sorted = Object.entries(globalScores).sort(([, a], [, b]) => b - a);
    if (sorted.length > 0 && sorted[0][0] === player.name) {
      globalStreak++;
      if (globalStreak >= 3) hasUntouchable = true;
    } else {
      globalStreak = 0;
    }
  });
  if (hasUntouchable) earned.push('untouchable');

  return earned;
}

/* Get all badges for a player (auto + manual) */
export function getPlayerBadges(player, allEvents, allPlayers) {
  const autoBadges = calculateEarnedBadges(player, allEvents, allPlayers);
  const manualBadges = player.manualBadges || [];
  const allBadgeIds = [...new Set([...autoBadges, ...manualBadges])];
  return allBadgeIds
    .map(id => getBadgeById(id))
    .filter(Boolean)
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
}
