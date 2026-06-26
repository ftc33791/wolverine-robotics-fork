import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

const LogoImage = () => {
  const [err, setErr] = useState(false);
  return (
    <div
      className="w-10 h-10 overflow-hidden flex items-center justify-center"
      style={{ clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)' }}
    >
      {err ? (
        <div
          className="w-full h-full flex items-center justify-center text-white font-black text-base"
          style={{ background: 'linear-gradient(135deg, #FF5A1F, #CC3D0A)' }}
        >
          WR
        </div>
      ) : (
        <img
          src="/data/logo.svg"
          alt="Wolverine Robotics"
          className="w-full h-full object-contain"
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
};

const Nav = ({ currentPage, onNavigate, navigation }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const indicatorRef = useRef(null);
  const navItemRefs = useRef({});

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 w-full z-[200] transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(6,16,32,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,90,31,0.15)' : '1px solid transparent',
        }}
      >
        {/* Scanline on border-bottom */}
        {scrolled && (
          <div
            className="absolute bottom-0 left-0 h-px pointer-events-none overflow-hidden"
            style={{ width: '100%' }}
          >
            <div
              className="absolute inset-y-0"
              style={{
                width: '30%',
                background: 'linear-gradient(90deg, transparent, #FF5A1F 50%, transparent)',
                animation: 'scan-h 3s linear infinite',
              }}
            />
          </div>
        )}

        <div className="container-wide">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group"
            >
              <div className="transition-transform duration-300 group-hover:scale-105">
                <LogoImage />
              </div>
              <div>
                <p
                  className="text-white font-black text-[15px] tracking-[0.1em] uppercase leading-none transition-colors duration-300 group-hover:text-[#FF5A1F]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  WOLVERINE
                </p>
                <p
                  className="text-[10px] tracking-[0.22em] uppercase leading-none mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)', color: '#FF5A1F' }}
                >
                  TEAM 33791
                </p>
              </div>
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  ref={(el) => (navItemRefs.current[item.id] = el)}
                  onClick={() => handleNav(item.id)}
                  onMouseEnter={() => setActiveHover(item.id)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative px-4 py-2 group"
                >
                  {/* Active / hover underline */}
                  <div
                    className="absolute bottom-0.5 left-4 right-4 h-px transition-all duration-300"
                    style={{
                      background: '#FF5A1F',
                      transform:
                        currentPage === item.id || activeHover === item.id
                          ? 'scaleX(1)'
                          : 'scaleX(0)',
                      transformOrigin: 'left',
                    }}
                  />
                  <span
                    className="relative text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color:
                        currentPage === item.id
                          ? '#FF5A1F'
                          : activeHover === item.id
                          ? '#fff'
                          : 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white hover:text-[#FF5A1F] transition-colors duration-300 p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-[199] flex flex-col pt-[70px] transition-all duration-500 md:hidden"
        style={{
          background: 'rgba(6,16,32,0.97)',
          backdropFilter: 'blur(24px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'all' : 'none',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="flex flex-col px-8 py-8 gap-2">
          {navigation.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="text-left py-4 border-b transition-all duration-300"
              style={{
                borderColor: 'rgba(255,90,31,0.1)',
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateX(0)' : 'translateX(30px)',
                transitionDelay: `${i * 50}ms`,
              }}
            >
              <span
                className="text-2xl font-black uppercase tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: currentPage === item.id ? '#FF5A1F' : '#fff',
                }}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan-h {
          0%   { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </>
  );
};

export default Nav;
