import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BlueField, Block, Photo } from '../components/ui/Kit';
import { PHOTOS } from '../photos.js';

const TAGS = [['all', 'All'], ['robot', 'Robot'], ['team', 'Team'], ['build', 'Build'], ['event', 'Events'], ['outreach', 'Outreach']];

const GalleryPage = () => {
  const [tag, setTag] = useState('all');
  const [open, setOpen] = useState(null);
  const shown = PHOTOS.filter((p) => tag === 'all' || p.tag === tag);
  return (
    <div>
      <BlueField hero>
        <p className="v-mono" style={{ opacity: 0.85 }}>{PHOTOS.length} PHOTOS</p>
        <h1 className="v-h1 mt-6">Gallery</h1>
      </BlueField>
      <Block>
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {TAGS.map(([id, l]) => <button key={id} onClick={() => setTag(id)} className="v-chip" style={{ background: tag === id ? '#fff' : 'rgba(255,255,255,0.08)', color: tag === id ? '#0a1cae' : '#fff' }}>{l}</button>)}
        </div>
        {shown.length === 0 && <p className="v-mono v-dim">PHOTOS COMING SOON</p>}
        <div style={{ columnGap: '1rem' }} className="columns-1 sm:columns-2 lg:columns-3">
          {shown.map((p) => (
            <button key={p.src} className="mb-4 block w-full overflow-hidden rounded-xl" style={{ breakInside: 'avoid', border: '1px solid var(--rule)' }} onClick={() => setOpen(p)}>
              <Photo src={p.src} alt={p.alt} className="block w-full" />
            </button>
          ))}
        </div>
      </Block>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 300, background: 'rgba(10,20,112,0.9)' }} onClick={() => setOpen(null)}>
          <button className="absolute right-5 top-5 text-white" aria-label="Close"><X size={26} /></button>
          <img src={open.src} alt={open.alt} style={{ maxWidth: '94vw', maxHeight: '90vh', borderRadius: 10 }} />
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
