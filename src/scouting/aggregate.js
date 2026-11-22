import { MATCH_FIELDS } from './season.js';

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

/** Roll match records up to one row per team. `matches` = live (non-deleted) match records. */
export function aggregateTeams(matches) {
  const byTeam = new Map();
  matches.forEach(m => {
    if (!byTeam.has(m.team)) byTeam.set(m.team, []);
    byTeam.get(m.team).push(m);
  });

  return [...byTeam.entries()].map(([team, rows]) => {
    const col = (k) => rows.map(r => num(r.data[k])).filter(v => v !== null);
    const pollen = mean(col('pollen')), nectar = mean(col('nectar')), missed = mean(col('teleopMissed'));
    const attempts = (pollen ?? 0) + (nectar ?? 0) + (missed ?? 0);
    const cycle = col('cycleSec').filter(v => v > 0);

    const endgameCounts = {};
    rows.forEach(r => { const e = r.data.endgame; if (e) endgameCounts[e] = (endgameCounts[e] || 0) + 1; });
    const endgameMode = Object.entries(endgameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    return {
      team,
      n: rows.length,
      auto: mean(col('autoPoints')),
      leftRate: rows.filter(r => r.data.leftStart).length / rows.length,
      pollen, nectar, missed,
      missRate: attempts > 0 ? (missed ?? 0) / attempts : null,
      cycle: mean(cycle),
      endgameMode,
      penalties: mean(col('penalties')),
      defense: mean(col('defense')),
      issueRate: rows.filter(r => r.data.robotIssue && r.data.robotIssue !== 'None').length / rows.length,
      rows: [...rows].sort((a, b) => (a.data.matchNo ?? 0) - (b.data.matchNo ?? 0)),
    };
  });
}

/** Columns for the team-data table. */
export const TEAM_COLUMNS = [
  { key: 'team',     label: 'Team',      get: t => t.team },
  { key: 'n',        label: 'Matches',   get: t => t.n },
  { key: 'auto',     label: 'Auto',      get: t => t.auto,      fmt: 1 },
  { key: 'leftRate', label: 'Left %',    get: t => t.leftRate,  pct: true },
  { key: 'pollen',   label: 'Pollen',    get: t => t.pollen,    fmt: 1 },
  { key: 'nectar',   label: 'Nectar',    get: t => t.nectar,    fmt: 1 },
  { key: 'missed',   label: 'Missed',    get: t => t.missed,    fmt: 1 },
  { key: 'missRate', label: 'Miss %',    get: t => t.missRate,  pct: true },
  { key: 'cycle',    label: 'Cycle s',   get: t => t.cycle,     fmt: 1 },
  { key: 'endgameMode', label: 'Endgame', get: t => t.endgameMode },
  { key: 'penalties',label: 'Pen',       get: t => t.penalties, fmt: 1 },
  { key: 'defense',  label: 'Def',       get: t => t.defense,   fmt: 1 },
  { key: 'issueRate',label: 'Issue %',   get: t => t.issueRate, pct: true },
];

export function formatCell(col, team) {
  const v = col.get(team);
  if (v === null || v === undefined || v === '') return '—';
  if (col.pct) return `${Math.round(v * 100)}%`;
  if (col.fmt !== undefined && typeof v === 'number') return v.toFixed(col.fmt);
  return String(v);
}

const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  // Neutralise spreadsheet formula injection from user-typed text.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** One row per scouted team-match, columns driven by MATCH_FIELDS. */
export function matchesToCSV(matches) {
  const head = ['event', 'match', 'team', 'alliance', 'scouter', ...MATCH_FIELDS.map(f => f.key)];
  const rows = [...matches]
    .sort((a, b) => (a.data.matchNo ?? 0) - (b.data.matchNo ?? 0) || a.team - b.team)
    .map(m => [m.event, m.data.matchNo, m.team, m.data.alliance, m.data.scouter,
      ...MATCH_FIELDS.map(f => (f.type === 'toggle' ? (m.data[f.key] ? 1 : 0) : m.data[f.key]))]);
  return [head, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
}
