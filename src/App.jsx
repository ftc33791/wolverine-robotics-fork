import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Award, Users, Mail, MapPin, Github, Linkedin, Instagram, Zap, Search, BarChart2 } from 'lucide-react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// SCOUTING — API, helpers, sub-components
// All at module level so React never recreates them between renders
// ─────────────────────────────────────────────────────────────────────────────

const FTCSCOUT_API = 'https://api.ftcscout.org/rest/v1';
const IGNITE_API   = '/api/ignite'; // Vercel serverless proxy → api/ignite.js

const SCOUT_SEASONS = [
  { value: '2025', label: '2025-26 DECODE' },
  { value: '2024', label: '2024-25 INTO THE DEEP' },
  { value: '2023', label: '2023-24 CENTERSTAGE' },
  { value: '2022', label: '2022-23 POWERPLAY' },
  { value: '2021', label: '2021-22 FREIGHT FRENZY' },
  { value: '2020', label: '2020-21 ULTIMATE GOAL' },
  { value: '2019', label: '2019-20 SKYSTONE' },
];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function batchFetch(items, fn, batchSize = 5) {
  const results = {};
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const infos = await Promise.all(batch.map(fn));
    batch.forEach((item, idx) => { results[item] = infos[idx]; });
  }
  return results;
}

function fmtDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Identical logic to the original app.js analyzePlaystyle
function analyzePlaystyle({ autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, winRate, season }) {
  const tags = [];
  let score = 0;
  const total = autoOpr + teleOpr + egOpr;
  if (total > 0) {
    if (autoOpr >= 30)      { tags.push('Strong Auto'); score += 3; }
    else if (autoOpr >= 15) { tags.push('Solid Auto');  score += 2; }
    else if (autoOpr < 5)   { tags.push('Weak Auto'); }
  }
  if (teleOpr >= 100)      { tags.push('TeleOp Powerhouse'); score += 4; }
  else if (teleOpr >= 60)  { tags.push('Strong TeleOp');     score += 3; }
  else if (teleOpr >= 30)  { tags.push('Avg TeleOp');        score += 1; }
  if (egOpr >= 15)         { tags.push('Climber'); score += 2; }
  else if (egOpr >= 5)     { tags.push('Parks');   score += 1; }
  if (dpr > 0 && seasonOpr > 0 && dpr > seasonOpr * 0.8) { tags.push('Defensive'); score += 1; }
  if (ccwm >= 50)          { tags.push('Carry Potential');       score += 3; }
  else if (ccwm >= 20)     { tags.push('Net Positive');          score += 2; }
  else if (ccwm < 0)       { tags.push('Needs Strong Partner'); }
  if (winRate >= 80)       { tags.push('Elite');      score += 3; }
  else if (winRate >= 65)  { tags.push('Consistent'); score += 2; }
  if (season === '2024') {
    if (autoOpr * 0.4 + teleOpr * 0.3 > 40) tags.push('Specimen Specialist');
    else if (teleOpr > 80)                   tags.push('High Basket Expert');
  }
  let tier = '';
  if (seasonOpr >= 150) tier = '★★★ ';
  else if (seasonOpr >= 100) tier = '★★ ';
  else if (seasonOpr >= 50)  tier = '★ ';
  return { text: tier + (tags.length > 0 ? tags.slice(0, 3).join(' · ') : 'Balanced'), score };
}

