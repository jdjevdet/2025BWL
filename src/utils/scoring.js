export const historicalScores = {
  'BACKLASH': { 'Erik': 5, 'Albert': 5, 'Johnny': 4, 'Jordan': 4, 'Matt': 4, 'Derick': 4, 'Marcus': 4, 'Jaydan': 3, 'George': 3, 'Rob': 2 },
  'MONEY IN THE BANK': { 'Matt': 4, 'Johnny': 3, 'Jaydan': 3, 'Erik': 3, 'Albert': 3, 'Rob': 3, 'Marcus': 3, 'Jordan': 2, 'George': 2, 'Derick': 2 },
  'NIGHT OF CHAMPIONS': { 'Jordan': 6, 'Johnny': 5, 'Jaydan': 5, 'Matt': 5, 'George': 5, 'Derick': 5, 'Rob': 5, 'Erik': 4, 'Albert': 4, 'Marcus': 3 },
  'SUMMERSLAM': { 'Johnny': 9, 'Erik': 9, 'Jordan': 8, 'Rob': 8, 'Jaydan': 7, 'Matt': 7, 'Albert': 7, 'George': 6, 'Derick': 6, 'Marcus': 6 },
  'CLASH IN PARIS': { 'Johnny': 6, 'Matt': 6, 'Erik': 6, 'George': 6, 'Albert': 6, 'Jordan': 5, 'Jaydan': 5, 'Derick': 5, 'Marcus': 5, 'Rob': 5 },
  'WRESTLEPALOOZA': { 'Johnny': 4, 'Jordan': 4, 'Jaydan': 4, 'Erik': 4, 'Derick': 4, 'Albert': 4, 'Matt': 3, 'George': 3, 'Rob': 1, 'Marcus': 0 },
  'CROWN JEWEL': { 'Derick': 5, 'Johnny': 4, 'Erik': 4, 'George': 4, 'Albert': 4, 'Matt': 3, 'Rob': 2, 'Jordan': 0, 'Jaydan': 0, 'Marcus': 0 }
};

export const historicalTotalMatches = {
  'BACKLASH': 5,
  'MONEY IN THE BANK': 4,
  'NIGHT OF CHAMPIONS': 6,
  'SUMMERSLAM': 13,
  'CLASH IN PARIS': 6,
  'WRESTLEPALOOZA': 4,
  'CROWN JEWEL': 5,
};

export const historicalEventNames = Object.keys(historicalScores);

export const calculateTotalPoints = (player, allEvents) => {
  let historicalTotal = 0;
  if (player.name) {
    historicalEventNames.forEach(eventName => {
      if (historicalScores[eventName]?.[player.name] !== undefined)
        historicalTotal += historicalScores[eventName][player.name];
    });
  }
  let firebaseTotal = 0;
  allEvents.forEach(event => {
    if (!historicalEventNames.includes(event.name.toUpperCase())) {
      if ((event.status === 'completed' || event.status === 'live') && event.matches) {
        event.matches.forEach(match => {
          const pickKey = `${event.id}-${match.id}`;
          if (match.winner && player.picks && player.picks[pickKey] === match.winner) firebaseTotal += 1;
        });
      }
    }
  });
  let eventBonusTotal = 0;
  if (player.eventBonusPoints) {
    Object.values(player.eventBonusPoints).forEach(pts => { eventBonusTotal += pts; });
  }
  return historicalTotal + firebaseTotal + (player.bonusPoints || 0) + eventBonusTotal;
};

export const getPlayerBreakdown = (player, allEvents) => {
  const breakdown = [];
  historicalEventNames.forEach(eventName => {
    const score = historicalScores[eventName]?.[player.name];
    if (score !== undefined) {
      const maxScore = Math.max(...Object.values(historicalScores[eventName]));
      breakdown.push({ eventName, score, totalMatches: maxScore, type: 'historical' });
    }
  });
  allEvents.forEach(event => {
    if (!historicalEventNames.includes(event.name.toUpperCase())) {
      if ((event.status === 'completed' || event.status === 'live') && event.matches && event.matches.length > 0) {
        const hasPicks = event.matches.some(m => player.picks?.[`${event.id}-${m.id}`]);
        const isSubmitted = event.submittedPlayers?.includes(player.name);
        if (!hasPicks && !isSubmitted) return;
        let score = 0;
        event.matches.forEach(match => {
          const pickKey = `${event.id}-${match.id}`;
          if (match.winner && player.picks?.[pickKey] === match.winner) score += 1;
        });
        const eventBonus = player.eventBonusPoints?.[event.id] || 0;
        breakdown.push({ eventName: event.name, eventId: event.id, score, totalMatches: event.matches.length, type: 'firebase', eventBonus });
      }
    }
  });
  return breakdown;
};
