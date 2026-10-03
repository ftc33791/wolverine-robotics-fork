import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const transforms = { up: 'translateY(36px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.9)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : (transforms[direction] || transforms.up),
      transition: `opacity 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

const MemberPhoto = ({ member, size = 'small' }) => {
  const [err, setErr] = useState(false);
  const fontSize = size === 'large' ? 'text-4xl' : 'text-2xl';
  return err ? (
    <div className={`w-full h-full flex items-center justify-center font-black text-white ${fontSize}`}
      style={{ background: 'linear-gradient(135deg, #0f1e35, #1a3050)' }}>
      {member.initials}
    </div>
  ) : (
    <img src={member.image} alt={member.name} className="w-full h-full object-cover"
      onError={() => setErr(true)} />
  );
};

const MemberCard = ({ member, onClick, delay }) => (
  <Reveal delay={delay} direction="scale">
    <div
      className="relative group cursor-pointer"
      onClick={() => onClick(member)}
    >
      <div
        className="relative overflow-hidden border transition-all duration-500 group-hover:scale-[1.03]"
        style={{
          aspectRatio: '3/4',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
          borderColor: 'rgba(255,90,31,0.1)',
          background: '#0a1628',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.1)'; }}
      >
        <MemberPhoto member={member} size="large" />

        {/* Always-visible name bar at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ background: 'linear-gradient(to top, rgba(6,16,32,0.97) 0%, rgba(6,16,32,0.6) 60%, transparent 100%)' }}
        >
          <p className="text-white text-[13px] font-bold leading-tight">{member.name}</p>
          {/* Top 3 roles on the card; all roles are in the pop-up. */}
          <p
            className="text-[9px] tracking-widest uppercase mt-1 leading-relaxed"
            style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
          >
            {member.roles.slice(0, 3).join(' · ')}
          </p>
        </div>


        {/* Hover: details icon */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="text-[8px] tracking-widest uppercase px-2 py-1"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'rgba(6,16,32,0.85)',
              color: 'rgba(255,255,255,0.5)',
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
            }}
          >
            CLICK FOR BIO
          </div>
        </div>
      </div>
    </div>
  </Reveal>
);

const MemberModal = ({ member, onClose }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', animation: 'fade-in 0.3s ease both' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden border"
        style={{
          background: '#0a1628',
          borderColor: 'rgba(255,90,31,0.25)',
          clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)',
          animation: 'fade-up 0.4s var(--ease-out-expo) both',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 z-10 text-white hover:text-[#FF5A1F] transition-colors duration-200"
        >
          <X size={20} />
        </button>

        {/* Header image */}
        <div className="relative" style={{ height: 260 }}>
          <MemberPhoto member={member} size="large" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #0a1628 5%, rgba(10,22,40,0.3) 50%, transparent 80%)' }}
          />
          {member.isPast && (
            <div
              className="absolute top-3 left-3 px-3 py-1 text-[9px] font-semibold tracking-widest uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(100,116,139,0.8)',
                color: '#fff',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}
            >
              ALUMNI
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <h2
            className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {member.name}
          </h2>
          <p
            className="text-[10px] tracking-widest uppercase mb-6"
            style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
          >
            {member.season || '2025-26 Decode'}
          </p>

          {/* Roles */}
          <div className="mb-5">
            <p
              className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
            >
              ROLES
            </p>
            <div className="flex flex-wrap gap-2">
              {member.roles.map((r, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-[10px] font-semibold tracking-wider border"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                    background: 'rgba(255,90,31,0.07)',
                    borderColor: 'rgba(255,90,31,0.2)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Facts: not filled in yet show as a dash. */}
          {member.roles && !member.isCoach && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                ['YEARS IN FIRST', member.yearsInFirst],
                ['YEARS ON TEAM', member.yearsOnTeam],
                ['GRADE', member.grade],
              ].map(([label, value]) => (
                <div key={label} className="px-3 py-3 border" style={{ borderColor: 'rgba(255,90,31,0.15)', background: 'rgba(255,90,31,0.04)' }}>
                  <p className="text-[8px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                  <p className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>{value ?? '—'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bio */}
          {member.bio && (
            <div>
              <p
                className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-3"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
              >
                ABOUT
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {member.bio}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const GroupSection = ({ group, onMemberClick }) => (
  <div className="mb-24">
    <Reveal delay={0}>
      <div className="flex items-center gap-5 mb-2">
        <h2
          className="text-3xl font-black text-white uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {group.label}
        </h2>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,90,31,0.4), transparent)' }} />
      </div>
      <p
        className="text-[10px] tracking-[0.22em] uppercase mb-10"
        style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
      >
        {group.sub}
      </p>
    </Reveal>
    <MemberGrid members={group.members} onMemberClick={onMemberClick} />
    {(group.subsections || []).map((sub) => (
      <div key={sub.label} className="mt-16">
        <Reveal>
          <h3
            className="text-xl font-black text-white uppercase tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {sub.label}
          </h3>
        </Reveal>
        <MemberGrid members={sub.members} onMemberClick={onMemberClick} />
      </div>
    ))}
  </div>
);

// More room between cards than before (Dev, 2026-10-02).
const MemberGrid = ({ members, onMemberClick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 sm:gap-x-10 sm:gap-y-12">
    {members.map((m, i) => (
      <MemberCard key={m.name} member={m} onClick={onMemberClick} delay={i * 50} />
    ))}
  </div>
);

const TeamPage = ({ teamMembers, pastMembers }) => {
  const [selected, setSelected] = useState(null);
  const [showPast, setShowPast] = useState(false);

  // Order per Dev's list (2026-10-02). The Mentor section was removed.
  const groups = [
    {
      label: 'TEAM ROSTER',
      sub: 'THE ENGINEERS',
      members: teamMembers.roster,
      subsections: [{ label: 'New Members', members: teamMembers.newMembers }],
    },
    { label: 'EXTENDED ROSTER', sub: 'THE WIDER PACK', members: teamMembers.extended },
    { label: 'COACHES', sub: 'THE LEADERS', members: teamMembers.coaches.map((c) => ({ ...c, isCoach: true })) },
  ].filter((g) => g.members.length > 0);
  const studentCount = teamMembers.roster.length + teamMembers.newMembers.length + teamMembers.extended.length;

  return (
    <div style={{ background: 'var(--c-blue-deep)' }}>
      {selected && <MemberModal member={selected} onClose={() => setSelected(null)} />}

      {/* ─── Hero ("The Pack"): about 70% shorter than before (Dev, 2026-10-02) ─── */}
      <section
        className="relative pt-[84px] pb-5 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #061020 0%, #0a1628 100%)',
          borderBottom: '1px solid rgba(255,90,31,0.08)',
        }}
      >
        <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
        <div className="container-wide relative z-10 flex flex-wrap items-end gap-x-6 gap-y-1">
          <h1 className="display-lg text-white" style={{ lineHeight: 0.95 }}>
            THE <span style={{ color: '#FF5A1F' }}>PACK</span>
          </h1>
          <span className="label-caps pb-1">TEAM 33791 · 2025-26 · {studentCount} STUDENTS · CLICK A CARD FOR DETAILS</span>
        </div>
      </section>

      {/* ─── Member groups ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#0a1628' }}>
        <div className="container-wide">
          {groups.map((g, i) => (
            <GroupSection key={i} group={g} onMemberClick={setSelected} />
          ))}

          {/* Past members toggle */}
          <div className="mt-4 border-t pt-14" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setShowPast((v) => !v)}
              className="flex items-center gap-4 group transition-all duration-300 hover:gap-5"
            >
              <span
                className="text-sm font-semibold tracking-[0.15em] uppercase transition-colors duration-200"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}
              >
                {showPast ? '▲ HIDE' : '▼ SHOW'} ALUMNI
              </span>
              {pastMembers.length > 0 && (
                <span
                  className="px-2 py-0.5 text-[9px] border"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(255,90,31,0.08)',
                    borderColor: 'rgba(255,90,31,0.2)',
                    color: '#FF5A1F',
                  }}
                >
                  {pastMembers.length}
                </span>
              )}
            </button>

            {showPast && (
              <div className="mt-12" style={{ animation: 'fade-up 0.6s var(--ease-out-expo) both' }}>
                {pastMembers.length === 0 ? (
                  <p
                    className="text-sm tracking-widest uppercase text-center py-12"
                    style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.15)' }}
                  >
                    NO ALUMNI YET — CHECK BACK NEXT SEASON
                  </p>
                ) : (
                  <GroupSection
                    group={{ label: 'ALUMNI', sub: 'FORMER MEMBERS', members: pastMembers.map((m) => ({ ...m, isPast: true })), rookie: false }}
                    onMemberClick={setSelected}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
