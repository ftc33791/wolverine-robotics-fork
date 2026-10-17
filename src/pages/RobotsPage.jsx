import React, { useState } from 'react';
import { BlueField, Reveal, SectionHead, Block, Card, Photo, CadSlot } from '../components/ui/Kit';
import { byTag } from '../photos.js';

const RobotsPage = ({ robots }) => {
  const [idx, setIdx] = useState(0);
  const [sub, setSub] = useState(0);
  const robot = robots[idx];
  const photos = byTag('robot');
  const s = robot.subsystems[sub];

  return (
    <div>
      <BlueField hero>
        <p className="v-mono" style={{ opacity: 0.85 }}>ENGINEERING · COMPETITION MACHINES</p>
        <h1 className="v-h1 mt-6">Our robots</h1>
      </BlueField>

      {robots.length > 1 && (
        <div className="sticky z-[150] border-b" style={{ top: 64, background: 'rgba(252,252,250,0.95)', borderColor: 'var(--rule)' }}>
          <div className="wrap flex justify-center gap-2 overflow-x-auto py-3">
            {robots.map((r, i) => (
              <button key={r.id} onClick={() => { setIdx(i); setSub(0); }} className="v-chip" style={{ background: i === idx ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)' }}>{r.season} · {r.name}</button>
            ))}
          </div>
        </div>
      )}

      <Block narrow>
        <SectionHead eyebrow={robot.season} title={robot.name} intro={robot.description} />
        <p className="v-mono -mt-6 mb-10" style={{ color: 'var(--accent)' }}>{robot.challenge.toUpperCase()}</p>

        {photos.length > 0 && (
          <div className="v-grid v-grid-3 mb-6">
            {photos.slice(0, 3).map((p) => <Card key={p.src}><div className="v-ratio-43"><Photo src={p.src} alt={p.alt} /></div></Card>)}
          </div>
        )}
        <CadSlot title={`${robot.name} CAD`} note="Interactive CAD of this robot goes here once the model is ready." />

        <div className="mx-auto mt-14 max-w-xl overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'var(--rule)' }}>
          {robot.specs.map((sp, i) => (
            <div key={sp.label} className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: i ? '1px solid var(--rule)' : 'none' }}>
              <span className="v-mono v-dim">{sp.label}</span>
              <span className="text-[15px] font-medium">{sp.value}</span>
            </div>
          ))}
        </div>

        {robot.achievements.length > 0 && (
          <div className="mt-10">
            <p className="v-mono v-dim mb-3">ACHIEVEMENTS</p>
            <div className="flex flex-wrap justify-center gap-2">{robot.achievements.map((a) => <span key={a} className="v-chip">{a}</span>)}</div>
          </div>
        )}
      </Block>

      <Block>
        <SectionHead eyebrow="ENGINEERING BREAKDOWN" title="Subsystems" />
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {robot.subsystems.map((x, i) => (
            <button key={x.name} onClick={() => setSub(i)} className="v-chip" style={{ background: i === sub ? '#fff' : 'rgba(255,255,255,0.08)', color: i === sub ? '#0a1cae' : '#fff', borderColor: i === sub ? '#fff' : 'var(--rule)' }}>{x.icon} {x.name}</button>
          ))}
        </div>
        {s && (
          <div key={sub} className="mx-auto max-w-3xl" style={{ animation: 'fade-up 0.45s var(--ease-out-expo) both' }}>
            <Card><div className="body !p-8">
              <p className="v-mono" style={{ color: 'var(--accent)' }}>{s.name}</p>
              {s.hardware && <p className="v-mono v-dim mt-2" style={{ textTransform: 'none' }}>{s.hardware}</p>}
              <p className="v-body mt-5">{s.detail}</p>
              {s.features && (
                <ul className="mx-auto mt-6 grid max-w-2xl gap-2 text-left sm:grid-cols-2">
                  {s.features.map((f) => <li key={f} className="flex gap-2 text-sm" style={{ color: 'var(--ink-dim)' }}><span style={{ color: 'var(--accent)' }}>◆</span>{f}</li>)}
                </ul>
              )}
            </div></Card>
            {s.metrics && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {s.metrics.map((m) => (
                  <Card key={m.label}><div className="body !py-4"><p className="v-h3" style={{ color: 'var(--accent)' }}>{m.value}</p><p className="v-mono v-dim mt-1" style={{ fontSize: '.65rem' }}>{m.label}</p></div></Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Block>

      <Block narrow>
        <SectionHead eyebrow="AUTONOMY AND CONTROL" title="Software" intro={robot.software?.overview} />
        <div className="space-y-3">
          {robot.software?.features?.map((f, i) => (
            <Reveal key={f.title} delay={i * 40}>
              <Card><div className="body">
                <p className="v-mono">{f.title}</p>
                <p className="v-body mt-2" style={{ fontSize: '.95rem' }}>{f.desc}</p>
              </div></Card>
            </Reveal>
          ))}
        </div>
      </Block>
    </div>
  );
};

export default RobotsPage;
