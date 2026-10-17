import React from 'react';
import { Mail, MapPin, Users } from 'lucide-react';
import { Btn, BlueField, Reveal, Block, Card } from '../components/ui/Kit';

const EMAIL = 'ftc33791@gmail.com';
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Hello from the Wolverine Robotics website')}`;

const INFO = [
  [Mail, 'EMAIL', EMAIL, MAILTO],
  [MapPin, 'LOCATION', 'Wakeland High School, Frisco, Texas'],
  [Users, 'TEAM', 'FTC Team 33791 · Wolverine Robotics'],
];

const SOCIAL = [
  ['GitHub', 'https://github.com/wolverine-robotics'],
  ['LinkedIn', 'https://www.linkedin.com/company/wolverine-robotics/'],
  ['Instagram', 'https://www.instagram.com/wolverine_robotics_ftc33791/'],
];

const ContactPage = () => (
  <div>
    <BlueField hero>
      <p className="v-mono" style={{ opacity: 0.85 }}>CONNECT · COLLABORATE</p>
      <h1 className="v-h1 mt-6">Get in touch</h1>
      <p className="v-lead mx-auto mt-8" style={{ maxWidth: '34rem' }}>
        Have a question, a sponsorship inquiry, or an idea to work on together? Send us an email.
      </p>
      <div className="mt-10">
        <Btn variant="onBlue" href={MAILTO}><Mail size={16} /> Email the team</Btn>
        <p className="v-mono mt-4" style={{ opacity: 0.9 }}>{EMAIL}</p>
      </div>
    </BlueField>

    <Block narrow>
      <div className="v-grid v-grid-3">
        {INFO.map(([Icon, label, value, href], i) => (
          <Reveal key={label} delay={i * 60}>
            <Card className="h-full"><div className="body !py-6">
              <Icon size={18} color="var(--blue)" className="mx-auto" />
              <p className="v-mono v-dim mt-3">{label}</p>
              {href
                ? <a href={href} className="mt-1 block text-sm underline underline-offset-4">{value}</a>
                : <p className="mt-1 text-sm">{value}</p>}
            </div></Card>
          </Reveal>
        ))}
      </div>
      <p className="v-mono v-dim mt-12">FOLLOW US</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SOCIAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="v-chip">{l} ↗</a>)}
      </div>
    </Block>
  </div>
);

export default ContactPage;
