import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
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
  const tx = { up: 'translateY(36px)', left: 'translateX(-36px)', right: 'translateX(36px)', scale: 'scale(0.92)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : (tx[direction] || tx.up),
      transition: `opacity 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.85s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

// ── Sponsor logo/card ──────────────────────────────────────────────
const SponsorCard = ({ sponsor, tier, delay }) => {
  const [imgErr, setImgErr] = useState(false);

  const tierStyles = {
    platinum: { border: 'rgba(229,231,235,0.3)', bg: 'rgba(229,231,235,0.04)', badge: '#E5E7EB', height: 180 },
    gold:     { border: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.04)',  badge: '#FBB924', height: 150 },
    silver:   { border: 'rgba(162,169,177,0.25)', bg: 'rgba(162,169,177,0.04)', badge: '#A2A9B1', height: 120 },
    default:  { border: 'rgba(255,90,31,0.15)',  bg: 'rgba(255,90,31,0.04)',  badge: '#FF5A1F',  height: 110 },
  };
  const style = tierStyles[tier] || tierStyles.default;

  return (
    <Reveal delay={delay} direction="scale">
      <div
        className="relative group border transition-all duration-500 hover:scale-[1.02] overflow-hidden"
        style={{
          background: style.bg,
          borderColor: style.border,
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = style.badge; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = style.border; }}
      >
        {/* Tier badge */}
        <div
          className="absolute top-3 right-3 px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-mono)',
            background: `${style.badge}18`,
            border: `1px solid ${style.badge}40`,
            color: style.badge,
            clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
          }}
        >
          {tier?.toUpperCase() || 'SPONSOR'}
        </div>

        {/* Logo area */}
        <div
          className="flex items-center justify-center p-8"
          style={{ height: style.height }}
        >
          {!imgErr && sponsor.image ? (
            <img
              src={sponsor.image}
              alt={sponsor.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ opacity: 0.92 }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <p
              className="text-xl font-black text-center uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.4)' }}
            >
              {sponsor.name}
            </p>
          )}
        </div>

        {/* Name bar */}
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: `${style.border}` }}
        >
          <p
            className="text-[11px] font-semibold tracking-wider text-center"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.45)' }}
          >
            {sponsor.name}
          </p>
          {sponsor.description && (
            <p
              className="text-[10px] text-center mt-1"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {sponsor.description}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
};

// ── Tier section ───────────────────────────────────────────────────
const TierSection = ({ tier, sponsors, delay }) => {
  if (!sponsors || sponsors.length === 0) return null;

  const tierConfig = {
    platinum: { label: 'PLATINUM', cols: 'grid-cols-1 sm:grid-cols-2', desc: 'Premier partners' },
    gold:     { label: 'GOLD',     cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', desc: 'Gold-level partners' },
    silver:   { label: 'SILVER',   cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', desc: 'Silver-level partners' },
    default:  { label: 'COMMUNITY',cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5', desc: 'Community supporters' },
  };
  const cfg = tierConfig[tier] || tierConfig.default;

  return (
    <div className="mb-20">
      <Reveal delay={delay}>
        <div className="flex items-center gap-5 mb-8">
          <div>
            <p className="label-caps">{cfg.label} SPONSORS</p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
              {cfg.desc}
            </p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,90,31,0.3), transparent)' }} />
        </div>
      </Reveal>
      <div className={`grid ${cfg.cols} gap-5`}>
        {sponsors.map((s, i) => (
          <SponsorCard key={i} sponsor={s} tier={tier} delay={delay + i * 60} />
        ))}
      </div>
    </div>
  );
};

// ── Partnership tier table ─────────────────────────────────────────
const TierTableRow = ({ tier, perks, price, featured }) => (
  <div
    className="relative p-6 border transition-all duration-300 hover:scale-[1.01]"
    style={{
      background: featured ? 'rgba(255,90,31,0.06)' : 'rgba(10,22,40,0.5)',
      borderColor: featured ? 'rgba(255,90,31,0.4)' : 'rgba(255,90,31,0.1)',
      clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
    }}
  >
    {featured && (
      <div
        className="absolute top-3 right-4 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'rgba(255,90,31,0.2)',
          border: '1px solid rgba(255,90,31,0.4)',
          color: '#FF5A1F',
          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
        }}
      >
        POPULAR
      </div>
    )}
    <div className="flex flex-wrap items-start gap-6">
      <div className="min-w-[120px]">
        <p
          className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1"
          style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
        >
          {tier}
        </p>
        <p
          className="text-lg font-black text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {price}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 flex-1">
        {perks.map((perk, i) => (
          <span
            key={i}
            className="px-3 py-1 text-[10px] tracking-wider border"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
            }}
          >
            {perk}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// SponsorsPage
// ─────────────────────────────────────────────────────────────────────
const SponsorsPage = ({ sponsors, onNavigate }) => {
  // Group sponsors by tier
  const grouped = sponsors.reduce((acc, s) => {
    const tier = s.tier || 'default';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(s);
    return acc;
  }, {});

  const tierOrder = ['platinum', 'gold', 'silver', 'default'];

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
          <Reveal><span className="label-caps">PARTNERSHIPS · SUPPORTERS</span></Reveal>
          <Reveal delay={80} direction="left">
            <h1 className="display-xl text-white mt-4 mb-6" style={{ lineHeight: 0.9 }}>
              OUR
              <span style={{ color: '#FF5A1F', display: 'block' }}>SPONSORS</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="body-lg max-w-xl">
              Their belief in the next generation of engineers makes this program possible.
              Every sponsor is a direct investor in student-led innovation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ SPONSOR GRID ════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#0a1628' }}>
        <div className="container-wide">
          {sponsors.length === 0 ? (
            <div className="text-center py-20">
              <p
                className="text-sm tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.15)' }}
              >
                SPONSORS COMING SOON
              </p>
            </div>
          ) : (
            tierOrder.map((tier, i) => (
              grouped[tier] ? (
                <TierSection
                  key={tier}
                  tier={tier}
                  sponsors={grouped[tier]}
                  delay={i * 80}
                />
              ) : null
            ))
          )}
        </div>
      </section>

      {/* ═══ BECOME A SPONSOR ════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #061020 100%)',
          borderTop: '1px solid rgba(255,90,31,0.08)',
        }}
      >
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* CTA text */}
            <div>
              <Reveal><span className="label-caps">PARTNERSHIP OPPORTUNITIES</span></Reveal>
              <Reveal delay={80} direction="left">
                <h2 className="display-lg text-white mt-3 mb-6">
                  BECOME A<br />
                  <span style={{ color: '#FF5A1F' }}>SPONSOR</span>
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your support directly funds competition entry fees, robot components,
                  travel, and outreach programs. In return, your brand reaches thousands
                  of STEM-engaged students, parents, and industry professionals across
                  the FIRST community.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <AngleButton onClick={() => onNavigate('contact')} variant="primary" size="lg">
                  PARTNER WITH US <ChevronRight size={16} />
                </AngleButton>
              </Reveal>
            </div>

            {/* Tier table */}
            <div className="space-y-3">
              <Reveal delay={120}>
                <p
                  className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-5"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                >
                  PARTNERSHIP TIERS
                </p>
              </Reveal>
              {[
                {
                  tier: 'PLATINUM',
                  price: 'Custom',
                  perks: ['Logo on robot', 'Banner at competitions', 'Social media features', 'Engineering reports', 'Direct team access'],
                  featured: false,
                },
                {
                  tier: 'GOLD',
                  price: '$1,000+',
                  perks: ['Logo on robot', 'Banner at competitions', 'Social media features', 'Website listing'],
                  featured: true,
                },
                {
                  tier: 'SILVER',
                  price: '$500+',
                  perks: ['Website listing', 'Social media mention', 'Competition recognition'],
                  featured: false,
                },
                {
                  tier: 'COMMUNITY',
                  price: 'Any amount',
                  perks: ['Website listing', 'Thank-you post'],
                  featured: false,
                },
              ].map((t, i) => (
                <Reveal key={i} delay={160 + i * 60} direction="right">
                  <TierTableRow {...t} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SponsorsPage;
