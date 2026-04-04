import { historicalScores, historicalEventNames, historicalTotalMatches, calculateTotalPoints, getPlayerBreakdown } from './scoring';

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
  {
    id: 'wrong-place-wrong-time',
    name: 'Wrong Place, Wrong Time',
    description: 'Score 0 points in an event.',
    flavor: '"You showed up... that\'s about it."',
    rarity: 'common',
    icon: 'CircleX',
    autoEarn: true,
  },
  {
    id: 'the-copycat',
    name: 'The Copycat',
    description: 'Submit the exact same picks as another player for an entire event.',
    flavor: '"Great minds think alike... or one of you is cheating."',
    rarity: 'common',
    icon: 'Copy',
    autoEarn: true,
  },
  {
    id: 'participation-trophy',
    name: 'Participation Trophy',
    description: 'Participate in an event but finish dead last.',
    flavor: '"Hey, at least you tried."',
    rarity: 'common',
    icon: 'Frown',
    autoEarn: true,
  },
  {
    id: 'the-jinx',
    name: 'The Jinx',
    description: 'Pick a wrestler who loses 5 or more times across your career.',
    flavor: '"At this point, they lose BECAUSE you picked them."',
    rarity: 'common',
    icon: 'CloudLightning',
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
  {
    id: 'ride-or-die',
    name: 'Ride or Die',
    description: 'Pick the same wrestler to win 3 or more times across different events.',
    flavor: '"Loyalty above logic."',
    rarity: 'uncommon',
    icon: 'Heart',
    autoEarn: true,
  },
  {
    id: 'chaos-agent',
    name: 'Chaos Agent',
    description: 'Have the most unique picks in an event — fewest matches agreeing with anyone.',
    flavor: '"Some people just want to watch the world burn."',
    rarity: 'uncommon',
    icon: 'Bomb',
    autoEarn: true,
  },
  {
    id: 'the-sweater',
    name: 'The Sweater',
    description: 'Submit picks for an event, then ask the admin to reset them.',
    flavor: '"Indecision is a decision."',
    rarity: 'uncommon',
    icon: 'RotateCcw',
    autoEarn: false,
  },
  {
    id: 'heartbreaker',
    name: 'Heartbreaker',
    description: 'Finish in 2nd place in 3 or more events.',
    flavor: '"Always the bridesmaid, never the bride."',
    rarity: 'uncommon',
    icon: 'HeartCrack',
    autoEarn: true,
  },
  {
    id: 'last-laugh',
    name: 'Last Laugh',
    description: 'Finish last in the first half of matches, then top 3 by the end.',
    flavor: '"Slow starts, strong finishes."',
    rarity: 'uncommon',
    icon: 'Laugh',
    autoEarn: true,
  },
  {
    id: 'dericks-son',
    name: "Derick's Son",
    description: 'Lose to Derick by 3 or more points in any event.',
    flavor: '"Who\'s the father now?"',
    rarity: 'uncommon',
    icon: 'Baby',
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
  {
    id: 'dericks-father',
    name: "Derick's Father",
    description: 'Beat Derick by 3 or more points in any event.',
    flavor: '"Who\'s your daddy?"',
    rarity: 'rare',
    icon: 'Crown',
    autoEarn: true,
  },
  {
    id: 'im-sorry-i-love-you',
    name: 'I\'m Sorry. I Love You.',
    description: 'Steal a point from another player during the Mr. Predictamania event.',
    flavor: '"The hardest choices require the strongest wills."',
    rarity: 'rare',
    icon: 'Skull',
    autoEarn: false,
  },
  {
    id: 'the-accountant',
    name: 'The Accountant',
    description: 'Finish in exactly 3rd place in 5 or more events.',
    flavor: '"Consistent mediocrity is an art form."',
    rarity: 'rare',
    icon: 'Hash',
    autoEarn: true,
  },
  {
    id: 'nemesis',
    name: 'Nemesis',
    description: 'Beat the same player in 5 consecutive events.',
    flavor: '"It\'s not personal... okay, it\'s personal."',
    rarity: 'rare',
    icon: 'Crosshair',
    autoEarn: true,
  },
  {
    id: 'main-eventer',
    name: 'Main Eventer',
    description: 'Get the main event (last match) correct in 5 or more events.',
    flavor: '"When it matters most, you deliver."',
    rarity: 'rare',
    icon: 'Tv',
    autoEarn: true,
  },
  {
    id: 'heel-turn',
    name: 'Heel Turn',
    description: 'Go from 1st place to last place between consecutive events.',
    flavor: '"You either die a hero or live long enough to see yourself become the villain."',
    rarity: 'rare',
    icon: 'ArrowDownUp',
    autoEarn: true,
  },
  {
    id: 'giant-killer',
    name: 'Giant Killer',
    description: 'Beat the #1 ranked player in 3 different events while ranked in the bottom half.',
    flavor: '"David vs. Goliath, and David keeps winning."',
    rarity: 'rare',
    icon: 'Mountain',
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
  {
    id: 'the-undertaker',
    name: 'The Undertaker',
    description: 'Win an event with 10 or more matches.',
    flavor: '"Rest. In. Peace."',
    rarity: 'epic',
    icon: 'Skull',
    autoEarn: true,
  },
  {
    id: 'sixth-sense',
    name: 'Sixth Sense',
    description: 'Correctly pick 3 or more matches where no other player picked the same winner.',
    flavor: '"You see what no one else can."',
    rarity: 'epic',
    icon: 'Eye',
    autoEarn: true,
  },
  {
    id: 'stone-cold-lock',
    name: 'Stone Cold Lock',
    description: 'Maintain 70%+ accuracy across 3 consecutive events.',
    flavor: '"And that\'s the bottom line."',
    rarity: 'epic',
    icon: 'Lock',
    autoEarn: true,
  },
  {
    id: 'the-collector',
    name: 'The Collector',
    description: 'Earn 20 or more badges total.',
    flavor: '"Gotta catch \'em all."',
    rarity: 'epic',
    icon: 'Package',
    autoEarn: true,
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    description: 'Never finish below 3rd place across 5 or more consecutive events.',
    flavor: '"An unshakeable force at the top."',
    rarity: 'epic',
    icon: 'Shield',
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

  // Helper: get completed/live firebase events
  // NOTE: We include ALL firebase events here, even those sharing names with
  // historical events. The historical name filter is only for scoring (to avoid
  // double-counting points), but badges should be computed from actual match data.
  const fbEvents = allEvents.filter(e =>
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
    // Firebase — count ALL firebase events (even those sharing historical names,
    // since they are separate events in a new season)
    allEvents.forEach(event => {
      const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
      const isSubmitted = event.submittedPlayers?.includes(player.name);
      if (hasPicks || isSubmitted) {
        count++;
        fbParticipated.push(event.id);
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
  // Uses event.type === 'historical' flag (set when building allOrderedEvents) to
  // distinguish historical-only entries from real Firebase events.
  const getEventRankings = (event) => {
    if (event.type === 'historical') {
      const scores = historicalScores[event.name] || historicalScores[event.name?.toUpperCase?.()];
      if (!scores) return [];
      return Object.entries(scores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);
    }
    return allPlayers
      .filter(p => {
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
  // Historical: if player score equals total matches, they got a full card
  if (!hasFullCard) {
    historicalEventNames.forEach(name => {
      const score = historicalScores[name]?.[player.name];
      const total = historicalTotalMatches[name];
      if (score !== undefined && total && score === total) hasFullCard = true;
    });
  }
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
    const pickedDecided = decidedMatches.filter(m => player.picks?.[`${event.id}-${m.id}`]);
    if (pickedDecided.length === 0) return;
    const correct = pickedDecided.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
    const wrong = pickedDecided.length - correct;
    if (wrong > correct) hasUndercard = true;
  });
  // Historical: check if wrong > correct
  if (!hasUndercard) {
    historicalEventNames.forEach(name => {
      const score = historicalScores[name]?.[player.name];
      const total = historicalTotalMatches[name];
      if (score !== undefined && total) {
        const wrong = total - score;
        if (wrong > score) hasUndercard = true;
      }
    });
  }
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
  // Historical: check if score === totalMatches / 2
  if (!hasSplitDecision) {
    historicalEventNames.forEach(name => {
      const score = historicalScores[name]?.[player.name];
      const total = historicalTotalMatches[name];
      if (score !== undefined && total && total >= 2 && total % 2 === 0 && score === total / 2) {
        hasSplitDecision = true;
      }
    });
  }
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
  // Award when player picked correctly on ALL decided matches AND picked every one.
  let perfectCardCount = 0;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length === 0) return;
    const pickedAll = decidedMatches.every(m => player.picks?.[`${event.id}-${m.id}`]);
    if (!pickedAll) return;
    const correctPicks = decidedMatches.filter(m =>
      player.picks?.[`${event.id}-${m.id}`] === m.winner
    ).length;
    if (correctPicks === decidedMatches.length) perfectCardCount++;
  });
  // Historical: score === totalMatches means perfect card
  historicalEventNames.forEach(name => {
    const score = historicalScores[name]?.[player.name];
    const total = historicalTotalMatches[name];
    if (score !== undefined && total && score === total) perfectCardCount++;
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
  // Historical: score === totalMatches - 1, and totalMatches >= 6
  if (!hasNearPerfect) {
    historicalEventNames.forEach(name => {
      const score = historicalScores[name]?.[player.name];
      const total = historicalTotalMatches[name];
      if (score !== undefined && total && total >= 6 && score === total - 1) {
        hasNearPerfect = true;
      }
    });
  }
  if (hasNearPerfect) earned.push('near-perfect');

  // ── STREAK MASTER (top 3 in 3 consecutive events) ──
  const allOrderedEvents = [
    ...historicalEventNames.map(name => ({ name, type: 'historical' })),
    ...allEvents
      .filter(e => e.status === 'completed' || e.status === 'live')
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

  // ── DERICK'S FATHER (beat Derick by 3+ in any event) ──
  if (player.name !== 'Derick') {
    let hasDericksFather = false;
    fbEvents.forEach(event => {
      const playerScore = getEventScore(player, event);
      const derickPlayer = allPlayers.find(p => p.name === 'Derick');
      if (derickPlayer) {
        const derickScore = getEventScore(derickPlayer, event);
        if (playerScore - derickScore >= 3) hasDericksFather = true;
      }
    });
    if (!hasDericksFather) {
      historicalEventNames.forEach(name => {
        const scores = historicalScores[name];
        if (!scores || scores[player.name] === undefined || scores['Derick'] === undefined) return;
        if (scores[player.name] - scores['Derick'] >= 3) hasDericksFather = true;
      });
    }
    if (hasDericksFather) earned.push('dericks-father');
  }

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

  // ── WRONG PLACE, WRONG TIME (score 0 in an event) ──
  let hasWrongPlace = false;
  fbEvents.forEach(event => {
    const decidedMatches = event.matches.filter(m => m.winner);
    if (decidedMatches.length === 0) return;
    const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
    if (!hasPicks && !event.submittedPlayers?.includes(player.name)) return;
    if (getEventScore(player, event) === 0) hasWrongPlace = true;
  });
  if (!hasWrongPlace) {
    historicalEventNames.forEach(name => {
      if (historicalScores[name]?.[player.name] === 0) hasWrongPlace = true;
    });
  }
  if (hasWrongPlace) earned.push('wrong-place-wrong-time');

  // ── THE COPYCAT (exact same picks as another player for entire event) ──
  let hasCopycat = false;
  fbEvents.forEach(event => {
    const playerPickKeys = event.matches.map(m => `${event.id}-${m.id}`);
    const playerPicks = playerPickKeys.map(k => player.picks?.[k]).filter(Boolean);
    if (playerPicks.length === 0) return;
    allPlayers.forEach(other => {
      if (other.name === player.name) return;
      const otherPicks = playerPickKeys.map(k => other.picks?.[k]).filter(Boolean);
      if (otherPicks.length === 0 || otherPicks.length !== playerPicks.length) return;
      const allMatch = playerPickKeys.every(k => player.picks?.[k] && player.picks[k] === other.picks?.[k]);
      if (allMatch && playerPicks.length >= 2) hasCopycat = true;
    });
  });
  if (hasCopycat) earned.push('the-copycat');

  // ── PARTICIPATION TROPHY (finish dead last in an event) ──
  let hasParticipationTrophy = false;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length < 2) return;
    if (rankings[rankings.length - 1].name === player.name) hasParticipationTrophy = true;
  });
  if (!hasParticipationTrophy) {
    historicalEventNames.forEach(name => {
      const scores = historicalScores[name];
      if (!scores || scores[player.name] === undefined) return;
      const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
      if (sorted[sorted.length - 1][0] === player.name) hasParticipationTrophy = true;
    });
  }
  if (hasParticipationTrophy) earned.push('participation-trophy');

  // ── THE JINX (pick a wrestler who loses 5+ times across career) ──
  let hasJinx = false;
  const pickLossCounts = {};
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      if (!match.winner) return;
      const pick = player.picks?.[`${event.id}-${match.id}`];
      if (pick && pick !== match.winner) {
        pickLossCounts[pick] = (pickLossCounts[pick] || 0) + 1;
      }
    });
  });
  if (Object.values(pickLossCounts).some(c => c >= 5)) hasJinx = true;
  if (hasJinx) earned.push('the-jinx');

  // ── RIDE OR DIE (pick same wrestler 3+ times across events) ──
  let hasRideOrDie = false;
  const pickCareerCounts = {};
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      const pick = player.picks?.[`${event.id}-${match.id}`];
      if (pick) pickCareerCounts[pick] = (pickCareerCounts[pick] || 0) + 1;
    });
  });
  if (Object.values(pickCareerCounts).some(c => c >= 3)) hasRideOrDie = true;
  if (hasRideOrDie) earned.push('ride-or-die');

  // ── CHAOS AGENT (most unique picks in an event) ──
  let hasChaosAgent = false;
  fbEvents.forEach(event => {
    if (event.matches.length < 3) return;
    const participants = allPlayers.filter(p =>
      Object.keys(p.picks || {}).some(k => k.startsWith(`${event.id}-`))
    );
    if (participants.length < 3) return;
    // For each player, count how many matches they agreed with at least one other player
    const agreementCounts = {};
    participants.forEach(p => {
      let agreements = 0;
      event.matches.forEach(match => {
        const myPick = p.picks?.[`${event.id}-${match.id}`];
        if (!myPick) return;
        const othersAgreed = participants.some(o =>
          o.name !== p.name && o.picks?.[`${event.id}-${match.id}`] === myPick
        );
        if (othersAgreed) agreements++;
      });
      agreementCounts[p.name] = agreements;
    });
    const playerAgreements = agreementCounts[player.name];
    if (playerAgreements === undefined) return;
    const minAgreements = Math.min(...Object.values(agreementCounts));
    if (playerAgreements === minAgreements && playerAgreements < event.matches.length) {
      // Make sure this player is uniquely the most contrarian (or tied for it)
      hasChaosAgent = true;
    }
  });
  if (hasChaosAgent) earned.push('chaos-agent');

  // ── HEARTBREAKER (2nd place in 3+ events) ──
  let secondPlaceCount = 0;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length >= 2 && rankings[1].name === player.name) secondPlaceCount++;
  });
  historicalEventNames.forEach(name => {
    const scores = historicalScores[name];
    if (!scores || scores[player.name] === undefined) return;
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (sorted.length >= 2 && sorted[1][0] === player.name) secondPlaceCount++;
  });
  if (secondPlaceCount >= 3) earned.push('heartbreaker');

  // ── LAST LAUGH (last in first half, top 3 by end) ──
  let hasLastLaugh = false;
  fbEvents.forEach(event => {
    const matches = event.matches || [];
    const decidedMatches = matches.filter(m => m.winner);
    if (decidedMatches.length < 4) return;
    const halfIdx = Math.floor(decidedMatches.length / 2);
    const firstHalf = decidedMatches.slice(0, halfIdx);
    // Rank players by first half only
    const participants = allPlayers.filter(p =>
      Object.keys(p.picks || {}).some(k => k.startsWith(`${event.id}-`))
    );
    if (participants.length < 3) return;
    const firstHalfRankings = participants
      .map(p => {
        let score = 0;
        firstHalf.forEach(m => {
          if (p.picks?.[`${event.id}-${m.id}`] === m.winner) score++;
        });
        return { name: p.name, score };
      })
      .sort((a, b) => b.score - a.score);
    const firstHalfRank = firstHalfRankings.findIndex(r => r.name === player.name);
    if (firstHalfRank === firstHalfRankings.length - 1) {
      // Was last in first half — check final ranking
      const finalRankings = getEventRankings(event);
      const finalRank = finalRankings.findIndex(r => r.name === player.name);
      if (finalRank !== -1 && finalRank < 3) hasLastLaugh = true;
    }
  });
  if (hasLastLaugh) earned.push('last-laugh');

  // ── DERICK'S SON (lose to Derick by 3+ in any event) ──
  if (player.name !== 'Derick') {
    let hasDericksSon = false;
    fbEvents.forEach(event => {
      const derickPlayer = allPlayers.find(p => p.name === 'Derick');
      if (derickPlayer) {
        const derickScore = getEventScore(derickPlayer, event);
        const playerScore = getEventScore(player, event);
        if (derickScore - playerScore >= 3) hasDericksSon = true;
      }
    });
    if (!hasDericksSon) {
      historicalEventNames.forEach(name => {
        const scores = historicalScores[name];
        if (!scores || scores[player.name] === undefined || scores['Derick'] === undefined) return;
        if (scores['Derick'] - scores[player.name] >= 3) hasDericksSon = true;
      });
    }
    if (hasDericksSon) earned.push('dericks-son');
  }

  // ── THE ACCOUNTANT (exactly 3rd place in 5+ events) ──
  let thirdPlaceCount = 0;
  fbEvents.forEach(event => {
    const rankings = getEventRankings(event);
    if (rankings.length >= 3 && rankings[2].name === player.name) thirdPlaceCount++;
  });
  historicalEventNames.forEach(name => {
    const scores = historicalScores[name];
    if (!scores || scores[player.name] === undefined) return;
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    if (sorted.length >= 3 && sorted[2][0] === player.name) thirdPlaceCount++;
  });
  if (thirdPlaceCount >= 5) earned.push('the-accountant');

  // ── NEMESIS (beat same player in 5 consecutive events) ──
  let hasNemesis = false;
  const otherNames = allPlayers.filter(p => p.name !== player.name).map(p => p.name);
  otherNames.forEach(opponentName => {
    let streak = 0;
    allOrderedEvents.forEach(event => {
      let myScore, theirScore;
      if (event.type === 'historical') {
        const scores = historicalScores[event.name] || {};
        myScore = scores[player.name];
        theirScore = scores[opponentName];
      } else {
        const opponent = allPlayers.find(p => p.name === opponentName);
        myScore = getEventScore(player, event);
        theirScore = opponent ? getEventScore(opponent, event) : undefined;
      }
      if (myScore !== undefined && theirScore !== undefined && myScore > theirScore) {
        streak++;
        if (streak >= 5) hasNemesis = true;
      } else {
        streak = 0;
      }
    });
  });
  if (hasNemesis) earned.push('nemesis');

  // ── MAIN EVENTER (last match correct in 5+ events) ──
  let mainEventCorrect = 0;
  fbEvents.forEach(event => {
    const matches = event.matches || [];
    if (matches.length === 0) return;
    const lastMatch = matches[matches.length - 1];
    if (lastMatch.winner && player.picks?.[`${event.id}-${lastMatch.id}`] === lastMatch.winner) {
      mainEventCorrect++;
    }
  });
  if (mainEventCorrect >= 5) earned.push('main-eventer');

  // ── HEEL TURN (1st to last between consecutive events) ──
  let hasHeelTurn = false;
  for (let i = 1; i < allOrderedEvents.length; i++) {
    const prevEvent = allOrderedEvents[i - 1];
    const currEvent = allOrderedEvents[i];
    const prevRankings = getEventRankings(prevEvent);
    const currRankings = getEventRankings(currEvent);
    const prevRank = prevRankings.findIndex(r => r.name === player.name);
    const currRank = currRankings.findIndex(r => r.name === player.name);
    if (prevRank === 0 && currRank === currRankings.length - 1 && currRankings.length >= 2) {
      hasHeelTurn = true;
    }
  }
  if (hasHeelTurn) earned.push('heel-turn');

  // ── GIANT KILLER (beat #1 ranked while bottom half in 3 events) ──
  let giantKillCount = 0;
  for (let i = 1; i < allOrderedEvents.length; i++) {
    const currEvent = allOrderedEvents[i];
    // Calculate cumulative standings before this event
    const prevCumulative = {};
    for (let j = 0; j < i; j++) {
      const e = allOrderedEvents[j];
      if (e.type === 'historical') {
        const scores = historicalScores[e.name] || {};
        Object.entries(scores).forEach(([n, s]) => {
          prevCumulative[n] = (prevCumulative[n] || 0) + s;
        });
      } else {
        allPlayers.forEach(p => {
          prevCumulative[p.name] = (prevCumulative[p.name] || 0) + getEventScore(p, e);
        });
      }
    }
    const prevSorted = Object.entries(prevCumulative).sort(([, a], [, b]) => b - a);
    if (prevSorted.length < 2) continue;
    const topPlayer = prevSorted[0][0];
    const playerGlobalRank = prevSorted.findIndex(([n]) => n === player.name);
    const isBottomHalf = playerGlobalRank >= Math.floor(prevSorted.length / 2);
    if (!isBottomHalf || topPlayer === player.name) continue;
    // Check if player beat the top player in this event
    const currRankings = getEventRankings(currEvent);
    const playerEventRank = currRankings.findIndex(r => r.name === player.name);
    const topEventRank = currRankings.findIndex(r => r.name === topPlayer);
    if (playerEventRank !== -1 && topEventRank !== -1 && playerEventRank < topEventRank) {
      giantKillCount++;
    }
  }
  if (giantKillCount >= 3) earned.push('giant-killer');

  // ── THE UNDERTAKER (win event with 10+ matches) ──
  let hasUndertaker = false;
  fbEvents.forEach(event => {
    if (event.matches.length < 10) return;
    const rankings = getEventRankings(event);
    if (rankings.length > 0 && rankings[0].name === player.name) hasUndertaker = true;
  });
  if (!hasUndertaker) {
    historicalEventNames.forEach(name => {
      const total = historicalTotalMatches[name];
      if (!total || total < 10) return;
      const scores = historicalScores[name];
      if (!scores || scores[player.name] === undefined) return;
      const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
      if (sorted[0][0] === player.name) hasUndertaker = true;
    });
  }
  if (hasUndertaker) earned.push('the-undertaker');

  // ── SIXTH SENSE (3+ correct picks no one else picked same winner) ──
  let sixthSenseCount = 0;
  fbEvents.forEach(event => {
    event.matches.forEach(match => {
      if (!match.winner) return;
      const pick = player.picks?.[`${event.id}-${match.id}`];
      if (pick !== match.winner) return;
      // Did anyone else pick this winner?
      const otherPickedWinner = allPlayers.some(p =>
        p.name !== player.name && p.picks?.[`${event.id}-${match.id}`] === match.winner
      );
      if (!otherPickedWinner) sixthSenseCount++;
    });
  });
  if (sixthSenseCount >= 3) earned.push('sixth-sense');

  // ── STONE COLD LOCK (70%+ accuracy across 3 consecutive events) ──
  let hasStoneCold = false;
  const eventAccuracies = [];
  allOrderedEvents.forEach(event => {
    if (event.type === 'historical') {
      const total = historicalTotalMatches[event.name];
      const score = historicalScores[event.name]?.[player.name];
      if (total && score !== undefined) {
        eventAccuracies.push(score / total);
      } else {
        eventAccuracies.push(null);
      }
    } else {
      const decided = event.matches?.filter(m => m.winner) || [];
      if (decided.length === 0) { eventAccuracies.push(null); return; }
      const hasPicks = Object.keys(player.picks || {}).some(k => k.startsWith(`${event.id}-`));
      if (!hasPicks) { eventAccuracies.push(null); return; }
      const correct = decided.filter(m => player.picks?.[`${event.id}-${m.id}`] === m.winner).length;
      eventAccuracies.push(correct / decided.length);
    }
  });
  for (let i = 0; i <= eventAccuracies.length - 3; i++) {
    const three = eventAccuracies.slice(i, i + 3);
    if (three.every(a => a !== null && a >= 0.7)) hasStoneCold = true;
  }
  if (hasStoneCold) earned.push('stone-cold-lock');

  // ── IRONCLAD (never below 3rd in 5+ consecutive events) ──
  let hasIronclad = false;
  let ironcladStreak = 0;
  allOrderedEvents.forEach(event => {
    const rankings = getEventRankings(event);
    const rank = rankings.findIndex(r => r.name === player.name);
    if (rank !== -1 && rank < 3) {
      ironcladStreak++;
      if (ironcladStreak >= 5) hasIronclad = true;
    } else {
      ironcladStreak = 0;
    }
  });
  if (hasIronclad) earned.push('ironclad');

  return earned;
}

/* Get all badges for a player (auto + manual) */
export function getPlayerBadges(player, allEvents, allPlayers) {
  const autoBadges = calculateEarnedBadges(player, allEvents, allPlayers);
  const manualBadges = player.manualBadges || [];
  const allBadgeIds = [...new Set([...autoBadges, ...manualBadges])];

  // Check for The Collector meta-badge (20+ badges, not counting itself)
  if (allBadgeIds.length >= 20 && !allBadgeIds.includes('the-collector')) {
    allBadgeIds.push('the-collector');
  }

  return allBadgeIds
    .map(id => getBadgeById(id))
    .filter(Boolean)
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
}


