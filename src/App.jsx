import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Users, Mail, MapPin, Github, Linkedin, Instagram, Zap, Search, BarChart2 } from 'lucide-react';
import * as THREE from 'three';
import './Scouting.css';

const FTCSCOUT_API = 'https://api.ftcscout.org/rest/v1';
const IGNITE_API = '/api/ignite';

function escHtml(str) { return str; }

const getColumns = (season) => [
  { key: 'team', label: 'Team #', getter: t => t.teamNumber, tooltip: 'Team number' },
  { key: 'name', label: 'Team Name', getter: t => t.name, tooltip: 'Team name' },
  { key: 'seasonRank', label: 'Rank', getter: t => t.seasonRank ?? 99999, tooltip: 'Global OPR ranking' },
  { key: 'seasonOpr', label: 'Total NP', getter: t => t.seasonOpr ?? 0, tooltip: 'Season average Non-Penalty score', hasVisual: true, barColor: 'blue' },
  { key: 'autoOpr', label: 'Auto', getter: t => t.autoOpr ?? 0, tooltip: 'Season Auto average', hasVisual: true, barColor: 'yellow' },
  { key: 'teleOpr', label: 'Teleop', getter: t => t.teleOpr ?? 0, tooltip: 'Season TeleOp average', hasVisual: true, barColor: 'blue' },
  { key: 'egOpr', label: 'Endgame', getter: t => t.egOpr ?? 0, tooltip: 'Season Endgame average', hasVisual: true, barColor: 'red' },
  { key: 'dpr', label: 'Def PR', getter: t => t.dpr ?? 0, tooltip: 'Defensive Power Rating', hasVisual: true, barColor: 'red' },
  { key: 'ccwm', label: 'CCWM', getter: t => t.ccwm ?? 0, tooltip: 'Contribution to Margin', hasVisual: true, barColor: 'green' },
  { key: 'winRate', label: 'Season Win%', getter: t => t.winRate ?? 0, tooltip: 'Season-wide win rate', hasVisual: true, barColor: 'green', isWinPct: true },
  { key: 'lastWinRate', label: 'Last Win%', getter: t => t.lastWinRate ?? 0, tooltip: 'Win rate at recent event', hasVisual: true, barColor: 'green', isWinPct: true },
  { key: 'record', label: 'W-L-T', getter: t => t.totalWins ?? 0, tooltip: 'Season record' },
  { key: 'maxScore', label: 'Max NP', getter: t => t.maxScoreNp ?? 0, tooltip: 'Best score', hasVisual: true, barColor: 'blue' },
  { key: 'avgScore', label: 'Avg NP', getter: t => t.avgScoreNp ?? 0, tooltip: 'Average score', hasVisual: true, barColor: 'blue' },
  { key: 'events', label: 'Events', getter: t => t.eventCount ?? 0, tooltip: 'Events played' },
  { key: 'lastRank', label: 'Last Rank', getter: t => t.lastRank ?? 999, tooltip: 'Ranking at recent event' },
  { key: 'lastEvent', label: 'Last Event', getter: t => t.lastEventCode ?? '', tooltip: 'Most recent event' },
  { key: 'comments', label: 'Comments', getter: t => t.teamNumber, tooltip: 'Local notes', noSort: true },
  { key: 'awards', label: 'Awards', getter: t => t.awardCount ?? 0, tooltip: 'Season awards' },
  { key: 'location', label: 'Location', getter: t => t.location ?? '', tooltip: 'Team location' }
];

function analyzePlaystyle(data, currentSeason) {
    const { autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, winRate } = data;
    const tags = [];
    let score = 0;
    const total = autoOpr + teleOpr + egOpr;

    if (total > 0) {
        if (autoOpr >= 30) { tags.push('Strong Auto'); score += 3; }
        else if (autoOpr >= 15) { tags.push('Solid Auto'); score += 2; }
        else if (autoOpr < 5) { tags.push('Weak Auto'); }
    }
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

    if (currentSeason === '2024') {
        const avgSpecimen = autoOpr * 0.4 + teleOpr * 0.3;
        if (avgSpecimen > 40) tags.push('Specimen Specialist');
        else if (teleOpr > 80) tags.push('High Basket Expert');
    }

    let tier = '';
    if (seasonOpr >= 150) tier = '★★★';
    else if (seasonOpr >= 100) tier = '★★';
    else if (seasonOpr >= 50) tier = '★';

    const text = (tier ? tier + ' ' : '') + (tags.length > 0 ? tags.slice(0, 3).join(' · ') : 'Balanced');
    return { text, score };
}

