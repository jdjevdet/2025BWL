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
  {
    id: 'undercard',
    name: 'Undercard',
    description: 'Get more wrong than right in an event.',
    flavor: '"We all start somewhere... even at the bottom."',
    rarity: 'common',
    icon: 'ArrowDownUp',
    autoEarn: true,
  },
  {
    id: 'bandwagon-fan',
    name: 'Bandwagon Fan',
    description: 'Pick the same winner as every other player in at least one match.',
    flavor: '"If everyone jumped off a cliff... you\'d jump too."',
    rarity: 'common',
    icon: 'Handshake',
    autoEarn: true,
  },
  {
    id: 'split-decision',
    name: 'Split Decision',
    description: 'Have your picks be exactly 50/50 correct and wrong in an event.',
    flavor: '"Perfectly balanced, as all things should be."',
    rarity: 'common',
    icon: 'Scale',
    autoEarn: true,
  },
  {
    id: 'newcomer',
    name: 'Newcomer',
    description: 'Participate in your first BWL season.',
    flavor: '"Fresh meat for the prediction machine."',
    rarity: 'common',
    icon: 'Baby',
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
  {
    id: 'buzzer-beater',
    name: 'Buzzer Beater',
    description: 'Submit your picks within the last hour before the deadline.',
    flavor: '"Living on the edge — picks at the last second."',
    rarity: 'uncommon',
    icon: 'Timer',
    autoEarn: true,
  },
  {
    id: 'upset-spotter',
    name: 'Upset Spotter',
    description: 'Correctly pick 3 or more underdogs (least-picked options) across your career.',
    flavor: '"You see what others refuse to believe."',
    rarity: 'uncommon',
    icon: 'Crosshair',
    autoEarn: true,
  },
  {
    id: 'clutch-performer',
    name: 'Clutch Performer',
    description: 'Get the last match of an event correct when it decides your final ranking.',
    flavor: '"When everything is on the line, you deliver."',
    rarity: 'uncommon',
    icon: 'Zap',
    autoEarn: true,
  },
  {
    id: 'dark-horse',
    name: 'Dark Horse',
    description: 'Finish top 3 in an event after being bottom half in the previous one.',
    flavor: '"Nobody saw it coming. Except you."',
    rarity: 'uncommon',
    icon: 'Moon',
    autoEarn: true,
  },
  {
    id: 'contrarian',
    name: 'Contrarian',
    description: 'Pick the least-popular option in 3 or more matches of a single event.',
    flavor: '"You don\'t follow the crowd — you ARE the crowd."',
    rarity: 'uncommon',
    icon: 'AlertTriangle',
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
  {
    id: 'cinderella-run',
    name: 'Cinderella Run',
    description: 'Go from last place globally to top 3 within a single season.',
    flavor: '"From the ashes, a champion rises."',
    rarity: 'rare',
    icon: 'Sparkles',
    autoEarn: true,
  },
  {
    id: 'head-hunter',
    name: 'Head Hunter',
    description: 'Beat every other player head-to-head at least once across events.',
    flavor: '"No one is safe. Everyone gets got."',
    rarity: 'rare',
    icon: 'Search',
    autoEarn: true,
  },
  {
    id: 'near-perfect',
    name: 'Near Perfect',
    description: 'Miss only 1 pick in an event with 6 or more matches.',
    flavor: '"So close to perfection it hurts."',
    rarity: 'rare',
    icon: 'Star',
    autoEarn: true,
  },
  {
    id: 'rival-slayer',
    name: 'Rival Slayer',
    description: 'Win an event when you were the lowest-ranked player entering it.',
    flavor: '"The ultimate comeback. No one believed — except you."',
    rarity: 'rare',
    icon: 'Skull',
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
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Achieve 75%+ overall career accuracy across 5 or more events.',
    flavor: '"A mind so sharp it cuts through every card."',
    rarity: 'epic',
    icon: 'Brain',
    autoEarn: true,
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Win 5 or more events total across all time.',
    flavor: '"They keep coming back, and they keep winning."',
    rarity: 'epic',
    icon: 'Infinity',
    autoEarn: true,
  },
  {
    id: 'final-boss',
    name: 'Final Boss',
    description: 'Finish 1st in both the first and last event of a season.',
    flavor: '"The alpha and the omega. Beginning and end."',
    rarity: 'epic',
    icon: 'Flag',
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
  {
    id: 'hall-of-famer',
    name: 'Hall of Famer',
    description: 'Inducted into the BWL Hall of Fame.',
    flavor: '"Your name echoes through the halls of eternity."',
    rarity: 'legendary',
    icon: 'Award',
    autoEarn: false,
  },
  {
    id: 'the-streak',
    name: 'The Streak',
    description: 'Won an unprecedented number of consecutive events.',
    flavor: '"The streak is alive. The streak is UNBREAKABLE."',
    rarity: 'legendary',
    icon: 'Flame',
    autoEarn: false,
  },
  {
    id: 'royal-rumble-champion',
    name: 'Royal Rumble Champion',
    description: 'Awarded for Royal Rumble event excellence.',
    flavor: '"30 superstars. One ring. And you called it all."',
    rarity: 'legendary',
    icon: 'Bookmark',
    autoEarn: false,
  },
  {
    id: 'mitb-champion',
    name: 'Money in the Bank Champion',
    description: 'Awarded for Money in the Bank event excellence.',
    flavor: '"You climbed the ladder and cashed in — flawlessly."',
    rarity: 'legendary',
    icon: 'Briefcase',
    autoEarn: false,
  },
  {
    id: 'survivor-series-champion',
    name: 'Survivor Series Champion',
    description: 'Awarded for Survivor Series event excellence.',
    flavor: '"The sole survivor. The last one standing."',
    rarity: 'legendary',
    icon: 'Snowflake',
    autoEarn: false,
  },
  {
    id: 'summerslam-champion',
    name: 'SummerSlam Champion',
    description: 'Awarded for SummerSlam event excellence.',
    flavor: '"The biggest party of the summer — and you owned it."',
    rarity: 'legendary',
    icon: 'Sun',
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

  // Helper: count events participated in (returns { total, fbParticipated })
  const getParticipationData = () => {
    let count = 0;
    const fbParticipated = [];
    // Historical
    historicalEventNames.forEach(name => {
      if (historicalScores[name]?.[player.name] !== undefined) count++;
    });
    // Firebase
    allEvents.forEach(event => {
      if (!historicalEventNames.includes(event.name.toUpperCase())) {
        const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
        const isSubmitted = event.submittedPlayers?.includes(player.name);
        if (hasPicks || isSubmitted) {
          count++;
          fbParticipated.push(event.id);
        }
      }
    });
    return { total: count, fbParticipated };
  };

  // Helper: get event score for a player in a firebase event
  const getEventScore = (p, event) => {
    let score = 0;
    event.matches?.forEach(match => {
      if (match.winner && p.picks?.[`${event.id}-${match.id}`] === match.winner) score++;
    });
    return score;
  };

  // Helper: get ranked results for an event (only players who participated)
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
      .filter(p => {
        // Only include players who actually picked in this event
        const hasPicks = Object.keys(p.picks || {}).some(k => k.startsWith(`${event.id}-`));
        const isSubmitted = event.submittedPlayers?.includes(p.name);
        return hasPicks || isSubmitted;
      })
      .map(p => ({ name: p.name, score: getEventScore(p, event) }))
      .sort((a, b) => b.score - a.score);
  };

  // Helper: get most-picked and least-picked option for a match
  const getPickPopularity = (event, match) => {
    const pickCounts = {};
    match.options.forEach(o => pickCounts[o] = 0);
    allPlayers.forEach(p => {
      const pick = p.picks?.[`${event.id}-${match.id}`];
      if (pick && pickCounts[pick] !== undefined) pickCounts[pick]++;
    });
    const counts = Object.entries(pickCounts);
    const maxPicks = Math.max(...counts.map(([, c]) => c));
    const minPicks = Math.min(...counts.map(([, c]) => c));
    const mostPicked = counts.find(([, c]) => c === maxPicks)?.[0];
    const leastPicked = counts.find(([, c]) => c === minPicks)?.[0];
    const totalPickers = allPlayers.filter(p => p.picks?.[`${event.id}-${match.id}`]).length;
    return { pickCounts, mostPicked, leastPicked, totalPickers };
  };

  const { total: participatedCount, fbParticipated } = getParticipationData();

  // ── FIRST PICK ──
  if (participatedCount >= 1) earned.push('first-pick');

  // ── REGULAR (3+ events) ──
  if (participatedCount >= 3) earned.push('regular');

  // ── VETERAN (10+ events) ──
  if (participatedCount >= 10) earned.push('veteran');

  // ── NEWCOMER (participated in at least 1 firebase event = current season) ──
  if (fbParticipated.length >= 1) earned.push('newcomer');

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

  // ── UNDERCARD (more wrong than right in an event) ──
  let hasUndercard = false;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length === 0) return;
    // Only count matches where the player actually made a pick
    const pickedDecided = decidedMatches.filter(m => player.picks?.[`${event.id}-${m.id}`]);
    if (pickedDecided.length === 0) return;
    const correct = pickedDecided.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
    const wrong = pickedDecided.length - correct;
    if (wrong > correct) hasUndercard = true;
  });
  if (hasUndercard) earned.push('undercard');

  // ── BANDWAGON FAN (pick same as every other player who picked in a match) ──
  let hasBandwagon = false;
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      if (!playerPick) return;
      // Only consider players who actually made a pick for this match
      const otherPickers = allPlayers.filter(p =>
        p.name !== player.name && p.picks?.[`${event.id}-${match.id}`]
      );
      if (otherPickers.length < 2) return;
      const allSame = otherPickers.every(p => p.picks?.[`${event.id}-${match.id}`] === playerPick);
      if (allSame) hasBandwagon = true;
    });
  });
  if (hasBandwagon) earned.push('bandwagon-fan');

  // ── SPLIT DECISION (exactly 50/50 in an event) ──
  let hasSplitDecision = false;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length < 2 || decidedMatches.length % 2 !== 0) return;
    const correct = decidedMatches.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
    if (correct === decidedMatches.length / 2) hasSplitDecision = true;
  });
  if (hasSplitDecision) earned.push('split-decision');

  // ── HAT TRICK (3 correct in a row within an event) ──
  let hasHatTrick = false;
  fbEvents.forEach(event => {
    let streak = 0;
    event.matches.forEach(match => {
      if (match.winner && player.picks?.[`${event.id}-${match.id}`] === match.winner) {
        streak++;
        if (streak >= 3) hasHatTrick = true;
      } else if (match.winner) {
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
      const { mostPicked } = getPickPopularity(event, match);
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      if (playerPick === mostPicked && playerPick === match.winner) majorityCorrect++;
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
      const winnerPickers = allPlayers.filter(p =>
        p.picks?.[`${event.id}-${match.id}`] === match.winner
      );
      if (winnerPickers.length === 1 && winnerPickers[0].name === player.name) {
        hasAgainstGrain = true;
      }
    });
  });
  if (hasAgainstGrain) earned.push('against-the-grain');

  // ── BUZZER BEATER (submitted within last hour before deadline) ──
  // We check if the event has a deadline and the player is in submittedPlayers
  // Since we don't track exact submission time, we approximate: if the event has
  // submittedPlayers and a deadline, and the player submitted, we check event metadata
  // For now, this badge is tracked via a special field 'buzzerBeaters' on the player doc
  // that the submit function can set. We'll check for it here.
  if (player.buzzerBeaters && player.buzzerBeaters.length > 0) {
    earned.push('buzzer-beater');
  }

  // ── UPSET SPOTTER (correctly picked 3+ underdogs career-wide) ──
  let underdogCorrect = 0;
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      if (!match.winner || match.options.length < 2) return;
      const { leastPicked, pickCounts } = getPickPopularity(event, match);
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      // Only count if the least-picked is truly an underdog (less than others)
      const counts = Object.values(pickCounts);
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);
      if (playerPick === leastPicked && playerPick === match.winner && minCount < maxCount) {
        underdogCorrect++;
      }
    });
  });
  if (underdogCorrect >= 3) earned.push('upset-spotter');

  // ── CLUTCH PERFORMER (last match correct and it decided ranking) ──
  let hasClutch = false;
  fbEvents.forEach(event => {
    const matches = event.matches || [];
    if (matches.length === 0) return;
    const lastMatch = matches[matches.length - 1];
    if (!lastMatch.winner) return;
    const playerPick = player.picks?.[`${event.id}-${lastMatch.id}`];
    if (playerPick !== lastMatch.winner) return;
    // Check if without the last match, player wouldn't be in top 3
    const rankingsWithout = allPlayers
      .map(p => {
        let score = 0;
        matches.slice(0, -1).forEach(m => {
          if (m.winner && p.picks?.[`${event.id}-${m.id}`] === m.winner) score++;
        });
        return { name: p.name, score };
      })
      .sort((a, b) => b.score - a.score);
    const rankWithout = rankingsWithout.findIndex(r => r.name === player.name);
    const rankingsWith = getEventRankings(event);
    const rankWith = rankingsWith.findIndex(r => r.name === player.name);
    // Clutch = moved into top 3 because of last match, or stayed in top 3 by 1 point margin
    if (rankWith < 3 && rankWithout >= 3) hasClutch = true;
  });
  if (hasClutch) earned.push('clutch-performer');

  // ── DARK HORSE (top 3 after bottom half in previous event) ──
  let hasDarkHorse = false;
  const orderedFbEvents = [...fbEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 1; i < orderedFbEvents.length; i++) {
    const prevEvent = orderedFbEvents[i - 1];
    const currEvent = orderedFbEvents[i];
    const prevRankings = getEventRankings(prevEvent);
    const currRankings = getEventRankings(currEvent);
    const prevRank = prevRankings.findIndex(r => r.name === player.name);
    const currRank = currRankings.findIndex(r => r.name === player.name);
    if (prevRank !== -1 && currRank !== -1 && currRank < 3 && prevRank >= Math.floor(prevRankings.length / 2)) {
      hasDarkHorse = true;
    }
  }
  if (hasDarkHorse) earned.push('dark-horse');

  // ── CONTRARIAN (picked least-popular in 3+ matches of single event) ──
  let hasContrarian = false;
  fbEvents.forEach(event => {
    let contrarianCount = 0;
    event.matches.forEach(match => {
      if (match.options.length < 2) return;
      const playerPick = player.picks?.[`${event.id}-${match.id}`];
      if (!playerPick) return;
      const { leastPicked, pickCounts } = getPickPopularity(event, match);
      const counts = Object.values(pickCounts);
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);
      if (playerPick === leastPicked && minCount < maxCount) contrarianCount++;
    });
    if (contrarianCount >= 3) hasContrarian = true;
  });
  if (hasContrarian) earned.push('contrarian');

  // ── PERFECT CARD ──
  // Award when player picked correctly on ALL decided matches AND picked every match.
  // For completed events: all matches must have winners and all must be correct.
  // For live events: all matches that have winners must be correct, AND the player
  // must have picked every decided match correctly (no misses allowed).
  let perfectCardCount = 0;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length === 0) return;
    // Player must have picked every decided match
    const pickedAll = decidedMatches.every(m => player.picks?.[`${event.id}-${m.id}`]);
    if (!pickedAll) return;
    const correctPicks = decidedMatches.filter(m =>
      player.picks?.[`${event.id}-${m.id}`] === m.winner
    ).length;
    // All decided matches must be correct
    if (correctPicks === decidedMatches.length) perfectCardCount++;
  });
  if (perfectCardCount >= 1) earned.push('perfect-card');
  if (perfectCardCount >= 2) earned.push('the-oracle');

  // ── NEAR PERFECT (miss only 1 in 6+ match event) ──
  let hasNearPerfect = false;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length < 6) return;
    const correct = decidedMatches.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
    if (correct === decidedMatches.length - 1) hasNearPerfect = true;
  });
  if (hasNearPerfect) earned.push('near-perfect');

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
  let totalEventWins = 0;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length >= 2 && rankings[0].name === player.name) {
      totalEventWins++;
      if (rankings[0].score - rankings[1].score >= 3) hasDominator = true;
    } else if (rankings.length === 1 && rankings[0].name === player.name) {
      totalEventWins++;
    }
  });
  historicalEventNames.forEach(name => {
    const scores = historicalScores[name];
    if (!scores || scores[player.name] === undefined) return;
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (sorted[0][0] === player.name) {
      totalEventWins++;
      if (sorted.length >= 2 && sorted[0][1] - sorted[1][1] >= 3) hasDominator = true;
    }
  });
  if (hasDominator) earned.push('dominator');

  // ── UNBREAKABLE (5+ event wins all time) ──
  if (totalEventWins >= 5) earned.push('unbreakable');

  // ── CINDERELLA RUN (last place globally to top 3 in a season) ──
  // Check firebase events only (current season)
  let hasCinderella = false;
  if (orderedFbEvents.length >= 2) {
    let wasLastGlobal = false;
    let wasTop3Global = false;
    // Track cumulative scores through the season
    const cumulativeScores = {};
    orderedFbEvents.forEach(event => {
      allPlayers.forEach(p => {
        cumulativeScores[p.name] = (cumulativeScores[p.name] || 0) + getEventScore(p, event);
      });
      const sorted = Object.entries(cumulativeScores)
        .filter(([, s]) => s > 0 || allPlayers.some(p => p.name === player.name))
        .sort(([, a], [, b]) => b - a);
      const playerIdx = sorted.findIndex(([n]) => n === player.name);
      if (playerIdx === sorted.length - 1 && sorted.length >= 3) wasLastGlobal = true;
      if (wasLastGlobal && playerIdx !== -1 && playerIdx < 3) {
        hasCinderella = true;
      }
    });
  }
  if (hasCinderella) earned.push('cinderella-run');

  // ── HEAD HUNTER (beat every other player h2h at least once) ──
  let hasHeadHunter = false;
  if (allPlayers.length >= 2) {
    const otherPlayerNames = allPlayers.filter(p => p.name !== player.name).map(p => p.name);
    const beaten = new Set();
    fbEvents.forEach(event => {
      const playerScore = getEventScore(player, event);
      allPlayers.forEach(p => {
        if (p.name === player.name) return;
        if (getEventScore(p, event) < playerScore) beaten.add(p.name);
      });
    });
    historicalEventNames.forEach(name => {
      const scores = historicalScores[name];
      if (!scores || scores[player.name] === undefined) return;
      const myScore = scores[player.name];
      Object.entries(scores).forEach(([n, s]) => {
        if (n !== player.name && s < myScore) beaten.add(n);
      });
    });
    if (otherPlayerNames.every(n => beaten.has(n))) hasHeadHunter = true;
  }
  if (hasHeadHunter) earned.push('head-hunter');

  // ── RIVAL SLAYER (win event when lowest-ranked entering) ──
  let hasRivalSlayer = false;
  if (orderedFbEvents.length >= 2) {
    for (let i = 1; i < orderedFbEvents.length; i++) {
      const currEvent = orderedFbEvents[i];
      // Calculate cumulative global standings BEFORE this event
      const prevCumulative = {};
      for (let j = 0; j < i; j++) {
        allPlayers.forEach(p => {
          prevCumulative[p.name] = (prevCumulative[p.name] || 0) + getEventScore(p, orderedFbEvents[j]);
        });
      }
      const prevSorted = Object.entries(prevCumulative).sort(([, a], [, b]) => b - a);
      const wasLowest = prevSorted.length >= 2 && prevSorted[prevSorted.length - 1][0] === player.name;
      if (wasLowest) {
        const currRankings = getEventRankings(currEvent);
        if (currRankings.length > 0 && currRankings[0].name === player.name) {
          hasRivalSlayer = true;
        }
      }
    }
  }
  if (hasRivalSlayer) earned.push('rival-slayer');

  // ── DYNASTY (win 3+ firebase events) ──
  let fbWins = 0;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length > 0 && rankings[0].name === player.name) fbWins++;
  });
  if (fbWins >= 3) earned.push('dynasty');

  // ── GRANDMASTER (75%+ career accuracy across 5+ events) ──
  let totalCorrect = 0;
  let totalDecided = 0;
  let eventsWithData = 0;
  fbEvents.forEach(event => {
    const decided = event.matches.filter(m => m.winner);
    if (decided.length === 0) return;
    const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
    if (!hasPicks) return;
    eventsWithData++;
    totalDecided += decided.length;
    totalCorrect += decided.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
  });
  if (eventsWithData >= 5 && totalDecided > 0 && (totalCorrect / totalDecided) >= 0.75) {
    earned.push('grandmaster');
  }

  // ── FINAL BOSS (1st in both first and last event of the season) ──
  let hasFinalBoss = false;
  if (orderedFbEvents.length >= 2) {
    const firstEvent = orderedFbEvents[0];
    const lastEvent = orderedFbEvents[orderedFbEvents.length - 1];
    const firstRankings = getEventRankings(firstEvent);
    const lastRankings = getEventRankings(lastEvent);
    if (
      firstRankings.length > 0 && firstRankings[0].name === player.name &&
      lastRankings.length > 0 && lastRankings[0].name === player.name
    ) {
      hasFinalBoss = true;
    }
  }
  if (hasFinalBoss) earned.push('final-boss');

  // ── UNTOUCHABLE (#1 global for 3+ consecutive events) ──
  let globalStreak = 0;
  let hasUntouchable = false;
  allOrderedEvents.forEach((event, idx) => {
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
