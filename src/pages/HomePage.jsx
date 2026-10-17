import React, { useEffect, useRef, useState } from 'react';
import { Btn, BlueField, Reveal, SectionHead, Block, Card, Photo, CadSlot } from '../components/ui/Kit';
import { HOME_HIGHLIGHTS, ROBOTS } from '../data.js';
import { byTag } from '../photos.js';

const allStudents = (t) => t.roster.length + t.newMembers.length + t.extended.length;

const Counter = ({ target, suffix = '', duration = 1600, decimals = 0 }) => {
  const [val, setVal] = useState(decimals > 0 ? (0).toFixed(decimals) : '0');
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const tick = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const cur = (1 - Math.pow(1 - p, 3)) * target;
        setVal(decimals > 0 ? cur.toFixed(decimals) : String(Math.floor(cur)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals]);
  return <span ref={ref}>{val}{suffix}</span>;
};

const MemberPhoto = ({ member }) => {
  const [err, setErr] = useState(false);
  return err
    ? <div className="flex h-full w-full items-center justify-center text-2xl font-medium" style={{ background: 'var(--tint-blue)' }}>{member.initials}</div>
    : <img src={member.image} alt={member.name} loading="lazy" className="v-photo" onError={() => setErr(true)} />;
};

const HomePage = ({ onNavigate, teamMembers }) => {
  const robot = ROBOTS[0];
  const reel = [...byTag('robot').slice(1, 3), ...byTag('team').slice(0, 2), ...byTag('event').slice(0, 2)];
  const robotPhoto = byTag('robot')[0];
  const n = allStudents(teamMembers);

  const tiles = [
    { cls: 't-cream', label: 'THE ROBOT', num: '01', title: 'MATCHSTICK, our first robot.', link: 'Meet it', to: 'robots' },
    { cls: 't-blue', label: 'THE TEAM', num: '02', title: `${n} students, one pack.`, link: 'Meet the pack', to: 'team' },
    { cls: 't-peach', label: 'SPONSORS', num: '03', title: 'Help us compete this season.', link: 'Become a sponsor', to: 'sponsors' },
    { cls: 't-yellow', label: 'CONTACT', num: '04', title: 'Questions? Send us an email.', link: 'Get in touch', to: 'contact' },
  ];

  return (
    <div>
      <BlueField hero>
        <Reveal><p className="v-mono" style={{ opacity: 0.85 }}>FTC TEAM 33791 · SEASON 2025-26</p></Reveal>
        <h1 className="v-h1 mt-6" style={{ animation: 'fade-up 0.9s 0.1s var(--ease-out-expo) both' }}>Wolverine<br />Robotics</h1>
        <p className="v-lead mx-auto mt-8" style={{ maxWidth: '34rem', animation: 'fade-up 0.9s 0.25s var(--ease-out-expo) both' }}>
          A first-year FIRST Tech Challenge team from Wakeland High School in Frisco, Texas.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3" style={{ animation: 'fade-up 0.9s 0.4s var(--ease-out-expo) both' }}>
          <Btn variant="onBlue" onClick={() => onNavigate('robots')}>Meet MATCHSTICK</Btn>
          <Btn variant="line" onClick={() => onNavigate('team')}>The pack</Btn>
        </div>
      </BlueField>

      <Block>
        <div className="v-tiles">
          {tiles.map((t) => (
            <button key={t.num} className={`v-tile ${t.cls}`} onClick={() => onNavigate(t.to)}>
              <span className="top v-mono"><span>{t.label}</span><span>{t.num}</span></span>
              <span>
                <span className="v-h3 block">{t.title}</span>
                <span className="link block">{t.link} →</span>
              </span>
            </button>
          ))}
        </div>
      </Block>

      <section className="border-y" style={{ borderColor: 'var(--rule)' }}>
        <div className="wrap grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {HOME_HIGHLIGHTS.statBar.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <p className="v-stat"><Counter target={s.num} suffix={s.suffix} decimals={s.decimals ?? 0} /></p>
              <p className="v-mono v-dim mt-2">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {reel.length > 0 && (
        <Block>
          <SectionHead eyebrow="ON THE FIELD AND IN THE SHOP" title="The season in photos" />
          <div className="v-grid v-grid-3">
            {reel.map((p, i) => (
              <Reveal key={p.src} delay={i * 50}><Card><div className="v-ratio-43"><Photo src={p.src} alt={p.alt} /></div></Card></Reveal>
            ))}
          </div>
          <div className="mt-10"><Btn variant="ghost" onClick={() => onNavigate('gallery')}>Full gallery →</Btn></div>
        </Block>
      )}

      <Block narrow>
        <SectionHead eyebrow="COMPETITION MOMENT" title="Playoff Match 4" />
        <Reveal>
          <Card>
            <div style={{ background: '#050b3a' }}><Photo src="/photos/a-img_9178.jpg" alt="Projector screen at the FIT-North U-League Tournament showing Playoff Match 4, with team 33791 on Alliance 2" className="mx-auto block" /></div>
            <div className="body">
              <p className="v-mono" style={{ color: 'var(--accent)' }}>FIT-NORTH U-LEAGUE TOURNAMENT</p>
              <p className="v-body mt-2">Team 33791 played on Alliance 2. The screen reads 173 to 164.</p>
            </div>
          </Card>
        </Reveal>
      </Block>

      <Block>
        <SectionHead
          eyebrow="2025-26 SEASON · DECODE CHALLENGE"
          title="MATCHSTICK"
          intro="MATCHSTICK is our first robot. It has a mecanum drivetrain, PedroPathing for autonomous, and an RPM lookup table that brings a scoring cycle down to 3.8 seconds."
        />
        <div className="mx-auto max-w-3xl">
          {robotPhoto ? <Card><div className="v-ratio-43"><Photo src={robotPhoto.src} alt={robotPhoto.alt} /></div></Card> : null}
          <div className={robotPhoto ? 'mt-5' : ''}><CadSlot /></div>
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {HOME_HIGHLIGHTS.spotlightSpecs.map(([l, v]) => <span key={l} className="v-chip">{l} · {v}</span>)}
        </div>
        <div className="mt-10"><Btn onClick={() => onNavigate('robots')}>Full breakdown →</Btn></div>
      </Block>

      <Block className="" >
        <SectionHead eyebrow="ENGINEERING BREAKDOWN" title="Subsystems" intro="The four subsystems that make up MATCHSTICK." />
        <div className="v-grid v-grid-4">
          {robot.subsystems.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <Card className="h-full"><div className="body !pt-6">
                <p className="text-2xl" style={{ color: 'var(--accent)' }}>{s.icon}</p>
                <p className="v-mono mt-3">{s.name}</p>
                <p className="v-body mt-3" style={{ fontSize: '.95rem' }}>{s.brief}</p>
              </div></Card>
            </Reveal>
          ))}
        </div>
      </Block>

      <Block narrow>
        <SectionHead eyebrow="SEASON RECORD" title="Achievements" />
        <div className="flex flex-wrap justify-center gap-2">
          {HOME_HIGHLIGHTS.achievementBadges.map((t) => <span key={t} className="v-chip">{t}</span>)}
        </div>
      </Block>

      <Block>
        <SectionHead eyebrow="OUR STUDENTS" title="The pack" />
        <div className="v-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {teamMembers.roster.slice(0, 6).map((m, i) => (
            <Reveal key={m.name} delay={i * 50}>
              <button className="block w-full" onClick={() => onNavigate('team')}>
                <div className="v-ratio-sq rounded-xl"><MemberPhoto member={m} /></div>
                <p className="mt-3 text-sm font-medium">{m.name}</p>
                <p className="v-mono v-dim mt-1" style={{ fontSize: '.68rem' }}>{m.roles[0]}</p>
              </button>
            </Reveal>
          ))}
        </div>
        <p className="v-mono v-dim mt-10">+{n - 6} more students</p>
        <div className="mt-4"><Btn variant="ghost" onClick={() => onNavigate('team')}>Full roster →</Btn></div>
      </Block>

      <BlueField>
        <p className="v-mono" style={{ opacity: 0.85 }}>SUPPORTED BY WAKELAND HIGH SCHOOL AND WAKELAND NHS</p>
        <h2 className="v-h2 mt-4">Help us compete.</h2>
        <p className="v-lead mx-auto mt-5" style={{ maxWidth: '32rem' }}>Sponsorship pays for entry fees, robot parts, travel, and outreach.</p>
        <div className="mt-8"><Btn variant="onBlue" onClick={() => onNavigate('sponsors')}>Become a sponsor →</Btn></div>
      </BlueField>
    </div>
  );
};

export default HomePage;
