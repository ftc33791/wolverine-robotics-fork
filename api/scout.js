// api/scout.js — Vercel serverless function: shared scouting storage.
//
//   GET  /api/scout?season=2026&event=TXDAL&since=0   → { records, cursor, more }
//   POST /api/scout   { records: [...] }              → { ok, count }
//
// Every request must carry the team passcode in the `x-team-passcode` header.
// Env vars (Vercel → Settings → Environment Variables):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY, TEAM_PASSCODE
import crypto from 'node:crypto';

const PAGE = 500;
const MAX_BATCH = 100;
const MAX_DATA_CHARS = 4000;
const KINDS = new Set(['match', 'note']);

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function readPasscode(req) {
  const raw = req.headers['x-team-passcode'];
  if (typeof raw !== 'string') return '';
  try { return decodeURIComponent(raw); } catch { return raw; }
}

function cleanRecord(r) {
  if (!r || typeof r !== 'object') return null;
  const { id, kind, season, event, team, data, updatedAt, deleted } = r;
  if (typeof id !== 'string' || !/^[\w-]{8,64}$/.test(id)) return null;
  if (!KINDS.has(kind)) return null;
  if (typeof season !== 'string' || !/^\d{4}$/.test(season)) return null;
  if (typeof event !== 'string' || !/^[A-Za-z0-9_-]{2,24}$/.test(event)) return null;
  if (!Number.isInteger(team) || team < 1 || team > 999999) return null;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (JSON.stringify(data).length > MAX_DATA_CHARS) return null;
  if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null;
  return { id, kind, season, event_code: event.toUpperCase(), team, data, updated_at: Math.floor(updatedAt), deleted: deleted === true };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, TEAM_PASSCODE } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TEAM_PASSCODE) {
    return res.status(503).json({ error: 'not_configured' });
  }
  if (!safeEqual(readPasscode(req), TEAM_PASSCODE)) {
    await sleep(400); // slows down passcode guessing
    return res.status(401).json({ error: 'bad_passcode' });
  }

  const base = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/scout_records`;
  const auth = { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` };

  try {
    if (req.method === 'GET') {
      const season = String(req.query.season || '');
      const event = String(req.query.event || '').toUpperCase();
      const since = Number.parseInt(req.query.since, 10) || 0;
      if (!/^\d{4}$/.test(season) || !/^[A-Z0-9_-]{2,24}$/.test(event) || since < 0) {
        return res.status(400).json({ error: 'bad_query' });
      }
      const url = `${base}?select=id,kind,season,event_code,team,data,updated_at,deleted,server_ts`
        + `&season=eq.${season}&event_code=eq.${encodeURIComponent(event)}`
        + `&server_ts=gte.${since}&order=server_ts.asc&limit=${PAGE}`;
      const up = await fetch(url, { headers: auth });
      if (!up.ok) return res.status(502).json({ error: 'storage_error' });
      const rows = await up.json();
      const records = rows.map(r => ({
        id: r.id, kind: r.kind, season: r.season, event: r.event_code, team: r.team,
        data: r.data, updatedAt: Number(r.updated_at), deleted: r.deleted, serverTs: Number(r.server_ts),
      }));
      return res.status(200).json({
        records,
        cursor: records.length ? records[records.length - 1].serverTs : since,
        more: rows.length === PAGE,
      });
    }

    if (req.method === 'POST') {
      const list = Array.isArray(req.body?.records) ? req.body.records : null;
      if (!list || list.length === 0 || list.length > MAX_BATCH) return res.status(400).json({ error: 'bad_batch' });
      const serverTs = Date.now();
      const rows = list.map(cleanRecord);
      if (rows.some(r => r === null)) return res.status(400).json({ error: 'bad_record' });
      const up = await fetch(`${base}?on_conflict=id`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows.map(r => ({ ...r, server_ts: serverTs }))),
      });
      if (!up.ok) return res.status(502).json({ error: 'storage_error' });
      return res.status(200).json({ ok: true, count: rows.length });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch {
    return res.status(502).json({ error: 'storage_unreachable' });
  }
}
