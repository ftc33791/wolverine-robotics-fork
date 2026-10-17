import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import AngleButton from '../components/ui/AngleButton';
import GridScan from '../components/ui/GridScan';
import { TEAM } from '../data.js';

const STUDENT_COUNT = TEAM.roster.length + TEAM.newMembers.length + TEAM.extended.length;

const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const transforms = { up: 'translateY(36px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.92)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : (transforms[direction] || transforms.up),
      transition: `opacity 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

const ValueCard = ({ number, title, body, delay }) => (
  <Reveal delay={delay} direction="up">
    <div
      className="relative p-8 border h-full transition-all duration-500 group hover:scale-[1.02]"
      style={{
        background: 'rgba(10,22,40,0.5)',
        borderColor: 'rgba(255,90,31,0.1)',
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.4)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,90,31,0.1)'; }}
    >
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: '#FF5A1F' }} />
      <p
        className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
        style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
      >
        {number}
      </p>
      <h3
        className="text-xl font-black text-white mb-4 uppercase tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
        {body}
      </p>
    </div>
  </Reveal>
);

const AboutPage = ({ onNavigate }) => {
  return (
    <div style={{ background: 'var(--c-blue-deep)' }}>

      {/* ─── Page hero ────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #061020 0%, #0a1628 100%)',
          borderBottom: '1px solid rgba(255,90,31,0.08)',
        }}
      >
        <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <GridScan sensitivity={0.25} scanOpacity={0.12} opacity={1} />
        </div>

        <div className="container-narrow relative z-10">
          <Reveal>
            <span className="label-caps">WHO WE ARE</span>
          </Reveal>
          <Reveal delay={80} direction="left">
            <h1
              className="display-xl text-white mt-4 mb-8"
              style={{ lineHeight: 0.9 }}
            >
              ABOUT
              <span style={{ color: '#FF5A1F', display: 'block' }}>WOLVERINE</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p
              className="text-lg leading-relaxed max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.72)' }}
            >
              We are Team 33791, a first-year FIRST Tech Challenge robotics team at
              Wakeland High School in Frisco, Texas. We have {STUDENT_COUNT} students, and we want
              to show that a rookie team can compete at the highest level of
              high school robotics.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Origin story ─────────────────────────────────────────── */}
      <section className="py-28" style={{ background: '#0a1628' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Large quote */}
            <div className="lg:col-span-5">
              <Reveal direction="left">
                <div
                  className="relative p-10 border-l-2"
                  style={{ borderColor: '#FF5A1F' }}
                >
                  <p
                    className="text-3xl font-black text-white leading-tight uppercase"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    "Built with precision. Engineered for excellence. Driven by innovation."
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-8 h-px" style={{ background: '#FF5A1F' }} />
                    <p
                      className="text-[11px] tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)' }}
                    >
                      WOLVERINE ROBOTICS MOTTO
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Decorative number */}
              <Reveal delay={200} direction="left">
                <div className="mt-12 flex items-end gap-4">
                  <span
                    className="text-[7rem] font-black leading-none"
                    style={{ color: 'rgba(255,90,31,0.08)', fontFamily: 'var(--font-display)' }}
                  >
                    33791
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Content paragraphs */}
            <div className="lg:col-span-7 space-y-8">
              <Reveal delay={80}>
                <div>
                  <p
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                  >
                    THE BEGINNING
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    Wolverine Robotics was founded in 2025. Team 33791 started from
                    scratch, with no old hardware and no alumni to lean on, and set out
                    to build something great in its first season.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={140}>
                <div>
                  <p
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                  >
                    THE MACHINE
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    MATCHSTICK is our 2025-26 competition robot. We designed it in CAD,
                    stress-tested it in simulation, and refined it over dozens of
                    practice matches. Every bolt, wire run, and motor was a deliberate
                    choice. It reflects how we work: build clean, build fast, build to win.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div>
                  <p
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                  >
                    THE MISSION
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    We care about more than trophies. Every competition tests a robot
                    we designed under pressure, with several disciplines working
                    together, and driven by students who understand every part they
                    touch. For us, FTC is where STEM education becomes real.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={280}>
                <div className="flex flex-wrap gap-3">
                  <AngleButton onClick={() => onNavigate('team')} variant="secondary" size="md">
                    MEET THE TEAM <ChevronRight size={14} />
                  </AngleButton>
                  <AngleButton onClick={() => onNavigate('robots')} variant="ghost" size="md">
                    SEE THE ROBOT
                  </AngleButton>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────────── */}
      <section
        className="py-28"
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #061020 100%)',
          borderTop: '1px solid rgba(255,90,31,0.06)',
        }}
      >
        <div className="container-wide">
          <div className="mb-14">
            <Reveal><span className="label-caps">WHAT DRIVES US</span></Reveal>
            <Reveal delay={80} direction="left">
              <h2 className="display-lg text-white mt-3">OUR VALUES</h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                number: '01',
                title: 'HONEST ENGINEERING',
                body: "We document every design decision and justify every choice. If we can't explain why, we don't ship it.",
              },
              {
                number: '02',
                title: 'ITERATION',
                body: 'The first solution is rarely the best one. We prototype, test, break, and rebuild until the mechanism does what we need every time.',
              },
              {
                number: '03',
                title: 'TEAMWORK',
                body: 'No subsystem succeeds alone. Mechanical, software, and strategy have to work together, and we win or lose as one system.',
              },
              {
                number: '04',
                title: 'COMPETITION MINDSET',
                body: "Practice isn't the same as competition. We train for the case where everything goes wrong and prepare fixes before we need them.",
              },
              {
                number: '05',
                title: 'COMMUNITY IMPACT',
                body: "We're part of a larger community. Outreach, mentorship, and STEM advocacy are part of what it means to be Wolverine.",
              },
              {
                number: '06',
                title: 'GRACIOUS PROFESSIONALISM',
                body: "Gracious Professionalism is a FIRST core value, and we hold to it. How you compete matters as much as whether you win. We respect opponents, mentor rookies, and celebrate the sport.",
              },
            ].map((v, i) => (
              <ValueCard key={i} {...v} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FTC callout ──────────────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: '#061020', borderTop: '1px solid rgba(255,90,31,0.06)' }}
      >
        <div className="container-narrow text-center relative z-10">
          <Reveal>
            <span className="label-caps">FIRST TECH CHALLENGE</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="display-lg text-white mt-3 mb-6">
              THE <span style={{ color: '#FF5A1F' }}>COMPETITION</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="body-lg max-w-2xl mx-auto mb-10">
              In FTC, students design, build, program, and drive robots in
              head-to-head matches played in alliances. Teams are judged on
              robot performance, engineering documentation, outreach, and
              gracious professionalism. It is the whole engineering process in
              one school year.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-wrap gap-4 justify-center">
              <AngleButton onClick={() => onNavigate('robots')} variant="primary" size="md">
                EXPLORE MATCHSTICK <ChevronRight size={14} />
              </AngleButton>
              <AngleButton onClick={() => onNavigate('contact')} variant="secondary" size="md">
                PARTNER WITH US
              </AngleButton>
            </div>
          </Reveal>
        </div>

        {/* Background text */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-hidden whitespace-nowrap"
          style={{ lineHeight: 1, bottom: '-0.1em' }}
        >
          <span
            className="font-black uppercase"
            style={{
              fontSize: 'clamp(4rem, 18vw, 18rem)',
              color: 'rgba(255,255,255,0.012)',
              fontFamily: 'var(--font-display)',
            }}
          >
            FTC 2025
          </span>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
