import React, { useRef } from 'react';

/**
 * AngleButton — chamfered-corner CTA with magnetic hover.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
const AngleButton = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  size = 'md',
  disabled = false,
  type = 'button',
}) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  const sizeMap = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-7 py-3.5 text-xs',
    lg: 'px-10 py-4 text-sm',
  };

  const variantMap = {
    primary: {
      base: 'bg-[#FF5A1F] text-white border-[#FF5A1F]',
      hover: 'hover:bg-[#E04A10] hover:border-[#E04A10]',
      glow: 'hover:shadow-[0_0_30px_rgba(255,90,31,0.45),0_0_60px_rgba(255,90,31,0.2)]',
    },
    secondary: {
      base: 'bg-transparent text-white border-[#FF5A1F]',
      hover: 'hover:bg-[rgba(255,90,31,0.1)]',
      glow: 'hover:shadow-[0_0_25px_rgba(255,90,31,0.3)]',
    },
    ghost: {
      base: 'bg-transparent text-[#A2A9B1] border-[#1a2f4a]',
      hover: 'hover:text-white hover:border-[#A2A9B1]',
      glow: '',
    },
    danger: {
      base: 'bg-transparent text-red-400 border-red-800',
      hover: 'hover:bg-red-900/20',
      glow: '',
    },
  };

  const v = variantMap[variant] || variantMap.primary;

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        'relative inline-flex items-center gap-2.5 border',
        'font-mono font-semibold tracking-widest uppercase',
        'transition-all duration-300',
        'clip-chamfer-sm overflow-hidden',
        'select-none',
        sizeMap[size],
        v.base,
        v.hover,
        v.glow,
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-none',
        className,
      ].join(' ')}
      style={{ willChange: 'transform', transitionProperty: 'transform, box-shadow, background-color, border-color, color' }}
    >
      {/* Shimmer overlay */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700"
        style={{
          background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          skewX: '-20deg',
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
    </button>
  );
};

export default AngleButton;
