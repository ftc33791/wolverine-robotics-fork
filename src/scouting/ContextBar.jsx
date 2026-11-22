import React, { useState } from 'react';
import { SEASONS } from './season.js';
import { getSavedPasscode, saveName } from './store.js';

const STATUS = {
  local:        ['LOCAL ONLY', 'warn'],
  syncing:      ['SYNCING…', 'warn'],
  synced:       ['SYNCED', 'good'],
  offline:      ['OFFLINE · SAVED ON THIS DEVICE', 'warn'],
  auth:         ['WRONG PASSCODE', 'bad'],
  unconfigured: ['SYNC NOT SET UP · SAVING ON THIS DEVICE', 'bad'],
  error:        ['SYNC ERROR · WILL RETRY', 'bad'],
};

export function SyncChip({ store, hasEvent }) {
  let [label, tone] = STATUS[store.status] || STATUS.local;
  if (!hasEvent) { label = 'ENTER AN EVENT CODE'; tone = 'warn'; }
  else if (store.status === 'local' && !getSavedPasscode()) label = 'LOCAL ONLY · ADD TEAM PASSCODE TO SYNC';
  return (
    <span className="sc2-chip" data-tone={tone} role="status">
      {label}{store.pending > 0 && hasEvent ? ` · ${store.pending} TO SEND` : ''}
    </span>
  );
}

/** Season, event, scouter name and team passcode: shared by every scouting tab. */
export default function ContextBar({ season, setSeason, eventCode, setEventCode, name, setName, store, hasEvent }) {
  const [pass, setPass] = useState(getSavedPasscode());
  const commitPass = () => store.setPasscode(pass);

  return (
    <div className="sc2-bar">
      <label className="sc2-field">
        <span>SEASON</span>
        <select className="sc2-select" value={season} onChange={e => setSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label className="sc2-field">
        <span>EVENT CODE</span>
        <input className="sc2-input" value={eventCode} onChange={e => setEventCode(e.target.value)}
          placeholder="e.g. TXDAL" autoCapitalize="characters" autoCorrect="off" spellCheck={false} maxLength={24} style={{ width: 150 }} />
      </label>
      <label className="sc2-field">
        <span>YOUR NAME</span>
        <input className="sc2-input" value={name} onChange={e => { setName(e.target.value); saveName(e.target.value); }}
          placeholder="Shown on your notes" maxLength={40} autoComplete="given-name" style={{ width: 170 }} />
      </label>
      <label className="sc2-field">
        <span>TEAM PASSCODE</span>
        <input className="sc2-input" type="password" value={pass} onChange={e => setPass(e.target.value)}
          onBlur={commitPass} onKeyDown={e => { if (e.key === 'Enter') { commitPass(); e.currentTarget.blur(); } }}
          placeholder="Syncs with teammates" autoComplete="off" style={{ width: 170 }} />
      </label>
      <SyncChip store={store} hasEvent={hasEvent} />
    </div>
  );
}
