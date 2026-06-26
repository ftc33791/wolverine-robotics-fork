// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design token aliases — use these in className for consistency
        orange: {
          DEFAULT: '#FF5A1F',
          dim:     '#CC3D0A',
          glow:    'rgba(255,90,31,0.35)',
        },
        blue: {
          deep:    '#061020',
          mid:     '#0a1628',
          card:    '#0f1e35',
          border:  '#1a2f4a',
          bright:  '#1E90FF',
        },
        steel:   '#A2A9B1',
        content: '#E8EDF3',
        dim:     '#7A8FA6',
        faint:   '#3D526A',
      },
      fontFamily: {
        display: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cinematic':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        // Legacy (kept for backward compat)
        'slide-up':         'slideUp 0.8s ease-out',
        'slide-up-delay':   'slideUp 0.8s ease-out 0.2s both',
        'fade-in':          'fadeIn 1s ease-out 0.4s both',
        'fade-in-delay':    'fadeIn 1s ease-out 0.6s both',
        'fade-in-delay-2':  'fadeIn 1s ease-out 0.8s both',
        // New
        'fade-up':          'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'slide-left':       'slide-left 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'scale-up':         'scale-up 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
        'float':            'float 6s ease-in-out infinite',
        'pulse-glow':       'pulse-glow 2.5s ease-in-out infinite',
        'rotate-slow':      'rotate-slow 20s linear infinite',
        'scanline':         'scanline-move 4s linear infinite',
        'claw-in':          'claw-in 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
        'claw-out':         'claw-out 0.55s cubic-bezier(0.4,0,0.6,1) forwards',
      },
      keyframes: {
        // Legacy
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      clipPath: {
        'chamfer-sm': 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
        'chamfer-md': 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
        'chamfer-lg': 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)',
        'chamfer-xl': 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)',
      },
    },
  },
  plugins: [],
};
