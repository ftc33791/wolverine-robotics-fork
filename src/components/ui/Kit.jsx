import React, { useEffect, useRef, useState } from 'react';

/** Fade/slide in once when scrolled into view. Transform + opacity only. */
export const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(20px)',
        transition: `opacity 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
};

/** Pill/rounded button. variant: primary | ghost | onBlue | line */
export const Btn = ({ children, onClick, href, variant = 'primary', className = '', ...rest }) => {
  const v = { primary: '', ghost: 'v-btn-ghost', onBlue: 'v-btn-on-blue', line: 'v-btn-line' }[variant] || '';
  const cls = `v-btn ${v} ${className}`;
  return href
    ? <a href={href} className={cls} {...rest}>{children}</a>
    : <button type="button" onClick={onClick} className={cls} {...rest}>{children}</button>;
};

/** Blue blueprint band. Hero when `hero` is set. */
export const BlueField = ({ children, hero = false, className = '' }) => (
  <section className={`bp-field ${className}`} style={hero ? { paddingTop: 'clamp(7rem, 16vw, 10rem)', paddingBottom: 'clamp(4rem, 9vw, 7rem)' } : { padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
    <div className="bp-content wrap">{children}</div>
  </section>
);

/** Centred section heading: mono eyebrow, title, optional lead. */
export const SectionHead = ({ eyebrow, title, intro, level = 2, onBlue = false }) => {
  const H = `h${level}`;
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow && <Reveal><p className="v-mono" style={{ opacity: 0.8 }}>{eyebrow}</p></Reveal>}
      <Reveal delay={60}><H className={`${level === 1 ? 'v-h1' : 'v-h2'} mt-3`}>{title}</H></Reveal>
      {intro && <Reveal delay={120}><p className="v-lead mx-auto mt-5" style={{ maxWidth: '40rem' }}>{intro}</p></Reveal>}
    </div>
  );
};

/** Plain content section on the paper background. */
export const Block = ({ children, className = '', narrow = false, id }) => (
  <section id={id} className={`v-section ${className}`}>
    <div className={narrow ? 'wrap-narrow' : 'wrap'}>{children}</div>
  </section>
);

/** White bordered card. */
export const Card = ({ children, className = '' }) => <div className={`v-card ${className}`}>{children}</div>;

/** Photo with lazy loading; renders nothing if it fails. */
export const Photo = ({ src, alt = '', className = 'v-photo' }) => {
  const [err, setErr] = useState(false);
  if (err) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setErr(true)} className={className} />;
};

/** Reserved spot for the future CAD viewer (no WebGL yet). */
export const CadSlot = ({ title = 'CAD viewer', note = 'Interactive CAD of MATCHSTICK goes here once the model is ready.' }) => (
  <div className="v-cad" data-slot="cad-viewer">
    <p className="v-mono" style={{ color: 'var(--accent)' }}>RESERVED · CAD VIEWER</p>
    <p className="v-h3">{title}</p>
    <p className="v-body" style={{ maxWidth: '26rem' }}>{note}</p>
  </div>
);
