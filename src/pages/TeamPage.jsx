import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BlueField, Reveal, Block, Photo } from '../components/ui/Kit';

const MemberPhoto = ({ member, className = 'v-photo' }) => {
  const [err, setErr] = useState(false);
  return err
    ? <div className="flex h-full w-full items-center justify-center text-3xl font-medium" style={{ background: 'var(--tint-blue)' }}>{member.initials}</div>
    : <img src={member.image} alt={member.name} loading="lazy" className={className} onError={() => setErr(true)} />;
};

const MemberCard = ({ member, onClick, delay }) => (
  <Reveal delay={delay}>
    <button className="block w-full" onClick={() => onClick(member)}>
      <div className="v-ratio-34 rounded-xl" style={{ border: '1px solid var(--rule)' }}><MemberPhoto member={member} /></div>
      <p className="mt-3 text-[15px] font-medium">{member.name}</p>
      <p className="v-mono v-dim mt-1" style={{ fontSize: '.68rem', lineHeight: 1.5 }}>{member.roles.slice(0, 3).join(' · ')}</p>
    </button>
  </Reveal>
);

const MemberModal = ({ member, onClose }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 300, background: 'rgba(17,17,17,0.55)', backdropFilter: 'blur(6px)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full overflow-y-auto rounded-2xl text-center" style={{ maxWidth: 480, maxHeight: '90vh', background: 'var(--paper)', animation: 'fade-up 0.35s var(--ease-out-expo) both' }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white p-1.5" style={{ color: '#0a1cae' }} aria-label="Close"><X size={18} /></button>
        <div style={{ height: 260 }}><MemberPhoto member={member} /></div>
        <div className="px-8 pb-8 pt-6">
          <h2 className="v-h2" style={{ fontSize: '2rem' }}>{member.name}</h2>
          <p className="v-mono v-dim mt-2">{member.isPast ? 'ALUMNI · ' : ''}{member.season || '2025-26 Decode'}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">{member.roles.map((r) => <span key={r} className="v-chip">{r}</span>)}</div>
          {!member.isCoach && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[['YEARS IN FIRST', member.yearsInFirst], ['YEARS ON TEAM', member.yearsOnTeam], ['GRADE', member.grade]].map(([l, v]) => (
                <div key={l} className="rounded-lg border p-3" style={{ borderColor: 'var(--rule)', background: 'rgba(255,255,255,0.08)' }}>
                  <p className="v-mono v-dim" style={{ fontSize: '.6rem' }}>{l}</p>
                  <p className="v-h3 mt-1">{v ?? '—'}</p>
                </div>
              ))}
            </div>
          )}
          {member.bio && <p className="v-body mt-6" style={{ fontSize: '.95rem' }}>{member.bio}</p>}
        </div>
      </div>
    </div>
  );
};

const Group = ({ label, sub, members, onPick, children }) => (
  <div className="mb-20">
    <Reveal><h2 className="v-h2">{label}</h2><p className="v-mono v-dim mt-3 mb-10">{sub}</p></Reveal>
    <div className="v-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '2rem 1.25rem' }}>
      {members.map((m, i) => <MemberCard key={m.name} member={m} onClick={onPick} delay={i * 40} />)}
    </div>
    {children}
  </div>
);

const TeamPage = ({ teamMembers, pastMembers }) => {
  const [selected, setSelected] = useState(null);
  const [showPast, setShowPast] = useState(false);
  const count = teamMembers.roster.length + teamMembers.newMembers.length + teamMembers.extended.length;

  return (
    <div>
      {selected && <MemberModal member={selected} onClose={() => setSelected(null)} />}
      <BlueField hero>
        <p className="v-mono" style={{ opacity: 0.85 }}>TEAM 33791 · 2025-26 · {count} STUDENTS</p>
        <h1 className="v-h1 mt-6">The pack</h1>
        <p className="v-lead mx-auto mt-6" style={{ maxWidth: '30rem' }}>Click a card for details.</p>
      </BlueField>

      <Block>
        <Group label="Team roster" sub="THE ENGINEERS" members={teamMembers.roster} onPick={setSelected}>
          <div className="mt-16">
            <Reveal><h3 className="v-h3 mb-8">New members</h3></Reveal>
            <div className="v-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '2rem 1.25rem' }}>
              {teamMembers.newMembers.map((m, i) => <MemberCard key={m.name} member={m} onClick={setSelected} delay={i * 40} />)}
            </div>
          </div>
        </Group>
        <Group label="Extended roster" sub="THE WIDER PACK" members={teamMembers.extended} onPick={setSelected} />
        <Group label="Coaches" sub="THE LEADERS" members={teamMembers.coaches.map((c) => ({ ...c, isCoach: true }))} onPick={setSelected} />

        <div className="border-t pt-12" style={{ borderColor: 'var(--rule)' }}>
          <button onClick={() => setShowPast((v) => !v)} className="v-mono">{showPast ? '▲ HIDE' : '▼ SHOW'} ALUMNI{pastMembers.length ? ` (${pastMembers.length})` : ''}</button>
          {showPast && (
            <div className="mt-10">
              {pastMembers.length === 0
                ? <p className="v-mono v-dim">NO ALUMNI YET</p>
                : <Group label="Alumni" sub="FORMER MEMBERS" members={pastMembers.map((m) => ({ ...m, isPast: true }))} onPick={setSelected} />}
            </div>
          )}
        </div>
      </Block>
    </div>
  );
};

export default TeamPage;
