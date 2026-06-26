import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';

const Footer = ({ onNavigate, navigation }) => {
  return (
    <footer
      style={{
        background: '#061020',
        borderTop: '1px solid rgba(255,90,31,0.12)',
      }}
    >
      {/* Top accent line */}
      <div
        className="w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,90,31,0.5) 30%, rgba(255,90,31,0.5) 70%, transparent)',
        }}
      />

      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <p
                className="text-white font-black text-xl uppercase tracking-widest leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                WOLVERINE
              </p>
              <p
                className="text-[11px] tracking-[0.2em] uppercase mt-1"
                style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
              >
                ROBOTICS · TEAM 33791
              </p>
            </div>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              First-year FTC team from Frisco, Texas. Engineering precision.
              Competing with conviction. Building the future.
            </p>
            <div className="flex gap-3">
              {[
                [Github, 'https://github.com/wolverine-robotics', 'GitHub'],
                [Linkedin, 'https://www.linkedin.com/company/wolverine-robotics/', 'LinkedIn'],
                [Instagram, 'https://www.instagram.com/wolverine_robotics/', 'Instagram'],
              ].map(([Icon, href, label], i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border transition-all duration-300 hover:scale-110"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                    background: 'rgba(255,90,31,0.08)',
                    borderColor: 'rgba(255,90,31,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,90,31,0.2)';
                    e.currentTarget.style.borderColor = '#FF5A1F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,90,31,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,90,31,0.25)';
                  }}
                >
                  <Icon size={15} color="#FF5A1F" />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="md:col-span-2" />

          {/* Quick links */}
          <div className="md:col-span-3">
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
            >
              QUICK LINKS
            </p>
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="text-left text-[13px] transition-all duration-200 hover:translate-x-1"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
            >
              CONTACT
            </p>
            <div className="flex flex-col gap-2">
              {[
                ['EMAIL', 'ftc33791@gmail.com'],
                ['LOCATION', 'Frisco, Texas'],
                ['SCHOOL', 'Wakeland High School'],
                ['SEASON', '2025-26 Decode'],
              ].map(([label, val]) => (
                <div key={label}>
                  <span
                    className="text-[9px] tracking-widest"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-faint)' }}
                  >
                    {label}
                  </span>
                  <p
                    className="text-[13px]"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>
            © 2025 Wolverine Robotics · FTC Team 33791 · All rights reserved
          </p>
          <p className="text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.12)' }}>
            Built by Sahejdeep Singh · Guided by Dev Gavande & Abdullah Khaled
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
