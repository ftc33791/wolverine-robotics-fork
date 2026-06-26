import React, { useState } from 'react';

/**
 * OnshapeViewer — embeds a live Onshape CAD viewer via iframe.
 *
 * Why: GLB exports of full assemblies get huge fast (tens of MB),
 * which bloats the repo and slows page load. Onshape's public
 * embed link streams the model straight from their servers —
 * nothing to host, nothing to compress, always reflects the
 * latest version of your CAD.
 *
 * Setup (one-time, per document):
 *   1. Open the document/assembly in Onshape
 *   2. Share -> enable "Anyone with link can view"
 *   3. Share -> "Get embeddable link" -> copy the iframe src URL
 *   4. Paste that URL into the `embedUrl` field for the robot in src/data.js
 */
const OnshapeViewer = ({ embedUrl, height = '600px', title = 'CAD Model' }) => {
  const [loaded, setLoaded] = useState(false);

  if (!embedUrl) {
    return (
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,90,31,0.3)' }}
      >
        <p
          className="text-xs tracking-widest uppercase text-center px-6"
          style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}
        >
          CAD embed link not set — add `embedUrl` to this robot in src/data.js
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 border-2 border-t-[#FF5A1F] border-r-[#FF5A1F] border-b-transparent border-l-transparent rounded-full"
              style={{ animation: 'rotate-slow 0.8s linear infinite' }}
            />
            <p
              className="text-[10px] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,90,31,0.6)' }}
            >
              LOADING CAD…
            </p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title={title}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  );
};

export default OnshapeViewer;