// Identical logic to the original app.js buildTeam — uses both Ignite + FTCScout
function buildTeam(teamNumber, igniteData, quickStats, awardsForTeam, season) {
  const ig      = igniteData;
  const summary = ig?.seasonSummary;

  // Names + location come from Ignite
  const name     = ig?.name ?? '';
  const location = [ig?.city, ig?.state, ig?.country].filter(Boolean).join(', ');

  // Season-wide stats: prefer Ignite summary, fall back to FTCScout quick-stats
  const seasonOpr = summary?.opr       ?? quickStats?.tot?.value ?? 0;
  const autoOpr   = summary?.autoOpr   ?? 0;
  const teleOpr   = summary?.teleopOpr ?? 0;
  const egOpr     = summary?.endgameOpr ?? 0;
  const dpr       = summary?.dpr  ?? 0;
  const ccwm      = summary?.ccwm ?? 0;

  // Global rank from FTCScout
  const seasonRank = quickStats?.tot?.rank ?? 99999;

  // Season record from Ignite
  const totalWins    = summary?.totalWins    ?? 0;
  const totalLosses  = summary?.totalLosses  ?? 0;
  const totalTies    = summary?.totalTies    ?? 0;
  const totalMatches = summary?.matchesPlayed ?? 0;
  const winRate      = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

  // Season scores from Ignite
  const maxScoreNp = summary?.maxScore    ?? 0;
  const avgScoreNp = summary?.avgScore    ?? 0;
  const eventCount = summary?.eventsPlayed ?? 0;

  // Event history + best OPR + last event stats — all from Ignite
  let lastOpr = 0, lastRank = 999, lastWins = 0, lastLosses = 0, lastTies = 0;
  let lastEventCode = '', lastWinRate = 0, bestOpr = 0;
  let eventHistory = [];

  if (ig?.events && ig?.eventStats) {
    const validEvents = [...ig.events].filter(
      e => ig.eventStats[e.eventId] && ig.eventStats[e.eventId].wins !== null
    );
    validEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    validEvents.forEach(e => {
      const stats    = ig.eventStats[e.eventId];
      const eventOpr = stats.opr ?? stats.npOpr ?? 0;
      if (eventOpr > bestOpr) bestOpr = eventOpr;
      eventHistory.push({ eventName: e.name, eventCode: e.eventCode, date: e.startDate, opr: eventOpr });
    });
    if (eventHistory.length > 0) {
      const latest      = validEvents[validEvents.length - 1];
      const latestStats = ig.eventStats[latest.eventId];
      lastOpr       = eventHistory[eventHistory.length - 1].opr;
      lastRank      = latestStats.rank   ?? 999;
      lastWins      = latestStats.wins   ?? 0;
      lastLosses    = latestStats.losses ?? 0;
      lastTies      = latestStats.ties   ?? 0;
      lastEventCode = latest.eventCode   ?? '';
      const lastTotal = lastWins + lastLosses + lastTies;
      lastWinRate   = lastTotal > 0 ? (lastWins / lastTotal) * 100 : 0;
    }
  }

  // Combine event awards + season awards from Ignite, deduplicate
  const seasonAwards = ig?.seasonAwards ?? [];
  const allAwards    = [...(awardsForTeam || []), ...seasonAwards];
  const seen         = new Set();
  const awards       = allAwards.filter(a => {
    const key = a.type || a.awardName || '';
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  const playstyle = analyzePlaystyle({ autoOpr, teleOpr, egOpr, dpr, ccwm, seasonOpr, totalWins, totalLosses, winRate, season });

  return {
    teamNumber, name, location, bestOpr,
    seasonOpr, seasonRank, autoOpr, teleOpr, egOpr, dpr, ccwm,
    totalWins, totalLosses, totalTies, totalMatches, winRate,
    maxScoreNp, avgScoreNp, eventCount,
    lastOpr, lastRank, lastWins, lastLosses, lastTies, lastEventCode, lastWinRate,
    awards, awardCount: awards.length,
    playstyle: playstyle.text, playstyleScore: playstyle.score,
    eventHistory,
  };
}

// Full column set matching the original app.js
const SCOUT_COLUMNS = [
  { key: 'team',        label: 'Team #',      getter: t => t.teamNumber,       noSort: false, defaultAsc: true  },
  { key: 'name',        label: 'Team Name',   getter: t => t.name ?? '',       noSort: false, isString: true    },
  { key: 'seasonRank',  label: 'Rank',        getter: t => t.seasonRank ?? 99999, noSort: false, defaultAsc: true },
  { key: 'bestOpr',     label: 'Best OPR',    getter: t => t.bestOpr   ?? 0,   hasBar: true,  barColor: 'blue'  },
  { key: 'autoOpr',     label: 'Auto OPR',    getter: t => t.autoOpr   ?? 0,   hasBar: true,  barColor: 'yellow'},
  { key: 'teleOpr',     label: 'TeleOp OPR',  getter: t => t.teleOpr   ?? 0,   hasBar: true,  barColor: 'blue'  },
  { key: 'egOpr',       label: 'Endg OPR',    getter: t => t.egOpr     ?? 0,   hasBar: true,  barColor: 'red'   },
  { key: 'dpr',         label: 'Def PR',      getter: t => t.dpr       ?? 0,   hasBar: true,  barColor: 'red'   },
  { key: 'ccwm',        label: 'CCWM',        getter: t => t.ccwm      ?? 0,   hasBar: true,  barColor: 'green' },
  { key: 'winRate',     label: 'Season Win%', getter: t => t.winRate   ?? 0,   hasBar: true,  barColor: 'green' },
  { key: 'lastWinRate', label: 'Last Win%',   getter: t => t.lastWinRate ?? 0, hasBar: true,  barColor: 'green' },
  { key: 'record',      label: 'W-L-T',       getter: t => t.totalWins ?? 0,   noSort: true                     },
  { key: 'maxScore',    label: 'Max NP',      getter: t => t.maxScoreNp ?? 0,  hasBar: true,  barColor: 'blue'  },
  { key: 'avgScore',    label: 'Avg NP',      getter: t => t.avgScoreNp ?? 0,  hasBar: true,  barColor: 'blue'  },
  { key: 'events',      label: 'Events',      getter: t => t.eventCount ?? 0                                    },
  { key: 'lastRank',    label: 'Last Rank',   getter: t => t.lastRank  ?? 999, defaultAsc: true                 },
  { key: 'lastEvent',   label: 'Last Event',  getter: t => t.lastEventCode ?? '', isString: true                },
  { key: 'comments',    label: 'Comments',    getter: t => t.teamNumber,       noSort: true                     },
  { key: 'awards',      label: 'Awards',      getter: t => t.awardCount ?? 0                                    },
  { key: 'location',    label: 'Location',    getter: t => t.location  ?? '',  isString: true                   },
];

// ── Scout sub-components ──────────────────────────────────────

function WinRateBadge({ pct }) {
  const n = Number(pct);
  let color = 'text-red-400 bg-red-500/10 border-red-500/20';
  if (n >= 60)      color = 'text-green-400 bg-green-500/10 border-green-500/20';
  else if (n >= 40) color = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  return <span className={`inline-block px-2 py-0.5 text-xs font-bold font-mono border ${color}`}>{n.toFixed(0)}%</span>;
}

function AwardBadge({ name }) {
  const lower = (name || '').toLowerCase();
  let color = 'text-[#A2A9B1] border-[#A2A9B1]/20 bg-[#A2A9B1]/5';
  if (lower.includes('winning') || lower.includes('winner')) color = 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
  else if (lower.includes('finalist'))  color = 'text-[#A2A9B1] border-[#A2A9B1]/30 bg-[#A2A9B1]/10';
  else if (lower.includes('inspire'))   color = 'text-blue-400 border-blue-400/30 bg-blue-400/10';
  else if (lower.includes('control'))   color = 'text-orange-400 border-orange-400/30 bg-orange-400/10';
  else if (lower.includes('connect'))   color = 'text-green-400 border-green-400/30 bg-green-400/10';
  else if (lower.includes('innovate'))  color = 'text-purple-400 border-purple-400/30 bg-purple-400/10';
  const display = name
    .replace('Winning Alliance - Captain',          'WAC')
    .replace('Winning Alliance - 1st Team Selected','WA-1st')
    .replace('Winning Alliance - 2nd Team Selected','WA-2nd')
    .replace('Finalist Alliance - Captain',         'FAC')
    .replace('Finalist Alliance',                   'Finalist')
    .replace(' Award', '');
  return <span className={`inline-block px-1.5 py-0.5 text-[0.65rem] font-bold border mr-1 ${color}`}>{display}</span>;
}

function ScoutRankBadge({ rank }) {
  const r = Number(rank);
  if (r >= 99999) return <span className="text-[#A2A9B1]/40 font-mono text-sm">—</span>;
  if (r === 1) return <span className="px-2 py-0.5 text-xs font-bold font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/30">1</span>;
  if (r === 2) return <span className="px-2 py-0.5 text-xs font-bold font-mono text-[#A2A9B1] bg-[#A2A9B1]/10 border border-[#A2A9B1]/25">2</span>;
  if (r === 3) return <span className="px-2 py-0.5 text-xs font-bold font-mono text-orange-400 bg-orange-400/10 border border-orange-400/25">3</span>;
  return <span className="text-[#A2A9B1] font-mono text-sm">#{r}</span>;
}

function LastRankBadge({ rank }) {
  const r = Number(rank);
  if (r >= 999) return <span className="text-[#A2A9B1]/40 font-mono text-sm">—</span>;
  if (r <= 3)   return <ScoutRankBadge rank={r} />;
  return <span className="text-[#A2A9B1] font-mono text-sm">{r}</span>;
}

function PhaseBar({ auto, tele, eg }) {
  const total = (auto + tele + eg) || 1;
  return (
    <div className="flex h-1.5 w-full gap-px">
      <div className="bg-yellow-400/70" style={{ width: `${(auto / total) * 100}%` }} />
      <div className="bg-blue-400/70"   style={{ width: `${(tele / total) * 100}%` }} />
      <div className="bg-red-400/70"    style={{ width: `${(eg   / total) * 100}%` }} />
    </div>
  );
}

// ── Team Detail Modal ─────────────────────────────────────────

function TeamModal({ team, season, allTeams, onClose }) {
  const [notes, setNotes]     = useState(() => localStorage.getItem(`notes_${team.teamNumber}`) || '');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  function saveNotes() {
    localStorage.setItem(`notes_${team.teamNumber}`, notes);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  const avgAuto = allTeams.reduce((s, t) => s + (t.autoOpr || 0), 0) / (allTeams.length || 1);
  const avgTele = allTeams.reduce((s, t) => s + (t.teleOpr || 0), 0) / (allTeams.length || 1);
  const avgEg   = allTeams.reduce((s, t) => s + (t.egOpr   || 0), 0) / (allTeams.length || 1);
  const oprData = team.eventHistory?.map(e => e.opr) || [];

  const clipSm = { clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' };
  const clipMd = { clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' };
  const clipLg = { clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' };

  const StatBox = ({ label, value, sub }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase">{label}</span>
      <span className={`font-mono font-bold ${sub ? 'text-xl text-[#A2A9B1]' : 'text-2xl text-white'}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-gradient-to-br from-[#132038] to-[#0a1628] border-2 border-[#A2A9B1] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
           style={clipLg}>
        <div className="absolute top-0 right-0 w-5 h-5 bg-orange-600"
             style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
        <div className="p-8">
          <button onClick={onClose}
                  className="absolute top-3 right-3 text-[#A2A9B1]/60 hover:text-orange-500 transition-colors p-2 z-10">
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6 pb-5 border-b border-[#A2A9B1]/20">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="text-orange-500 font-black font-mono text-2xl">#{team.teamNumber}</span>
              <h2 className="text-white font-black text-xl" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
                {team.name || 'Unknown Team'}
              </h2>
            </div>
            {team.location && <p className="text-[#A2A9B1]/60 text-sm">{team.location}</p>}
          </div>

          {/* Season performance */}
          <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-3">Season Performance</p>
          <div className="grid grid-cols-3 gap-4 mb-4 p-5 bg-[#1a2847]/50 border border-[#A2A9B1]/15" style={clipMd}>
            <StatBox label="OPR"      value={team.seasonOpr.toFixed(1)} />
            <StatBox label="Rank"     value={team.seasonRank >= 99999 ? '—' : `#${team.seasonRank}`} />
            <StatBox label="Win Rate" value={`${team.winRate.toFixed(0)}%`} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[['Auto OPR','border-yellow-400/20',team.autoOpr],['TeleOp OPR','border-blue-400/20',team.teleOpr],['Endgame OPR','border-red-400/20',team.egOpr]].map(([lbl,border,val]) => (
              <div key={lbl} className={`p-4 bg-[#1a2847]/40 border ${border}`} style={clipSm}>
                <StatBox label={lbl} value={val.toFixed(1)} sub />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[['Def PR','border-red-400/10',team.dpr],['CCWM','border-green-400/10',team.ccwm],['Events','border-[#A2A9B1]/15',team.eventCount]].map(([lbl,border,val]) => (
              <div key={lbl} className={`p-4 bg-[#1a2847]/30 border ${border}`} style={clipSm}>
                <StatBox label={lbl} value={typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(1) : val} sub />
              </div>
            ))}
          </div>

          {/* Scoring breakdown bar */}
          <div className="mb-6">
            <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-2">Scoring Breakdown</p>
            <PhaseBar auto={team.autoOpr} tele={team.teleOpr} eg={team.egOpr} />
            <div className="flex gap-4 mt-2">
              {[['bg-yellow-400/70','text-yellow-400/70','Auto'],['bg-blue-400/70','text-blue-400/70','TeleOp'],['bg-red-400/70','text-red-400/70','Endgame']].map(([bg,tc,lbl]) => (
                <span key={lbl} className={`text-[0.65rem] ${tc} flex items-center gap-1`}>
                  <span className={`w-2 h-2 inline-block ${bg}`} />{lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Latest event */}
          {team.lastEventCode && (
            <div className="mb-6 p-5 bg-[#1a2847]/30 border border-[#A2A9B1]/15" style={clipMd}>
              <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-3">
                Latest Event: <span className="text-orange-500">{team.lastEventCode}</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                <StatBox label="Event OPR" value={team.lastOpr > 0 ? team.lastOpr.toFixed(1) : '—'} sub />
                <StatBox label="Rank"      value={team.lastRank >= 999 ? '—' : `#${team.lastRank}`} sub />
                <StatBox label="Record"    value={`${team.lastWins}-${team.lastLosses}-${team.lastTies}`} sub />
              </div>
            </div>
          )}

          {/* OPR trend sparkline */}
          {oprData.length >= 2 && (
            <div className="mb-6">
              <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-3">OPR Trend</p>
              <div className="flex items-end gap-6 flex-wrap">
                <ScoutSparkline data={oprData} />
                <div className="flex gap-4 flex-wrap">
                  {team.eventHistory.map((e, i) => (
                    <span key={i} className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-xs text-orange-500/80">{e.opr.toFixed(1)}</span>
                      <span className="text-[0.6rem] text-[#A2A9B1]/50">{e.eventCode}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* vs Event average */}
          {allTeams.length > 1 && (
            <div className="mb-6">
              <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-3">vs Event Average</p>
              <div className="space-y-2">
                {[
                  { label: 'Auto',    tv: team.autoOpr, avg: avgAuto, color: 'bg-yellow-400' },
                  { label: 'TeleOp',  tv: team.teleOpr, avg: avgTele, color: 'bg-blue-400'   },
                  { label: 'Endgame', tv: team.egOpr,   avg: avgEg,   color: 'bg-red-400'    },
                ].map(({ label, tv, avg, color }) => {
                  const maxVal = Math.max(tv, avg, 1);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-[#A2A9B1]/60 w-16 text-right shrink-0">{label}</span>
                      <div className="flex-1 flex gap-2 items-center">
                        <div className="flex-1 bg-[#1a2847] h-2 relative overflow-hidden">
                          <div className={`absolute top-0 left-0 h-full ${color} opacity-80`} style={{ width: `${(tv / maxVal) * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs text-white w-10 shrink-0">{tv.toFixed(1)}</span>
                      </div>
                      <div className="flex-1 flex gap-2 items-center">
                        <div className="flex-1 bg-[#1a2847] h-2 relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-[#A2A9B1] opacity-40" style={{ width: `${(avg / maxVal) * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs text-[#A2A9B1]/60 w-10 shrink-0">{avg.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-4 mt-1">
                  <span className="text-[0.65rem] text-orange-400/70 flex items-center gap-1"><span className="w-2 h-2 bg-orange-400/70 inline-block" />This Team</span>
                  <span className="text-[0.65rem] text-[#A2A9B1]/50 flex items-center gap-1"><span className="w-2 h-2 bg-[#A2A9B1]/40 inline-block" />Event Avg</span>
                </div>
              </div>
            </div>
          )}

          {/* Robot profile */}
          <div className="mb-6 p-4 bg-orange-600/5 border border-orange-600/20" style={clipSm}>
            <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-1">Robot Profile</p>
            <p className="text-orange-400 font-semibold text-sm">{team.playstyle}</p>
          </div>

          {/* Awards */}
          {team.awards?.length > 0 && (
            <div className="mb-6">
              <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-2">Awards</p>
              <div className="flex flex-wrap gap-1">
                {team.awards.map((a, i) => <AwardBadge key={i} name={a.type || a.awardName || ''} />)}
              </div>
            </div>
          )}

          {/* Scouting notes */}
          <div className="p-5 bg-[#0a1628]/60 border border-[#A2A9B1]/15" style={clipMd}>
            <p className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase mb-3">Scouting Notes</p>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Observations, strengths, weaknesses..."
              rows={4}
              className="w-full bg-[#132038] border border-[#A2A9B1]/20 text-white text-sm p-3 focus:outline-none focus:border-orange-600 resize-none transition-colors placeholder-[#A2A9B1]/30"
              style={clipSm}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#A2A9B1]/40 italic">{savedMsg || 'Saved locally in your browser'}</span>
              <button onClick={saveNotes}
                      className="px-5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black tracking-widest transition-colors"
                      style={clipSm}>
                SAVE
              </button>
            </div>
          </div>

          {/* External links */}
          <div className="flex gap-5 mt-5 pt-4 border-t border-[#A2A9B1]/15">
            <a href={`https://ftcscout.org/teams/${team.teamNumber}`} target="_blank" rel="noopener noreferrer"
               className="text-xs text-[#A2A9B1]/50 hover:text-orange-500 transition-colors">FTCScout ↗</a>
            <a href={`https://theorangealliance.org/teams/${team.teamNumber}`} target="_blank" rel="noopener noreferrer"
               className="text-xs text-[#A2A9B1]/50 hover:text-orange-500 transition-colors">Orange Alliance ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoutSparkline({ data, width = 200, height = 50 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  const last = pts.split(' ').at(-1).split(',');
  return (
    <svg width={width} height={height} className="block overflow-visible shrink-0">
      <polyline points={pts} fill="none" stroke="#FF5A1F" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#FF5A1F" />
    </svg>
  );
}

// ── Awards Panel ──────────────────────────────────────────────

function AwardsPanel({ teams }) {
  const allAwards = [];
  for (const t of teams) {
    for (const a of (t.awards || [])) allAwards.push({ ...a, teamNumber: t.teamNumber, teamName: t.name });
  }
  if (allAwards.length === 0) return null;

  const ORDER = { winning:0,winner:0,finalist:1,inspire:2,think:3,connect:4,innovate:5,control:6,motivate:7,design:8 };
  allAwards.sort((a, b) => {
    const ak = Object.keys(ORDER).find(k => (a.type||a.awardName||'').toLowerCase().includes(k)) ?? 'z';
    const bk = Object.keys(ORDER).find(k => (b.type||b.awardName||'').toLowerCase().includes(k)) ?? 'z';
    return (ORDER[ak]??99) - (ORDER[bk]??99);
  });
  const seen = new Set();
  const unique = allAwards.filter(a => {
    const key = `${a.teamNumber}-${a.type||a.awardName}`;
    if (seen.has(key)) return false; seen.add(key); return true;
  });

  const ICONS   = { winning:'🏆',winner:'🏆',finalist:'🥈',inspire:'⭐',think:'🧠',connect:'🤝',innovate:'💡',control:'🎮',motivate:'🔥',design:'📐' };
  const BORDERS = { winning:'border-l-yellow-400/70',winner:'border-l-yellow-400/70',finalist:'border-l-[#A2A9B1]/40',inspire:'border-l-blue-400/60',control:'border-l-orange-500/60',connect:'border-l-green-400/60',innovate:'border-l-purple-400/60' };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-4 pb-3 border-b-2 border-[#A2A9B1]/20">
        <h3 className="text-sm font-black tracking-widest text-[#A2A9B1]">AWARDS</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-orange-600/40 to-transparent" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {unique.map((award, i) => {
          const lower     = (award.type || award.awardName || '').toLowerCase();
          const iconKey   = Object.keys(ICONS).find(k => lower.includes(k));
          const borderKey = Object.keys(BORDERS).find(k => lower.includes(k));
          return (
            <div key={i} className={`flex items-center gap-3 p-3 bg-[#1a2847]/40 border border-[#A2A9B1]/15 border-l-4 ${BORDERS[borderKey] || 'border-l-yellow-400/60'}`}>
              <span className="text-lg shrink-0">{ICONS[iconKey] || '🏆'}</span>
              <div className="min-w-0">
                <div className="text-white text-xs font-bold uppercase tracking-wide truncate">{award.type || award.awardName || ''}</div>
                <div className="text-[#A2A9B1]/60 text-xs">
                  <a href={`https://ftcscout.org/teams/${award.teamNumber}`} target="_blank" rel="noopener noreferrer"
                     className="text-orange-500/80 hover:text-orange-400">#{award.teamNumber}</a>
                  {award.teamName ? ` — ${award.teamName}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SCOUTING PAGE — stable module-level component ─────────────

function ScoutingPage({ isVisible }) {
  const [season, setSeason]             = useState('2024');
  const [eventCode, setEventCode]       = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [eventInfo, setEventInfo]       = useState(null);
  const [teams, setTeams]               = useState([]);
  const [filter, setFilter]             = useState('');
  const [sort, setSort]                 = useState({ key: 'seasonOpr', asc: false });
  const [showVisuals, setShowVisuals]   = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const displayTeams = React.useMemo(() => {
    const col = SCOUT_COLUMNS.find(c => c.key === sort.key);
    let list = [...teams];
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(t => String(t.teamNumber).includes(q) || (t.name || '').toLowerCase().includes(q));
    }
    if (col && !col.noSort) {
      list.sort((a, b) => {
        const va = col.getter(a), vb = col.getter(b);
        let cmp = col.isString ? String(va).localeCompare(String(vb)) : (Number(va) - Number(vb));
        return sort.asc ? cmp : -cmp;
      });
    }
    return list;
  }, [teams, filter, sort]);

  const maxVals = React.useMemo(() => {
    const m = {};
    SCOUT_COLUMNS.forEach(col => {
      if (col.hasBar) m[col.key] = Math.max(...teams.map(t => Math.max(0, col.getter(t) || 0)), 1);
    });
    return m;
  }, [teams]);

  function toggleSort(key) {
    setSort(prev => ({
      key,
      asc: prev.key === key ? !prev.asc : (SCOUT_COLUMNS.find(c => c.key === key)?.defaultAsc ?? false),
    }));
  }

  async function handleScout(e) {
    e.preventDefault();
    const code = eventCode.trim().toUpperCase();
    if (!code) { setError('Enter an event code.'); return; }
    setError(''); setLoading(true); setEventInfo(null); setTeams([]); setFilter('');

    try {
      // Phase 1 — event info, team list, awards (FTCScout, no CORS issue)
      const [event, eventTeams, eventAwards] = await Promise.all([
        fetchJSON(`${FTCSCOUT_API}/events/${season}/${code}`),
        fetchJSON(`${FTCSCOUT_API}/events/${season}/${code}/teams`),
        fetchJSON(`${FTCSCOUT_API}/events/${season}/${code}/awards`).catch(() => []),
      ]);

      if (!eventTeams?.length) throw new Error('No teams found. The event may not have published its team list yet.');

      const teamNumbers = eventTeams.map(t => t.teamNumber);
      const awardsMap   = {};
      (eventAwards || []).forEach(a => {
        if (!awardsMap[a.teamNumber]) awardsMap[a.teamNumber] = [];
        awardsMap[a.teamNumber].push(a);
      });

      // Phase 2 — Ignite (names, location, breakdown stats) + FTCScout quick-stats (global rank)
      // Both fetched in parallel, batched to avoid rate limits
      const [igniteResults, quickResults] = await Promise.all([
        batchFetch(teamNumbers, n => fetchJSON(`${IGNITE_API}/teams/${n}?season=${season}`).catch(() => null), 5),
        batchFetch(teamNumbers, n => fetchJSON(`${FTCSCOUT_API}/teams/${n}/quick-stats?season=${season}`).catch(() => null), 5),
      ]);

      const assembled = teamNumbers.map(num =>
        buildTeam(num, igniteResults[num], quickResults[num], awardsMap[num] || [], season)
      );
      assembled.sort((a, b) => b.seasonOpr - a.seasonOpr);

      let status = 'Upcoming';
      if (event.finished)  status = 'Completed';
      else if (event.ongoing) status = 'In Progress';
      else if (event.started) status = 'Started';

      setEventInfo({ ...event, status, teamCount: assembled.length });
      setTeams(assembled);
      setSort({ key: 'seasonOpr', asc: false });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function renderCell(col, team, currentSeason) {
    const v = col.getter(team);
    switch (col.key) {
      case 'team':
        return <a href={`https://ftcscout.org/teams/${team.teamNumber}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="font-mono font-bold text-orange-500 hover:underline">{team.teamNumber}</a>;
      case 'name':
        return <span className="text-white text-sm font-medium">{team.name || <span className="text-[#A2A9B1]/40 italic text-xs">Unknown</span>}</span>;
      case 'seasonRank':
        return <ScoutRankBadge rank={v} />;
      case 'bestOpr': case 'autoOpr': case 'teleOpr': case 'egOpr': case 'dpr': case 'ccwm': case 'maxScore': case 'avgScore': {
        const n = Number(v);
        const cls = n > 0 ? 'text-green-400' : n < 0 ? 'text-red-400' : 'text-[#A2A9B1]/40';
        return <span className={`font-mono text-sm ${cls}`}>{n.toFixed(1)}</span>;
      }
      case 'winRate': case 'lastWinRate':
        return <WinRateBadge pct={v} />;
      case 'record':
        return <span className="font-mono text-sm text-[#A2A9B1]">{team.totalWins}-{team.totalLosses}-{team.totalTies}</span>;
      case 'events':
        return <span className="font-mono text-sm text-[#A2A9B1]">{Math.round(Number(v))}</span>;
      case 'lastRank':
        return <LastRankBadge rank={v} />;
      case 'lastEvent':
        return v
          ? <a href={`https://ftcscout.org/events/${season}/${v}/rankings`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-orange-500/80 hover:text-orange-400 text-xs font-mono">{v}</a>
          : <span className="text-[#A2A9B1]/40 font-mono text-sm">—</span>;
      case 'comments': {
        const note = localStorage.getItem(`notes_${team.teamNumber}`);
        if (!note) return <span className="text-[#A2A9B1]/30 italic text-xs">No notes</span>;
        const display = note.trim().length > 30 ? note.trim().substring(0, 30) + '…' : note.trim();
        return <span className="text-[#A2A9B1]/70 italic text-xs">"{display}"</span>;
      }
      case 'awards':
        return team.awards?.length > 0
          ? <div className="flex flex-wrap gap-0.5">{team.awards.map((a, i) => <AwardBadge key={i} name={a.type || a.awardName || ''} />)}</div>
          : <span className="text-[#A2A9B1]/30 text-sm">—</span>;
      case 'location':
        return <span className="text-[#A2A9B1]/50 text-xs">{v || '—'}</span>;
      default:
        return <span className="text-[#A2A9B1] text-sm">{String(v)}</span>;
    }
  }

  const clipSm = { clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' };
  const clipMd = { clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' };
  const inputCls = "bg-[#0a1628] border border-[#A2A9B1]/30 text-white text-sm px-4 h-11 focus:outline-none focus:border-orange-600 transition-colors font-mono w-full placeholder-[#A2A9B1]/30";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-[0.05] pointer-events-none select-none flex items-center justify-center text-orange-500 text-[18rem] font-black">⚡</div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Page header */}
        <div className="text-center mb-14">
          <div id="scout-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['scout-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
            <div className="flex items-center gap-3 px-6 py-3 bg-orange-600/20 border-2 border-orange-600"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
              <Zap className="text-orange-500" size={16} />
              <span className="text-orange-500 font-black text-sm tracking-wider">FTC AUTO SCOUT</span>
            </div>
          </div>
          <h1 id="scout-title" data-animate
              className={`text-6xl md:text-8xl font-black text-white mb-4 tracking-tight transition-all duration-700 ${isVisible['scout-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
              style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
            SCOUTING
          </h1>
          <p id="scout-desc" data-animate
             className={`text-lg text-[#A2A9B1] max-w-2xl mx-auto transition-all duration-700 ${isVisible['scout-desc'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'}`}
             style={{ transitionDelay: '200ms' }}>
            Enter an FTC event code to load full team stats, OPR breakdowns, awards and more.
            Powered by <a href="https://ftcscout.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">FTCScout</a> &amp; <a href="https://ignitepathways.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Ignite</a>.
          </p>
        </div>

        {/* Search card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-blue-900/10 translate-x-3 translate-y-3" style={clipMd} />
          <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-8 border-2 border-[#A2A9B1]" style={clipMd}>
            <h2 className="text-xs font-black tracking-widest text-orange-500 mb-1">LOOK UP EVENT</h2>
            <p className="text-[#A2A9B1]/50 text-sm mb-6">
              Find event codes at <a href="https://ftcscout.org" target="_blank" rel="noopener noreferrer" className="text-orange-500/70 hover:text-orange-400">ftcscout.org</a>
            </p>
            <form onSubmit={handleScout}>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex flex-col gap-1.5 md:w-64">
                  <label className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase">Season</label>
                  <select value={season} onChange={e => setSeason(e.target.value)} disabled={loading}
                          className={inputCls} style={{ ...clipSm, appearance: 'none' }}>
                    {SCOUT_SEASONS.map(s => <option key={s.value} value={s.value} style={{ background: '#0a1628' }}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[0.6rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase">Event Code</label>
                  <input type="text" value={eventCode} onChange={e => setEventCode(e.target.value.toUpperCase())}
                         placeholder="e.g. USTXCCOS2" disabled={loading}
                         className={inputCls} style={clipSm} autoComplete="off" spellCheck="false" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6rem] opacity-0 select-none">Go</label>
                  <button type="submit" disabled={loading}
                          className="h-11 px-8 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-black text-sm tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                          style={clipSm}>
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />LOADING...</>
                      : <><Search size={15} />SCOUT EVENT</>}
                  </button>
                </div>
              </div>
            </form>
            {loading && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-[#A2A9B1]/10">
                <div className="h-full w-1/3 bg-orange-500" style={{ animation: 'loadSlide 1.2s ease-in-out infinite' }} />
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 border-l-4 border-l-red-500 text-red-400 text-sm">
            <X size={15} className="shrink-0" />{error}
          </div>
        )}

        {/* Event banner */}
        {eventInfo && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-6 border-2 border-[#A2A9B1] border-l-4 border-l-orange-600"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-[0.6rem] font-bold tracking-widest text-orange-500 mb-1">EVENT</p>
                  <h2 className="text-white font-black text-xl mb-3">{eventInfo.name}</h2>
                  <div className="flex flex-wrap gap-6">
                    {[
                      ['VENUE',  [eventInfo.venue, eventInfo.city, eventInfo.state].filter(Boolean).join(', ') || '—'],
                      ['DATE',   eventInfo.start === eventInfo.end ? fmtDate(eventInfo.start) : `${fmtDate(eventInfo.start)} — ${fmtDate(eventInfo.end)}`],
                      ['TEAMS',  eventInfo.teamCount],
                      ['STATUS', eventInfo.status],
                    ].map(([label, val]) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[0.55rem] font-bold tracking-widest text-[#A2A9B1]/50 uppercase">{label}</span>
                        <span className="text-[#A2A9B1] text-sm">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <a href={`https://ftc-events.firstinspires.org/${eventInfo.season}/${eventInfo.code}`} target="_blank" rel="noopener noreferrer"
                     className="px-3 py-2 border border-[#A2A9B1]/30 text-[#A2A9B1]/60 hover:border-orange-600 hover:text-orange-500 text-xs font-bold tracking-wider transition-colors">
                    FTC EVENTS ↗
                  </a>
                  <a href={`https://ftcscout.org/events/${eventInfo.season}/${eventInfo.code}/rankings`} target="_blank" rel="noopener noreferrer"
                     className="px-3 py-2 border border-[#A2A9B1]/30 text-[#A2A9B1]/60 hover:border-orange-600 hover:text-orange-500 text-xs font-bold tracking-wider transition-colors">
                    FTCSCOUT ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Awards */}
        {teams.length > 0 && <AwardsPanel teams={teams} />}

        {/* Table */}
        {teams.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-3 border-b-2 border-[#A2A9B1]/20">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black tracking-widest text-[#A2A9B1]">TEAM STATISTICS</h3>
                <div className="h-px w-24 bg-gradient-to-r from-orange-600/40 to-transparent hidden md:block" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setShowVisuals(v => !v)}>
                  <div className={`w-9 h-5 rounded-full border transition-all relative ${showVisuals ? 'bg-orange-600/20 border-orange-600' : 'bg-[#A2A9B1]/10 border-[#A2A9B1]/20'}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${showVisuals ? 'left-4 bg-orange-500' : 'left-0.5 bg-[#A2A9B1]/40'}`} />
                  </div>
                  <span className="text-[0.65rem] font-bold tracking-widest text-[#A2A9B1]/60 uppercase">Visuals</span>
                </div>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A2A9B1]/40 pointer-events-none" />
                  <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
                         placeholder="Filter teams..."
                         className="pl-8 pr-3 h-8 bg-[#0a1628] border border-[#A2A9B1]/20 text-white text-xs focus:outline-none focus:border-orange-600 transition-colors w-44 placeholder-[#A2A9B1]/30"
                         style={clipSm} />
                </div>
                <span className="text-[0.65rem] font-mono text-[#A2A9B1]/40 whitespace-nowrap">
                  {filter ? `${displayTeams.length} / ${teams.length}` : `${teams.length}`} teams
                </span>
              </div>
            </div>

            <div className="border border-[#A2A9B1]/20 overflow-x-auto"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)', background: 'rgba(10,22,40,0.7)' }}>
              <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr className="border-b-2 border-[#A2A9B1]/20">
                    {SCOUT_COLUMNS.map(col => (
                      <th key={col.key}
                          onClick={() => !col.noSort && toggleSort(col.key)}
                          title={col.tooltip}
                          className={`px-3 py-3 text-left text-[0.6rem] font-black tracking-widest uppercase whitespace-nowrap bg-[#1a2847]/60 transition-colors
                            ${col.noSort ? 'cursor-default text-[#A2A9B1]/40' : 'cursor-pointer hover:text-orange-500'}
                            ${sort.key === col.key ? 'text-orange-500' : 'text-[#A2A9B1]/60'}`}>
                        {col.label}
                        {!col.noSort && (
                          <span className="ml-1 opacity-60 text-[0.55rem]">
                            {sort.key === col.key ? (sort.asc ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayTeams.map(team => (
                    <tr key={team.teamNumber} onClick={() => setSelectedTeam(team)}
                        className="border-b border-[#A2A9B1]/10 cursor-pointer hover:bg-orange-600/5 transition-colors">
                      {SCOUT_COLUMNS.map(col => {
                        const barPct = col.hasBar && showVisuals
                          ? (Math.max(0, col.getter(team)) / (maxVals[col.key] || 1)) * 100 : 0;
                        return (
                          <td key={col.key} className="px-3 py-2.5 relative">
                            {col.hasBar && showVisuals && (
                              <div className={`absolute inset-y-1 left-0 transition-all duration-300 ${
                                col.barColor === 'yellow' ? 'bg-yellow-400/10' :
                                col.barColor === 'red'    ? 'bg-red-400/10'    :
                                col.barColor === 'green'  ? 'bg-green-400/10'  : 'bg-blue-400/10'
                              }`} style={{ width: `${barPct}%` }} />
                            )}
                            <div className="relative z-10">{renderCell(col, team)}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && teams.length === 0 && (
          <div className="text-center py-24 text-[#A2A9B1]/40">
            <BarChart2 size={44} className="mx-auto mb-4 opacity-25" />
            <p className="text-lg font-bold tracking-wider">Enter an event code to load data</p>
            <p className="text-sm mt-1">Find codes at <a href="https://ftcscout.org" target="_blank" rel="noopener noreferrer" className="text-orange-500/70 hover:text-orange-400">ftcscout.org</a></p>
          </div>
        )}

        <div className="text-center pt-8 border-t border-[#A2A9B1]/10">
          <p className="text-xs text-[#A2A9B1]/30">
            Data from <a href="https://ftcscout.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500/60">FTCScout</a> &amp; <a href="https://ignitepathways.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500/60">Ignite Pathways</a> · Original source FIRST · Click any row for full detail
          </p>
        </div>
      </div>

      {selectedTeam && (
        <TeamModal team={selectedTeam} season={season} allTeams={teams} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING SITE COMPONENTS (100% unchanged from your original App.jsx)
// ─────────────────────────────────────────────────────────────────────────────

const ClawMarkImage = ({ opacity = 0.15, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = '/claw.png';
  }, []);
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ opacity }}>
      {imageLoaded && !imageError ? (
        <img src="/claw.png" alt="Wolverine Claw" className="w-full h-full object-contain"
             style={{ filter: 'brightness(1.3) contrast(1.2)' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-orange-500/30 text-6xl font-black">⚡</div>
        </div>
      )}
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
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
           style={{ boxShadow: 'inset 0 0 20px rgba(255, 90, 31, 0.4)' }} />
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
    if (hasChecked.current) return;
    hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = sponsor.image;
  }, [sponsor.image]);
  return (
    <div className="aspect-video bg-white flex items-center justify-center mb-6 overflow-hidden relative group transition-all duration-500 hover:scale-[1.03]"
         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
      {!imageLoaded ? (
        <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center">
          <div className="text-white text-6xl font-black animate-pulse">{initials}</div>
        </div>
      ) : imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-[#132038] to-[#FF5A1F] flex items-center justify-center">
          <div className="text-white text-6xl font-black">{initials}</div>
        </div>
      ) : (
        <img src={sponsor.image} alt={sponsor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      )}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
           style={{ boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.5)' }} />
    </div>
  );
};

const TeamMemberCard = ({ member, size = 'small', showRookie = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
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
        {!imageLoaded || imageError
          ? <span className="animate-pulse">{member.initials}</span>
          : <img src={member.image} alt={member.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#132038]/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
             style={{ boxShadow: 'inset 0 0 30px rgba(255, 90, 31, 0.6)' }} />
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
    if (hasChecked.current) return;
    hasChecked.current = true;
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
    if (hasChecked.current) return;
    hasChecked.current = true;
    const img = new Image();
    img.onload = () => { setImageLoaded(true); setImageError(false); };
    img.onerror = () => { setImageError(true); setImageLoaded(true); };
    img.src = '/data/logo.svg';
  }, []);
  return (
    <div className="w-12 h-12 flex items-center justify-center overflow-hidden"
         style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
      {!imageLoaded || imageError
        ? <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white font-black text-xl">WR</div>
        : <img src="/data/logo.svg" alt="Wolverine Robotics Logo" className="w-full h-full object-contain" />}
    </div>
  );
};

const GridScan = ({ sensitivity = 0.55, lineThickness = 1, linesColor = '#FF5A1F', scanColor = '#FF5A1F', scanOpacity = 0.3, gridScale = 0.15, noiseIntensity = 0.008 }) => {
  const containerRef = useRef(null);
  const rendererRef  = useRef(null);
  const rafRef       = useRef(null);
  const lookTarget   = useRef(new THREE.Vector2(0, 0));
  const lookCurrent  = useRef(new THREE.Vector2(0, 0));
  const lookVel      = useRef(new THREE.Vector2(0, 0));

  const vert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
  const frag = `
precision highp float;
uniform vec3 iResolution;uniform float iTime;uniform vec2 uSkew;uniform float uLineThickness;
uniform vec3 uLinesColor;uniform vec3 uScanColor;uniform float uGridScale;uniform float uScanOpacity;uniform float uNoise;
varying vec2 vUv;
void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 p=(2.0*fragCoord-iResolution.xy)/iResolution.y;vec3 ro=vec3(0.0);vec3 rd=normalize(vec3(p,2.0));
  vec2 skew=clamp(uSkew,vec2(-0.7),vec2(0.7));rd.xy+=skew*rd.z;
  vec3 color=vec3(0.0);float minT=1e20;float fadeStrength=1.5;vec2 gridUV=vec2(0.0);
  for(int i=0;i<4;i++){
    float isY=float(i<2);float pos=mix(-0.2,0.2,float(i))*isY+mix(-0.5,0.5,float(i-2))*(1.0-isY);
    float num=pos-(isY*ro.y+(1.0-isY)*ro.x);float den=isY*rd.y+(1.0-isY)*rd.x;float t=num/den;
    vec3 h=ro+rd*t;bool use=t>0.0&&t<minT;
    gridUV=use?mix(h.zy,h.xz,isY)/uGridScale:gridUV;minT=use?t:minT;
  }
  vec3 hit=ro+rd*minT;float dist=length(hit-ro);
  float fx=fract(gridUV.x);float fy=fract(gridUV.y);float ax=min(fx,1.0-fx);float ay=min(fy,1.0-fy);
  float wx=fwidth(gridUV.x);float wy=fwidth(gridUV.y);float halfPx=max(0.0,uLineThickness)*0.5;
  float tx=halfPx*wx;float ty=halfPx*wy;
  float lineX=1.0-smoothstep(tx,tx+wx,ax);float lineY=1.0-smoothstep(ty,ty+wy,ay);
  float lineMask=max(lineX,lineY);float fade=exp(-dist*fadeStrength);
  float scanZ=mod(iTime*0.4,2.0);float dz=abs(hit.z-scanZ);float sigma=0.2;
  float scanPulse=exp(-0.5*(dz*dz)/(sigma*sigma));
  vec3 gridCol=uLinesColor*lineMask*fade;vec3 scanCol=uScanColor*scanPulse*uScanOpacity;
  color=gridCol+scanCol;
  float n=fract(sin(dot(gl_FragCoord.xy+vec2(iTime*123.4),vec2(12.9898,78.233)))*43758.5453123);
  color+=(n-0.5)*uNoise;color=clamp(color,0.0,1.0);
  float alpha=clamp(max(lineMask*fade,scanPulse*uScanOpacity),0.0,1.0)*0.6;
  fragColor=vec4(color,alpha);
}
void main(){vec4 c;mainImage(c,vUv*iResolution.xy);gl_FragColor=c;}`;

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onMove = e => { const r = el.getBoundingClientRect(); lookTarget.current.set(((e.clientX-r.left)/r.width)*2-1, -(((e.clientY-r.top)/r.height)*2-1)); };
    const onLeave = () => lookTarget.current.set(0, 0);
    el.addEventListener('mousemove', onMove); el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  useEffect(() => {
    const container = containerRef.current; if (!container) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const srgb = hex => new THREE.Color(hex).convertSRGBToLinear();
    const uniforms = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio()) },
      iTime: { value: 0 }, uSkew: { value: new THREE.Vector2(0, 0) },
      uLineThickness: { value: lineThickness }, uLinesColor: { value: srgb(linesColor) },
      uScanColor: { value: srgb(scanColor) }, uGridScale: { value: gridScale },
      uScanOpacity: { value: scanOpacity }, uNoise: { value: noiseIntensity },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);
    const onResize = () => { renderer.setSize(container.clientWidth, container.clientHeight); material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio()); };
    window.addEventListener('resize', onResize);
    const s = THREE.MathUtils.clamp(sensitivity, 0, 1);
    const skewScale = THREE.MathUtils.lerp(0.04, 0.15, s);
    const smoothTime = THREE.MathUtils.lerp(0.5, 0.15, s);
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      const sdv2 = (cur, tgt, vel, st, dt) => {
        const out = cur.clone(); st = Math.max(0.0001, st);
        const omega = 2/st, x = omega*dt;
        const exp = 1/(1+x+0.48*x*x+0.235*x*x*x);
        let change = cur.clone().sub(tgt);
        const newTarget = cur.clone().sub(change);
        const temp = vel.clone().addScaledVector(change, omega).multiplyScalar(dt);
        vel.sub(temp.clone().multiplyScalar(omega)); vel.multiplyScalar(exp);
        out.copy(newTarget.clone().add(change.add(temp).multiplyScalar(exp)));
        return out;
      };
      lookCurrent.current.copy(sdv2(lookCurrent.current, lookTarget.current, lookVel.current, smoothTime, dt));
      material.uniforms.uSkew.value.set(lookCurrent.current.x * skewScale, -lookCurrent.current.y * 1.2 * skewScale);
      material.uniforms.iTime.value = now / 1000;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose(); quad.geometry.dispose(); renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [sensitivity, lineThickness, linesColor, scanColor, scanOpacity, gridScale, noiseIntensity]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
};

const InitialLoadAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('grid');
  const [clawImageLoaded, setClawImageLoaded] = useState(false);
  const [clawImageError, setClawImageError]   = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => { setClawImageLoaded(true); setClawImageError(false); };
    img.onerror = () => { setClawImageError(true); setClawImageLoaded(true); };
    img.src = '/data/logo.svg';
  }, []);

  useEffect(() => {
    const list = ['/data/logo.svg','/claw.png','/data/robots/matchstick-main.jpg','/data/robots/matchstick-1.jpg','/data/robots/matchstick-2.jpg','/data/robots/matchstick-3.jpg','/data/robots/matchstick-4.jpg','/data/team/dev.jpg','/data/team/sahejdeep.jpg','/data/team/sripadh.jpg','/data/team/manveer.jpg','/data/sponsors/whs.png','/data/sponsors/nhs.png'];
    let n = 0;
    const done = () => { if (++n >= list.length) setImagesPreloaded(true); };
    list.forEach(src => { const i = new Image(); i.onload = done; i.onerror = done; i.src = src; });
  }, []);

  useEffect(() => {
    if (!imagesPreloaded) return;
    const t1 = setTimeout(() => setPhase('logo'),    800);
    const t2 = setTimeout(() => setPhase('complete'), 1600);
    const t3 = setTimeout(() => onComplete(),          2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, imagesPreloaded]);

  return (
    <div className={`fixed inset-0 z-[200] bg-[#132038] flex items-center justify-center transition-opacity duration-500 ${phase === 'complete' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className={`absolute h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-all duration-1000 ${phase === 'grid' ? 'w-0 left-1/2 top-1/2' : 'w-[141%] -left-[20%] top-1/2'}`}
             style={{ boxShadow: '0 0 30px rgba(255,90,31,1)', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
      </div>
      <div className={`relative z-20 transition-all duration-700 ${phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="relative flex flex-col items-center">
          <div className="w-80 h-80 relative mb-8 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 bg-[#132038] z-0" />
            {clawImageLoaded && !clawImageError
              ? <img src="/data/logo.svg" alt="Logo"
                     className={`w-full h-full object-contain transition-all duration-1000 relative z-10 ${phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                     style={{ filter: 'brightness(1.5) contrast(1.3) drop-shadow(0 0 50px rgba(255,90,31,1))' }} />
              : <div className={`text-orange-500 text-9xl font-black transition-all duration-700 relative z-10 ${phase === 'logo' || phase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>⚡</div>
            }
            <div className="absolute inset-0 bg-orange-500/40 blur-3xl animate-pulse" />
          </div>
          <div className="text-center w-full">
            <h1 className="text-7xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>WOLVERINE</h1>
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
  const [currentPage,      setCurrentPage]      = useState('home');
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [scrollY,          setScrollY]          = useState(0);
  const [isVisible,        setIsVisible]        = useState({});
  const [isInitialLoad,    setIsInitialLoad]    = useState(true);
  const [pageTransitioning,setPageTransitioning]= useState(false);
  const [displayPage,      setDisplayPage]      = useState('home');
  const [transitionPhase,  setTransitionPhase]  = useState('none');

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
      if (['home','about','robots','sponsors','contact','scouting'].includes(page)) setCurrentPage(page);
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
    setPageTransitioning(true);
    setTransitionPhase('out');
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
    { name: 'ROBOTS',   id: 'robots'   },
    { name: 'SPONSORS', id: 'sponsors' },
    { name: 'CONTACT',  id: 'contact'  },
    { name: 'SCOUTING', id: 'scouting' },
  ];

  const teamMembers = {
    students: [
      { name: 'Dev Gavande',          role: 'Team Captain, Founder, Driver, CAD Lead, Hardware Lead', image: '/data/team/dev.jpg',      initials: 'DG', rookie: false },
      { name: 'Sahejdeep Singh',       role: 'Software, Hardware, Drive Coach',                        image: '/data/team/sahejdeep.jpg', initials: 'SS', rookie: true  },
      { name: 'Sripaadh J Kuppusamy', role: 'Hardware, Human Player',                                  image: '/data/team/sripadh.jpg',  initials: 'SK', rookie: true  },
      { name: 'Manveer Singh Tib',     role: 'Hardware, Human Player',                                  image: '/data/team/manveer.jpg',  initials: 'MT', rookie: true  },
      { name: 'Jivansh Pandya',        role: 'Hardware',                                                image: '/data/team/Jivansh.jpg',  initials: 'JP', rookie: true  },
      { name: 'Jacob Esparza',         role: 'Hardware',                                                image: '/data/team/Jacob.jpeg',   initials: 'JE', rookie: true  },
      { name: 'Kaiden Lee',            role: 'Hardware',                                                image: '/data/team/kaiden.jpg',   initials: 'KL', rookie: true  },
      { name: 'Kalvik Das',            role: 'Hardware',                                                image: '/data/team/Kalvik.jpg',   initials: 'KD', rookie: true  },
      { name: 'Alexander Fiderfish',   role: 'Hardware',                                                image: '/data/team/member9.jpg',  initials: 'AF', rookie: true  },
      { name: 'Piousvir Singh',        role: 'Outreach',                                                image: '/data/team/pious.jpg',    initials: 'PS', rookie: true  },
      { name: 'Pratham Erramilli',     role: 'Outreach',                                                image: '/data/team/pratham.jpg',  initials: 'PE', rookie: true  },
      { name: 'Kavin Murugan',         role: 'Outreach',                                                image: '/data/team/kavin.jpg',    initials: 'KM', rookie: true  },
    ],
    mentors: [{ name: 'Abdullah Khaled', role: 'Youth Software Mentor', image: '/data/team/abdullah.jpg', initials: 'AK', rookie: false }],
    coaches: [
      { name: 'Mr. Ellis',   role: 'Coach', image: '/data/team/ellis.jpg', initials: 'E', rookie: false },
      { name: 'Mr. Gavande', role: 'Coach', image: '/data/team/vijay.jpg', initials: 'V', rookie: false },
    ],
  };

  const handleLogoClick = () => { setCurrentPage('home'); window.scrollTo(0, 0); };

  const renderPage = () => {
    if (displayPage === 'scouting') return <ScoutingPage isVisible={isVisible} />;

    if (displayPage === 'home') return (
      <div className="min-h-screen">
        <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#132038]">
          <GridScan />
          <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[600px] h-[600px]" />
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: 'linear-gradient(45deg,#FF5A1F 1px,transparent 1px),linear-gradient(-45deg,#FF5A1F 1px,transparent 1px)', backgroundSize: '60px 60px', transform: `translateY(${scrollY * 0.2}px)` }} />
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <div className="mb-8">
              <div id="hero-badge" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['hero-badge'] ? 'animate-expand-center' : 'opacity-0 scale-[0.3]'}`}>
                <div className="flex items-center gap-3 px-6 py-3 bg-orange-600/20 border-2 border-orange-600 transition-all duration-300 hover:bg-orange-600/30 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/50"
                     style={{ clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)' }}>
                  <Zap className="text-orange-500" size={20} />
                  <span className="text-orange-500 font-black text-sm tracking-wider">FTC TEAM 33791</span>
                </div>
              </div>
              <h1 id="hero-title-1" data-animate
                  className={`text-7xl md:text-9xl font-black text-white mb-4 tracking-tight transition-all duration-700 ${isVisible['hero-title-1'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                  style={{ animationDelay: '0.1s', fontFamily: 'system-ui,-apple-system,sans-serif', letterSpacing: '0.02em' }}>
                WOLVERINE
              </h1>
              <h2 id="hero-title-2" data-animate
                  className={`text-5xl md:text-8xl font-black text-orange-500 mb-8 transition-all duration-700 ${isVisible['hero-title-2'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                  style={{ animationDelay: '0.25s', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
                ROBOTICS
              </h2>
            </div>
            <div id="hero-description" data-animate
                 className={`max-w-2xl mx-auto mb-12 space-y-4 transition-all duration-700 ${isVisible['hero-description'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'}`}
                 style={{ animationDelay: '0.4s' }}>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">First-year FTC team from Frisco, TX pushing the boundaries of what rookies can achieve.</p>
              <p className="text-base md:text-lg text-gray-400">Built with precision. Engineered for excellence. Driven by innovation.</p>
            </div>
            <div id="hero-buttons" data-animate
                 className={`flex flex-wrap gap-6 justify-center transition-all duration-700 ${isVisible['hero-buttons'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
                 style={{ animationDelay: '0.5s' }}>
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
              <div id="team-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['team-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
                <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600 hover:scale-105 transition-transform duration-300"
                     style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                  <span className="text-orange-500 font-black text-sm tracking-widest">THE PACK</span>
                </div>
              </div>
              <h2 id="team-title" data-animate
                  className={`text-5xl md:text-7xl font-black text-white mb-4 transition-all duration-700 ${isVisible['team-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                  style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
                MEET THE TEAM
              </h2>
              <p id="team-subtitle" data-animate
                 className={`text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-700 ${isVisible['team-subtitle'] ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'}`}
                 style={{ transitionDelay: '200ms' }}>
                12 students. 1 vision. Unlimited potential.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {teamMembers.students.slice(0, 4).map((member, idx) => (
                <div key={idx} id={`member-preview-${idx}`} data-animate
                     className={`text-center transition-all duration-700 ${isVisible[`member-preview-${idx}`] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
                     style={{ transitionDelay: `${idx * 75}ms` }}>
                  <TeamMemberCard member={member} size="small" showRookie={false} />
                  <h3 className="text-white font-bold text-base mt-4 mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                  <p className="text-orange-500 text-xs font-bold tracking-wider">{member.role.split(',')[0]}</p>
                </div>
              ))}
            </div>
            <div id="team-cta" data-animate className={`text-center transition-all duration-700 ${isVisible['team-cta'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`} style={{ transitionDelay: '0.4s' }}>
              <AngleButton onClick={() => setCurrentPage('about')} variant="secondary">FULL ROSTER <ChevronRight size={20} /></AngleButton>
            </div>
          </div>
        </div>
      </div>
    );

    if (displayPage === 'about') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[800px] h-[800px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="about-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['about-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
              <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                <span className="text-orange-500 font-black text-sm tracking-widest">TEAM 33791</span>
              </div>
            </div>
            <h1 id="about-title" data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['about-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
              THE PACK
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              A first-year team built on precision engineering, relentless innovation, and the drive to prove that rookies can compete at the highest level.
            </p>
          </div>
          {[
            { id: 'students-section', label: 'STUDENTS', sub: 'THE ENGINEERS', members: teamMembers.students, rookie: true,  delay: '300ms' },
            { id: 'mentors-section',  label: 'MENTORS',  sub: 'THE GUIDES',    members: teamMembers.mentors,  rookie: false, delay: '400ms' },
            { id: 'coaches-section',  label: 'COACHES',  sub: 'THE LEADERS',   members: teamMembers.coaches,  rookie: false, delay: '500ms' },
          ].filter(g => g.members.length > 0).map(group => (
            <div key={group.id} id={group.id} data-animate
                 className={`mb-24 transition-all duration-700 ${isVisible[group.id] ? 'animate-fade-in' : 'opacity-0'}`}
                 style={{ transitionDelay: group.delay }}>
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-4xl font-black text-white" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>{group.label}</h2>
                  <div className="flex-1 h-1 bg-gradient-to-r from-orange-600 to-transparent" />
                </div>
                <p className="text-orange-500 font-bold tracking-wider text-sm">{group.sub}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {group.members.map((member, i) => (
                  <div key={i} className="text-center"
                       style={{ animation: 'growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}>
                    <TeamMemberCard member={member} size="large" showRookie={group.rookie} />
                    <div className="mt-4">
                      <h3 className="text-white font-bold text-base mb-1 hover:text-orange-500 transition-colors duration-300">{member.name}</h3>
                      <p className="text-orange-500 text-xs font-bold tracking-wider leading-relaxed">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (displayPage === 'robots') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[900px] h-[900px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="robots-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['robots-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
              <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                <span className="text-orange-500 font-black text-sm tracking-widest">TECHNICAL SPECS</span>
              </div>
            </div>
            <h1 id="robots-title" data-animate
                className={`text-6xl md:text-8xl font-black text-white transition-all duration-700 ${isVisible['robots-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
              MATCHSTICK
            </h1>
          </div>
          <div id="matchstick-detail" data-animate
               className={`relative transition-all duration-700 ${isVisible['matchstick-detail'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
               style={{ transitionDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-blue-900/10 transform translate-x-6 translate-y-6"
                 style={{ clipPath: 'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)' }} />
            <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1629] p-8 md:p-16 border-4 border-[#A2A9B1] overflow-hidden group hover:border-orange-600 transition-all duration-500 hover:scale-[1.02]"
                 style={{ clipPath: 'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)' }}>
              <ClawMarkImage className="top-0 right-0 w-64 h-64" opacity={0.05} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                   style={{ boxShadow: 'inset 0 0 60px rgba(255,90,31,0.5)' }} />
              <div className="grid md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-8">
                  <div className="aspect-square bg-gradient-to-br from-orange-900 to-blue-900 flex items-center justify-center text-white font-black overflow-hidden relative hover:shadow-2xl hover:shadow-orange-600/60 transition-all duration-500 border-4 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.03]"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%)' }}>
                    <RobotImage src="/data/robots/matchstick-main.jpg" alt="Matchstick Robot" fallbackText="MS" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square bg-gradient-to-br from-blue-800 to-orange-800 flex items-center justify-center text-white text-5xl font-bold overflow-hidden hover:scale-[1.05] transition-all duration-300 border-2 border-[#A2A9B1] hover:border-orange-600 group relative"
                           style={{ clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)' }}>
                        <RobotImage src={`/data/robots/matchstick-${i}.jpg`} alt={`Matchstick detail ${i}`} fallbackText={String(i)} />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
                             style={{ boxShadow: 'inset 0 0 25px rgba(255,90,31,0.6)' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <h2 className="text-6xl font-black text-white mb-3" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>MATCHSTICK</h2>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-transparent" />
                      <p className="text-orange-500 font-black tracking-widest text-sm">2025-26 DECODE</p>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">Our first machine. Every component precision-engineered for maximum performance. Built to dominate the competition field from day one.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[['WEIGHT','28 LBS'],['HEIGHT','18 IN'],['DRIVETRAIN','MECANUM'],['LANGUAGE','JAVA 17']].map(([label,val],idx) => (
                      <div key={idx} className="bg-gradient-to-br from-orange-600/20 to-blue-900/20 p-6 border-2 border-[#A2A9B1] hover:border-orange-600 hover:scale-[1.05] transition-all duration-300 group relative"
                           style={{ clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)' }}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"
                             style={{ boxShadow: 'inset 0 0 25px rgba(255,90,31,0.5)' }} />
                        <p className="text-orange-500/70 font-bold text-xs mb-2 tracking-wider relative z-10">{label}</p>
                        <p className="text-white text-2xl font-black relative z-10">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 p-8 border-2 border-[#A2A9B1] hover:border-blue-500 transition-all duration-300 group relative hover:scale-[1.02]"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 30px rgba(66,153,225,0.4)' }} />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <Award className="text-orange-500" size={28} />
                      <h3 className="text-white font-black text-2xl">ACHIEVEMENTS</h3>
                    </div>
                    <ul className="space-y-3 relative z-10">
                      {['2X CONTROL AWARD WINNER','SEMI-FINALIST AT U-LEAGUE TOURNAMENT','WINNER OF DALLAS SEMI-REGIONAL'].map((a,i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <div className="w-2 h-2 bg-orange-600 transform rotate-45" />
                          <span className="font-semibold">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 p-8 border-2 border-[#A2A9B1] hover:border-orange-500 transition-all duration-300 group relative hover:scale-[1.02]"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" style={{ boxShadow: 'inset 0 0 30px rgba(255,90,31,0.5)' }} />
                    <h3 className="text-white font-black text-2xl mb-6 relative z-10">KEY FEATURES</h3>
                    <ul className="space-y-3 relative z-10">
                      {['12 & 9 BALL AUTONOMOUS','3 SECOND CYCLE TIME','VARIABLE SHOOTING SEQUENCE','MODULAR SUBSYSTEM DESIGN'].map((f,i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <div className="w-2 h-2 bg-orange-600 transform rotate-45" />
                          <span className="font-semibold">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (displayPage === 'sponsors') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.1} className="bottom-0 right-0 w-[750px] h-[750px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="sponsors-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['sponsors-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
              <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                <span className="text-orange-500 font-black text-sm tracking-widest">SUPPORTERS</span>
              </div>
            </div>
            <h1 id="sponsors-title" data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['sponsors-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
              OUR SPONSORS
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Their support makes innovation possible. Together, we're building the future of robotics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
            {[{ name: 'Wakeland High School', image: '/data/sponsors/whs.png' },{ name: 'Wakeland High School NHS', image: '/data/sponsors/nhs.png' }].map((sponsor, idx) => (
              <div key={idx} id={`sponsor-${idx}`} data-animate
                   className={`relative group transition-all duration-700 ${isVisible[`sponsor-${idx}`] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
                   style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-4 translate-y-4"
                     style={{ clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)' }} />
                <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]"
                     style={{ clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)' }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                       style={{ boxShadow: 'inset 0 0 35px rgba(255,90,31,0.4)' }} />
                  <div className="relative z-10">
                    <SponsorCard sponsor={sponsor} />
                    <h3 className="text-white font-black text-2xl text-center group-hover:text-orange-500 transition-colors duration-300">{sponsor.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div id="become-sponsor" data-animate
               className={`relative max-w-4xl mx-auto transition-all duration-700 ${isVisible['become-sponsor'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
               style={{ transitionDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-blue-900/30 transform translate-x-4 translate-y-4"
                 style={{ clipPath: 'polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,0 100%)' }} />
            <div className="relative bg-gradient-to-br from-orange-900/40 to-blue-900/40 p-12 md:p-16 text-center border-4 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]"
                 style={{ clipPath: 'polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,0 100%)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                   style={{ boxShadow: 'inset 0 0 50px rgba(255,90,31,0.5)' }} />
              <div className="relative z-10">
                <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>BECOME A SPONSOR</h2>
                <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">Join us in empowering the next generation of engineers and innovators. Your support directly impacts our ability to compete and excel.</p>
                <AngleButton onClick={() => setCurrentPage('contact')} variant="primary" className="text-lg px-12 py-5">PARTNER WITH US <ChevronRight size={24} /></AngleButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (displayPage === 'contact') return (
      <div className="min-h-screen bg-gradient-to-b from-[#132038] to-[#0a1628] py-32 relative overflow-hidden">
        <ClawMarkImage opacity={0.12} className="bottom-0 right-0 w-[850px] h-[850px]" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div id="contact-tag" data-animate className={`inline-block mb-6 transition-all duration-700 ${isVisible['contact-tag'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}>
              <div className="px-6 py-2 bg-orange-600/20 border-2 border-orange-600" style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }}>
                <span className="text-orange-500 font-black text-sm tracking-widest">CONNECT</span>
              </div>
            </div>
            <h1 id="contact-title" data-animate
                className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-700 ${isVisible['contact-title'] ? 'animate-lock-in' : 'opacity-0 translate-x-[-40px]'}`}
                style={{ fontFamily: 'system-ui,-apple-system,sans-serif', transitionDelay: '100ms' }}>
              GET IN TOUCH
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>Questions? Sponsorship opportunities? Let's talk.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div id="contact-info" data-animate className={`space-y-6 transition-all duration-700 ${isVisible['contact-info'] ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
              {[
                { icon: Mail,   title: 'EMAIL',        content: 'ftc33791@gmail.com' },
                { icon: MapPin, title: 'LOCATION',     content: 'Wakeland High School\nFrisco, Texas' },
                { icon: Users,  title: 'SOCIAL MEDIA', content: null },
              ].map((item, idx) => (
                <div key={idx} className="relative group"
                     style={{ animation: 'growIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards', animationDelay: `${idx * 100}ms`, opacity: 0 }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-2 translate-y-2"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)' }} />
                  <div className="relative bg-[#1a2847] p-8 border-2 border-[#A2A9B1] hover:border-orange-600 transition-all duration-500 hover:scale-[1.03]"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                         style={{ boxShadow: 'inset 0 0 30px rgba(255,90,31,0.5)' }} />
                    <div className="relative z-10">
                      <item.icon className="text-orange-500 mb-4" size={32} />
                      <h3 className="text-white font-black text-lg mb-3 tracking-wider">{item.title}</h3>
                      {item.content
                        ? <p className="text-gray-300 whitespace-pre-line">{item.content}</p>
                        : (
                          <div className="flex gap-4">
                            {[[Github,'https://github.com/wolverine-robotics'],[Linkedin,'https://www.linkedin.com/company/wolverine-robotics/'],[Instagram,'https://www.instagram.com/wolverine_robotics/']].map(([Icon, href], i) => (
                              <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                                 className="w-12 h-12 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125 relative group"
                                 style={{ clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)' }}>
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
            <div id="contact-form" data-animate
                 className={`relative transition-all duration-700 ${isVisible['contact-form'] ? 'animate-grow-in' : 'opacity-0 scale-[0.85]'}`}
                 style={{ transitionDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/20 transform translate-x-3 translate-y-3"
                   style={{ clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)' }} />
              <div className="relative bg-[#1a2847] p-8 border-2 border-orange-600 group hover:border-orange-500 transition-all duration-500 hover:scale-[1.02]"
                   style={{ clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
                     style={{ boxShadow: 'inset 0 0 35px rgba(255,90,31,0.4)' }} />
                <form className="space-y-6 relative z-10">
                  {[['NAME','text','500ms'],['EMAIL','email','600ms']].map(([label,type,delay]) => (
                    <div key={label} className="animate-fade-in-up" style={{ animationDelay: delay }}>
                      <label className="block text-white font-bold text-sm mb-2 tracking-wider">{label}</label>
                      <input type={type} className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300"
                             style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }} />
                    </div>
                  ))}
                  <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                    <label className="block text-white font-bold text-sm mb-2 tracking-wider">MESSAGE</label>
                    <textarea rows="6" className="w-full px-4 py-4 bg-[#0f1629] text-white border-2 border-[#A2A9B1] focus:border-orange-600 focus:outline-none transition-colors duration-300 resize-none"
                              style={{ clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)' }} />
                  </div>
                  <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
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
      <div className={`min-h-[100dvh] ${transitionPhase === 'out' ? 'animate-claw-slash-out' : transitionPhase === 'in' ? 'animate-claw-slash-in' : ''}`}
           style={{ willChange: transitionPhase !== 'none' ? 'clip-path,opacity' : 'auto' }}>

        {/* NAV */}
        <nav className="fixed top-0 w-full bg-[#0a1628]/98 backdrop-blur-md border-b-2 border-orange-600 z-50 shadow-lg shadow-orange-600/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
                <div className="transform group-hover:scale-110 transition-transform duration-300"><LogoImage /></div>
                <div>
                  <h1 className="text-white font-black text-lg tracking-wider group-hover:text-orange-500 transition-colors duration-300" style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>WOLVERINE</h1>
                  <p className="text-orange-500 text-xs font-black tracking-widest">TEAM 33791</p>
                </div>
              </div>
              <div className="hidden md:flex gap-8">
                {navigation.map(item => (
                  <button key={item.id} onClick={() => setCurrentPage(item.id)}
                          className={`text-sm font-black tracking-wider transition-all duration-300 relative group ${currentPage === item.id ? 'text-orange-500 scale-110' : 'text-white hover:text-orange-500 hover:scale-110'}`}>
                    {item.name}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-orange-600 transition-all duration-300 ${currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </button>
                ))}
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden text-white hover:text-orange-500 transition-colors duration-300 hover:scale-110">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#0f1629] border-t-2 border-orange-600">
              <div className="flex flex-col">
                {navigation.map((item, idx) => (
                  <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                          className={`px-6 py-4 text-left font-black tracking-wider transition-all duration-300 border-b border-orange-600/20 ${currentPage === item.id ? 'text-orange-500 bg-orange-600/10' : 'text-white hover:bg-orange-600/5'}`}
                          style={{ animationDelay: `${idx * 50}ms` }}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="pt-20">{renderPage()}</div>

        {/* FOOTER */}
        <footer className="bg-[#0a1628] border-t-2 border-orange-600 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-white font-black text-xl mb-4">WOLVERINE ROBOTICS</h3>
                <p className="text-gray-400">FTC Team 33791</p>
                <p className="text-gray-400">Frisco, Texas</p>
              </div>
              <div>
                <h3 className="text-white font-black text-xl mb-4">QUICK LINKS</h3>
                <div className="flex flex-col gap-2">
                  {navigation.map(item => (
                    <button key={item.id} onClick={() => setCurrentPage(item.id)}
                            className="text-gray-400 hover:text-orange-500 text-left transition-colors duration-300 hover:translate-x-2">
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-black text-xl mb-4">CONNECT</h3>
                <div className="flex gap-4">
                  {[[Github,'https://github.com/wolverine-robotics'],[Linkedin,'https://www.linkedin.com/company/wolverine-robotics/'],[Instagram,'https://www.instagram.com/wolverine_robotics/']].map(([Icon, href], i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                       className="w-10 h-10 bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-125"
                       style={{ clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)' }}>
                      <Icon className="text-white" size={20} />
                    </a>
                  ))}
                </div>
              </div>
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
