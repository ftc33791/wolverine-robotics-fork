import React from 'react';
import { Btn, BlueField, Reveal, SectionHead, Block, Card, Photo } from '../components/ui/Kit';
import { TEAM } from '../data.js';
import { byTag } from '../photos.js';

const STUDENT_COUNT = TEAM.roster.length + TEAM.newMembers.length + TEAM.extended.length;

const VALUES = [
  { n: '01', cls: 't-cream', title: 'Honest engineering', body: "Write down why you made every design choice, and if nobody can explain it, don't ship it." },
  { n: '02', cls: 't-blue', title: 'Iteration', body: 'The first idea is usually wrong, so prototype, test, break it, rebuild it, until the mechanism does what we need every time.' },
  { n: '03', cls: 't-peach', title: 'Teamwork', body: 'Mechanical, software, and strategy win or lose together as one system.' },
  { n: '04', cls: 't-yellow', title: 'Competition mindset', body: "Practice doesn't cover everything going wrong at once, so we rehearse that case and have fixes ready." },
  { n: '05', cls: 't-blue', title: 'Community impact', body: 'Outreach, mentorship, and STEM advocacy come with being Wolverine.' },
  { n: '06', cls: 't-cream', title: 'Gracious Professionalism', body: 'Gracious Professionalism is a FIRST core value and we hold ourselves to it. How you compete counts as much as whether you win, so we respect opponents, mentor rookies, and celebrate the sport.' },
];

const STORY = [
  ['THE BEGINNING', 'The team started in 2025 from nothing. No hand-me-down hardware and no alumni to call. We wanted our first season to produce something great.'],
  ['THE MACHINE', "MATCHSTICK is the 2025-26 robot. We drew it in CAD, ran stress tests in simulation, and kept changing it through dozens of practice matches. Every bolt, wire run, and motor was picked on purpose. Build clean, build fast, build to win. That's us."],
  ['THE MISSION', "Trophies aren't the only point. A competition is a test: a robot we designed with the clock running, mechanical, software, and strategy all fitting together, and drivers who know every part they touch. FTC is where STEM education stops being abstract."],
];

const AboutPage = ({ onNavigate }) => {
  const photos = [...byTag('team'), ...byTag('build')].slice(0, 3);
  return (
    <div>
      <BlueField hero>
        <p className="v-mono" style={{ opacity: 0.85 }}>WHO WE ARE</p>
        <h1 className="v-h1 mt-6">About us</h1>
        <p className="v-lead mx-auto mt-8" style={{ maxWidth: '38rem' }}>
          We're Team 33791, a rookie FIRST Tech Challenge team out of Wakeland High School in Frisco, Texas. {STUDENT_COUNT} students. Our goal is pretty simple: show that a first-year team can keep up with the best in high school robotics.
        </p>
      </BlueField>

      <Block narrow>
        <Reveal>
          <Card><div className="body !p-8">
            <p className="v-h2" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)' }}>"Built with precision. Engineered for excellence. Driven by innovation."</p>
            <p className="v-mono v-dim mt-5">WOLVERINE ROBOTICS MOTTO</p>
          </div></Card>
        </Reveal>
        <div className="mt-14 space-y-10">
          {STORY.map(([h, t], i) => (
            <Reveal key={h} delay={i * 60}>
              <p className="v-mono" style={{ color: 'var(--accent)' }}>{h}</p>
              <p className="v-body mt-3">{t}</p>
            </Reveal>
          ))}
        </div>
        {photos.length > 0 && (
          <div className="v-grid v-grid-3 mt-14">
            {photos.map((p) => <Card key={p.src}><div className="v-ratio-43"><Photo src={p.src} alt={p.alt} /></div></Card>)}
          </div>
        )}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Btn onClick={() => onNavigate('team')}>Meet the team</Btn>
          <Btn variant="ghost" onClick={() => onNavigate('robots')}>See the robot</Btn>
        </div>
      </Block>

      <Block>
        <SectionHead eyebrow="WHAT DRIVES US" title="Our values" />
        <div className="v-tiles v-tiles-3">
          {VALUES.map((v) => (
            <div key={v.n} className={`v-tile ${v.cls}`} style={{ minHeight: 280 }}>
              <span className="top v-mono"><span>VALUE</span><span>{v.n}</span></span>
              <span><span className="v-h3 block">{v.title}</span><span className="v-body mt-3 block" style={{ fontSize: '.95rem' }}>{v.body}</span></span>
            </div>
          ))}
        </div>
      </Block>

      <BlueField>
        <p className="v-mono" style={{ opacity: 0.85 }}>FIRST TECH CHALLENGE</p>
        <h2 className="v-h2 mt-4">The competition</h2>
        <p className="v-lead mx-auto mt-5" style={{ maxWidth: '40rem' }}>
          In short, FTC students design, build, program, and drive robots in head-to-head matches played in alliances. Judges score robot performance, engineering documentation, outreach, and gracious professionalism. All of it happens inside one school year.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn variant="onBlue" onClick={() => onNavigate('robots')}>Explore MATCHSTICK</Btn>
          <Btn variant="line" onClick={() => onNavigate('contact')}>Partner with us</Btn>
        </div>
      </BlueField>
    </div>
  );
};

export default AboutPage;
