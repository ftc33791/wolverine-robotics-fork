// Public-data helpers for the scouting page (FTCScout + Ignite).
// Moved out of App.jsx unchanged, only with `export` added.

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING API CONSTANTS (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
export const FTCSCOUT_API = 'https://api.ftcscout.org/rest/v1';
export const IGNITE_API   = '/api/ignite';

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING HELPERS (preserved verbatim)
// ─────────────────────────────────────────────────────────────────────────────
export const getColumns = (season) => [
  { key: 'team',       label: 'Team #',       getter: t => t.teamNumber,        tooltip: 'Team number' },
  { key: 'name',       label: 'Team Name',    getter: t => t.name,              tooltip: 'Team name' },
  { key: 'seasonRank', label: 'Rank',         getter: t => t.seasonRank ?? 99999, tooltip: 'Global OPR ranking' },
  { key: 'seasonOpr',  label: 'Total NP',     getter: t => t.seasonOpr ?? 0,    tooltip: 'Season average Non-Penalty score', hasVisual: true, barColor: 'blue' },
  { key: 'autoOpr',    label: 'Auto',         getter: t => t.autoOpr ?? 0,      tooltip: 'Season Auto average', hasVisual: true, barColor: 'yellow' },
  { key: 'teleOpr',    label: 'Teleop',       getter: t => t.teleOpr ?? 0,      tooltip: 'Season TeleOp average', hasVisual: true, barColor: 'blue' },
  { key: 'egOpr',      label: 'Endgame',      getter: t => t.egOpr ?? 0,        tooltip: 'Season Endgame average', hasVisual: true, barColor: 'red' },
  { key: 'dpr',        label: 'Def PR',       getter: t => t.dpr ?? 0,          tooltip: 'Defensive Power Rating', hasVisual: true, barColor: 'red' },
  { key: 'ccwm',       label: 'CCWM',         getter: t => t.ccwm ?? 0,         tooltip: 'Contribution to Margin', hasVisual: true, barColor: 'green' },
  { key: 'winRate',    label: 'Season Win%',  getter: t => t.winRate ?? 0,      tooltip: 'Season-wide win rate', hasVisual: true, barColor: 'green', isWinPct: true },
  { key: 'lastWinRate',label: 'Last Win%',    getter: t => t.lastWinRate ?? 0,  tooltip: 'Win rate at recent event', hasVisual: true, barColor: 'green', isWinPct: true },
  { key: 'record',     label: 'W-L-T',        getter: t => t.totalWins ?? 0,    tooltip: 'Season record' },
  { key: 'maxScore',   label: 'Max NP',       getter: t => t.maxScoreNp ?? 0,   tooltip: 'Best score', hasVisual: true, barColor: 'blue' },
  { key: 'avgScore',   label: 'Avg NP',       getter: t => t.avgScoreNp ?? 0,   tooltip: 'Average score', hasVisual: true, barColor: 'blue' },
  { key: 'events',     label: 'Events',       getter: t => t.eventCount ?? 0,   tooltip: 'Events played' },
  { key: 'lastRank',   label: 'Last Rank',    getter: t => t.lastRank ?? 999,   tooltip: 'Ranking at recent event' },
  { key: 'lastEvent',  label: 'Last Event',   getter: t => t.lastEventCode ?? '', tooltip: 'Most recent event' },
  { key: 'comments',   label: 'Comments',     getter: t => t.teamNumber,        tooltip: 'Local notes', noSort: true },
  { key: 'awards',     label: 'Awards',       getter: t => t.awardCount ?? 0,   tooltip: 'Season awards' },
  { key: 'location',   label: 'Location',     getter: t => t.location ?? '',    tooltip: 'Team location' },
];

export function analyzePlaystyle(data) {
  const { autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, winRate } = data;
  const tags = []; let score = 0;
  if (autoOpr >= 30) { tags.push('Strong Auto'); score += 3; }
  else if (autoOpr >= 15) { tags.push('Solid Auto'); score += 2; }
  else if (autoOpr < 5) { tags.push('Weak Auto'); }
  if (teleOpr >= 100) { tags.push('TeleOp Powerhouse'); score += 4; }
  else if (teleOpr >= 60) { tags.push('Strong TeleOp'); score += 3; }
  else if (teleOpr >= 30) { tags.push('Avg TeleOp'); score += 1; }
  if (egOpr >= 15) { tags.push('Climber'); score += 2; }
  else if (egOpr >= 5) { tags.push('Parks'); score += 1; }
  if (dpr > 0 && seasonOpr > 0 && dpr > seasonOpr * 0.8) { tags.push('Defensive'); score += 1; }
  if (ccwm >= 50) { tags.push('Carry Potential'); score += 3; }
  else if (ccwm >= 20) { tags.push('Net Positive'); score += 2; }
  else if (ccwm < 0) { tags.push('Needs Strong Partner'); }
  if (winRate >= 80) { tags.push('Elite'); score += 3; }
  else if (winRate >= 65) { tags.push('Consistent'); score += 2; }
  let tier = '';
  if (seasonOpr >= 150) tier = '★★★';
  else if (seasonOpr >= 100) tier = '★★';
  else if (seasonOpr >= 50) tier = '★';
  const text = (tier ? tier + ' ' : '') + (tags.length > 0 ? tags.slice(0, 3).join(' · ') : 'Balanced');
  return { text, score };
}

export function buildTeam(teamNumber, igniteData, quickStats, awardsForTeam, season) {
  const ig = igniteData; const qs = quickStats;
  const summary = ig?.seasonSummary;
  const name = ig?.name ?? '';
  const location = [ig?.city, ig?.state, ig?.country].filter(Boolean).join(', ');
  const seasonOpr = qs?.tot?.value ?? summary?.opr ?? 0;
  const autoOpr   = qs?.auto?.value ?? summary?.autoOpr ?? 0;
  const teleOpr   = qs?.dc?.value   ?? summary?.teleopOpr ?? 0;
  const egOpr     = qs?.eg?.value   ?? summary?.endgameOpr ?? 0;
  const dpr       = qs?.dpr?.value  ?? summary?.dpr ?? 0;
  const ccwm      = qs?.ccwm?.value ?? summary?.ccwm ?? 0;
  const seasonRank = qs?.tot?.rank ?? 99999;
  const totalWins = summary?.totalWins ?? 0; const totalLosses = summary?.totalLosses ?? 0;
  const totalTies = summary?.totalTies ?? 0; const totalMatches = summary?.matchesPlayed ?? 0;
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
  const maxScoreNp = summary?.maxScore ?? 0; const avgScoreNp = summary?.avgScore ?? 0;
  const eventCount = summary?.eventsPlayed ?? 0;
  let lastOpr = 0, lastRank = 999, lastWins = 0, lastLosses = 0, lastTies = 0, lastEventCode = '', lastWinRate = 0, bestOpr = 0;
  let eventHistory = [];
  if (ig?.events && ig?.eventStats) {
    const validEvents = [...ig.events].filter(e => ig.eventStats[e.eventId] && ig.eventStats[e.eventId].wins !== null);
    validEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    validEvents.forEach(e => {
      const stats = ig.eventStats[e.eventId];
      const eventOpr = stats.opr ?? stats.npOpr ?? 0;
      if (eventOpr > bestOpr) bestOpr = eventOpr;
      eventHistory.push({ eventName: e.name, eventCode: e.eventCode, date: e.startDate, opr: eventOpr });
    });
    if (eventHistory.length > 0) {
      const latestEvent = validEvents[validEvents.length - 1];
      const latestStats = ig.eventStats[latestEvent.eventId];
      lastOpr = eventHistory[eventHistory.length - 1].opr;
      lastRank = latestStats.rank ?? 999;
      lastWins = latestStats.wins ?? 0; lastLosses = latestStats.losses ?? 0; lastTies = latestStats.ties ?? 0;
      lastEventCode = latestEvent.eventCode ?? '';
      const lastTotal = lastWins + lastLosses + lastTies;
      lastWinRate = lastTotal > 0 ? (lastWins / lastTotal) * 100 : 0;
    }
  }
  const seasonAwards = ig?.seasonAwards ?? [];
  const allAwards = [...(awardsForTeam || []), ...seasonAwards];
  const seen = new Set();
  const uniqueAwards = allAwards.filter(a => { const key = a.type || a.awardName || ''; if (seen.has(key)) return false; seen.add(key); return true; });
  const playstyle = analyzePlaystyle({ autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, totalWins, totalLosses, winRate }, season);
  return {
    teamNumber, name, location, bestOpr,
    seasonOpr, seasonRank, autoOpr, teleOpr, egOpr, dpr, ccwm,
    totalWins, totalLosses, totalTies, totalMatches, winRate,
    maxScoreNp, avgScoreNp, eventCount,
    lastOpr, lastRank, lastWins, lastLosses, lastTies, lastEventCode, lastWinRate,
    awards: uniqueAwards, awardCount: uniqueAwards.length,
    playstyle: playstyle.text, playstyleScore: playstyle.score, eventHistory,
  };
}

export async function fetchEvent(season, code) {
  const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}`);
  if (!res.ok) throw new Error('Event not found. Check the event code and season.');
  return res.json();
}
export async function fetchEventTeams(season, code) {
  const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}/teams`);
  if (!res.ok) throw new Error('Could not fetch team list for this event.');
  return res.json();
}
export async function fetchEventAwards(season, code) {
  try { const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}/awards`); return res.ok ? res.json() : []; } catch { return []; }
}
export async function fetchTeamQuickStats(teamNumber, season) {
  try { const res = await fetch(`${FTCSCOUT_API}/teams/${teamNumber}/quick-stats?season=${season}`); return res.ok ? res.json() : null; } catch { return null; }
}
export async function fetchIgniteTeam(teamNumber, season) {
  try { const res = await fetch(`${IGNITE_API}/teams/${teamNumber}?season=${season}`); return res.ok ? res.json() : null; } catch { return null; }
}
export async function batchFetch(items, fn, batchSize = 5) {
  const results = {};
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const infos = await Promise.all(batch.map(fn));
    batch.forEach((item, idx) => results[item] = infos[idx]);
  }
  return results;
}
