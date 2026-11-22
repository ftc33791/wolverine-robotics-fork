/**
 * SCOUTING PAGE — match scouting, team data, public event stats, compare.
 * The public-data parts (Event Stats / Compare / team modal) are the original
 * code; match scouting and shared notes come from src/scouting/*.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, BarChart2, ClipboardList, Table } from 'lucide-react';

import '../Scouting.css';
import '../scouting/scouting-v2.css';
import {
  getColumns, buildTeam, fetchEvent, fetchEventTeams, fetchEventAwards,
  fetchTeamQuickStats, fetchIgniteTeam, batchFetch,
} from '../scouting/ftcData.js';
import { CURRENT_SEASON } from '../scouting/season.js';
import { useScoutStore, getSavedName } from '../scouting/store.js';
import ContextBar from '../scouting/ContextBar.jsx';
import MatchForm from '../scouting/MatchForm.jsx';
import TeamData from '../scouting/TeamData.jsx';
import TeamNotes from '../scouting/TeamNotes.jsx';

const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

export default function ScoutingPage() {
  const [season, setSeason] = useState(() => lsGet('scout:season') || CURRENT_SEASON);
  const [eventCode, setEventCode] = useState(() => lsGet('scout:event') || '');
  const [scouter, setScouter] = useState(getSavedName);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [eventInfo, setEventInfo] = useState(null);
  const [renderedTeams, setRenderedTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [sortKey, setSortKey] = useState('seasonOpr');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showVisuals, setShowVisuals] = useState(false);
  const [activeTab, setActiveTab] = useState('scout');
  const [compareTeam1, setCompareTeam1] = useState('');
  const [compareTeam2, setCompareTeam2] = useState('');
  const [compareData, setCompareData] = useState({ t1: null, t2: null });
  const [compareLoading, setCompareLoading] = useState(false);
  const [modalTeam, setModalTeam] = useState(null);
  const oprRef = useRef(null); const phaseRef = useRef(null);
  const radarRef = useRef(null); const compareRadarRef = useRef(null);
  const chartInstances = useRef({});

  // Shared scouting store (match entries + team notes), keyed by season + event.
  const eventId = /^[A-Z0-9_-]{2,24}$/.test(eventCode.trim().toUpperCase()) ? eventCode.trim().toUpperCase() : '';
  const store = useScoutStore(season, eventId);
  useEffect(() => { try { localStorage.setItem('scout:season', season); } catch {} }, [season]);
  useEffect(() => { try { localStorage.setItem('scout:event', eventCode); } catch {} }, [eventCode]);
  const noteCount = (teamNumber) =>
    store.notes.filter(n => n.team === teamNumber).length + store.matches.filter(m => m.team === teamNumber && m.data.notes).length;

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

  const openModal = (team) => setModalTeam(team);

  const closeTeamModal = () => {
    if (chartInstances.current.opr)   chartInstances.current.opr.destroy();
    if (chartInstances.current.phase) chartInstances.current.phase.destroy();
    if (chartInstances.current.radar) chartInstances.current.radar.destroy();
    setModalTeam(null);
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

        <ContextBar
          season={season} setSeason={setSeason} eventCode={eventCode} setEventCode={setEventCode}
          name={scouter} setName={setScouter} store={store} hasEvent={!!eventId}
        />

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-b" style={{ borderColor: 'rgba(255,90,31,0.1)' }}>
          {[['scout', <ClipboardList size={14}/>, 'MATCH SCOUT'], ['data', <Table size={14}/>, 'TEAM DATA'], ['event', <Search size={14}/>, 'EVENT STATS'], ['compare', <BarChart2 size={14}/>, 'COMPARE']].map(([id, icon, label]) => (
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

        {activeTab === 'scout' && <MatchForm store={store} event={eventId} scouter={scouter.trim()} />}
        {activeTab === 'data' && <TeamData store={store} author={scouter.trim()} />}

        {/* Event scout tab */}
        {activeTab === 'event' && (
          <div>
            <form onSubmit={handleScout} className="flex flex-wrap gap-3 mb-8">
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
                                  background: noteCount(team.teamNumber) ? 'rgba(255,90,31,0.1)' : 'transparent',
                                  borderColor: 'rgba(255,90,31,0.2)',
                                  color: 'rgba(255,255,255,0.35)',
                                }}
                              >
                                {noteCount(team.teamNumber) || '+'}
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
                <TeamNotes store={store} team={modalTeam.teamNumber} author={scouter.trim()} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
