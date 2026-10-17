import React from 'react';

/**
 * Blueprint backdrop for a blue field (hero and CTA bands): saturated blue, a drifting drafting grid,
 * slow technical linework and paper grain. Pure CSS/SVG, transform and opacity
 * only. Animations switch off under prefers-reduced-motion (see blueprint.css).
 */
const BlueprintBackground = () => (
  <div className="bp-fx" aria-hidden="true">
    <div className="bp-grid bp-grid-minor" />
    <div className="bp-grid bp-grid-major" />

    <svg className="bp-lines" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#fff" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
        {/* large drafting circles, slow rotation */}
        <g className="bp-spin-a" style={{ transformOrigin: '1180px 300px' }}>
          <circle cx="1180" cy="300" r="260" strokeDasharray="2 10" />
          <circle cx="1180" cy="300" r="190" />
          <circle cx="1180" cy="300" r="120" strokeDasharray="14 8" />
          <line x1="900" y1="300" x2="1460" y2="300" />
          <line x1="1180" y1="20" x2="1180" y2="580" />
        </g>
        <g className="bp-spin-b" style={{ transformOrigin: '300px 720px' }}>
          <circle cx="300" cy="720" r="210" strokeDasharray="3 9" />
          <circle cx="300" cy="720" r="140" />
          <circle cx="300" cy="720" r="60" strokeDasharray="10 6" />
          <line x1="60" y1="720" x2="540" y2="720" />
          <line x1="300" y1="480" x2="300" y2="960" />
        </g>
        {/* dimension lines that draw themselves */}
        <g className="bp-draw">
          <path d="M120 140 H620 M120 128 V152 M620 128 V152" />
          <path d="M1000 880 H1480 M1000 868 V892 M1480 868 V892" />
          <path d="M70 200 V560 M58 200 H82 M58 560 H82" />
          <path d="M1530 420 V820 M1518 420 H1542 M1518 820 H1542" />
          <path d="M620 560 L760 460 L900 560 L760 660 Z" />
          <path d="M760 460 V660 M620 560 H900" strokeDasharray="4 6" />
        </g>
        {/* registration crosses */}
        <g className="bp-pulse" strokeWidth="1.4">
          <path d="M40 40 h28 M54 26 v28" />
          <path d="M1532 40 h28 M1546 26 v28" />
          <path d="M40 960 h28 M54 946 v28" />
          <path d="M1532 960 h28 M1546 946 v28" />
        </g>
      </g>
    </svg>

    <div className="bp-grain" />
  </div>
);

export default BlueprintBackground;
