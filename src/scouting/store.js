// ─────────────────────────────────────────────────────────────────────────────
//  store.js — local-first scouting store with team sync.
//
//  • Every save lands in localStorage first, so scouting keeps working with bad
//    venue wifi. Dirty records are pushed to /api/scout when a connection exists.
//  • Records are pulled every few seconds (incremental, by server timestamp) and
//    merged by `updatedAt` (newest edit wins per record).
//  • Notes are separate append-only records, so two people never overwrite each
//    other's notes. Deletes are tombstones (`deleted: true`) so they sync too.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LS = 'scout:v1:';
const PASS_KEY = 'scout:passcode';
const NAME_KEY = 'scout:name';
const POLL_MS = 5000;
const PUSH_CHUNK = 100;

const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage full/blocked */ } };

export const getSavedName = () => lsGet(NAME_KEY) || '';
export const saveName = (n) => lsSet(NAME_KEY, n.trim().slice(0, 40));
export const getSavedPasscode = () => lsGet(PASS_KEY) || '';

export const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

const empty = () => ({ records: {}, dirty: [], cursor: 0 });

function load(key) {
  if (!key) return empty();
  try {
    const p = JSON.parse(lsGet(key) || 'null');
    if (p && typeof p === 'object') return { records: p.records || {}, dirty: p.dirty || [], cursor: p.cursor || 0 };
  } catch { /* corrupt → start fresh */ }
  return empty();
}

/** Pure merge of server records into local state (exported for tests). */
export function mergeIncoming(state, incoming) {
  const records = { ...state.records };
  let cursor = state.cursor;
  incoming.forEach(r => {
    if (typeof r.serverTs === 'number' && r.serverTs > cursor) cursor = r.serverTs;
    const local = records[r.id];
    const localDirty = state.dirty.includes(r.id);
    if (!local || r.updatedAt > local.updatedAt || (!localDirty && r.updatedAt >= local.updatedAt)) {
      records[r.id] = r;
    }
  });
  return { ...state, records, cursor };
}

async function api(path, passcode, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'x-team-passcode': encodeURIComponent(passcode), ...(opts.headers || {}) },
  });
  if (res.status === 401) throw Object.assign(new Error('auth'), { code: 'auth' });
  if (res.status === 503) throw Object.assign(new Error('unconfigured'), { code: 'unconfigured' });
  if (!res.ok) throw Object.assign(new Error(`http ${res.status}`), { code: 'error' });
  return res.json();
}

/**
 * status: 'local' (no event / no passcode) | 'syncing' | 'synced' | 'offline' | 'auth' | 'unconfigured' | 'error'
 */
export function useScoutStore(season, event) {
  const key = season && event ? `${LS}${season}:${event}` : null;
  const keyRef = useRef(key);
  const [state, setState] = useState(() => load(key));
  const stateRef = useRef(state);
  const busy = useRef(false);
  const [status, setStatus] = useState('local');
  const [lastSync, setLastSync] = useState(0);

  const commit = useCallback((next) => {
    stateRef.current = next;
    if (keyRef.current) lsSet(keyRef.current, JSON.stringify(next));
    setState(next);
  }, []);

  // Switching season/event loads that event's local data.
  useEffect(() => {
    keyRef.current = key;
    const s = load(key);
    stateRef.current = s;
    setState(s);
    setStatus('local');
  }, [key]);

  const sync = useCallback(async () => {
    const k = keyRef.current;
    const pass = getSavedPasscode();
    if (!k || busy.current) return;
    if (!pass) { setStatus('local'); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus('offline'); return; }
    busy.current = true;
    setStatus('syncing');
    try {
      // 1) push dirty records
      let s = stateRef.current;
      for (let i = 0; i < s.dirty.length; i += PUSH_CHUNK) {
        const ids = s.dirty.slice(i, i + PUSH_CHUNK);
        const batch = ids.map(id => s.records[id]).filter(Boolean);
        if (batch.length) await api('/api/scout', pass, { method: 'POST', body: JSON.stringify({ records: batch }) });
        if (keyRef.current !== k) return;
        // Only clear records that weren't edited again while the request was in flight.
        const cur = stateRef.current;
        const sent = new Map(batch.map(r => [r.id, r.updatedAt]));
        commit({ ...cur, dirty: cur.dirty.filter(id => !(sent.has(id) && cur.records[id]?.updatedAt === sent.get(id))) });
      }
      // 2) pull everything newer than our cursor
      const [seasonId, ...rest] = k.slice(LS.length).split(':');
      const ev = rest.join(':');
      for (let guard = 0; guard < 20; guard++) {
        const cur = stateRef.current;
        const out = await api(`/api/scout?season=${encodeURIComponent(seasonId)}&event=${encodeURIComponent(ev)}&since=${cur.cursor}`, pass);
        if (keyRef.current !== k) return;
        commit(mergeIncoming(stateRef.current, out.records || []));
        if (!out.more) break;
      }
      setStatus('synced');
      setLastSync(Date.now());
    } catch (err) {
      if (keyRef.current === k) setStatus(err.code || 'offline');
    } finally {
      busy.current = false;
    }
  }, [commit]);

  // Sync on mount/key change, on a timer, and when the tab/network comes back.
  useEffect(() => {
    if (!key) return undefined;
    sync();
    const t = setInterval(() => { if (document.visibilityState === 'visible') sync(); }, POLL_MS);
    const wake = () => sync();
    window.addEventListener('online', wake);
    window.addEventListener('focus', wake);
    return () => { clearInterval(t); window.removeEventListener('online', wake); window.removeEventListener('focus', wake); };
  }, [key, sync]);

  const upsert = useCallback((rec) => {
    const cur = stateRef.current;
    const full = { ...rec, season, event, updatedAt: Date.now() };
    commit({
      ...cur,
      records: { ...cur.records, [full.id]: full },
      dirty: cur.dirty.includes(full.id) ? cur.dirty : [...cur.dirty, full.id],
    });
    setTimeout(sync, 50);
    return full;
  }, [commit, season, event, sync]);

  const saveMatch = useCallback((team, data, id) =>
    upsert({ id: id || newId(), kind: 'match', team: Number(team), data, deleted: false }), [upsert]);

  const addNote = useCallback((team, text, author) =>
    upsert({ id: newId(), kind: 'note', team: Number(team), data: { text: text.trim().slice(0, 1000), author: author || 'Anonymous' }, deleted: false }), [upsert]);

  const remove = useCallback((id) => {
    const r = stateRef.current.records[id];
    if (r) upsert({ ...r, deleted: true });
  }, [upsert]);

  const setPasscode = useCallback((p) => { lsSet(PASS_KEY, p.trim()); setTimeout(sync, 0); }, [sync]);

  const { matches, notes } = useMemo(() => {
    const live = Object.values(state.records).filter(r => !r.deleted);
    return {
      matches: live.filter(r => r.kind === 'match'),
      notes: live.filter(r => r.kind === 'note').sort((a, b) => b.updatedAt - a.updatedAt),
    };
  }, [state.records]);

  return {
    enabled: !!key, status, lastSync, pending: state.dirty.length,
    matches, notes, saveMatch, addNote, remove, setPasscode, sync,
  };
}
