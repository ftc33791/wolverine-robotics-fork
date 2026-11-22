// ─────────────────────────────────────────────────────────────────────────────
//  season.js — the ONE file to edit when the game changes.
//  The match form, the team-data table and the CSV export are all generated
//  from MATCH_FIELDS, so adding/removing a metric happens here only.
// ─────────────────────────────────────────────────────────────────────────────

export const OUR_TEAM = 33791;

// FTCScout/Ignite use the START year as the season id (2026 = 2026-27).
export const CURRENT_SEASON = '2026';

export const SEASONS = [
  { value: '2026', label: '2026-27 · BioBuzz' },
  { value: '2025', label: '2025-26 · DECODE' },
  { value: '2024', label: '2024-25 · INTO THE DEEP' },
  { value: '2023', label: '2023-24 · CENTERSTAGE' },
  { value: '2022', label: '2022-23 · POWERPLAY' },
  { value: '2021', label: '2021-22 · FREIGHT FRENZY' },
  { value: '2020', label: '2020-21 · ULTIMATE GOAL' },
  { value: '2019', label: '2019-20 · SKYSTONE' },
];

// TODO(BioBuzz): confirm these against the game manual.
export const ENDGAME_OPTIONS = ['None', 'Attempted', 'Partial', 'Full'];
export const ISSUE_OPTIONS = ['None', 'Disconnected', 'Stuck', 'Tipped over', 'Broke', 'Jammed', 'Other'];
export const DEFENSE_LABELS = ['None', 'Brief', 'Some', 'Heavy'];

// type: counter | toggle | select | rating | cycle | text
export const MATCH_FIELDS = [
  { key: 'autoPoints',   label: 'Auto points',          group: 'Auto',    type: 'counter', step: 1, short: 'Auto' },
  { key: 'leftStart',    label: 'Left start',           group: 'Auto',    type: 'toggle',  short: 'Left %' },
  { key: 'pollen',       label: 'Teleop pollen',        group: 'Teleop',  type: 'counter', step: 1, short: 'Pollen' },
  { key: 'nectar',       label: 'Teleop nectar',        group: 'Teleop',  type: 'counter', step: 1, short: 'Nectar' },
  { key: 'teleopMissed', label: 'Teleop missed',        group: 'Teleop',  type: 'counter', step: 1, short: 'Missed' },
  { key: 'cycleSec',     label: 'Cycle speed (sec)',    group: 'Teleop',  type: 'cycle',   short: 'Cycle s' },
  { key: 'endgame',      label: 'Endgame',              group: 'Endgame', type: 'select',  options: ENDGAME_OPTIONS, short: 'Endgame' },
  { key: 'penalties',    label: 'Penalties',            group: 'Match',   type: 'counter', step: 1, short: 'Pen' },
  { key: 'defense',      label: 'Defense played',       group: 'Match',   type: 'rating',  labels: DEFENSE_LABELS, short: 'Def' },
  { key: 'robotIssue',   label: 'Robot issue',          group: 'Match',   type: 'select',  options: ISSUE_OPTIONS, short: 'Issue %' },
  { key: 'notes',        label: 'Notes',                group: 'Notes',   type: 'text',    short: 'Notes' },
];

export const defaultMatchData = () => {
  const d = {};
  MATCH_FIELDS.forEach(f => {
    if (f.type === 'counter' || f.type === 'rating') d[f.key] = 0;
    else if (f.type === 'toggle') d[f.key] = false;
    else if (f.type === 'select') d[f.key] = f.options[0];
    else if (f.type === 'cycle') d[f.key] = '';
    else d[f.key] = '';
  });
  return d;
};
