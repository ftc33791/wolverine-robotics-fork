import React from 'react';

const SOCIAL = [
  ['GitHub', 'https://github.com/wolverine-robotics'],
  ['LinkedIn', 'https://www.linkedin.com/company/wolverine-robotics/'],
  ['Instagram', 'https://www.instagram.com/wolverine_robotics_ftc33791/'],
];

const Footer = ({ onNavigate, navigation }) => (
  <footer className="v-footer">
    <div className="wrap">
      <p className="v-h3">Wolverine Robotics</p>
      <p className="v-body mt-2">A first-year FTC team from Wakeland High School in Frisco, Texas.</p>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-3">
        <div className="col">
          <p className="v-mono v-dim mb-2">EXPLORE</p>
          {navigation.map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)}>{item.name.charAt(0) + item.name.slice(1).toLowerCase()}</button>
          ))}
        </div>
        <div className="col">
          <p className="v-mono v-dim mb-2">FIND US</p>
          {SOCIAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer">{l}</a>)}
        </div>
        <div className="col col-span-2 sm:col-span-1">
          <p className="v-mono v-dim mb-2">CONTACT</p>
          <a href="mailto:ftc33791@gmail.com">ftc33791@gmail.com</a>
          <p className="v-body" style={{ fontSize: '.95rem' }}>Frisco, Texas</p>
          <p className="v-body" style={{ fontSize: '.95rem' }}>2025-26 Decode</p>
        </div>
      </div>

      <div className="mt-12 border-t pt-6" style={{ borderColor: 'var(--rule)' }}>
        <p className="v-mono v-dim">© 2025 Wolverine Robotics · FTC Team 33791 · All rights reserved</p>
        <p className="v-mono v-dim mt-2" style={{ opacity: 0.8 }}>Built by Sahejdeep Singh · Guided by Dev Gavande &amp; Abdullah Khaled</p>
      </div>
    </div>
  </footer>
);

export default Footer;
