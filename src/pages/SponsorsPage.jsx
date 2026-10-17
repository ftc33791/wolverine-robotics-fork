import React, { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import { Btn, BlueField, Reveal, SectionHead, Block, Card } from '../components/ui/Kit';

const PACKET_URL = 'https://drive.google.com/file/d/1hEzIhMCc46IsMPRaYb8D-5gL4FJLSHcs/view?usp=sharing';
const MAILTO = `mailto:ftc33791@gmail.com?subject=${encodeURIComponent('Sponsoring Wolverine Robotics')}`;

/* Everything in PACKET below is quoted or restated from the team's
   "Wolverine Robotics FTC 33791 Sponsorship Packet, 26'-27'" (Drive file
   "Wolverine Robotics.pdf"). No tiers or prices appear in the packet. */
const PACKET = {
  why: "Wolverine Robotics is a rapidly growing team that is projected to reach even better results than the previous year. With your help and support, not only will you support a growing team, you'll be able to support some of the most promising upcoming talent in the DFW Metroplex.",
  branding: [
    'Logo placement on team shirts and banners',
    'Logo on the robot and robot cart',
    'Large branding on social media and the website',
    'Branding placed at every outreach event',
  ],
  journey: [
    ['FIRST EVER MEET', 'As a new team, having finished an EveryBot in just 11 days, we competed for the first time.'],
    ['LEAGUE TOURNAMENT', 'With a completely revamped robot, we won the Control Award and were Semifinalists as well.'],
    ['DALLAS SEMI-REGIONAL', 'We captured the Control Award and won the tournament outright, moving us to the state finals.'],
    ['UIL STATE CHAMPIONSHIP', 'We went to Waco to compete against the best in Texas, and peaked at #2 overall in our division.'],
  ],
  numbers: [
    ['41.5%', 'FASTER CYCLES', 'Cycle times fell from 6.5 seconds to 3.8 seconds.'],
    ['92%', 'AUTO-ALIGN ACCURACY', 'AprilTag vision tracking with Limelight.'],
    ['500×', 'POSITIONING IMPROVEMENT', 'Positional drift fell from about 1% to 0.002% with goBILDA Pinpoint odometry and IMU data.'],
    ['0.95 s', 'RAPID FIRE', 'The triple-flywheel shooter launches three game elements in under one second.'],
  ],
};

const SponsorCard = ({ sponsor }) => {
  const [err, setErr] = useState(false);
  return (
    <Card className="h-full"><div className="body">
      <div className="flex items-center justify-center" style={{ height: 110 }}>
        {!err && sponsor.image
          ? <img src={sponsor.image} alt={sponsor.name} className="max-h-full max-w-full object-contain" onError={() => setErr(true)} />
          : <p className="v-h3">{sponsor.name}</p>}
      </div>
      <p className="mt-3 text-[15px] font-medium">{sponsor.name}</p>
      {sponsor.description && <p className="v-body mt-1" style={{ fontSize: '.85rem' }}>{sponsor.description}</p>}
    </div></Card>
  );
};

const SponsorsPage = ({ sponsors }) => (
  <div>
    <BlueField hero>
      <p className="v-mono" style={{ opacity: 0.85 }}>PARTNERSHIPS · 26'-27' SPONSORSHIP PACKET</p>
      <h1 className="v-h1 mt-6">Our sponsors</h1>
      <p className="v-lead mx-auto mt-8" style={{ maxWidth: '34rem' }}>Our sponsors make this program possible. Thank you for supporting student engineers.</p>
    </BlueField>

    <Block>
      {sponsors.length === 0
        ? <p className="v-mono v-dim">SPONSORS COMING SOON</p>
        : <div className="v-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', maxWidth: 760, margin: '0 auto' }}>{sponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)}</div>}
    </Block>

    <Block narrow>
      <SectionHead eyebrow="FROM OUR SPONSORSHIP PACKET" title="Why sponsor robotics?" intro={PACKET.why} />
    </Block>

    <Block>
      <SectionHead eyebrow="THE STORY SO FAR" title="Our first season" intro="1 season, 12 students, 1 mission." />
      <div className="v-tiles">
        {PACKET.journey.map(([h, t], i) => (
          <div key={h} className={`v-tile ${['t-cream', 't-blue', 't-peach', 't-yellow'][i]}`} style={{ minHeight: 300 }}>
            <span className="top v-mono"><span>{h}</span><span>0{i + 1}</span></span>
            <span className="v-body block" style={{ color: 'var(--ink)', fontSize: '.98rem' }}>{t}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['2× CONTROL AWARD', '2ND PLACE · UIL STATE 5A', 'WINNER · DALLAS SEMI-REGIONAL'].map((c) => <span key={c} className="v-chip">{c}</span>)}
      </div>
    </Block>

    <Block>
      <SectionHead eyebrow="ENGINEERING REIMAGINED" title="What your support builds" />
      <div className="v-grid v-grid-4">
        {PACKET.numbers.map(([n, l, d]) => (
          <Reveal key={l}><Card className="h-full"><div className="body !pt-6">
            <p className="v-stat" style={{ color: 'var(--accent)' }}>{n}</p>
            <p className="v-mono mt-3">{l}</p>
            <p className="v-body mt-2" style={{ fontSize: '.88rem' }}>{d}</p>
          </div></Card></Reveal>
        ))}
      </div>
    </Block>

    <Block narrow>
      <SectionHead eyebrow="WHERE YOUR BRANDING PLAYS" title="What sponsors get" />
      <div className="flex flex-wrap justify-center gap-2">{PACKET.branding.map((b) => <span key={b} className="v-chip">{b}</span>)}</div>
      <p className="v-body mx-auto mt-8" style={{ maxWidth: '34rem' }}>
        We are also a school team and take part in STEM workshops and outreach events in and outside the school area. The packet states that all donations are tax-exempt.
      </p>
      <p className="v-body mx-auto mt-4" style={{ maxWidth: '34rem' }}>
        Our total estimated cost for the whole year is about $11,000.
      </p>
    </Block>

    <BlueField>
      <p className="v-mono" style={{ opacity: 0.85 }}>BECOME A SPONSOR</p>
      <h2 className="v-h2 mt-4">Read the packet. Then say hello.</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Btn variant="onBlue" href={PACKET_URL} target="_blank" rel="noopener noreferrer"><Download size={15} /> Download the packet</Btn>
        <Btn variant="line" href={MAILTO}><Mail size={15} /> Email us</Btn>
      </div>
    </BlueField>
  </div>
);

export default SponsorsPage;