function buildTeam(teamNumber, igniteData, quickStats, awardsForTeam, season) {
    const ig = igniteData;
    const qs = quickStats;
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
    const totalWins = summary?.totalWins ?? 0;
    const totalLosses = summary?.totalLosses ?? 0;
    const totalTies = summary?.totalTies ?? 0;
    const totalMatches = summary?.matchesPlayed ?? 0;
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const maxScoreNp = summary?.maxScore ?? 0;
    const avgScoreNp = summary?.avgScore ?? 0;
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
            lastWins = latestStats.wins ?? 0;
            lastLosses = latestStats.losses ?? 0;
            lastTies = latestStats.ties ?? 0;
            lastEventCode = latestEvent.eventCode ?? '';
            const lastTotal = lastWins + lastLosses + lastTies;
            lastWinRate = lastTotal > 0 ? (lastWins / lastTotal) * 100 : 0;
        }
    }

    const seasonAwards = ig?.seasonAwards ?? [];
    const allAwards = [...(awardsForTeam || []), ...seasonAwards];
    const seen = new Set();
    const uniqueAwards = allAwards.filter(a => {
        const key = a.type || a.awardName || '';
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const playstyle = analyzePlaystyle({ autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, totalWins, totalLosses, winRate }, season);

    return {
        teamNumber, name, location, bestOpr,
        seasonOpr, seasonRank, autoOpr, teleOpr, egOpr, dpr, ccwm,
        totalWins, totalLosses, totalTies, totalMatches, winRate,
        maxScoreNp, avgScoreNp, eventCount,
        lastOpr, lastRank, lastWins, lastLosses, lastTies, lastEventCode, lastWinRate,
        awards: uniqueAwards, awardCount: uniqueAwards.length,
        playstyle: playstyle.text, playstyleScore: playstyle.score, eventHistory
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

function ScoutingPage({ isVisible }) {
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

    const oprRef = useRef(null);
    const phaseRef = useRef(null);
    const radarRef = useRef(null);
    const compareRadarRef = useRef(null);
    const chartInstances = useRef({});

    const handleScout = async (e) => {
        e.preventDefault();
        const code = eventCode.trim().toUpperCase();
        if (!code) { setErrorMsg('Enter an event code.'); return; }

        setErrorMsg('');
        setLoading(true);
        setEventInfo(null);
        setAllTeams([]);

        try {
            const [event, eventTeams, eventAwards] = await Promise.all([
                fetchEvent(season, code),
                fetchEventTeams(season, code),
                fetchEventAwards(season, code),
            ]);

            if (!eventTeams || eventTeams.length === 0) throw new Error('No teams found. The event may not have published its team list yet.');
            const teamNumbers = eventTeams.map(t => t.teamNumber);
            const awardsMap = {};
            if (eventAwards) eventAwards.forEach(a => {
                if (!awardsMap[a.teamNumber]) awardsMap[a.teamNumber] = [];
                awardsMap[a.teamNumber].push(a);
            });

            const [igniteResults, quickResults] = await Promise.all([
                batchFetch(teamNumbers, n => fetchIgniteTeam(n, season), 5),
                batchFetch(teamNumbers, n => fetchTeamQuickStats(n, season), 5),
            ]);

            const assembled = teamNumbers.map(num => buildTeam(num, igniteResults[num], quickResults[num], awardsMap[num] || [], season));
            assembled.sort((a, b) => b.seasonOpr - a.seasonOpr);

            setEventInfo({ ...event, teamCount: assembled.length });
            setAllTeams(assembled);
            setRenderedTeams(assembled);
            setSortKey('seasonOpr'); setSortAsc(false); setFilterQuery('');
        } catch (err) {
            setErrorMsg(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async (e) => {
        e.preventDefault();
        const t1 = compareTeam1.trim();
        const t2 = compareTeam2.trim();
        if (!t1 || !t2) { setErrorMsg('Enter both team numbers.'); return; }

        setErrorMsg('');
        setCompareLoading(true);
        setCompareData({ t1: null, t2: null });

        try {
            const nums = [parseInt(t1), parseInt(t2)];
            const [igniteResults, quickResults] = await Promise.all([
                batchFetch(nums, n => fetchIgniteTeam(n, season), 2),
                batchFetch(nums, n => fetchTeamQuickStats(n, season), 2),
            ]);

            const data1 = buildTeam(nums[0], igniteResults[nums[0]], quickResults[nums[0]], [], season);
            const data2 = buildTeam(nums[1], igniteResults[nums[1]], quickResults[nums[1]], [], season);

            setCompareData({ t1: data1, t2: data2 });
        } catch (err) {
            setErrorMsg('Error fetching comparison data.');
        } finally {
            setCompareLoading(false);
        }
    };

    const handleSort = (key) => {
        const isAsc = sortKey === key ? !sortAsc : (key === 'seasonRank' || key === 'lastRank');
        setSortKey(key); setSortAsc(isAsc);

        const col = getColumns(season).find(c => c.key === key);
        if (!col || col.noSort) return;

        const sorted = [...renderedTeams].sort((a, b) => {
            let va = col.getter(a), vb = col.getter(b);
            if (typeof va === 'string') return isAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            return isAsc ? va - vb : vb - va;
        });
        setRenderedTeams(sorted);
    };

    const handleFilter = (e) => {
        const query = e.target.value.toLowerCase();
        setFilterQuery(query);
        let filtered = allTeams.filter(t => String(t.teamNumber).includes(query) || (t.name || '').toLowerCase().includes(query));

        const col = getColumns(season).find(c => c.key === sortKey);
        if (col && !col.noSort) {
            filtered.sort((a, b) => {
                let va = col.getter(a), vb = col.getter(b);
                if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
                return sortAsc ? va - vb : vb - va;
            });
        }
        setRenderedTeams(filtered);
    };

    const openModal = (team) => {
        setModalTeam(team);
        setNotes(localStorage.getItem(`notes_${team.teamNumber}`) || '');
        setSaveStatus(localStorage.getItem(`notes_${team.teamNumber}`) ? 'Last saved locally' : 'No notes yet');
    };

    const closeTeamModal = () => {
        if (chartInstances.current.opr) chartInstances.current.opr.destroy();
        if (chartInstances.current.phase) chartInstances.current.phase.destroy();
        if (chartInstances.current.radar) chartInstances.current.radar.destroy();
        setModalTeam(null);
    };

    const saveNotes = () => {
        if (!modalTeam) return;
        localStorage.setItem(`notes_${modalTeam.teamNumber}`, notes.trim());
        setSaveStatus('Saved to local storage');
    };

    useEffect(() => {
        if (!modalTeam || !window.Chart) return;

        if (chartInstances.current.opr) chartInstances.current.opr.destroy();
        if (chartInstances.current.phase) chartInstances.current.phase.destroy();
        if (chartInstances.current.radar) chartInstances.current.radar.destroy();

        const labels = modalTeam.eventHistory ? modalTeam.eventHistory.map(e => e.eventCode) : [];
        const oprData = modalTeam.eventHistory ? modalTeam.eventHistory.map(e => e.opr) : [];

        chartInstances.current.opr = new window.Chart(oprRef.current, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Event OPR', data: oprData, borderColor: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.1)', borderWidth: 2, pointBackgroundColor: '#3b82f6', fill: true, tension: 0.3 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'OPR TREND OVER SEASON', color: '#8b8b9a' } }, scales: { y: { grid: { color: '#23232e' }, ticks: { color: '#8b8b9a' } }, x: { grid: { display: false }, ticks: { color: '#8b8b9a' } } } }
        });

        const aOpr = Math.max(0, modalTeam.autoOpr);
        const tOpr = Math.max(0, modalTeam.teleOpr);
        const eOpr = Math.max(0, modalTeam.egOpr);

        chartInstances.current.phase = new window.Chart(phaseRef.current, {
            type: 'doughnut',
            data: { labels: ['Auto', 'TeleOp', 'Endgame'], datasets: [{ data: [aOpr, tOpr, eOpr], backgroundColor: ['#eab308', '#3b82f6', '#ef4444'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#e8e8ed' } }, title: { display: true, text: 'SCORING PROFILE', color: '#8b8b9a' } } }
        });

        const avgStats = { auto: 0, tele: 0, eg: 0, dpr: 0, ccwm: 0 };
        if (allTeams.length > 0) {
            allTeams.forEach(t => { avgStats.auto += t.autoOpr||0; avgStats.tele += t.teleOpr||0; avgStats.eg += t.egOpr||0; avgStats.dpr += t.dpr||0; avgStats.ccwm += t.ccwm||0; });
            avgStats.auto /= allTeams.length; avgStats.tele /= allTeams.length; avgStats.eg /= allTeams.length; avgStats.dpr /= allTeams.length; avgStats.ccwm /= allTeams.length;
        }

        chartInstances.current.radar = new window.Chart(radarRef.current, {
            type: 'radar',
            data: {
                labels: ['Auto OPR', 'TeleOp OPR', 'Endg OPR', 'CCWM', 'Def PR'],
                datasets: [
                    { label: `Team ${modalTeam.teamNumber}`, data: [modalTeam.autoOpr||0, modalTeam.teleOpr||0, modalTeam.egOpr||0, modalTeam.ccwm||0, modalTeam.dpr||0], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.4)' },
                    { label: 'Event Average', data: [avgStats.auto, avgStats.tele, avgStats.eg, avgStats.ccwm, avgStats.dpr], borderColor: '#8b8b9a', backgroundColor: 'rgba(139, 139, 154, 0.2)', borderDash: [5, 5] }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e8e8ed' } }, title: { display: true, text: 'TEAM VS AVERAGE', color: '#8b8b9a' } }, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#8b8b9a' }, ticks: { display: false } } } }
        });
    }, [modalTeam]);

    useEffect(() => {
        if (!compareData.t1 || !compareData.t2 || !window.Chart) return;

        if (chartInstances.current.compareRadar) {
            chartInstances.current.compareRadar.destroy();
        }

        const metrics = [
            { label: 'Total NP', key: 'seasonOpr' },
            { label: 'Auto', key: 'autoOpr' },
            { label: 'Teleop', key: 'teleOpr' },
            { label: 'Endgame', key: 'egOpr' },
            { label: 'CCWM', key: 'ccwm' },
            { label: 'DPR', key: 'dpr' }
        ];

        const t1 = compareData.t1;
        const t2 = compareData.t2;

        chartInstances.current.compareRadar = new window.Chart(compareRadarRef.current, {
            type: 'radar',
            data: {
                labels: metrics.map(m => m.label),
                datasets: [
                    { label: `Team ${t1.teamNumber}`, data: metrics.map(m => t1[m.key]||0), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.3)', pointBackgroundColor: '#3b82f6' },
                    { label: `Team ${t2.teamNumber}`, data: metrics.map(m => t2[m.key]||0), borderColor: '#fb923c', backgroundColor: 'rgba(251, 146, 60, 0.3)', pointBackgroundColor: '#fb923c' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#e8e8ed', font: { weight: 'bold' } } } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#8b8b9a', font: { size: 10, weight: '700' } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }, [compareData]);

    const maxVals = {};
    const cols = getColumns(season);
    cols.forEach(c => {
        if (c.hasVisual) {
            let max = 0;
            allTeams.forEach(t => { const v = c.getter(t) || 0; if (v > max) max = v; });
            maxVals[c.key] = max;
        }
    });

    return (
        <div className="scouting-app-scoped">
            <div className="app-container" style={{paddingTop: '32px'}}>
                <header className="header">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="1" y="1" width="26" height="26" stroke="#3b82f6" strokeWidth="2" fill="none" /><rect x="7" y="7" width="14" height="14" fill="#3b82f6" /></svg>
                        </div>
                        <div><h1 className="logo-text">FTC AUTO SCOUT</h1><p className="logo-subtitle">SCOUTING DATABASE</p></div>
                    </div>
                </header>

                <section className="scout-tabs">
                    <button className={`tab-btn ${activeTab === 'event' ? 'active' : ''}`} onClick={() => setActiveTab('event')}>EVENT SCOUT</button>
                    <button className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>COMPARE TEAMS</button>
                </section>

                {activeTab === 'event' ? (
                    <section className="search-section">
                        <div className="search-card">
                            <h2 className="search-title">LOOK UP EVENT</h2>
                            <p className="search-desc">Enter an FTC event code to pull stats, awards, and team data.</p>
                            <form onSubmit={handleScout} className="search-form">
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <label className="input-label">SEASON</label>
                                        <select value={season} onChange={e=>setSeason(e.target.value)} className="input-field" disabled={loading}>
                                            <option value="2025">2025-26 DECODE</option>
                                            <option value="2024">2024-25 INTO THE DEEP</option>
                                            <option value="2023">2023-24 CENTERSTAGE</option>
                                        </select>
                                    </div>
                                    <div className="input-wrapper input-wrapper-grow">
                                        <label className="input-label">EVENT CODE</label>
                                        <input type="text" value={eventCode} onChange={e=>setEventCode(e.target.value.toUpperCase())} className="input-field" placeholder="e.g. USTXCCOS2" disabled={loading} />
                                    </div>
                                    <button type="submit" className="scout-btn" disabled={loading}>
                                        {!loading ? <span className="btn-text">SCOUT EVENT</span> : <span className="spinner"></span>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                ) : (
                    <section className="search-section">
                        <div className="search-card">
                            <h2 className="search-title">COMPARE TEAMS</h2>
                            <p className="search-desc">Enter two team numbers to see their 2025 stats side-by-side.</p>
                            <form onSubmit={handleCompare} className="search-form">
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <label className="input-label">TEAM #1</label>
                                        <input type="number" value={compareTeam1} onChange={e=>setCompareTeam1(e.target.value)} className="input-field" placeholder="e.g. 33791" disabled={compareLoading} />
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">TEAM #2</label>
                                        <input type="number" value={compareTeam2} onChange={e=>setCompareTeam2(e.target.value)} className="input-field" placeholder="e.g. 12820" disabled={compareLoading} />
                                    </div>
                                    <button type="submit" className="scout-btn" disabled={compareLoading}>
                                        {!compareLoading ? <span className="btn-text">COMPARE TEAMS</span> : <span className="spinner"></span>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                )}

                {errorMsg && (
                    <div className="error-display"><div className="error-card"><span className="error-icon">✕</span> <span>{errorMsg}</span></div></div>
                )}
                {(loading || compareLoading) && <div className="loading-bar"><div className="loading-bar-inner"></div></div>}

                {activeTab === 'event' && eventInfo && (
                    <section className="event-info">
                        <div className="event-card">
                            <div className="event-header">
                                <div className="event-details">
                                    <div className="event-label">EVENT</div>
                                    <h2 className="event-name">{eventInfo.name}</h2>
                                    <div className="event-meta">
                                        <span className="event-meta-item"><span className="meta-label">VENUE</span><span className="meta-value">{eventInfo.venue}</span></span>
                                        <span className="event-meta-item"><span className="meta-label">TEAMS</span><span className="meta-value">{eventInfo.teamCount}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'event' && allTeams.length > 0 && (
                    <section className="table-section">
                        <div className="section-header">
                            <h3 className="section-title">TEAM STATISTICS</h3>
                            <div className="table-controls">
                                <div className="visuals-toggle">
                                    <label className="switch">
                                        <input type="checkbox" checked={showVisuals} onChange={e=>setShowVisuals(e.target.checked)} />
                                        <span className="slider round"></span>
                                    </label>
                                    <span className="toggle-label">Show Visuals</span>
                                </div>
                                <div className="table-search">
                                    <input type="text" value={filterQuery} onChange={handleFilter} className="table-filter" placeholder="Filter teams..." />
                                </div>
                                <span className="team-count-label">{renderedTeams.length}/{allTeams.length}</span>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className={`scout-table ${showVisuals ? 'show-visuals' : ''}`}>
                                <thead>
                                    <tr>
                                        {cols.map(c => (
                                            <th key={c.key} onClick={() => handleSort(c.key)} className={sortKey===c.key?'sort-active':''}>
                                                {c.label}{!c.noSort && <span className="sort-arrow">{sortKey===c.key?(sortAsc?'▲':'▼'):'↕'}</span>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderedTeams.map(t => (
                                        <tr key={t.teamNumber} onClick={() => openModal(t)} className="cursor-pointer hover:bg-[#1e1e28]">
                                            {cols.map(c => {
                                                const val = c.getter(t);
                                                let pct = c.hasVisual ? (c.isWinPct ? val : Math.min(100, (Math.max(0, val)/(maxVals[c.key]||1))*100)) : 0;
                                                return (
                                                    <td key={c.key} className={c.hasVisual ? `bar-cell bar-${c.barColor}` : ''} style={c.hasVisual ? {'--val-pct': `${pct}%`} : {}}>
                                                        {c.key === 'team' ? <span className="cell-number" style={{fontWeight:'bold', color: '#60a5fa'}}>#{val}</span> :
                                                         c.key === 'name' ? <span className="cell-team-name">{val}</span> :
                                                         c.key === 'winRate' || c.key === 'lastWinRate' ? <span className={`winrate-tag ${val>=60?'wr-high':val>=40?'wr-mid':'wr-low'}`}>{val.toFixed(0)}%</span> :
                                                         c.key === 'record' ? <span className="cell-record">{t.totalWins}-{t.totalLosses}-{t.totalTies}</span> :
                                                         c.key === 'lastEvent' ? <span className="cell-location">{val}</span> :
                                                         c.key === 'comments' ? <span className="cell-comments text-gray-400 italic text-xs">{localStorage.getItem(`notes_${t.teamNumber}`) ? '"' + localStorage.getItem(`notes_${t.teamNumber}`).substring(0,20) + '..."' : 'No comments'}</span> :
                                                         c.key === 'awards' ? <div className="flex gap-1">{(t.awards||[]).slice(0,2).map((a,i)=><span key={i} className="award-badge text-xs bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded leading-none border border-yellow-500/50">{a.awardName?a.awardName.split(' ')[0]:'Awd'}</span>)}{t.awards?.length>2&&<span className="text-gray-500 text-xs">+{t.awards.length-2}</span>}</div> :
                                                         <span className={typeof val === 'number' ? `cell-number ${val>0?'val-positive':val<0?'val-negative':'val-neutral'}` : ''}>{typeof val === 'number' ? (Number.isInteger(val)?val:val.toFixed(1)) : val}</span>}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'compare' && compareData.t1 && compareData.t2 && (
                    <section className="compare-section">
                        <div className="compare-visual-section">
                            <div className="compare-chart-container">
                                <canvas ref={compareRadarRef}></canvas>
                            </div>
                        </div>
                        <div className="compare-grid">
                            {[compareData.t1, compareData.t2].map((t, idx) => {
                                const other = idx === 0 ? compareData.t2 : compareData.t1;
                                return (
                                    <div key={idx} className="compare-card" style={{borderColor: idx === 0 ? '#3b82f6' : '#fb923c'}}>
                                        <div className="compare-header">
                                            <span className="compare-number" style={{color: idx === 0 ? '#3b82f6' : '#fb923c'}}>#{t.teamNumber}</span>
                                            <h2 className="compare-name">{t.name || 'Unknown Team'}</h2>
                                            <p className="compare-loc">{t.location}</p>
                                        </div>
                                        <div className="compare-stats">
                                            <div className={`comp-stat ${t.seasonOpr > other.seasonOpr ? 'winner' : ''}`}><label>Total NP</label><span>{t.seasonOpr.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.autoOpr > other.autoOpr ? 'winner' : ''}`}><label>Auto</label><span>{t.autoOpr.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.teleOpr > other.teleOpr ? 'winner' : ''}`}><label>Teleop</label><span>{t.teleOpr.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.egOpr > other.egOpr ? 'winner' : ''}`}><label>Endgame</label><span>{t.egOpr.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.ccwm > other.ccwm ? 'winner' : ''}`}><label>CCWM</label><span>{t.ccwm.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.dpr < other.dpr ? 'winner' : ''}`}><label>Def PR</label><span>{t.dpr.toFixed(1)}</span></div>
                                            <div className={`comp-stat ${t.winRate > other.winRate ? 'winner' : ''}`}><label>Win Rate</label><span>{t.winRate.toFixed(0)}%</span></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {modalTeam && (
                <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) closeTeamModal(); }}>
                    <div className="modal-card max-h-[90vh] overflow-y-auto">
                        <button className="modal-close-btn" onClick={closeTeamModal}>✕</button>
                        <div className="modal-header">
                            <div className="modal-team-info">
                                <span className="modal-team-number">#{modalTeam.teamNumber}</span>
                                <h2 className="modal-team-name">{modalTeam.name || 'Unknown Team'}</h2>
                            </div>
                        </div>
                        <div className="modal-grid">
                            <div className="modal-section modal-section-wide">
                                <h3 className="modal-section-title">VISUAL ANALYTICS</h3>
                                <div className="charts-container h-[250px] flex gap-4">
                                    <div className="chart-wrapper flex-1 bg-[#1c1c24] p-2 rounded"><canvas ref={oprRef}></canvas></div>
                                    <div className="chart-wrapper flex-1 bg-[#1c1c24] p-2 rounded"><canvas ref={phaseRef}></canvas></div>
                                    <div className="chart-wrapper flex-1 bg-[#1c1c24] p-2 rounded"><canvas ref={radarRef}></canvas></div>
                                </div>
                            </div>
                            <div className="modal-section modal-section-wide modal-section-primary">
                                <h3 className="modal-section-title">SCOUTING NOTES</h3>
                                <div className="notes-container">
                                    <textarea className="notes-textarea w-full p-3 bg-gray-900 text-gray-200" rows="3" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observations..."></textarea>
                                    <div className="notes-footer flex justify-between mt-2">
                                        <span className="text-gray-500 text-sm">{saveStatus}</span>
                                        <button onClick={saveNotes} className="bg-blue-600 text-white px-4 py-1 text-sm font-bold tracking-wider">SAVE</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ClawMarkImage = ({ opacity = 0.15, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return; hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = '/claw.png';
  }, []);
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ opacity }}>
      {imageLoaded && !imageError
        ? <img src="/claw.png" alt="Wolverine Claw" className="w-full h-full object-contain" style={{ filter: 'brightness(1.3) contrast(1.2)' }} />
        : <div className="w-full h-full flex items-center justify-center"><div className="text-orange-500/30 text-6xl font-black">⚡</div></div>}
    </div>
  );
};

const AngleButton = ({ children, onClick, variant = 'primary', className = '' }) => {
  const base = "relative px-8 py-4 font-bold transition-all duration-300 overflow-hidden group";
  const variants = {
    primary:   "bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-orange-600/50 hover:scale-105",
    secondary: "bg-gradient-to-br from-blue-900 to-blue-950 text-white border-2 border-blue-500 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105",
    ghost:     "bg-transparent text-white border-2 border-orange-500 hover:bg-orange-500/10 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" style={{ boxShadow: 'inset 0 0 20px rgba(255, 90, 31, 0.4)' }} />
      <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">{children}</span>
    </button>
  );
};

const SponsorCard = ({ sponsor }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  const initials = sponsor.name.split(' ').map(w => w[0]).join('');
  useEffect(() => {
    if (hasChecked.current) return; hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = sponsor.image;
  }, [sponsor.image]);
  return (
    <div className="aspect-video bg-white flex items-center justify-center mb-6 overflow-hidden relative group transition-all duration-500 hover:scale-[1.03]" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
      {!imageLoaded
        ? <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center"><div className="text-white text-6xl font-black animate-pulse">{initials}</div></div>
        : imageError
          ? <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center"><div className="text-white text-6xl font-black">{initials}</div></div>
          : <img src={sponsor.image} alt={sponsor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{ boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.5)' }} />
    </div>
  );
};

const TeamMemberCard = ({ member, size = 'small', showRookie = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return; hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = member.image;
  }, [member.image]);
  const sizeClasses = size === 'small' ? 'w-28 h-28 text-3xl' : 'aspect-square text-6xl';
  return (
    <div className="relative">
      <div className={`${sizeClasses} bg-gradient-to-br from-[#132038] to-[#1a2847] mx-auto flex items-center justify-center text-white font-black overflow-hidden relative border-2 border-[#A2A9B1] group transition-all duration-500 hover:scale-[1.05] hover:border-orange-600`}
           style={{ clipPath: size === 'small' ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
        {!imageLoaded || imageError ? <span className="animate-pulse">{member.initials}</span> : <img src={member.image} alt={member.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#132038]/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{ boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.6)' }} />
        <div className="absolute top-0 right-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-full transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-full transition-all duration-500 delay-100" />
      </div>
      {showRookie && member.rookie && (
        <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-black px-3 py-1 shadow-lg z-10 animate-pulse border border-orange-400"
             style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)', boxShadow: '0 4px 15px rgba(255, 90, 31, 0.5)' }}>
          ROOKIE
        </div>
      )}
    </div>
  );
};

const RobotImage = ({ src, alt, fallbackText }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return; hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = src;
  }, [src]);
  return !imageLoaded || imageError
    ? <span className="text-white font-black text-8xl animate-pulse">{fallbackText}</span>
    : <img src={src} alt={alt} className="w-full h-full object-cover" />;
};

const LogoImage = () => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return; hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = '/data/logo.svg';
  }, []);
  return (
    <div className="w-12 h-12 flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
      {!imageLoaded || imageError
        ? <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white font-black text-xl">WR</div>
        : <img src="/data/logo.svg" alt="Wolverine Robotics Logo" className="w-full h-full object-contain" />}
    </div>
  );
};

const GridScan = ({ sensitivity = 0.55, lineThickness = 1, linesColor = '#FF5A1F', scanColor = '#FF5A1F', scanOpacity = 0.3, gridScale = 0.15, noiseIntensity = 0.008 }) => {
  const containerRef = useRef(null); const rendererRef = useRef(null); const rafRef = useRef(null);
  const lookTarget = useRef(new THREE.Vector2(0, 0)); const lookCurrent = useRef(new THREE.Vector2(0, 0)); const lookVel = useRef(new THREE.Vector2(0, 0));
  const vert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
  const frag = `precision highp float;uniform vec3 iResolution;uniform float iTime;uniform vec2 uSkew;uniform float uLineThickness;uniform vec3 uLinesColor;uniform vec3 uScanColor;uniform float uGridScale;uniform float uScanOpacity;uniform float uNoise;varying vec2 vUv;void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 p=(2.0*fragCoord-iResolution.xy)/iResolution.y;vec3 ro=vec3(0.0);vec3 rd=normalize(vec3(p,2.0));vec2 skew=clamp(uSkew,vec2(-0.7),vec2(0.7));rd.xy+=skew*rd.z;vec3 color=vec3(0.0);float minT=1e20;float fadeStrength=1.5;vec2 gridUV=vec2(0.0);for(int i=0;i<4;i++){float isY=float(i<2);float pos=mix(-0.2,0.2,float(i))*isY+mix(-0.5,0.5,float(i-2))*(1.0-isY);float num=pos-(isY*ro.y+(1.0-isY)*ro.x);float den=isY*rd.y+(1.0-isY)*rd.x;float t=num/den;vec3 h=ro+rd*t;bool use=t>0.0&&t<minT;gridUV=use?mix(h.zy,h.xz,isY)/uGridScale:gridUV;minT=use?t:minT;}vec3 hit=ro+rd*minT;float dist=length(hit-ro);float fx=fract(gridUV.x);float fy=fract(gridUV.y);float ax=min(fx,1.0-fx);float ay=min(fy,1.0-fy);float wx=fwidth(gridUV.x);float wy=fwidth(gridUV.y);float halfPx=max(0.0,uLineThickness)*0.5;float tx=halfPx*wx;float ty=halfPx*wy;float lineX=1.0-smoothstep(tx,tx+wx,ax);float lineY=1.0-smoothstep(ty,ty+wy,ay);float lineMask=max(lineX,lineY);float fade=exp(-dist*fadeStrength);float scanZ=mod(iTime*0.4,2.0);float dz=abs(hit.z-scanZ);float sigma=0.2;float scanPulse=exp(-0.5*(dz*dz)/(sigma*sigma));vec3 gridCol=uLinesColor*lineMask*fade;vec3 scanCol=uScanColor*scanPulse*uScanOpacity;color=gridCol+scanCol;float n=fract(sin(dot(gl_FragCoord.xy+vec2(iTime*123.4),vec2(12.9898,78.233)))*43758.5453123);color+=(n-0.5)*uNoise;color=clamp(color,0.0,1.0);float alpha=clamp(max(lineMask*fade,scanPulse*uScanOpacity),0.0,1.0)*0.6;fragColor=vec4(color,alpha);}void main(){vec4 c;mainImage(c,vUv*iResolution.xy);gl_FragColor=c;}`;
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onMove = e => { const r = el.getBoundingClientRect(); lookTarget.current.set(((e.clientX-r.left)/r.width)*2-1,-(((e.clientY-r.top)/r.height)*2-1)); };
    const onLeave = () => lookTarget.current.set(0, 0);
    el.addEventListener('mousemove', onMove); el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  useEffect(() => {
    const container = containerRef.current; if (!container) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2)); renderer.setSize(container.clientWidth, container.clientHeight); renderer.setClearColor(0x000000, 0); container.appendChild(renderer.domElement);
    const srgb = hex => new THREE.Color(hex).convertSRGBToLinear();
    const uniforms = { iResolution:{value:new THREE.Vector3(container.clientWidth,container.clientHeight,renderer.getPixelRatio())},iTime:{value:0},uSkew:{value:new THREE.Vector2(0,0)},uLineThickness:{value:lineThickness},uLinesColor:{value:srgb(linesColor)},uScanColor:{value:srgb(scanColor)},uGridScale:{value:gridScale},uScanOpacity:{value:scanOpacity},uNoise:{value:noiseIntensity} };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false });
    const scene = new THREE.Scene(); const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material); scene.add(quad);
    const onResize = () => { renderer.setSize(container.clientWidth,container.clientHeight); material.uniforms.iResolution.value.set(container.clientWidth,container.clientHeight,renderer.getPixelRatio()); };
    window.addEventListener('resize', onResize);
    const s=THREE.MathUtils.clamp(sensitivity,0,1); const skewScale=THREE.MathUtils.lerp(0.04,0.15,s); const smoothTime=THREE.MathUtils.lerp(0.5,0.15,s);
    let last = performance.now();
    const tick = () => {
      const now=performance.now(); const dt=Math.max(0,Math.min(0.1,(now-last)/1000)); last=now;
      const sdv2=(cur,tgt,vel,st,dt)=>{const out=cur.clone();st=Math.max(0.0001,st);const omega=2/st,x=omega*dt;const exp=1/(1+x+0.48*x*x+0.235*x*x*x);let change=cur.clone().sub(tgt);const newTarget=cur.clone().sub(change);const temp=vel.clone().addScaledVector(change,omega).multiplyScalar(dt);vel.sub(temp.clone().multiplyScalar(omega));vel.multiplyScalar(exp);out.copy(newTarget.clone().add(change.add(temp).multiplyScalar(exp)));return out;};
      lookCurrent.current.copy(sdv2(lookCurrent.current,lookTarget.current,lookVel.current,smoothTime,dt));
      material.uniforms.uSkew.value.set(lookCurrent.current.x*skewScale,-lookCurrent.current.y*1.2*skewScale);
      material.uniforms.iTime.value=now/1000; renderer.render(scene,camera); rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',onResize);material.dispose();quad.geometry.dispose();renderer.dispose();if(container.contains(renderer.domElement))container.removeChild(renderer.domElement);};
  }, [sensitivity,lineThickness,linesColor,scanColor,scanOpacity,gridScale,noiseIntensity]);
  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
};

const InitialLoadAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('grid');
  const [clawImageLoaded, setClawImageLoaded] = useState(false);
  const [clawImageError, setClawImageError] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => { setClawImageLoaded(true); setClawImageError(false); };
    img.onerror = () => { setClawImageError(true); setClawImageLoaded(true); };
    img.src = '/data/logo.svg';
  }, []);
  useEffect(() => {
    const list = ['/data/logo.svg','/claw.png','/data/robots/matchstick-main.jpg','/data/robots/matchstick-1.jpg','/data/robots/matchstick-2.jpg','/data/robots/matchstick-3.jpg','/data/robots/matchstick-4.jpg','/data/team/dev.jpg','/data/team/sahejdeep.jpg','/data/team/sripadh.jpg','/data/team/manveer.jpg','/data/sponsors/whs.png','/data/sponsors/nhs.png'];
    let n = 0; const done = () => { if (++n >= list.length) setImagesPreloaded(true); };
    list.forEach(src => { const i = new Image(); i.onload = done; i.onerror = done; i.src = src; });
  }, []);
  useEffect(() => {
    if (!imagesPreloaded) return;
    const t1=setTimeout(()=>setPhase('logo'),800); const t2=setTimeout(()=>setPhase('complete'),1600); const t3=setTimeout(()=>onComplete(),2200);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, [onComplete, imagesPreloaded]);
  return (
    <div className={`fixed inset-0 z-[200] bg-[#132038] flex items-center justify-center transition-opacity duration-500 ${phase==='complete'?'opacity-0':'opacity-100'}`}>
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className={`absolute h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-all duration-1000 ${phase==='grid'?'w-0 left-1/2 top-1/2':'w-[141%] -left-[20%] top-1/2'}`} style={{boxShadow:'0 0 30px rgba(255,90,31,1)',transform:'rotate(-45deg)',transformOrigin:'center'}} />
      </div>
      <div className={`relative z-20 transition-all duration-700 ${phase==='logo'||phase==='complete'?'opacity-100 scale-100':'opacity-0 scale-50'}`}>
        <div className="relative flex flex-col items-center">
          <div className="w-80 h-80 relative mb-8 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 bg-[#132038] z-0" />
            {clawImageLoaded&&!clawImageError
              ? <img src="/data/logo.svg" alt="Logo" className={`w-full h-full object-contain transition-all duration-1000 relative z-10 ${phase==='logo'||phase==='complete'?'opacity-100 scale-100':'opacity-0 scale-50'}`} style={{filter:'brightness(1.5) contrast(1.3) drop-shadow(0 0 50px rgba(255,90,31,1))'}} />
              : <div className={`text-orange-500 text-9xl font-black transition-all duration-700 relative z-10 ${phase==='logo'||phase==='complete'?'opacity-100 scale-100':'opacity-0 scale-50'}`}>⚡</div>}
            <div className="absolute inset-0 bg-orange-500/40 blur-3xl animate-pulse" />
          </div>
          <div className="text-center w-full">
            <h1 className="text-7xl font-black text-white mb-3 tracking-tight" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>WOLVERINE</h1>
            <p className="text-orange-500 font-black text-3xl tracking-widest">ROBOTICS</p>
            <p className="text-[#A2A9B1] font-mono text-lg mt-6 tracking-wider">TEAM 33791</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────

const App = () => {
  const [currentPage,       setCurrentPage]       = useState('home');
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [scrollY,           setScrollY]           = useState(0);
  const [isVisible,         setIsVisible]         = useState({});
  const [isInitialLoad,     setIsInitialLoad]     = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [displayPage,       setDisplayPage]       = useState('home');
  const [transitionPhase,   setTransitionPhase]   = useState('none');

  // Member modal state
  const [selectedMember,   setSelectedMember]   = useState(null);
  const [showPastMembers,  setShowPastMembers]  = useState(false);

  useEffect(() => {
    const el = document.querySelector("link[rel*='icon']");
    if (el) el.parentNode.removeChild(el);
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = '/data/logo.svg';
    document.head.appendChild(fav);
  }, []);

  useEffect(() => {
    window.history.pushState({}, '', currentPage === 'home' ? '/' : `/${currentPage}`);
  }, [currentPage]);

  useEffect(() => {
    const handle = () => {
      const path = window.location.pathname;
      const page = path === '/' ? 'home' : path.substring(1);
      if (['home','about','robots','sponsors','contact','scouting','team'].includes(page)) setCurrentPage(page);
    };
    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      @keyframes lockInPlace{from{opacity:0;transform:translateX(-40px)}50%{transform:translateX(5px)}to{opacity:1;transform:translateX(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes growIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
      @keyframes pulseglow{0%,100%{box-shadow:0 0 5px rgba(255,90,31,0.3)}50%{box-shadow:0 0 25px rgba(255,90,31,0.6)}}
      @keyframes expandFromCenter{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
      @keyframes clawSlashOut{0%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%);opacity:1}100%{clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%);opacity:0}}
      @keyframes clawSlashIn{0%{clip-path:polygon(0 0,0 0,0 100%,0 100%);opacity:0}100%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%);opacity:1}}
      @keyframes loadSlide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
      @keyframes slideInDiagonalReverse{from{opacity:0;transform:translate(60px,-60px)}to{opacity:1;transform:translate(0,0)}}
      .animate-fade-in-up{animation:fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0}
      .animate-fade-in{animation:fadeIn 0.6s ease-out forwards;opacity:0}
      .animate-grow-in{animation:growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;opacity:0}
      .animate-lock-in{animation:lockInPlace 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;opacity:0}
      .animate-pulse-glow{animation:pulseglow 2s ease-in-out infinite}
      .animate-expand-center{animation:expandFromCenter 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;opacity:0}
      .animate-slide-diagonal-reverse{animation:slideInDiagonalReverse 0.8s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0}
      .animate-claw-slash-out{animation:clawSlashOut 0.6s cubic-bezier(0.4,0,0.6,1) forwards;will-change:clip-path,opacity}
      .animate-claw-slash-in{animation:clawSlashIn 0.6s cubic-bezier(0.4,0,0.2,1) forwards;will-change:clip-path,opacity}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (currentPage === displayPage) return;
    if (currentPage === 'home' && isInitialLoad) return;
    setPageTransitioning(true); setTransitionPhase('out');
    const t1 = setTimeout(() => window.scrollTo(0, 0), 350);
    const t2 = setTimeout(() => { setDisplayPage(currentPage); setIsVisible({}); setTransitionPhase('in'); }, 600);
    const t3 = setTimeout(() => { setPageTransitioning(false); setTransitionPhase('none'); }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [currentPage, isInitialLoad]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting && e.target.id) setIsVisible(prev => ({ ...prev, [e.target.id]: true })); }),
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      document.querySelectorAll('[data-animate]').forEach(el => { if (el.id) observer.observe(el); });
      return () => observer.disconnect();
    }, isInitialLoad ? 200 : 150);
    return () => clearTimeout(timer);
  }, [displayPage, isInitialLoad]);

  const navigation = [
    { name: 'HOME',     id: 'home'     },
    { name: 'ABOUT',    id: 'about'    },
    { name: 'TEAM',     id: 'team'     },
    { name: 'ROBOTS',   id: 'robots'   },
    { name: 'SPONSORS', id: 'sponsors' },
    { name: 'CONTACT',  id: 'contact'  },
    { name: 'SCOUTING', id: 'scouting' },
  ];

  const teamMembers = {
    students: [
      { name: 'Dev Gavande',          role: 'Team Captain, Founder, Driver, CAD Lead, Hardware Lead', image: '/data/team/Dev.png',      initials: 'DG', rookie: false, season: '2025–26 Decode', bio: 'Founding member and team captain leading Wolverine Robotics.' },
      { name: 'Sahejdeep Singh',       role: 'Software Lead, Hardware, Drive Coach',                        image: '/data/team/sahejdeep.jpg', initials: 'SS', rookie: true,  season: '2025–26 Decode' },
      { name: 'Sripaadh J Kuppusamy', role: 'Hardware, Human Player',                                  image: '/data/team/sripadh.jpg',  initials: 'SK', rookie: true,  season: '2025–26 Decode' },
      { name: 'Manveer Singh Tib',     role: 'Hardware, Human Player',                                  image: '/data/team/manveer.jpg',  initials: 'MT', rookie: true,  season: '2025–26 Decode' },
      { name: 'Jivansh Pandya',        role: 'Hardware',                                                image: '/data/team/Jivansh.jpg',  initials: 'JP', rookie: true,  season: '2025–26 Decode' },
      { name: 'Jacob Esparza',         role: 'Hardware',                                                image: '/data/team/Jacob.jpeg',   initials: 'JE', rookie: true,  season: '2025–26 Decode' },
      { name: 'Kaiden Lee',            role: 'Hardware',                                                image: '/data/team/kaiden.jpg',   initials: 'KL', rookie: true,  season: '2025–26 Decode' },
      { name: 'Kalvik Das',            role: 'Hardware',                                                image: '/data/team/Kalvik.jpg',   initials: 'KD', rookie: true,  season: '2025–26 Decode' },
      { name: 'Alexander Fiderfish',   role: 'Hardware',                                                image: '/data/team/member9.jpg',  initials: 'AF', rookie: true,  season: '2025–26 Decode' },
      { name: 'Piousvir Singh',        role: 'Outreach',                                                image: '/data/team/pious.jpg',    initials: 'PS', rookie: true,  season: '2025–26 Decode' },
      { name: 'Pratham Erramilli',     role: 'Outreach',                                                image: '/data/team/pratham.jpg',  initials: 'PE', rookie: true,  season: '2025–26 Decode' },
      { name: 'Kavin Murugan',         role: 'Outreach',                                                image: '/data/team/kavin.jpg',    initials: 'KM', rookie: true,  season: '2025–26 Decode' },
    ],
  
    coaches: [
      { name: 'Mr. Ellis',   role: 'Coach', image: '/data/team/ellis.jpg', initials: 'E', rookie: false, season: '2025–26 Decode' },
    ],

    mentors: [
      { name: 'Abdullah Khaled', role: 'Youth Software Mentor', image: '/data/team/abdullah.jpg', initials: 'AK', rookie: false, season: '2025–26 Decode', bio: "Wolverine Robotics Youth Software Mentor" },
    ],
  };

  // Add past members here as the team grows across seasons.
  // Each entry supports: name, role, image, initials, rookie, season, pastRoles, bio
  const pastMembers = [];

  const handleLogoClick = () => { setCurrentPage('home'); window.scrollTo(0, 0); };

  // Close member modal when changing pages
  useEffect(() => {
    setSelectedMember(null);
    setShowPastMembers(false);
  }, [displayPage]);

  const renderPage = () => {
    if (displayPage === 'scouting') return <ScoutingPage isVisible={isVisible} />;

    // ── HOME ──────────────────────────────────────────────────────────────────
    if (displayPage === 'home') return (
      <div className="min-h-screen">
        <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#132038]">
          <GridScan />
          <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[600px] h-[600px]" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg,#FF5A1F 1px,transparent 1px),linear-gradient(-45deg,#FF5A1F 1px,transparent 1px)', backgroundSize: '60px 60px', transform: `translateY(${scrollY * 0.2}px)` }} />
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <div className="mb-8">
              <div id="hero-badge" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['hero-badge']?'animate-expand-center':'opacity-0 scale-[0.3]'}`}>
                <div className="flex items-center gap-3 px-6 py-3 bg-orange-600/20 border-2 border-orange-600 transition-all duration-300 hover:bg-orange-600/30 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/50" style={{clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)'}}>
                  <Zap className="text-orange-500" size={20} /><span className="text-orange-500 font-black text-sm tracking-wider">FTC TEAM 33791</span>
                </div>
              </div>
              <h1 id="hero-title-1" data-animate className={`text-7xl md:text-9xl font-black text-white mb-4 tracking-tight transition-all duration-700 ${isVisible['hero-title-1']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{animationDelay:'0.1s',fontFamily:'system-ui,-apple-system,sans-serif',letterSpacing:'0.02em'}}>WOLVERINE</h1>
              <h2 id="hero-title-2" data-animate className={`text-5xl md:text-8xl font-black text-orange-500 mb-8 transition-all duration-700 ${isVisible['hero-title-2']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{animationDelay:'0.25s',fontFamily:'system-ui,-apple-system,sans-serif'}}>ROBOTICS</h2>
            </div>
            <div id="hero-description" data-animate className={`max-w-2xl mx-auto mb-12 space-y-4 transition-all duration-700 ${isVisible['hero-description']?'animate-fade-in-up':'opacity-0 translate-y-[30px]'}`} style={{animationDelay:'0.4s'}}>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">First-year FTC team from Frisco, TX pushing the boundaries of what rookies can achieve.</p>
              <p className="text-base md:text-lg text-gray-400">Built with precision. Engineered for excellence. Driven by innovation.</p>
            </div>
            <div id="hero-buttons" data-animate className={`flex flex-wrap gap-6 justify-center transition-all duration-700 ${isVisible['hero-buttons']?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{animationDelay:'0.5s'}}>
              <AngleButton onClick={() => setCurrentPage('robots')} variant="primary">VIEW MATCHSTICK <ChevronRight size={20} /></AngleButton>
              <AngleButton onClick={() => setCurrentPage('about')}  variant="ghost">MEET THE TEAM</AngleButton>
            </div>
          </div>
        </div>
        <div className="py-32 bg-gradient-to-b from-[#132038] to-[#0a1628] relative overflow-hidden">
          <GridScan sensitivity={0.3} scanOpacity={0.2} />
          <ClawMarkImage opacity={0.08} className="top-1/3 left-1/4 w-[550px] h-[550px]" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div id="team-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['team-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}>
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600 hover:scale-105 transition-transform duration-300" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}><span className="text-orange-500 font-black text-sm tracking-widest">THE PACK</span></div>
              </div>
              <h2 id="team-title" data-animate className={`text-5xl md:text-7xl font-black text-white mb-4 transition-all duration-700 ${isVisible['team-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>MEET THE TEAM</h2>
              <p id="team-subtitle" data-animate className={`text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-700 ${isVisible['team-subtitle']?'animate-fade-in-up':'opacity-0 translate-y-[30px]'}`} style={{transitionDelay:'200ms'}}>12 students. 1 vision. Unlimited potential.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {teamMembers.students.slice(0, 4).map((member, idx) => (
                <div key={idx} id={`member-preview-${idx}`} data-animate className={`text-center transition-all duration-700 ${isVisible[`member-preview-${idx}`]?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:`${idx*75}ms`}}>
                  <TeamMemberCard member={member} size="small" showRookie={false} />
                  <h3 className="text-white font-bold text-base mt-4 mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                  <p className="text-orange-500 text-xs font-bold tracking-wider">{member.role.split(',')[0]}</p>
                </div>
              ))}
            </div>
            <div id="team-cta" data-animate className={`text-center transition-all duration-700 ${isVisible['team-cta']?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:'0.4s'}}>
              <AngleButton onClick={() => setCurrentPage('team')} variant="secondary">FULL ROSTER <ChevronRight size={20} /></AngleButton>
            </div>
          </div>
        </div>
      </div>
    );

    // ── ABOUT ─────────────────────────────────────────────────────────────────
    if (displayPage === 'about') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[800px] h-[800px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="about-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['about-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}>
              <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}>
                <span className="text-orange-500 font-black text-sm tracking-widest">TEAM 33791</span>
              </div>
            </div>
            <h1 id="about-title" data-animate className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['about-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>ABOUT US</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
              A first-year team built on precision engineering, relentless innovation, and the drive to prove that rookies can compete at the highest level.
            </p>
          </div>
          {/* Content placeholder — add sections here as needed */}
          <div id="about-content" data-animate className={`text-center transition-all duration-700 ${isVisible['about-content']?'animate-fade-in-up':'opacity-0 translate-y-[30px]'}`} style={{transitionDelay:'300ms'}}>
            <p className="text-gray-500 text-lg tracking-wider">More content coming soon.</p>
            <div className="mt-12">
              <AngleButton onClick={() => setCurrentPage('team')} variant="secondary">MEET THE TEAM <ChevronRight size={20} /></AngleButton>
            </div>
          </div>
        </div>
      </div>
    );

    // ── TEAM ──────────────────────────────────────────────────────────────────
    if (displayPage === 'team') return (
      <>
        {/* Member detail modal */}
        {selectedMember && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedMember(null); }}
          >
            <div
              className="relative bg-[#1a2847] border-2 border-orange-600 w-full max-w-md p-8 overflow-y-auto max-h-[90vh]"
              style={{ clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)' }}
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-6 text-gray-400 hover:text-white text-2xl font-black transition-colors duration-200"
              >✕</button>

              {/* Avatar + name */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden border-2 border-orange-600"
                     style={{ clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
                  <TeamMemberCard member={selectedMember} size="small" showRookie={false} />
                </div>
                <div>
                  <h2 className="text-white font-black text-2xl leading-tight" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
                    {selectedMember.name}
                  </h2>
                  <span
                    className="inline-block mt-2 text-xs font-black tracking-wider px-3 py-1"
                    style={{
                      background: selectedMember.isPast ? 'rgba(161,161,170,0.2)' : 'rgba(255,90,31,0.2)',
                      color: selectedMember.isPast ? '#a1a1aa' : '#FF5A1F',
                      clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)'
                    }}
                  >
                    {selectedMember.isPast ? 'PAST MEMBER' : 'CURRENT MEMBER'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-5 border-t-2 border-orange-600/30 pt-6">
                <div>
                  <p className="text-orange-500 text-xs font-black tracking-widest mb-2">
                    {selectedMember.isPast ? 'ROLES HELD' : 'CURRENT ROLES'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.role.split(',').map((r, i) => (
                      <span
                        key={i}
                        className="text-gray-200 text-sm bg-[#0f1629] border border-orange-600/40 px-3 py-1"
                        style={{ clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)' }}
                      >
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedMember.pastRoles && (
                  <div>
                    <p className="text-orange-500 text-xs font-black tracking-widest mb-2">PAST ROLES</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{selectedMember.pastRoles}</p>
                  </div>
                )}

                <div>
                  <p className="text-orange-500 text-xs font-black tracking-widest mb-2">SEASON</p>
                  <p className="text-gray-300 text-sm">{selectedMember.season || '2025–26 Decode'}</p>
                </div>

                {selectedMember.rookie && !selectedMember.isPast && (
                  <div
                    className="flex items-center gap-2 bg-orange-600/10 border border-orange-600/40 px-4 py-3"
                    style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}
                  >
                    <div className="w-2 h-2 bg-orange-600 rotate-45 flex-shrink-0" />
                    <p className="text-orange-400 text-sm font-bold">Rookie season — first year competing</p>
                  </div>
                )}

                {selectedMember.bio && (
                  <div>
                    <p className="text-orange-500 text-xs font-black tracking-widest mb-2">ABOUT</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
          <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[800px] h-[800px]" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">

            {/* Page header */}
            <div className="text-center mb-20">
              <div id="team-page-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['team-page-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}>
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">TEAM 33791</span>
                </div>
              </div>
              <h1 id="team-page-title" data-animate className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['team-page-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>THE PACK</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
                12 students. 1 vision. Unlimited potential. Click any member to learn more.
              </p>
            </div>

            {/* Member groups */}
            {[
              { id: 'students-section', label: 'STUDENTS',  sub: 'THE ENGINEERS', members: teamMembers.students, rookie: true,  delay: '300ms' },
              { id: 'mentors-section',  label: 'MENTORS',   sub: 'THE GUIDES',    members: teamMembers.mentors,  rookie: false, delay: '400ms' },
              { id: 'coaches-section',  label: 'COACHES',   sub: 'THE LEADERS',   members: teamMembers.coaches,  rookie: false, delay: '500ms' },
            ].filter(g => g.members.length > 0).map(group => (
              <div key={group.id} id={group.id} data-animate className={`mb-24 transition-all duration-700 ${isVisible[group.id]?'animate-fade-in':'opacity-0'}`} style={{transitionDelay:group.delay}}>
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-white" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>{group.label}</h2>
                    <div className="flex-1 h-1 bg-gradient-to-r from-orange-600 to-transparent" />
                  </div>
                  <p className="text-orange-500 font-bold tracking-wider text-sm">{group.sub}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {group.members.map((member, i) => (
                    <div
                      key={i}
                      className="text-center cursor-pointer group"
                      style={{animation:'growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', animationDelay:`${i*40}ms`, opacity:0}}
                      onClick={() => setSelectedMember(member)}
                    >
                      <TeamMemberCard member={member} size="large" showRookie={group.rookie} />
                      <div className="mt-4">
                        <h3 className="text-white font-bold text-base mb-1 group-hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                        <p className="text-orange-500 text-xs font-bold tracking-wider leading-relaxed">{member.role.split(',')[0]}</p>
                        <p className="text-gray-600 text-xs mt-1 group-hover:text-gray-400 transition-colors duration-300">click for details</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Past Members */}
            <div className="mt-8 border-t-2 border-orange-600/20 pt-16">
              <div className="text-center mb-10">
                <button
                  onClick={() => setShowPastMembers(prev => !prev)}
                  className="relative px-10 py-4 font-black text-white border-2 border-gray-600 hover:border-orange-600 transition-all duration-300 hover:scale-105 group"
                  style={{ clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)', background: 'transparent' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-3 tracking-wider text-sm">
                    <span>{showPastMembers ? '▲' : '▼'}</span>
                    PAST MEMBERS
                    {pastMembers.length > 0 && (
                      <span className="bg-orange-600/30 text-orange-400 text-xs px-2 py-0.5 border border-orange-600/50">
                        {pastMembers.length}
                      </span>
                    )}
                  </span>
                </button>
              </div>

              {showPastMembers && (
                <div className="animate-fade-in-up">
                  {pastMembers.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-600 text-sm tracking-wider">NO PAST MEMBERS YET — CHECK BACK NEXT SEASON</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-12">
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-4xl font-black text-gray-500" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>ALUMNI</h2>
                          <div className="flex-1 h-1 bg-gradient-to-r from-gray-600 to-transparent" />
                        </div>
                        <p className="text-gray-600 font-bold tracking-wider text-sm">FORMER MEMBERS</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {pastMembers.map((member, i) => (
                          <div
                            key={i}
                            className="text-center cursor-pointer group opacity-80 hover:opacity-100 transition-opacity duration-300"
                            style={{animation:'growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', animationDelay:`${i*40}ms`}}
                            onClick={() => setSelectedMember({ ...member, isPast: true })}
                          >
                            <TeamMemberCard member={member} size="large" showRookie={false} />
                            <div className="mt-4">
                              <h3 className="text-gray-400 font-bold text-base mb-1 group-hover:text-white transition-colors duration-300">{member.name}</h3>
                              <p className="text-gray-600 text-xs font-bold tracking-wider leading-relaxed">{member.role.split(',')[0]}</p>
                              <p className="text-gray-700 text-xs mt-1 group-hover:text-gray-500 transition-colors duration-300">click for details</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </>
    );

    // ── ROBOTS ────────────────────────────────────────────────────────────────
    if (displayPage === 'robots') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[900px] h-[900px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="robots-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['robots-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}><div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}><span className="text-orange-500 font-black text-sm tracking-widest">TECHNICAL SPECS</span></div></div>
            <h1 id="robots-title" data-animate className={`text-6xl md:text-8xl font-black text-white transition-all duration-700 ${isVisible['robots-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>MATCHSTICK</h1>
          </div>
          <div id="matchstick-detail" data-animate className={`relative transition-all duration-700 ${isVisible['matchstick-detail']?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:'200ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-blue-900/10 transform translate-x-6 translate-y-6" style={{clipPath:'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)'}} />
            <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-8 md:p-16 border-4 border-[#A2A9B1] overflow-hidden group hover:border-orange-600 transition-all duration-500 hover:scale-[1.02]" style={{clipPath:'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)'}}>
              <ClawMarkImage className="top-0 right-0 w-64 h-64" opacity={0.05} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{boxShadow:'inset 0 0 60px rgba(255,90,31,0.5)'}} />
              <div className="grid md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-8">
                  <div className="aspect-square bg-gradient-to-br from-orange-900 to-blue-900 flex items-center justify-center text-white font-black overflow-hidden relative hover:shadow-2xl hover:shadow-orange-600/60 transition-all duration-500 border-4 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.03]" style={{clipPath:'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)'}}>
                    <RobotImage src="/data/robots/matchstick-main.jpg" alt="Matchstick Robot" fallbackText="MS" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[1,2,3,4].map(i=>(
                      <div key={i} className="aspect-square bg-gradient-to-br from-blue-800 to-orange-800 flex items-center justify-center text-white text-5xl font-bold overflow-hidden hover:scale-[1.05] transition-all duration-300 border-2 border-[#A2A9B1] hover:border-orange-600 group relative" style={{clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)'}}>
                        <RobotImage src={`/data/robots/matchstick-${i}.jpg`} alt={`Matchstick detail ${i}`} fallbackText={String(i)} />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" style={{boxShadow:'inset 0 0 25px rgba(255,90,31,0.6)'}} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <h2 className="text-6xl font-black text-white mb-3" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>MATCHSTICK</h2>
                    <div className="flex items-center gap-3 mb-6"><div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-transparent" /><p className="text-orange-500 font-black tracking-widest text-sm">2025-26 DECODE</p></div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">Our first machine. Every component precision-engineered for maximum performance. Built to dominate the competition field from day one.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[['WEIGHT','28 LBS'],['HEIGHT','18 IN'],['DRIVETRAIN','MECANUM'],['LANGUAGE','JAVA 17']].map(([label,val],idx)=>(
                      <div key={idx} className="bg-gradient-to-br from-orange-600/20 to-blue-900/20 p-6 border-2 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.05] transition-all duration-300 group relative" style={{clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)'}}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" style={{boxShadow:'inset 0 0 25px rgba(255,90,31,0.5)'}} />
                        <p className="text-orange-500/70 font-bold text-xs mb-2 tracking-wider relative z-10">{label}</p>
                        <p className="text-white text-2xl font-black relative z-10">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 p-8 border-2 border-[#A2A9B1] hover:border-blue-500 transition-all duration-300 group relative hover:scale-[1.02]" style={{clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)'}}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow:'inset 0 0 30px rgba(66,153,225,0.4)'}} />
                    <div className="flex items-center gap-3 mb-6 relative z-10"><Award className="text-orange-500" size={28} /><h3 className="text-white font-black text-2xl">ACHIEVEMENTS</h3></div>
                    <ul className="space-y-3 relative z-10">{['2X CONTROL AWARD WINNER','SEMI-FINALIST AT U-LEAGUE TOURNAMENT','WINNER OF DALLAS SEMI-REGIONAL'].map((a,i)=><li key={i} className="flex items-center gap-3 text-gray-300"><div className="w-2 h-2 bg-orange-600 transform rotate-45" /><span className="font-semibold">{a}</span></li>)}</ul>
                  </div>
                  <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 p-8 border-2 border-[#A2A9B1] hover:border-orange-500 transition-all duration-300 group relative hover:scale-[1.02]" style={{clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)'}}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" style={{boxShadow:'inset 0 0 30px rgba(255,90,31,0.5)'}} />
                    <h3 className="text-white font-black text-2xl mb-6 relative z-10">KEY FEATURES</h3>
                    <ul className="space-y-3 relative z-10">{['12 & 9 BALL AUTONOMOUS','3 SECOND CYCLE TIME','VARIABLE SHOOTING SEQUENCE','MODULAR SUBSYSTEM DESIGN'].map((f,i)=><li key={i} className="flex items-center gap-3 text-gray-300"><div className="w-2 h-2 bg-orange-600 transform rotate-45" /><span className="font-semibold">{f}</span></li>)}</ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // ── SPONSORS ──────────────────────────────────────────────────────────────
    if (displayPage === 'sponsors') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[750px] h-[750px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="sponsors-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['sponsors-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}><div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}><span className="text-orange-500 font-black text-sm tracking-widest">SUPPORTERS</span></div></div>
            <h1 id="sponsors-title" data-animate className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['sponsors-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>OUR SPONSORS</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>Their support makes innovation possible. Together, we're building the future of robotics.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
            {[{name:'Wakeland High School',image:'/data/sponsors/whs.png'},{name:'Wakeland High School NHS',image:'/data/sponsors/nhs.png'}].map((sponsor,idx)=>(
              <div key={idx} id={`sponsor-${idx}`} data-animate className={`relative group transition-all duration-700 ${isVisible[`sponsor-${idx}`]?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:`${idx*150}ms`}}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-4 translate-y-4" style={{clipPath:'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)'}} />
                <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]" style={{clipPath:'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)'}}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{boxShadow:'inset 0 0 35px rgba(255,90,31,0.4)'}} />
                  <div className="relative z-10"><SponsorCard sponsor={sponsor} /><h3 className="text-white font-black text-2xl text-center group-hover:text-orange-500 transition-colors duration-300">{sponsor.name}</h3></div>
                </div>
              </div>
            ))}
          </div>
          <div id="become-sponsor" data-animate className={`relative max-w-4xl mx-auto transition-all duration-700 ${isVisible['become-sponsor']?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:'300ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-blue-900/30 transform translate-x-4 translate-y-4" style={{clipPath:'polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,0 100%)'}} />
            <div className="relative bg-gradient-to-br from-orange-900/40 to-blue-900/40 p-12 md:p-16 text-center border-4 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]" style={{clipPath:'polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,0 100%)'}}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{boxShadow:'inset 0 0 50px rgba(255,90,31,0.5)'}} />
              <div className="relative z-10">
                <h2 className="text-5xl font-black text-white mb-6" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>BECOME A SPONSOR</h2>
                <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">Join us in empowering the next generation of engineers and innovators. Your support directly impacts our ability to compete and excel.</p>
                <AngleButton onClick={()=>setCurrentPage('contact')} variant="primary" className="text-lg px-12 py-5">PARTNER WITH US <ChevronRight size={24} /></AngleButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // ── CONTACT ───────────────────────────────────────────────────────────────
    if (displayPage === 'contact') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[850px] h-[850px]" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="contact-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['contact-tag']?'animate-grow-in':'opacity-0 scale-[0.85]'}`}><div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}}><span className="text-orange-500 font-black text-sm tracking-widest">CONNECT</span></div></div>
            <h1 id="contact-title" data-animate className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['contact-title']?'animate-lock-in':'opacity-0 translate-x-[-40px]'}`} style={{fontFamily:'system-ui,-apple-system,sans-serif',transitionDelay:'100ms'}}>GET IN TOUCH</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay:'200ms'}}>Questions? Sponsorship opportunities? Let's talk.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div id="contact-info" data-animate className={`space-y-6 transition-all duration-700 ${isVisible['contact-info']?'animate-fade-in':'opacity-0'}`} style={{transitionDelay:'300ms'}}>
              {[{icon:Mail,title:'EMAIL',content:'ftc33791@gmail.com'},{icon:MapPin,title:'LOCATION',content:'Wakeland High School\nFrisco, Texas'},{icon:Users,title:'SOCIAL MEDIA',content:null}].map((item,idx)=>(
                <div key={idx} className="relative group" style={{animation:'growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',animationDelay:`${idx*100}ms`,opacity:0}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-2 translate-y-2" style={{clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)'}} />
                  <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]" style={{clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)'}}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{boxShadow:'inset 0 0 30px rgba(255,90,31,0.5)'}} />
                    <div className="relative z-10">
                      <item.icon className="text-orange-500 mb-4" size={32} />
                      <h3 className="text-white font-black text-lg mb-3 tracking-wider">{item.title}</h3>
                      {item.content ? <p className="text-gray-300 whitespace-pre-line">{item.content}</p> : (
                        <div className="flex gap-4">
                          {[[Github,'https://github.com/wolverine-robotics'],[Linkedin,'https://www.linkedin.com/company/wolverine-robotics/'],[Instagram,'https://www.instagram.com/wolverine_robotics/']].map(([Icon,href],i)=>(
                            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125 relative group" style={{clipPath:'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)'}}>
                              <Icon className="text-white relative z-10" size={20} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div id="contact-form" data-animate className={`relative transition-all duration-700 ${isVisible['contact-form']?'animate-grow-in':'opacity-0 scale-[0.85]'}`} style={{transitionDelay:'400ms'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-3 translate-y-3" style={{clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)'}} />
              <div className="relative bg-[#1a2847] p-8 border-2 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]" style={{clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)'}}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" style={{boxShadow:'inset 0 0 35px rgba(255,90,31,0.4)'}} />
                <form className="space-y-6 relative z-10">
                  {[['NAME','text','500ms'],['EMAIL','email','600ms']].map(([label,type,delay])=>(
                    <div key={label} className="animate-fade-in-up" style={{animationDelay:delay}}>
                      <label className="block text-white font-bold text-sm mb-2 tracking-wider">{label}</label>
                      <input type={type} className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}} />
                    </div>
                  ))}
                  <div className="animate-fade-in-up" style={{animationDelay:'700ms'}}>
                    <label className="block text-white font-bold text-sm mb-2 tracking-wider">MESSAGE</label>
                    <textarea rows="6" className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300 resize-none" style={{clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)'}} />
                  </div>
                  <div className="animate-fade-in-up" style={{animationDelay:'800ms'}}>
                    <AngleButton variant="primary" className="w-full text-lg py-4">SEND MESSAGE <ChevronRight size={20} /></AngleButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return null;
  };

  if (isInitialLoad) return <InitialLoadAnimation onComplete={() => setIsInitialLoad(false)} />;

  return (
    <div className="min-h-[100dvh] bg-[#0a1628] overflow-hidden relative">
      <div className={`min-h-[100dvh] ${transitionPhase==='out'?'animate-claw-slash-out':transitionPhase==='in'?'animate-claw-slash-in':''}`} style={{willChange:transitionPhase!=='none'?'clip-path,opacity':'auto'}}>
        <nav className="fixed top-0 w-full bg-[#0a1628]/98 backdrop-blur-md border-b-2 border-orange-600 z-50 shadow-lg shadow-orange-600/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
                <div className="transform group-hover:scale-110 transition-transform duration-300"><LogoImage /></div>
                <div>
                  <h1 className="text-white font-black text-lg tracking-wider group-hover:text-orange-500 transition-colors duration-300" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>WOLVERINE</h1>
                  <p className="text-orange-500 text-xs font-black tracking-widest">TEAM 33791</p>
                </div>
              </div>
              <div className="hidden md:flex gap-8">
                {navigation.map(item=>(
                  <button key={item.id} onClick={()=>setCurrentPage(item.id)} className={`text-sm font-black tracking-wider transition-all duration-300 relative group ${currentPage===item.id?'text-orange-500 scale-110':'text-white hover:text-orange-500 hover:scale-110'}`}>
                    {item.name}<div className={`absolute bottom-0 left-0 h-0.5 bg-orange-600 transition-all duration-300 ${currentPage===item.id?'w-full':'w-0 group-hover:w-full'}`} />
                  </button>
                ))}
              </div>
              <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white hover:text-orange-500 transition-colors duration-300 hover:scale-110">
                {mobileMenuOpen?<X size={28} />:<Menu size={28} />}
              </button>
            </div>
          </div>
          {mobileMenuOpen&&(
            <div className="md:hidden bg-[#0f1629] border-t-2 border-orange-600">
              <div className="flex flex-col">
                {navigation.map((item,idx)=>(
                  <button key={item.id} onClick={()=>{setCurrentPage(item.id);setMobileMenuOpen(false);}} className={`px-6 py-4 text-left font-black tracking-wider transition-all duration-300 border-b border-orange-600/20 ${currentPage===item.id?'text-orange-500 bg-orange-600/10':'text-white hover:bg-orange-600/5'}`} style={{animationDelay:`${idx*50}ms`}}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
        <div className="pt-20">{renderPage()}</div>
        <footer className="bg-[#0a1628] border-t-2 border-orange-600 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div><h3 className="text-white font-black text-xl mb-4">WOLVERINE ROBOTICS</h3><p className="text-gray-400">FTC Team 33791</p><p className="text-gray-400">Frisco, Texas</p></div>
              <div><h3 className="text-white font-black text-xl mb-4">QUICK LINKS</h3><div className="flex flex-col gap-2">{navigation.map(item=><button key={item.id} onClick={()=>setCurrentPage(item.id)} className="text-gray-400 hover:text-orange-500 text-left transition-colors duration-300 hover:translate-x-2">{item.name}</button>)}</div></div>
              <div><h3 className="text-white font-black text-xl mb-4">CONNECT</h3><div className="flex gap-4">{[[Github,'https://github.com/wolverine-robotics'],[Linkedin,'https://www.linkedin.com/company/wolverine-robotics/'],[Instagram,'https://www.instagram.com/wolverine_robotics/']].map(([Icon,href],i)=><a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125" style={{clipPath:'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)'}}><Icon className="text-white" size={20} /></a>)}</div></div>
            </div>
            <div className="border-t-2 border-gray-800 pt-8 text-center">
              <p className="text-gray-500 text-sm">© 2025 Wolverine Robotics. All rights reserved.</p>
              <p className="text-gray-600 text-xs mt-2">Website developed by Sahejdeep Singh: sahej.robotics@outlook.com. Made with Guidance of Dev Gavande and Abdullah Khaled</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
