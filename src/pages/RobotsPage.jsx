import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Award, Zap } from 'lucide-react';
import RobotViewer from '../components/RobotViewer';
import OnshapeViewer from '../components/OnshapeViewer';
import AngleButton from '../components/ui/AngleButton';
import GridScan from '../components/ui/GridScan';

// ── Shared reveal animation ────────────────────────────────────────
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const tx = { up: 'translateY(36px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.92)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : (tx[direction] || tx.up),
      transition: `opacity 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

// ── Spec row ───────────────────────────────────────────────────────
const SpecRow = ({ label, value, delay }) => (
  <Reveal delay={delay}>
    <div
      className="flex justify-between items-center px-5 py-4 border-b transition-colors duration-300 group"
      style={{ borderColor: 'rgba(255,90,31,0.08)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,90,31,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span
        className="text-[10px] font-semibold tracking-[0.2em] uppercase"
        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-bold"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text)' }}
      >
        {value}
      </span>
    </div>
  </Reveal>
);

// ── Subsystem detail card ──────────────────────────────────────────
const SubsystemCard = ({ subsystem, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-5 border transition-all duration-400 relative overflow-hidden group"
    style={{
      background: isActive ? 'rgba(255,90,31,0.08)' : 'rgba(10,22,40,0.5)',
      borderColor: isActive ? 'rgba(255,90,31,0.5)' : 'rgba(255,90,31,0.1)',
      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
    }}
  >
    {isActive && (
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: '#FF5A1F' }}
      />
    )}
    <div className="flex items-center gap-3 mb-2">
      <span style={{ fontSize: 18 }}>{subsystem.icon}</span>
      <p
        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
        style={{
          fontFamily: 'var(--font-mono)',
          color: isActive ? '#FF5A1F' : 'rgba(255,255,255,0.4)',
        }}
      >
        {subsystem.name}
      </p>
    </div>
    <p
      className="text-[12px] leading-relaxed"
      style={{ color: isActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)' }}
    >
      {subsystem.brief}
    </p>
  </button>
);

// ── Achievement item ───────────────────────────────────────────────
const AchievementItem = ({ text, delay }) => (
  <Reveal delay={delay}>
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{
        background: 'rgba(10,22,40,0.5)',
        border: '1px solid rgba(255,90,31,0.1)',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
      }}
    >
      <div
        className="w-2 h-2 rotate-45 flex-shrink-0"
        style={{ background: '#FF5A1F', boxShadow: '0 0 8px rgba(255,90,31,0.5)' }}
      />
      <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
        {text}
      </span>
    </div>
  </Reveal>
);

// ── Season selector tab ────────────────────────────────────────────
const SeasonTab = ({ robot, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="relative px-6 py-3 text-left border-b-2 transition-all duration-300"
    style={{
      borderColor: isActive ? '#FF5A1F' : 'transparent',
      background: isActive ? 'rgba(255,90,31,0.06)' : 'transparent',
    }}
  >
    <p
      className="text-[10px] tracking-[0.2em] uppercase font-semibold"
      style={{ fontFamily: 'var(--font-mono)', color: isActive ? '#FF5A1F' : 'rgba(255,255,255,0.3)' }}
    >
      {robot.season}
    </p>
    <p
      className="text-base font-black uppercase tracking-tight"
      style={{ fontFamily: 'var(--font-display)', color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}
    >
      {robot.name}
    </p>
  </button>
);

// ─────────────────────────────────────────────────────────────────────
// RobotsPage
// ─────────────────────────────────────────────────────────────────────
const RobotsPage = ({ robots }) => {
  const [activeRobotIdx, setActiveRobotIdx] = useState(0);
  const [activeSubsystem, setActiveSubsystem] = useState(0);
  const [viewMode, setViewMode] = useState('detail'); // 'detail' | 'exploded'

  const robot = robots[activeRobotIdx];

  return (
    <div style={{ background: 'var(--c-blue-deep)' }}>

      {/* ═══ PAGE HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #061020 0%, #0a1628 100%)',
          borderBottom: '1px solid rgba(255,90,31,0.08)',
        }}
      >
        <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-35">
          <GridScan sensitivity={0.2} scanOpacity={0.12} opacity={1} />
        </div>

        <div className="container-wide relative z-10">
          <Reveal>
            <span className="label-caps">ENGINEERING · COMPETITION MACHINES</span>
          </Reveal>
          <Reveal delay={80} direction="left">
            <h1 className="display-xl text-white mt-4" style={{ lineHeight: 0.9 }}>
              OUR
              <span style={{ color: '#FF5A1F', display: 'block' }}>ROBOTS</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ═══ SEASON SELECTOR (shows when multiple robots exist) ══════ */}
      {robots.length > 1 && (
        <section
          className="sticky top-[70px] z-[150]"
          style={{
            background: 'rgba(6,16,32,0.96)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,90,31,0.1)',
          }}
        >
          <div className="container-wide">
            <div className="flex overflow-x-auto">
              {robots.map((r, i) => (
                <SeasonTab
                  key={r.id}
                  robot={r}
                  isActive={activeRobotIdx === i}
                  onClick={() => { setActiveRobotIdx(i); setActiveSubsystem(0); }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ MAIN ROBOT SHOWCASE ═════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#0a1628' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left: 3D viewer */}
            <div className="lg:col-span-7">
              {/* View mode toggles */}
              <Reveal>
                <div className="flex items-center gap-2 mb-4">
                  {['detail', 'exploded'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="px-4 py-2 text-[9px] font-semibold tracking-widest uppercase border transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                        background: viewMode === mode ? 'rgba(255,90,31,0.15)' : 'transparent',
                        borderColor: viewMode === mode ? '#FF5A1F' : 'rgba(255,255,255,0.1)',
                        color: viewMode === mode ? '#FF5A1F' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {mode === 'detail' ? 'ASSEMBLED' : 'EXPLODED VIEW'}
                    </button>
                  ))}
                </div>
              </Reveal>

              {/* 3D Canvas */}
              <Reveal delay={60} direction="left">
                <div
                  className="relative"
                  style={{
                    height: 560,
                    border: '1px solid rgba(255,90,31,0.12)',
                    clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)',
                    background: '#061020',
                  }}
                >
                  {/* HUD overlays */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FF5A1F', animation: 'pulse-glow 2s infinite' }}
                    />
                    <span
                      className="text-[9px] tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.7)' }}
                    >
                      {robot.name} · {robot.season}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className="text-[8px] tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
                    >
                      {viewMode === 'exploded' ? 'EXPLODED VIEW' : '3D RENDER'}
                    </span>
                  </div>

                  {robot.embedUrl ? (
                    <OnshapeViewer
                      embedUrl={viewMode === 'exploded' && robot.embedUrlExploded ? robot.embedUrlExploded : robot.embedUrl}
                      title={`${robot.name} CAD${viewMode === 'exploded' ? ' (exploded)' : ''}`}
                      height="100%"
                    />
                  ) : (
                    <RobotViewer
                      mode={viewMode}
                      interactive={true}
                      autoRotate={viewMode === 'detail'}
                      showAnnotations={true}
                      height="100%"
                    />
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right: info panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Robot identity */}
              <Reveal delay={100}>
                <div>
                  <span className="label-caps">{robot.season}</span>
                  <h2
                    className="display-lg text-white mt-2 mb-1"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {robot.name}
                  </h2>
                  <p className="text-[11px] tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}>
                    {robot.challenge}
                  </p>
                </div>
              </Reveal>

              {/* Description */}
              <Reveal delay={140}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {robot.description}
                </p>
              </Reveal>

              {/* Spec table */}
              <Reveal delay={180}>
                <div
                  className="border"
                  style={{
                    borderColor: 'rgba(255,90,31,0.1)',
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                  }}
                >
                  {robot.specs.map((s, i) => (
                    <SpecRow key={i} label={s.label} value={s.value} delay={200 + i * 30} />
                  ))}
                </div>
              </Reveal>

              {/* Achievements */}
              {robot.achievements.length > 0 && (
                <div>
                  <Reveal delay={320}>
                    <p
                      className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-3"
                      style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                    >
                      ACHIEVEMENTS
                    </p>
                  </Reveal>
                  <div className="space-y-2">
                    {robot.achievements.map((a, i) => (
                      <AchievementItem key={i} text={a} delay={340 + i * 40} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SUBSYSTEM DEEP-DIVE ═════════════════════════════════════ */}
      <section
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #061020 100%)',
          borderTop: '1px solid rgba(255,90,31,0.06)',
        }}
      >
        <div className="container-wide">
          <div className="mb-12">
            <Reveal><span className="label-caps">ENGINEERING BREAKDOWN</span></Reveal>
            <Reveal delay={80} direction="left">
              <h2 className="display-lg text-white mt-3">SUBSYSTEMS</h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Subsystem list */}
            <div className="lg:col-span-4 space-y-3">
              {robot.subsystems.map((sub, i) => (
                <Reveal key={i} delay={i * 60} direction="left">
                  <SubsystemCard
                    subsystem={sub}
                    isActive={activeSubsystem === i}
                    onClick={() => setActiveSubsystem(i)}
                  />
                </Reveal>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-8">
              {robot.subsystems[activeSubsystem] && (() => {
                const sub = robot.subsystems[activeSubsystem];
                return (
                  <div
                    key={activeSubsystem}
                    style={{ animation: 'fade-up 0.5s var(--ease-out-expo) both' }}
                  >
                    <div
                      className="p-8 border mb-6"
                      style={{
                        background: 'rgba(10,22,40,0.6)',
                        borderColor: 'rgba(255,90,31,0.15)',
                        clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <span style={{ fontSize: 28 }}>{sub.icon}</span>
                        <div>
                          <p className="label-caps">{sub.name}</p>
                          {sub.hardware && (
                            <p
                              className="text-[11px] mt-1"
                              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
                            >
                              {sub.hardware}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {sub.detail}
                      </p>

                      {/* Feature bullets */}
                      {sub.features && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sub.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div
                                className="w-1.5 h-1.5 mt-1.5 rotate-45 flex-shrink-0"
                                style={{ background: '#FF5A1F' }}
                              />
                              <p
                                className="text-[12px] leading-snug"
                                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.45)' }}
                              >
                                {f}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metrics row */}
                    {sub.metrics && (
                      <div className="grid grid-cols-3 gap-3">
                        {sub.metrics.map((m, i) => (
                          <div
                            key={i}
                            className="p-4 border text-center"
                            style={{
                              background: 'rgba(10,22,40,0.5)',
                              borderColor: 'rgba(255,90,31,0.1)',
                              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                            }}
                          >
                            <p
                              className="text-xl font-black"
                              style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                            >
                              {m.value}
                            </p>
                            <p
                              className="text-[9px] tracking-widest uppercase mt-1"
                              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
                            >
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOFTWARE SECTION ════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{
          background: '#061020',
          borderTop: '1px solid rgba(255,90,31,0.06)',
        }}
      >
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <Reveal><span className="label-caps">AUTONOMY & CONTROL</span></Reveal>
              <Reveal delay={80} direction="left">
                <h2 className="display-lg text-white mt-3 mb-6">SOFTWARE</h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {robot.software?.overview || 'Custom Java 17 codebase built on the FTC SDK. Modular architecture separates hardware abstraction, autonomous routines, and driver-control logic for clean iteration between competitions.'}
                </p>
              </Reveal>

              {robot.software?.features && (
                <div className="space-y-3">
                  {robot.software.features.map((f, i) => (
                    <Reveal key={i} delay={180 + i * 50} direction="left">
                      <div
                        className="flex items-start gap-4 p-4 border"
                        style={{
                          background: 'rgba(10,22,40,0.5)',
                          borderColor: 'rgba(255,90,31,0.1)',
                          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                        }}
                      >
                        <Zap size={14} color="#FF5A1F" className="mt-0.5 flex-shrink-0" />
                        <div>
                          <p
                            className="text-[11px] font-semibold tracking-wider uppercase mb-1"
                            style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}
                          >
                            {f.title}
                          </p>
                          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {f.desc}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Code accent block */}
            <Reveal delay={100} direction="right">
              <div
                className="p-6 font-mono text-[11px] leading-relaxed overflow-hidden relative"
                style={{
                  background: '#020c18',
                  border: '1px solid rgba(255,90,31,0.12)',
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
                }}
              >
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {['#FF5A1F', '#F59E0B', '#10B981'].map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <div className="mt-6">
                  <p style={{ color: 'rgba(255,255,255,0.2)' }}>// MATCHSTICK TeleOp — field-centric scoring</p>
                  <p className="mt-2"><span style={{ color: '#FF5A1F' }}>public void</span> <span style={{ color: '#60a5fa' }}>runOpMode</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>()</span> {'{'}</p>
                  <p className="pl-4"><span style={{ color: '#FF5A1F' }}>waitForStart</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>();</span></p>
                  <p className="pl-4 mt-1"><span style={{ color: 'rgba(255,255,255,0.2)' }}>// Init pathing + drive</span></p>
                  <p className="pl-4"><span style={{ color: '#a78bfa' }}>follower</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>.</span><span style={{ color: '#60a5fa' }}>setStartingPose</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>(startPose);</span></p>
                  <p className="pl-4"><span style={{ color: '#a78bfa' }}>drivetrain</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>.</span><span style={{ color: '#60a5fa' }}>setFieldCentric</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>(</span><span style={{ color: '#34d399' }}>true</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>);</span></p>
                  <p className="pl-4 mt-1"><span style={{ color: 'rgba(255,255,255,0.2)' }}>// Score from anywhere</span></p>
                  <p className="pl-4"><span style={{ color: '#a78bfa' }}>shooter</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>.</span><span style={{ color: '#60a5fa' }}>setTargetRpm</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>(</span><span style={{ color: '#a78bfa' }}>lookupTable</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>.</span><span style={{ color: '#60a5fa' }}>getRpm</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>(distance));</span></p>
                  <p className="mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{'}'}</p>
                  <p className="mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>// Cycle time target: 3.8s (lookup-table optimized)</p>
                  <p><span style={{ color: '#FF5A1F' }}>static final double</span> <span style={{ color: '#fbbf24' }}>TARGET_CYCLE</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>= </span><span style={{ color: '#34d399' }}>3.8</span><span style={{ color: 'rgba(255,255,255,0.6)' }}>;</span></p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
};

export default RobotsPage;
