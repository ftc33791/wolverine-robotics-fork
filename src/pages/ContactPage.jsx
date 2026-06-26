import React, { useState, useRef, useEffect } from 'react';
import { Mail, MapPin, Users, Github, Linkedin, Instagram, Send, CheckCircle } from 'lucide-react';
import AngleButton from '../components/ui/AngleButton';
import GridScan from '../components/ui/GridScan';

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
  const tx = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)', scale: 'scale(0.93)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : (tx[direction] || tx.up),
      transition: `opacity 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

// ── Input field ────────────────────────────────────────────────────
const Field = ({ label, type = 'text', value, onChange, required, rows }) => {
  const [focused, setFocused] = useState(false);
  const baseStyle = {
    background: '#020c18',
    borderColor: focused ? '#FF5A1F' : 'rgba(255,90,31,0.15)',
    color: '#E8EDF3',
    outline: 'none',
    transition: 'border-color 0.25s ease',
    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
  };

  return (
    <div>
      <label
        className="block text-[9px] font-semibold tracking-[0.22em] uppercase mb-2"
        style={{ fontFamily: 'var(--font-mono)', color: focused ? '#FF5A1F' : 'rgba(255,255,255,0.3)' }}
      >
        {label}{required && <span style={{ color: '#FF5A1F' }}> *</span>}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3 text-sm border resize-none"
          style={baseStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3 text-sm border"
          style={baseStyle}
        />
      )}
    </div>
  );
};

// ── Info card ──────────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, label, value, href, delay }) => (
  <Reveal delay={delay}>
    <div
      className="flex items-start gap-4 p-5 border transition-colors duration-300"
      style={{
        background: 'rgba(10,22,40,0.5)',
        borderColor: 'rgba(255,90,31,0.1)',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0 border"
        style={{
          borderColor: 'rgba(255,90,31,0.2)',
          background: 'rgba(255,90,31,0.07)',
          clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
        }}
      >
        <Icon size={15} color="#FF5A1F" />
      </div>
      <div>
        <p
          className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-1"
          style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
        >
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="text-sm transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-mono)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5A1F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-mono)' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  </Reveal>
);

// ─────────────────────────────────────────────────────────────────────
// ContactPage
// ─────────────────────────────────────────────────────────────────────
const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate send — replace with real form action (Formspree / EmailJS / etc.)
    setTimeout(() => setStatus('sent'), 1500);
  };

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
          <GridScan sensitivity={0.2} scanOpacity={0.1} opacity={1} />
        </div>

        <div className="container-wide relative z-10">
          <Reveal><span className="label-caps">CONNECT · COLLABORATE</span></Reveal>
          <Reveal delay={80} direction="left">
            <h1 className="display-xl text-white mt-4 mb-6" style={{ lineHeight: 0.9 }}>
              GET IN
              <span style={{ color: '#FF5A1F', display: 'block' }}>TOUCH</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="body-lg max-w-xl">
              Questions? Sponsorship inquiries? Want to collaborate? We're responsive and ready to talk.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CONTACT GRID ════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#0a1628' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left: info */}
            <div className="lg:col-span-4 space-y-4">
              <Reveal>
                <p
                  className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-6"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                >
                  CONTACT INFO
                </p>
              </Reveal>

              <InfoCard icon={Mail}    label="EMAIL"    value="ftc33791@gmail.com" href="mailto:ftc33791@gmail.com" delay={40} />
              <InfoCard icon={MapPin}  label="LOCATION" value="Wakeland High School, Frisco, Texas" delay={100} />
              <InfoCard icon={Users}   label="TEAM"     value="FTC Team 33791 · Wolverine Robotics" delay={160} />

              {/* Social links */}
              <Reveal delay={220}>
                <div className="pt-4">
                  <p
                    className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-4"
                    style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                  >
                    FOLLOW US
                  </p>
                  <div className="flex gap-3">
                    {[
                      [Github,    'https://github.com/wolverine-robotics',              'GitHub'],
                      [Linkedin,  'https://www.linkedin.com/company/wolverine-robotics/', 'LinkedIn'],
                      [Instagram, 'https://www.instagram.com/wolverine_robotics/',        'Instagram'],
                    ].map(([Icon, href, label], i) => (
                      <a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex items-center gap-2 px-4 py-2.5 border text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                          background: 'rgba(255,90,31,0.06)',
                          borderColor: 'rgba(255,90,31,0.2)',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#FF5A1F';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,90,31,0.2)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        }}
                      >
                        <Icon size={13} />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-8">
              <Reveal delay={80} direction="right">
                <div
                  className="p-8 border"
                  style={{
                    background: 'rgba(10,22,40,0.5)',
                    borderColor: 'rgba(255,90,31,0.12)',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
                  }}
                >
                  {status === 'sent' ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <CheckCircle size={40} color="#FF5A1F" />
                      <p
                        className="text-lg font-black text-white uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        MESSAGE SENT
                      </p>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        We'll get back to you shortly.
                      </p>
                      <button
                        onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
                        className="mt-4 text-[11px] tracking-widest uppercase transition-colors duration-200"
                        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.6)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5A1F')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,90,31,0.6)')}
                      >
                        SEND ANOTHER →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Your Name"    value={form.name}    onChange={set('name')}    required />
                        <Field label="Email Address" type="email" value={form.email} onChange={set('email')} required />
                      </div>
                      <Field label="Subject" value={form.subject} onChange={set('subject')} />
                      <Field label="Message" value={form.message} onChange={set('message')} required rows={6} />

                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <p
                          className="text-[10px]"
                          style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
                        >
                          * Required fields
                        </p>
                        <AngleButton
                          type="submit"
                          variant="primary"
                          size="md"
                          disabled={status === 'sending'}
                        >
                          {status === 'sending' ? (
                            'SENDING…'
                          ) : (
                            <>SEND MESSAGE <Send size={13} /></>
                          )}
                        </AngleButton>
                      </div>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
