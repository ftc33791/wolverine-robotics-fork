import React, { useMemo, useState } from 'react';
import { MATCH_FIELDS } from './season.js';
import { OUR_TEAM } from './season.js'; // highlights our own row
import { TEAM_COLUMNS, aggregateTeams, formatCell, matchesToCSV } from './aggregate.js';
import TeamNotes from './TeamNotes.jsx';

function MatchLog({ rows }) {
  const cols = MATCH_FIELDS.filter(f => f.type !== 'text');
  return (
    <div className="sc2-tablewrap">
      <table className="sc2-table">
        <thead>
          <tr><th>Match</th>{cols.map(c => <th key={c.key} style={{ cursor: 'default' }}>{c.short}</th>)}<th style={{ cursor: 'default' }}>By</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ cursor: 'default' }}>
              <td className="team">{r.data.matchNo}</td>
              {cols.map(c => {
                const v = r.data[c.key];
                return <td key={c.key}>{c.type === 'toggle' ? (v ? 'Yes' : 'No') : c.type === 'rating' ? c.labels[v] ?? v : (v === '' || v === undefined ? '—' : String(v))}</td>;
              })}
              <td>{r.data.scouter || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeamData({ store, author }) {
  const [sortKey, setSortKey] = useState('team');
  const [asc, setAsc] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null); // team number

  const teams = useMemo(() => aggregateTeams(store.matches), [store.matches]);

  const view = useMemo(() => {
    const col = TEAM_COLUMNS.find(c => c.key === sortKey) || TEAM_COLUMNS[0];
    const q = query.trim();
    return teams
      .filter(t => !q || String(t.team).includes(q))
      .sort((a, b) => {
        const va = col.get(a), vb = col.get(b);
        // Missing values always sink to the bottom.
        if (va === null || va === '') return 1;
        if (vb === null || vb === '') return -1;
        const d = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
        return asc ? d : -d;
      });
  }, [teams, sortKey, asc, query]);

  const onSort = (key) => {
    if (key === sortKey) setAsc(a => !a);
    else { setSortKey(key); setAsc(key === 'team'); }
  };

  const download = () => {
    const blob = new Blob([matchesToCSV(store.matches)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scouting-${store.matches[0]?.season || ''}-${store.matches[0]?.event || 'event'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!store.enabled) return <p className="sc2-empty">Enter an event code above to see scouted teams.</p>;

  const openTeam = open !== null ? teams.find(t => t.team === open) : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <input className="sc2-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by team #" inputMode="numeric" style={{ width: 170 }} />
        <button className="sc2-btn small" onClick={download} disabled={store.matches.length === 0}>Export CSV</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'rgba(255,255,255,.4)' }}>
          {store.matches.length} entries · {teams.length} teams
        </span>
      </div>

      {teams.length === 0 ? (
        <p className="sc2-empty">Nothing scouted for this event yet. Entries from the Match Scout tab show up here.</p>
      ) : (
        <div className="sc2-tablewrap">
          <table className="sc2-table">
            <thead>
              <tr>
                {TEAM_COLUMNS.map(c => (
                  <th key={c.key} onClick={() => onSort(c.key)} aria-sort={sortKey === c.key ? (asc ? 'ascending' : 'descending') : undefined}>
                    {c.label}{sortKey === c.key ? (asc ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
                <th style={{ cursor: 'default' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {view.map(t => (
                <tr key={t.team} className={t.team === OUR_TEAM ? 'ours' : ''} onClick={() => setOpen(t.team)}>
                  {TEAM_COLUMNS.map(c => <td key={c.key} className={c.key === 'team' ? 'team' : ''}>{formatCell(c, t)}</td>)}
                  <td>{store.notes.filter(n => n.team === t.team).length + t.rows.filter(r => r.data.notes).length || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openTeam && (
        <div className="sc2-modal" onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div role="dialog" aria-modal="true" aria-label={`Team ${openTeam.team}`}>
            <header>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.1em', color: '#FF5A1F' }}>SCOUTED TEAM</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>#{openTeam.team}</h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'rgba(255,255,255,.4)' }}>{openTeam.n} matches scouted</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" style={{ color: '#fff', fontSize: '1.3rem', background: 'none', border: 0, cursor: 'pointer' }}>✕</button>
            </header>
            <section><MatchLog rows={openTeam.rows} /></section>
            <section><TeamNotes store={store} team={openTeam.team} author={author} /></section>
          </div>
        </div>
      )}
    </div>
  );
}
