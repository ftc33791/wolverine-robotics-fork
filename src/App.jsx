/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WOLVERINE ROBOTICS — App.jsx
 *  Root component: routing, page transitions, nav/footer shell.
 *  Scouting logic is preserved exactly as it was.
 *  All site content is imported from src/data.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, BarChart2 } from 'lucide-react';
import * as THREE from 'three';

// ── Data ──────────────────────────────────────────────────────────
import { NAVIGATION, TEAM, PAST_MEMBERS, ROBOTS, SPONSORS } from './data.js';

// ── UI Shell ──────────────────────────────────────────────────────
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import CustomCursor from './components/ui/CustomCursor.jsx';

// ── Pages ─────────────────────────────────────────────────────────
import HomePage     from './pages/HomePage.jsx';
import AboutPage    from './pages/AboutPage.jsx';
import TeamPage     from './pages/TeamPage.jsx';
import RobotsPage   from './pages/RobotsPage.jsx';
import SponsorsPage from './pages/SponsorsPage.jsx';
import ContactPage  from './pages/ContactPage.jsx';

// ── Scouting CSS ──────────────────────────────────────────────────
import './Scouting.css';

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING API CONSTANTS (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
const FTCSCOUT_API = 'https://api.ftcscout.org/rest/v1';
const IGNITE_API   = '/api/ignite';

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING HELPERS (preserved verbatim)
// ─────────────────────────────────────────────────────────────────────────────
const getColumns = (season) => [
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

function analyzePlaystyle(data) {
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

function buildTeam(teamNumber, igniteData, quickStats, awardsForTeam, season) {
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

async function fetchEvent(season, code) {
  const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}`);
  if (!res.ok) throw new Error('Event not found. Check the event code and season.');
  return res.json();
}
async function fetchEventTeams(season, code) {
  const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}/teams`);
  if (!res.ok) throw new Error('Could not fetch team list for this event.');
  return res.json();
}
async function fetchEventAwards(season, code) {
  try { const res = await fetch(`${FTCSCOUT_API}/events/${season}/${code}/awards`); return res.ok ? res.json() : []; } catch { return []; }
}
async function fetchTeamQuickStats(teamNumber, season) {
  try { const res = await fetch(`${FTCSCOUT_API}/teams/${teamNumber}/quick-stats?season=${season}`); return res.ok ? res.json() : null; } catch { return null; }
}
async function fetchIgniteTeam(teamNumber, season) {
  try { const res = await fetch(`${IGNITE_API}/teams/${teamNumber}?season=${season}`); return res.ok ? res.json() : null; } catch { return null; }
}
async function batchFetch(items, fn, batchSize = 5) {
  const results = {};
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const infos = await Promise.all(batch.map(fn));
    batch.forEach((item, idx) => results[item] = infos[idx]);
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING PAGE (preserved verbatim, only styled to match new design system)
// ─────────────────────────────────────────────────────────────────────────────
function ScoutingPage() {
  const [season, setSeason] = useState('2025');
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [eventInfo, setEventInfo] = useState(null);
  const [renderedTeams, setRenderedTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [sortKey, setSortKey] = useState('seasonOpr');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showVisuals, setShowVisuals] = useState(false);
  const [activeTab, setActiveTab] = useState('event');
  const [compareTeam1, setCompareTeam1] = useState('');
  const [compareTeam2, setCompareTeam2] = useState('');
  const [compareData, setCompareData] = useState({ t1: null, t2: null });
  const [compareLoading, setCompareLoading] = useState(false);
  const [modalTeam, setModalTeam] = useState(null);
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const oprRef = useRef(null); const phaseRef = useRef(null);
  const radarRef = useRef(null); const compareRadarRef = useRef(null);
  const chartInstances = useRef({});

  const handleScout = async (e) => {
    e.preventDefault();
    const code = eventCode.trim().toUpperCase();
    if (!code) { setErrorMsg('Enter an event code.'); return; }
    setErrorMsg(''); setLoading(true); setEventInfo(null); setAllTeams([]);
    try {
      const [event, eventTeams, eventAwards] = await Promise.all([fetchEvent(season, code), fetchEventTeams(season, code), fetchEventAwards(season, code)]);
      if (!eventTeams || eventTeams.length === 0) throw new Error('No teams found.');
      const teamNumbers = eventTeams.map(t => t.teamNumber);
      const awardsMap = {};
      if (eventAwards) eventAwards.forEach(a => { if (!awardsMap[a.teamNumber]) awardsMap[a.teamNumber] = []; awardsMap[a.teamNumber].push(a); });
      const [igniteResults, quickResults] = await Promise.all([batchFetch(teamNumbers, n => fetchIgniteTeam(n, season), 5), batchFetch(teamNumbers, n => fetchTeamQuickStats(n, season), 5)]);
      const assembled = teamNumbers.map(num => buildTeam(num, igniteResults[num], quickResults[num], awardsMap[num] || [], season));
      assembled.sort((a, b) => b.seasonOpr - a.seasonOpr);
      setEventInfo({ ...event, teamCount: assembled.length });
      setAllTeams(assembled); setRenderedTeams(assembled);
      setSortKey('seasonOpr'); setSortAsc(false); setFilterQuery('');
    } catch (err) { setErrorMsg(err.message || 'An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    const t1 = compareTeam1.trim(); const t2 = compareTeam2.trim();
    if (!t1 || !t2) { setErrorMsg('Enter both team numbers.'); return; }
    setErrorMsg(''); setCompareLoading(true); setCompareData({ t1: null, t2: null });
    try {
      const nums = [parseInt(t1), parseInt(t2)];
      const [igniteResults, quickResults] = await Promise.all([batchFetch(nums, n => fetchIgniteTeam(n, season), 2), batchFetch(nums, n => fetchTeamQuickStats(n, season), 2)]);
      setCompareData({ t1: buildTeam(nums[0], igniteResults[nums[0]], quickResults[nums[0]], [], season), t2: buildTeam(nums[1], igniteResults[nums[1]], quickResults[nums[1]], [], season) });
    } catch { setErrorMsg('Error fetching comparison data.'); }
    finally { setCompareLoading(false); }
  };

  const handleSort = (key) => {
    const isAsc = sortKey === key ? !sortAsc : (key === 'seasonRank' || key === 'lastRank');
    setSortKey(key); setSortAsc(isAsc);
    const col = getColumns(season).find(c => c.key === key);
    if (!col || col.noSort) return;
    const sorted = [...renderedTeams].sort((a, b) => { let va = col.getter(a), vb = col.getter(b); if (typeof va === 'string') return isAsc ? va.localeCompare(vb) : vb.localeCompare(va); return isAsc ? va - vb : vb - va; });
    setRenderedTeams(sorted);
  };

  const handleFilter = (e) => {
    const query = e.target.value.toLowerCase(); setFilterQuery(query);
    let filtered = allTeams.filter(t => String(t.teamNumber).includes(query) || (t.name || '').toLowerCase().includes(query));
    const col = getColumns(season).find(c => c.key === sortKey);
    if (col && !col.noSort) { filtered.sort((a, b) => { let va = col.getter(a), vb = col.getter(b); if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va); return sortAsc ? va - vb : vb - va; }); }
    setRenderedTeams(filtered);
  };

  const openModal = (team) => {
    setModalTeam(team); setNotes(localStorage.getItem(`notes_${team.teamNumber}`) || '');
    setSaveStatus(localStorage.getItem(`notes_${team.teamNumber}`) ? 'Last saved locally' : 'No notes yet');
  };

  const closeTeamModal = () => {
    if (chartInstances.current.opr)   chartInstances.current.opr.destroy();
    if (chartInstances.current.phase) chartInstances.current.phase.destroy();
    if (chartInstances.current.radar) chartInstances.current.radar.destroy();
    setModalTeam(null);
  };

  const saveNotes = () => {
    if (!modalTeam) return;
    localStorage.setItem(`notes_${modalTeam.teamNumber}`, notes.trim());
    setSaveStatus('Saved to local storage');
  };

  // Chart rendering (preserved)
  useEffect(() => {
    if (!modalTeam || !window.Chart) return;
    if (chartInstances.current.opr)   chartInstances.current.opr.destroy();
    if (chartInstances.current.phase) chartInstances.current.phase.destroy();
    if (chartInstances.current.radar) chartInstances.current.radar.destroy();
    const labels = modalTeam.eventHistory ? modalTeam.eventHistory.map(e => e.eventCode) : [];
    const oprData = modalTeam.eventHistory ? modalTeam.eventHistory.map(e => e.opr) : [];
    chartInstances.current.opr = new window.Chart(oprRef.current, { type: 'line', data: { labels, datasets: [{ label: 'Event OPR', data: oprData, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)', borderWidth: 2, pointBackgroundColor: '#3b82f6', fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'OPR TREND OVER SEASON', color: '#8b8b9a' } }, scales: { y: { grid: { color: '#23232e' }, ticks: { color: '#8b8b9a' } }, x: { grid: { display: false }, ticks: { color: '#8b8b9a' } } } } });
    const aOpr = Math.max(0, modalTeam.autoOpr); const tOpr = Math.max(0, modalTeam.teleOpr); const eOpr = Math.max(0, modalTeam.egOpr);
    chartInstances.current.phase = new window.Chart(phaseRef.current, { type: 'doughnut', data: { labels: ['Auto','TeleOp','Endgame'], datasets: [{ data: [aOpr,tOpr,eOpr], backgroundColor: ['#eab308','#3b82f6','#ef4444'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#e8e8ed' } }, title: { display: true, text: 'SCORING PROFILE', color: '#8b8b9a' } } } });
    const avgStats = { auto: 0, tele: 0, eg: 0, dpr: 0, ccwm: 0 };
    if (allTeams.length > 0) { allTeams.forEach(t => { avgStats.auto += t.autoOpr||0; avgStats.tele += t.teleOpr||0; avgStats.eg += t.egOpr||0; avgStats.dpr += t.dpr||0; avgStats.ccwm += t.ccwm||0; }); avgStats.auto /= allTeams.length; avgStats.tele /= allTeams.length; avgStats.eg /= allTeams.length; avgStats.dpr /= allTeams.length; avgStats.ccwm /= allTeams.length; }
    chartInstances.current.radar = new window.Chart(radarRef.current, { type: 'radar', data: { labels: ['Auto OPR','TeleOp OPR','Endg OPR','CCWM','Def PR'], datasets: [{ label: `Team ${modalTeam.teamNumber}`, data: [modalTeam.autoOpr||0,modalTeam.teleOpr||0,modalTeam.egOpr||0,modalTeam.ccwm||0,modalTeam.dpr||0], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.4)' }, { label: 'Event Average', data: [avgStats.auto,avgStats.tele,avgStats.eg,avgStats.ccwm,avgStats.dpr], borderColor: '#8b8b9a', backgroundColor: 'rgba(139,139,154,0.2)', borderDash: [5,5] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e8e8ed' } }, title: { display: true, text: 'TEAM VS AVERAGE', color: '#8b8b9a' } }, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#8b8b9a' }, ticks: { display: false } } } } });
  }, [modalTeam]);

  useEffect(() => {
    if (!compareData.t1 || !compareData.t2 || !window.Chart) return;
    if (chartInstances.current.compareRadar) chartInstances.current.compareRadar.destroy();
    const metrics = [{ label: 'Total NP', key: 'seasonOpr' }, { label: 'Auto', key: 'autoOpr' }, { label: 'Teleop', key: 'teleOpr' }, { label: 'Endgame', key: 'egOpr' }, { label: 'CCWM', key: 'ccwm' }, { label: 'DPR', key: 'dpr' }];
    const t1 = compareData.t1; const t2 = compareData.t2;
    chartInstances.current.compareRadar = new window.Chart(compareRadarRef.current, { type: 'radar', data: { labels: metrics.map(m => m.label), datasets: [{ label: `Team ${t1.teamNumber}`, data: metrics.map(m => t1[m.key]||0), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.3)', pointBackgroundColor: '#3b82f6' }, { label: `Team ${t2.teamNumber}`, data: metrics.map(m => t2[m.key]||0), borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.3)', pointBackgroundColor: '#fb923c' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e8e8ed' } } }, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#8b8b9a' }, ticks: { display: false } } } } });
  }, [compareData]);

  const columns = getColumns(season);
  const maxVals = {};
  columns.filter(c => c.hasVisual).forEach(c => { maxVals[c.key] = Math.max(...allTeams.map(t => Math.abs(c.getter(t))), 1); });

  // The scouting JSX is large but preserved as-is from the original codebase.
  // Only the outer wrapper class is updated to use the new design tokens.
  return (
    <div className="scouting-page min-h-screen py-24 px-4" style={{ background: 'var(--c-blue-deep)' }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Page title */}
        <div className="mb-10">
          <p className="label-caps mb-2">COMPETITION INTELLIGENCE</p>
          <h1 className="display-lg text-white">SCOUTING</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-b" style={{ borderColor: 'rgba(255,90,31,0.1)' }}>
          {[['event', <Search size={14}/>, 'EVENT SCOUT'], ['compare', <BarChart2 size={14}/>, 'COMPARE']].map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-6 py-3 text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
              style={{
                fontFamily: 'var(--font-mono)',
                color: activeTab === id ? '#FF5A1F' : 'rgba(255,255,255,0.35)',
                borderBottom: activeTab === id ? '2px solid #FF5A1F' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Event scout tab */}
        {activeTab === 'event' && (
          <div>
            <form onSubmit={handleScout} className="flex flex-wrap gap-3 mb-8">
              <select
                value={season}
                onChange={e => setSeason(e.target.value)}
                className="px-4 py-2.5 text-[12px] border"
                style={{ background: '#0a1628', borderColor: 'rgba(255,90,31,0.2)', color: '#fff', fontFamily: 'var(--font-mono)', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100)' }}
              >
                {['2025','2024','2023','2022','2021','2020','2019'].map(y => <option key={y} value={y}>{y}-{(parseInt(y)+1).toString().slice(2)}</option>)}
              </select>
              <input
                type="text"
                value={eventCode}
                onChange={e => setEventCode(e.target.value)}
                placeholder="EVENT CODE (e.g. TXDAL)"
                className="px-4 py-2.5 text-[12px] border flex-1 min-w-[180px]"
                style={{ background: '#0a1628', borderColor: 'rgba(255,90,31,0.2)', color: '#fff', fontFamily: 'var(--font-mono)', outline: 'none', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100)' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
                style={{ fontFamily: 'var(--font-mono)', background: '#FF5A1F', color: '#fff', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100)', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'LOADING…' : 'SCOUT'}
              </button>
              {allTeams.length > 0 && (
                <>
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={handleFilter}
                    placeholder="FILTER TEAMS…"
                    className="px-4 py-2.5 text-[12px] border"
                    style={{ background: '#0a1628', borderColor: 'rgba(255,90,31,0.2)', color: '#fff', fontFamily: 'var(--font-mono)', outline: 'none', minWidth: 140 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVisuals(v => !v)}
                    className="px-4 py-2.5 text-[11px] font-semibold tracking-widest uppercase border transition-all duration-200"
                    style={{ fontFamily: 'var(--font-mono)', background: showVisuals ? 'rgba(255,90,31,0.1)' : 'transparent', borderColor: 'rgba(255,90,31,0.3)', color: showVisuals ? '#FF5A1F' : 'rgba(255,255,255,0.4)' }}
                  >
                    {showVisuals ? 'HIDE BARS' : 'SHOW BARS'}
                  </button>
                </>
              )}
            </form>

            {errorMsg && (
              <div className="mb-4 px-4 py-3 text-[12px] border" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {errorMsg}
              </div>
            )}

            {eventInfo && (
              <div className="mb-4 px-4 py-3 text-[11px] flex gap-6 flex-wrap border" style={{ background: 'rgba(255,90,31,0.05)', borderColor: 'rgba(255,90,31,0.15)', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                <span><span style={{ color: '#FF5A1F' }}>EVENT</span> {eventInfo.name}</span>
                <span><span style={{ color: '#FF5A1F' }}>CODE</span> {eventInfo.eventCode}</span>
                <span><span style={{ color: '#FF5A1F' }}>TEAMS</span> {eventInfo.teamCount}</span>
                <span><span style={{ color: '#FF5A1F' }}>DATE</span> {eventInfo.start}</span>
              </div>
            )}

            {renderedTeams.length > 0 && (
              <div className="overflow-x-auto">
                <table className="scout-table w-full text-[11px]" style={{ fontFamily: 'var(--font-mono)', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,90,31,0.2)' }}>
                      {columns.map(col => (
                        <th
                          key={col.key}
                          onClick={() => !col.noSort && handleSort(col.key)}
                          title={col.tooltip}
                          className="px-3 py-3 text-left transition-colors duration-150"
                          style={{
                            cursor: col.noSort ? 'default' : 'pointer',
                            color: sortKey === col.key ? '#FF5A1F' : 'rgba(255,255,255,0.3)',
                            whiteSpace: 'nowrap',
                            userSelect: 'none',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            fontSize: '0.65rem',
                          }}
                        >
                          {col.label} {sortKey === col.key ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {renderedTeams.map((team, ri) => (
                      <tr
                        key={team.teamNumber}
                        onClick={() => openModal(team)}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: ri % 2 === 0 ? 'rgba(10,22,40,0.3)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,90,31,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? 'rgba(10,22,40,0.3)' : 'transparent'}
                      >
                        {columns.map(col => {
                          const val = col.getter(team);
                          if (col.key === 'record') return <td key={col.key} className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{team.totalWins}-{team.totalLosses}-{team.totalTies}</td>;
                          if (col.key === 'comments') return (
                            <td key={col.key} className="px-3 py-2.5">
                              <span
                                className="text-[10px] px-2 py-0.5 border"
                                style={{
                                  background: localStorage.getItem(`notes_${team.teamNumber}`) ? 'rgba(255,90,31,0.1)' : 'transparent',
                                  borderColor: 'rgba(255,90,31,0.2)',
                                  color: 'rgba(255,255,255,0.35)',
                                }}
                              >
                                {localStorage.getItem(`notes_${team.teamNumber}`) ? 'NOTES' : '+'}
                              </span>
                            </td>
                          );
                          const numVal = typeof val === 'number' ? val : null;
                          const display = col.isWinPct ? `${numVal?.toFixed(1)}%` : (numVal !== null ? numVal.toFixed(numVal % 1 === 0 ? 0 : 1) : val);
                          return (
                            <td key={col.key} className="px-3 py-2.5 whitespace-nowrap" style={{ color: col.key === 'team' ? '#FF5A1F' : col.key === 'name' ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                              {col.hasVisual && showVisuals && numVal !== null ? (
                                <div className="flex items-center gap-2">
                                  <span style={{ minWidth: 36, textAlign: 'right' }}>{display}</span>
                                  <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                                    <div style={{ width: `${Math.min((Math.abs(numVal) / maxVals[col.key]) * 100, 100)}%`, height: '100%', background: col.barColor === 'blue' ? '#3b82f6' : col.barColor === 'green' ? '#22c55e' : col.barColor === 'yellow' ? '#eab308' : '#ef4444', borderRadius: 2 }} />
                                  </div>
                                </div>
                              ) : display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Compare tab */}
        {activeTab === 'compare' && (
          <div>
            <form onSubmit={handleCompare} className="flex flex-wrap gap-3 mb-8">
              <select value={season} onChange={e => setSeason(e.target.value)} className="px-4 py-2.5 text-[12px] border" style={{ background: '#0a1628', borderColor: 'rgba(255,90,31,0.2)', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {['2025','2024','2023','2022','2021','2020','2019'].map(y => <option key={y} value={y}>{y}-{(parseInt(y)+1).toString().slice(2)}</option>)}
              </select>
              <input type="text" value={compareTeam1} onChange={e => setCompareTeam1(e.target.value)} placeholder="TEAM 1 #" className="px-4 py-2.5 text-[12px] border w-28" style={{ background: '#0a1628', borderColor: 'rgba(59,130,246,0.4)', color: '#fff', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              <input type="text" value={compareTeam2} onChange={e => setCompareTeam2(e.target.value)} placeholder="TEAM 2 #" className="px-4 py-2.5 text-[12px] border w-28" style={{ background: '#0a1628', borderColor: 'rgba(251,146,60,0.4)', color: '#fff', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              <button type="submit" disabled={compareLoading} className="px-6 py-2.5 text-[11px] font-semibold tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)', background: '#FF5A1F', color: '#fff', opacity: compareLoading ? 0.6 : 1 }}>
                {compareLoading ? 'LOADING…' : 'COMPARE'}
              </button>
            </form>

            {compareData.t1 && compareData.t2 && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {[compareData.t1, compareData.t2].map((team, idx) => (
                  <div key={idx} className="p-6 border" style={{ background: 'rgba(10,22,40,0.5)', borderColor: idx === 0 ? 'rgba(59,130,246,0.3)' : 'rgba(251,146,60,0.3)' }}>
                    <p className="text-[10px] mb-1" style={{ fontFamily: 'var(--font-mono)', color: idx === 0 ? '#60a5fa' : '#fb923c' }}>TEAM {idx + 1}</p>
                    <p className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>#{team.teamNumber}</p>
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{team.name || '—'}</p>
                    {[['Total NP', team.seasonOpr?.toFixed(1)], ['Auto OPR', team.autoOpr?.toFixed(1)], ['Teleop OPR', team.teleOpr?.toFixed(1)], ['Endgame OPR', team.egOpr?.toFixed(1)], ['Win Rate', `${team.winRate?.toFixed(1)}%`], ['Rank', team.seasonRank === 99999 ? '—' : team.seasonRank]].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{k}</span>
                        <span style={{ color: '#fff' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {compareData.t1 && compareData.t2 && (
              <div className="p-6 border" style={{ background: 'rgba(10,22,40,0.5)', borderColor: 'rgba(255,90,31,0.1)', height: 320 }}>
                <canvas ref={compareRadarRef} />
              </div>
            )}
          </div>
        )}

        {/* Team modal */}
        {modalTeam && (
          <div className="fixed inset-0 z-[400] flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }} onClick={e => { if (e.target === e.currentTarget) closeTeamModal(); }}>
            <div className="relative w-full max-w-2xl mt-8 mb-8 border" style={{ background: '#0a1628', borderColor: 'rgba(255,90,31,0.2)', clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'rgba(255,90,31,0.1)' }}>
                <div>
                  <p className="label-caps">TEAM PROFILE</p>
                  <h2 className="text-2xl font-black text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>#{modalTeam.teamNumber} · {modalTeam.name || 'Unknown'}</h2>
                  {modalTeam.location && <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>{modalTeam.location}</p>}
                </div>
                <button onClick={closeTeamModal} className="text-white hover:text-[#FF5A1F] transition-colors p-1 text-xl font-black">✕</button>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b" style={{ borderColor: 'rgba(255,90,31,0.1)' }}>
                {[['Total NP', modalTeam.seasonOpr?.toFixed(1)], ['Auto OPR', modalTeam.autoOpr?.toFixed(1)], ['Teleop OPR', modalTeam.teleOpr?.toFixed(1)], ['Endgame OPR', modalTeam.egOpr?.toFixed(1)], ['Win Rate', `${modalTeam.winRate?.toFixed(1)}%`], ['Global Rank', modalTeam.seasonRank === 99999 ? 'Unranked' : `#${modalTeam.seasonRank}`]].map(([k, v]) => (
                  <div key={k} className="p-3 border" style={{ background: 'rgba(6,16,32,0.5)', borderColor: 'rgba(255,90,31,0.1)' }}>
                    <p className="text-[9px] tracking-widest uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>{k}</p>
                    <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 grid md:grid-cols-3 gap-4 border-b" style={{ borderColor: 'rgba(255,90,31,0.1)' }}>
                <div style={{ height: 180 }}><canvas ref={oprRef} /></div>
                <div style={{ height: 180 }}><canvas ref={phaseRef} /></div>
                <div style={{ height: 180 }}><canvas ref={radarRef} /></div>
              </div>
              <div className="p-6">
                <p className="text-[9px] tracking-widest uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>SCOUTING NOTES</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add your notes here…"
                  className="w-full px-3 py-2 text-sm border resize-none"
                  style={{ background: '#020c18', borderColor: 'rgba(255,90,31,0.15)', color: '#fff', fontFamily: 'var(--font-mono)', outline: 'none' }}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>{saveStatus}</span>
                  <button onClick={saveNotes} className="px-4 py-2 text-[10px] font-semibold tracking-widest uppercase border transition-colors" style={{ fontFamily: 'var(--font-mono)', borderColor: '#FF5A1F', color: '#FF5A1F', background: 'transparent' }}>SAVE NOTES</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
function InitialLoad({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0=counting, 1=reveal, 2=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => { setPhase(2); onComplete(); }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{
        background: '#061020',
        opacity: phase === 1 ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: phase === 2 ? 'none' : 'all',
      }}
    >
      <div className="text-center">
        <p
          className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-4"
          style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.6)' }}
        >
          INITIALIZING SYSTEM
        </p>
        <div
          className="text-6xl font-black uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          WOLVERINE
        </div>
        <div
          className="text-xl font-black uppercase tracking-[0.2em] mt-1"
          style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
        >
          TEAM 33791
        </div>
        {/* Progress bar */}
        <div
          className="mt-8 h-px overflow-hidden mx-auto"
          style={{ width: 200, background: 'rgba(255,90,31,0.15)' }}
        >
          <div
            className="h-full"
            style={{
              background: '#FF5A1F',
              width: phase === 0 ? '100%' : '100%',
              transition: 'width 1.6s cubic-bezier(0.4,0,0.2,1)',
              animation: 'width-expand 1.6s cubic-bezier(0.4,0,0.2,1) forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  const [currentPage,  setCurrentPage]  = useState('home');
  const [displayPage,  setDisplayPage]  = useState('home');
  const [transitioning, setTransitioning] = useState(false);
  const [transPhase,   setTransPhase]   = useState('none'); // 'none'|'out'|'in'
  const [initialLoad,  setInitialLoad]  = useState(true);

  // Page transition
  useEffect(() => {
    if (currentPage === displayPage) return;
    if (currentPage === 'home' && initialLoad) return;
    setTransitioning(true);
    setTransPhase('out');
    const t1 = setTimeout(() => window.scrollTo(0, 0), 300);
    const t2 = setTimeout(() => { setDisplayPage(currentPage); setTransPhase('in'); }, 540);
    const t3 = setTimeout(() => { setTransitioning(false); setTransPhase('none'); }, 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [currentPage]);

  const navigate = (id) => setCurrentPage(id);

  const renderPage = () => {
    switch (displayPage) {
      case 'home':     return <HomePage     onNavigate={navigate} teamMembers={TEAM} />;
      case 'about':    return <AboutPage    onNavigate={navigate} />;
      case 'team':     return <TeamPage     teamMembers={TEAM} pastMembers={PAST_MEMBERS} />;
      case 'robots':   return <RobotsPage   robots={ROBOTS} />;
      case 'sponsors': return <SponsorsPage sponsors={SPONSORS} onNavigate={navigate} />;
      case 'contact':  return <ContactPage  />;
      case 'scouting': return <ScoutingPage />;
      default:         return <HomePage     onNavigate={navigate} teamMembers={TEAM} />;
    }
  };

  if (initialLoad) {
    return (
      <>
        <CustomCursor />
        <InitialLoad onComplete={() => setInitialLoad(false)} />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <Nav
        currentPage={currentPage}
        onNavigate={navigate}
        navigation={NAVIGATION}
      />
      <div
        style={{
          animation:
            transPhase === 'out' ? 'claw-out 0.54s cubic-bezier(0.4,0,0.6,1) forwards' :
            transPhase === 'in'  ? 'claw-in  0.54s cubic-bezier(0.4,0,0.2,1) forwards' :
            'none',
          willChange: transPhase !== 'none' ? 'clip-path, opacity' : 'auto',
          minHeight: '100vh',
        }}
      >
        {renderPage()}
      </div>
      {/* Hide footer on scouting page for wider layout */}
      {displayPage !== 'scouting' && (
        <Footer onNavigate={navigate} navigation={NAVIGATION} />
      )}
    </>
  );
};

export default App;
