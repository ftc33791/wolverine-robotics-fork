import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MATCH_FIELDS, defaultMatchData } from './season.js';

const GROUPS = [...new Set(MATCH_FIELDS.map(f => f.group))];

function Counter({ value, step = 1, onChange, label }) {
  const set = (v) => onChange(Math.max(0, v));
  return (
    <div className="sc2-counter" role="group" aria-label={label}>
      <button type="button" onClick={() => set(value - step)} aria-label={`Decrease ${label}`}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => set(value + step)} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}

function Segmented({ options, value, onChange, labelFn, badFn }) {
  return (
    <div className="sc2-seg">
      {options.map(o => (
        <button type="button" key={String(o)} aria-pressed={value === o} data-bad={badFn ? badFn(o) : undefined} onClick={() => onChange(o)}>
          {labelFn ? labelFn(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

/** Tap "Lap" each time the robot finishes a cycle; the average fills the field. */
function CycleTimer({ onUse }) {
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const lastRef = useRef(0);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => tick(n => n + 1), 200);
    return () => clearInterval(t);
  }, [running]);

  const avg = laps.length ? laps.reduce((a, b) => a + b, 0) / laps.length : null;
  const elapsed = running ? (Date.now() - lastRef.current) / 1000 : 0;

  const start = () => { lastRef.current = Date.now(); setRunning(true); };
  const lap = () => {
    const now = Date.now();
    setLaps(l => [...l, (now - lastRef.current) / 1000]);
    lastRef.current = now;
  };
  const reset = () => { setRunning(false); setLaps([]); };

  return (
    <div className="sc2-timer">
      {!running
        ? <button type="button" className="sc2-btn small" onClick={start}>Start timer</button>
        : <button type="button" className="sc2-btn small primary" onClick={lap}>Cycle done · {elapsed.toFixed(1)}s</button>}
      <span>{laps.length} cycles{avg !== null ? ` · avg ${avg.toFixed(1)}s` : ''}</span>
      {avg !== null && <button type="button" className="sc2-btn small" onClick={() => onUse(avg.toFixed(1))}>Use average</button>}
      {(running || laps.length > 0) && <button type="button" className="sc2-btn small danger" onClick={reset}>Reset</button>}
    </div>
  );
}

export default function MatchForm({ store, event, scouter }) {
  const [matchNo, setMatchNo] = useState('');
  const [team, setTeam] = useState('');
  const [alliance, setAlliance] = useState('red');
  const [data, setData] = useState(defaultMatchData);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState(null); // { text, err }
  const [timerKey, setTimerKey] = useState(0);

  const set = (key, v) => setData(d => ({ ...d, [key]: v }));

  const recent = useMemo(
    () => [...store.matches].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8),
    [store.matches],
  );

  const resetForm = (nextMatch) => {
    setData(defaultMatchData());
    setEditingId(null);
    setTimerKey(k => k + 1);
    if (nextMatch !== undefined) setMatchNo(String(nextMatch));
  };

  const submit = (e) => {
    e.preventDefault();
    const m = Number.parseInt(matchNo, 10);
    const t = Number.parseInt(team, 10);
    if (!scouter) return setMsg({ err: true, text: 'Enter your name at the top of the page first.' });
    if (!Number.isInteger(m) || m < 1) return setMsg({ err: true, text: 'Enter the match number.' });
    if (!Number.isInteger(t) || t < 1 || t > 999999) return setMsg({ err: true, text: 'Enter a valid team number.' });

    let id = editingId;
    let owner = scouter;
    const dupe = store.matches.find(r => r.team === t && r.data.matchNo === m && r.id !== editingId);
    if (dupe) {
      const ok = window.confirm(`Match ${m} · team ${t} was already scouted by ${dupe.data.scouter || 'someone'}. Replace their entry?`);
      if (!ok) return;
      id = dupe.id; owner = dupe.data.scouter || scouter;
    } else if (editingId) {
      owner = store.matches.find(r => r.id === editingId)?.data.scouter || scouter;
    }

    const cycle = data.cycleSec === '' ? '' : Number(data.cycleSec);
    store.saveMatch(t, { ...data, cycleSec: Number.isFinite(cycle) ? cycle : '', notes: data.notes.trim(), matchNo: m, alliance, scouter: owner }, id);
    setMsg({ text: `Saved match ${m} · team ${t}${store.status === 'synced' ? '' : ' (on this device, will sync)'}` });
    resetForm(m + 1);
  };

  const edit = (r) => {
    setMatchNo(String(r.data.matchNo)); setTeam(String(r.team)); setAlliance(r.data.alliance || 'red');
    setData({ ...defaultMatchData(), ...r.data }); setEditingId(r.id); setTimerKey(k => k + 1);
    setMsg({ text: `Editing match ${r.data.matchNo} · team ${r.team}` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = (r) => {
    if (window.confirm(`Delete match ${r.data.matchNo} · team ${r.team}?`)) store.remove(r.id);
  };

  if (!store.enabled) {
    return <p className="sc2-empty">Enter an event code above to start scouting matches.</p>;
  }

  const renderField = (f) => {
    const v = data[f.key];
    switch (f.type) {
      case 'counter': return <Counter value={v} step={f.step} label={f.label} onChange={x => set(f.key, x)} />;
      case 'toggle':  return <Segmented options={[true, false]} value={v} labelFn={o => (o ? 'Yes' : 'No')} onChange={x => set(f.key, x)} />;
      case 'select':  return <Segmented options={f.options} value={v} onChange={x => set(f.key, x)} badFn={f.key === 'robotIssue' ? (o => o !== 'None') : undefined} />;
      case 'rating':  return <Segmented options={f.labels.map((_, i) => i)} value={v} labelFn={i => f.labels[i]} onChange={x => set(f.key, x)} />;
      case 'cycle':   return (
        <div>
          <input className="sc2-input" type="number" inputMode="decimal" min="0" step="0.1" value={v} style={{ width: 110 }}
            onChange={e => set(f.key, e.target.value)} aria-label={f.label} />
        </div>
      );
      default: return null;
    }
  };

  return (
    <form className="sc2-form" onSubmit={submit} noValidate>
      <div className="sc2-group">
        <h3>MATCH</h3>
        <div className="sc2-row">
          <label htmlFor="sc2-match">Match number</label>
          <input id="sc2-match" className="sc2-input" type="number" inputMode="numeric" min="1" value={matchNo} onChange={e => setMatchNo(e.target.value)} style={{ width: 110 }} />
        </div>
        <div className="sc2-row">
          <label htmlFor="sc2-team">Team number</label>
          <input id="sc2-team" className="sc2-input" type="number" inputMode="numeric" min="1" value={team} onChange={e => setTeam(e.target.value)} style={{ width: 130 }} />
        </div>
        <div className="sc2-row">
          <span className="sc2-label">Alliance</span>
          <Segmented options={['red', 'blue']} value={alliance} onChange={setAlliance} labelFn={o => o[0].toUpperCase() + o.slice(1)} />
        </div>
      </div>

      {GROUPS.map(g => (
        <div className="sc2-group" key={g}>
          <h3>{g.toUpperCase()}</h3>
          {MATCH_FIELDS.filter(f => f.group === g).map(f => (
            f.type === 'text' ? (
              <div className="sc2-row stack" key={f.key}>
                <label htmlFor={`sc2-${f.key}`}>{f.label}</label>
                <textarea id={`sc2-${f.key}`} className="sc2-textarea" value={data[f.key]} maxLength={1000}
                  placeholder="Anything the numbers miss: driver skill, what broke, strategy…" onChange={e => set(f.key, e.target.value)} />
              </div>
            ) : (
              <div className="sc2-row" key={f.key}>
                <span className="sc2-label">{f.label}</span>
                <div>
                  {renderField(f)}
                  {f.type === 'cycle' && <CycleTimer key={timerKey} onUse={x => set(f.key, x)} />}
                </div>
              </div>
            )
          ))}
        </div>
      ))}

      {msg && <div className={`sc2-toast${msg.err ? ' err' : ''}`} role="status">{msg.text}</div>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" className="sc2-btn primary">{editingId ? 'Update entry' : 'Save entry'}</button>
        {editingId && <button type="button" className="sc2-btn" onClick={() => { resetForm(); setMsg(null); }}>Cancel edit</button>}
      </div>

      {recent.length > 0 && (
        <div className="sc2-recent">
          <h3>RECENT ENTRIES · EVERYONE</h3>
          <ul style={{ padding: 0, margin: 0 }}>
            {recent.map(r => (
              <li key={r.id}>
                <span>M{r.data.matchNo} · #{r.team} · {r.data.scouter || '?'}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="sc2-btn small" onClick={() => edit(r)}>Edit</button>
                  <button type="button" className="sc2-btn small danger" onClick={() => del(r)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
