export const isExclusivePicksEvent = (event) => event?.name?.toLowerCase().includes('royal rumble');

export const isExclusivePicksMatch = (event, matchTitle) => {
  if (!isExclusivePicksEvent(event)) return false;
  const normalizedTitle = matchTitle?.toLowerCase().replace(/['''`´]/g, "'").trim();
  return ["men's royal rumble match", "women's royal rumble match"].includes(normalizedTitle);
};

export const isExemptFromExclusive = (option) => option?.toLowerCase() === 'other';

export const getOtherPickers = (players, eventId, matchId, currentPlayerName) => {
  const pickKey = `${eventId}-${matchId}`;
  const otherPickers = [];
  players.forEach(player => {
    if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
      if (isExemptFromExclusive(player.picks[pickKey])) otherPickers.push(player.name);
    }
  });
  return otherPickers;
};

export const getPicksTakenByOthers = (players, eventId, matchId, currentPlayerName) => {
  const pickKey = `${eventId}-${matchId}`;
  const takenPicks = {};
  players.forEach(player => {
    if (player.name !== currentPlayerName && player.picks && player.picks[pickKey]) {
      const pick = player.picks[pickKey];
      if (!isExemptFromExclusive(pick)) takenPicks[pick] = player.name;
    }
  });
  return takenPicks;
};
