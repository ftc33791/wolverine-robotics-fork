import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Zap, ArrowDown } from 'lucide-react';
import GridScan from '../components/ui/GridScan';
import RobotViewer from '../components/RobotViewer';
import AngleButton from '../components/ui/AngleButton';
import { HOME_HIGHLIGHTS, ROBOTS } from '../data.js';

// ── Animated counter ───────────────────────────────────────────────
const Counter = ({ target, suffix = '', duration = 2000, decimals = 0, static: staticVal }) => {
  const [val, setVal] = useState(staticVal ?? '0');
  const ref = useRef(null);

  useEffect(() => {
    if (staticVal != null) return undefined;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start = null;
        const tick = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = ease * target;
          setVal(
            decimals > 0
              ? current.toFixed(decimals)
              : String(Math.floor(current))
          );
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, decimals, staticVal]);

  return <span ref={ref}>{staticVal ?? val}{suffix}</span>;
};

// ── Reveal wrapper ─────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const transforms = {
    up: 'translateY(40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    scale: 'scale(0.9)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : (transforms[direction] || transforms.up),
        transition: `opacity 0.9s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.9s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
};

// ── Subsystem card ─────────────────────────────────────────────────
const SubsystemCard = ({ title, detail, icon, index }) => (
  <Reveal delay={index * 80} direction="up">
    <div
      className="relative group p-6 border transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'rgba(10,22,40,0.6)',
        borderColor: 'rgba(255,90,31,0.15)',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.15)'; }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: '#FF5A1F' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(255,90,31,0.3)' }} />

      <p
        className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3"
        style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
      >
        {icon} {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {detail}
      </p>
    </div>
  </Reveal>
);

// ── Achievement badge ──────────────────────────────────────────────
const Badge = ({ text, delay }) => (
  <Reveal delay={delay} direction="scale">
    <div
      className="inline-flex items-center gap-2 px-4 py-2 border text-[11px] font-semibold tracking-wider"
      style={{
        fontFamily: 'var(--font-mono)',
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
        background: 'rgba(255,90,31,0.06)',
        borderColor: 'rgba(255,90,31,0.3)',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      <div className="w-1.5 h-1.5 bg-[#FF5A1F] rotate-45" />
      {text}
    </div>
  </Reveal>
);

// ── Main component ─────────────────────────────────────────────────
const HomePage = ({ onNavigate, teamMembers }) => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const [heroH, setHeroH] = useState(1);
  const [robotScrollProgress, setRobotScrollProgress] = useState(0);

  useEffect(() => {
    const fn = () => {
      setScrollY(window.scrollY);
      if (heroRef.current) {
        setHeroH(heroRef.current.offsetHeight);
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const progress = Math.min(scrollY / (heroH * 0.7), 1);
    setRobotScrollProgress(progress);
  }, [scrollY, heroH]);

  const parallaxY = scrollY * 0.3;

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-blue-deep)' }}>

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: '100vh', minHeight: 700 }}
      >
        {/* Blueprint grid background */}
        <div
          className="absolute inset-0 blueprint-grid"
          style={{ transform: `translateY(${parallaxY * 0.5}px)`, opacity: 0.5 }}
        />

        {/* Shader grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.65 }}>
          <GridScan sensitivity={0.5} lineThickness={1.1} gridScale={0.2} scanOpacity={0.2} opacity={1} />
        </div>

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(6,16,32,0.8) 100%)',
          }}
        />

        {/* 3D Robot — hero position */}
        <div
          className="absolute right-0 md:right-[2%] top-0 bottom-0 flex items-center"
          style={{
            width: '55%',
            opacity: Math.max(0, 1 - robotScrollProgress * 1.4),
            transform: `translateY(${robotScrollProgress * -40}px)`,
            transition: 'opacity 0.1s linear',
          }}
        >
          <RobotViewer
            mode="hero"
            scrollProgress={robotScrollProgress}
            interactive={true}
            autoRotate={true}
            height="80vh"
          />
        </div>

        {/* Hero text — left column */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{ width: '55%', paddingLeft: 'clamp(1.25rem, 5vw, 5rem)' }}
        >
          <div>
            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                background: 'rgba(255,90,31,0.08)',
                borderColor: 'rgba(255,90,31,0.4)',
                animation: 'fade-up 0.8s 0.1s var(--ease-out-expo) both',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#FF5A1F', boxShadow: '0 0 8px #FF5A1F', animation: 'pulse-glow 2s infinite' }}
              />
              <span
                className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
              >
                FTC TEAM 33791 · SEASON 2025-26
              </span>
            </div>

            {/* Main title */}
            <h1
              className="display-hero text-white mb-2 leading-none"
              style={{ animation: 'slide-left 1s 0.15s var(--ease-out-expo) both' }}
            >
              WOLVER-
            </h1>
            <h1
              className="display-hero mb-6 leading-none"
              style={{
                animation: 'slide-left 1s 0.25s var(--ease-out-expo) both',
                color: '#FF5A1F',
                textShadow: '0 0 60px rgba(255,90,31,0.4)',
              }}
            >
              INE
            </h1>

            {/* Sub label */}
            <div
              className="flex items-center gap-3 mb-8"
              style={{ animation: 'fade-up 0.8s 0.4s var(--ease-out-expo) both' }}
            >
              <div className="h-px flex-1 max-w-[48px]" style={{ background: 'linear-gradient(90deg, #FF5A1F, transparent)' }} />
              <p
                className="text-[11px] font-semibold tracking-[0.22em] uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.45)' }}
              >
                ROBOTICS · FRISCO, TEXAS
              </p>
            </div>

            <p
              className="text-base leading-relaxed mb-10 max-w-sm"
              style={{
                color: 'rgba(255,255,255,0.5)',
                animation: 'fade-up 0.8s 0.5s var(--ease-out-expo) both',
              }}
            >
              Precision engineering. Relentless innovation. First-year team
              competing at the highest level of FIRST Tech Challenge.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-4"
              style={{ animation: 'fade-up 0.8s 0.65s var(--ease-out-expo) both' }}
            >
              <AngleButton onClick={() => onNavigate('robots')} variant="primary" size="lg">
                MEET MATCHSTICK <ChevronRight size={16} />
              </AngleButton>
              <AngleButton onClick={() => onNavigate('team')} variant="secondary" size="lg">
                THE PACK
              </AngleButton>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animation: 'fade-up 1s 1.2s var(--ease-out-expo) both' }}
        >
          <p
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
          >
            SCROLL TO EXPLORE
          </p>
          <ArrowDown
            size={14}
            style={{ color: 'rgba(255,90,31,0.5)', animation: 'float 2s ease-in-out infinite' }}
          />
        </div>

        {/* HUD corner decorators */}
        <div className="absolute top-24 left-6 opacity-30">
          <div className="w-6 h-6 border-t border-l" style={{ borderColor: '#FF5A1F' }} />
        </div>
        <div className="absolute bottom-12 right-6 opacity-30">
          <div className="w-6 h-6 border-b border-r" style={{ borderColor: '#FF5A1F' }} />
        </div>
      </section>

      {/* ═══ STAT BAR ════════════════════════════════════════════════ */}
      <section
        className="relative py-8 border-y"
        style={{ background: 'rgba(6,16,32,0.95)', borderColor: 'rgba(255,90,31,0.1)' }}
      >
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {HOME_HIGHLIGHTS.statBar.map((s, i) => (
              <Reveal key={i} delay={i * 60} direction="up">
                <div className="flex flex-col">
                  <span
                    className="stat-value"
                    style={{ color: i % 2 === 0 ? '#fff' : '#FF5A1F' }}
                  >
                    <Counter
                      target={s.num}
                      suffix={s.suffix}
                      decimals={s.decimals ?? 0}
                      static={s.static}
                    />
                  </span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ROBOT SPOTLIGHT ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-32"
        style={{
          background: 'linear-gradient(180deg, #061020 0%, #0a1628 50%, #061020 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.3 }}
        >
          <GridScan sensitivity={0.2} scanOpacity={0.15} gridScale={0.25} opacity={1} />
        </div>

        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 3D viewer */}
            <Reveal direction="left">
              <div
                className="relative"
                style={{
                  height: 520,
                  border: '1px solid rgba(255,90,31,0.12)',
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
                  background: 'rgba(6,16,32,0.8)',
                }}
              >
                {/* Corner HUD elements */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#FF5A1F', animation: 'pulse-glow 2s infinite' }} />
                  <span className="text-[9px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.7)' }}>
                    3D RENDER · MATCHSTICK
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="text-[8px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>
                    CAD VISUALIZATION
                  </span>
                </div>

                <RobotViewer
                  mode="detail"
                  interactive={true}
                  autoRotate={true}
                  showAnnotations={true}
                  height="100%"
                />
              </div>
            </Reveal>

            {/* Text */}
            <div>
              <Reveal delay={100}>
                <span className="label-caps">2025-26 SEASON · DECODE CHALLENGE</span>
              </Reveal>
              <Reveal delay={160} direction="left">
                <h2
                  className="display-xl text-white mt-4 mb-6"
                  style={{ textShadow: 'none' }}
                >
                  MATCH-
                  <span style={{ color: '#FF5A1F', display: 'block' }}>STICK</span>
                </h2>
              </Reveal>
              <Reveal delay={220}>
                <p className="body-lg mb-8 max-w-md">
                  Our debut machine. Every mechanism engineered from the ground up
                  — mecanum drivetrain for omnidirectional precision, PedroPathing
                  autonomous, and an interpolated RPM lookup table tuned for
                  3.8-second scoring cycles.
                </p>
              </Reveal>

              {/* Spec grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {HOME_HIGHLIGHTS.spotlightSpecs.map(([label, val], i) => (
                  <Reveal key={i} delay={280 + i * 40} direction="left">
                    <div
                      className="flex justify-between items-center px-4 py-3"
                      style={{
                        background: 'rgba(10,22,40,0.6)',
                        border: '1px solid rgba(255,90,31,0.1)',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                      }}
                    >
                      <span
                        className="text-[9px] tracking-widest uppercase"
                        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[13px] font-bold"
                        style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}
                      >
                        {val}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={500}>
                <AngleButton onClick={() => onNavigate('robots')} variant="primary" size="md">
                  FULL BREAKDOWN <ChevronRight size={15} />
                </AngleButton>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SUBSYSTEMS ════════════════════════════════════════════ */}
      <section className="py-28" style={{ background: '#061020' }}>
        <div className="container-wide">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Reveal><span className="label-caps">ENGINEERING BREAKDOWN</span></Reveal>
              <Reveal delay={80} direction="left">
                <h2 className="display-lg text-white mt-3">SUBSYSTEMS</h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <p className="body-lg max-w-sm text-right">
                Each module independently designed and tested for peak performance.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROBOTS[0].subsystems.map((s, i) => (
              <SubsystemCard key={i} icon={s.icon} title={s.name} detail={s.brief} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ACHIEVEMENTS ══════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #061020 100%)',
          borderTop: '1px solid rgba(255,90,31,0.08)',
        }}
      >
        <div className="container-narrow relative z-10">
          <div className="text-center mb-14">
            <Reveal><span className="label-caps">SEASON RECORD</span></Reveal>
            <Reveal delay={80} direction="up">
              <h2 className="display-lg text-white mt-3">ACHIEVEMENTS</h2>
            </Reveal>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {HOME_HIGHLIGHTS.achievementBadges.map((t, i) => (
              <Badge key={i} text={t} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Decorative large text */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center pointer-events-none select-none overflow-hidden"
          style={{ lineHeight: 1 }}
        >
          <span
            className="text-[clamp(5rem,15vw,14rem)] font-black uppercase tracking-tight"
            style={{ color: 'rgba(255,255,255,0.015)', fontFamily: 'var(--font-display)' }}
          >
            DECODE 2025
          </span>
        </div>
      </section>

      {/* ═══ TEAM PREVIEW ══════════════════════════════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: '#061020', borderTop: '1px solid rgba(255,90,31,0.08)' }}
      >
        <div className="container-wide relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <Reveal><span className="label-caps">THE PEOPLE BEHIND THE MACHINE</span></Reveal>
              <Reveal delay={80} direction="left">
                <h2 className="display-lg text-white mt-3">THE PACK</h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <AngleButton onClick={() => onNavigate('team')} variant="secondary" size="md">
                FULL ROSTER <ChevronRight size={14} />
              </AngleButton>
            </Reveal>
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teamMembers.students.slice(0, 6).map((member, i) => (
              <Reveal key={i} delay={i * 60} direction="scale">
                <div
                  className="relative group cursor-none"
                  onClick={() => onNavigate('team')}
                >
                  <div
                    className="relative aspect-square overflow-hidden border transition-all duration-500"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                      borderColor: 'rgba(255,90,31,0.1)',
                      background: 'rgba(10,22,40,0.8)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.1)'; }}
                  >
                    {/* Photo */}
                    <MemberPhoto member={member} />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(6,16,32,0.95) 0%, transparent 60%)' }}
                    >
                      <div>
                        <p className="text-white text-[11px] font-bold leading-tight">{member.name}</p>
                        <p
                          className="text-[9px] tracking-wider uppercase mt-0.5"
                          style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                        >
                          {member.role.split(',')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Remaining count */}
          {teamMembers.students.length > 6 && (
            <Reveal delay={400}>
              <div className="mt-6 text-center">
                <button
                  onClick={() => onNavigate('team')}
                  className="text-sm transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5A1F')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  +{teamMembers.students.length - 6} more engineers →
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══ SPONSORS TEASER ══════════════════════════════════════ */}
      <section
        className="py-16"
        style={{
          background: '#061020',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="container-narrow text-center">
          <Reveal>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-8"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
            >
              SUPPORTED BY
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {['Wakeland High School', 'Wakeland NHS'].map((name, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate('sponsors')}
                  className="text-[15px] font-bold uppercase tracking-widest transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >
                  {name}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={160}>
            <button
              onClick={() => onNavigate('sponsors')}
              className="mt-8 text-[11px] tracking-widest uppercase transition-colors duration-200"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5A1F')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,90,31,0.5)')}
            >
              BECOME A SPONSOR →
            </button>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

// ── Member photo helper ────────────────────────────────────────────
const MemberPhoto = ({ member }) => {
  const [err, setErr] = useState(false);
  return err ? (
    <div
      className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
      style={{ background: 'linear-gradient(135deg, #0f1e35, #1a2f4a)' }}
    >
      {member.initials}
    </div>
  ) : (
    <img
      src={member.image}
      alt={member.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      onError={() => setErr(true)}
    />
  );
};

export default HomePage;
