import React, { useState } from 'react';

const ago = (ts) => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/** Notes for one team, shared with everyone on the same event. Also shows notes typed on match forms. */
export default function TeamNotes({ store, team, author }) {
  const [text, setText] = useState('');
  const items = [
    ...store.notes.filter(n => n.team === team).map(n => ({
      id: n.id, ts: n.updatedAt, who: n.data.author, body: n.data.text, own: n.data.author === author, src: 'note',
    })),
    ...store.matches.filter(m => m.team === team && m.data.notes).map(m => ({
      id: m.id, ts: m.updatedAt, who: m.data.scouter, body: m.data.notes, own: false, src: `Match ${m.data.matchNo}`,
    })),
  ].sort((a, b) => b.ts - a.ts);

  const add = () => {
    if (!text.trim() || !store.enabled) return;
    store.addNote(team, text, author);
    setText('');
  };

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>
        TEAM NOTES · SHARED
      </p>
      {items.length === 0
        ? <p className="sc2-empty">No notes for this team yet.</p>
        : (
          <div className="sc2-notes">
            {items.map(n => (
              <div key={n.id} className={`sc2-note${n.src === 'note' ? '' : ' fromMatch'}`}>
                <small>
                  <span>{n.who || 'Anonymous'}{n.src === 'note' ? '' : ` · ${n.src}`} · {ago(n.ts)}</span>
                  {n.own && <button onClick={() => store.remove(n.id)} aria-label="Delete note" title="Delete note">✕</button>}
                </small>
                {n.body}
              </div>
            ))}
          </div>
        )}
      {store.enabled ? (
        <>
          <textarea className="sc2-textarea" value={text} onChange={e => setText(e.target.value)} maxLength={1000}
            placeholder={author ? 'Add a note everyone on the team will see…' : 'Enter your name at the top of the page to add a note'}
            disabled={!author} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="sc2-btn small" onClick={add} disabled={!text.trim() || !author}>Add note</button>
          </div>
        </>
      ) : <p className="sc2-empty">Enter an event code at the top of the page to add notes.</p>}
    </div>
  );
}
