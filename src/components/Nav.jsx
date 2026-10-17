import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Logo = () => {
  const [err, setErr] = useState(false);
  return err ? (
    <span className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white" style={{ background: 'var(--blue)' }}>WR</span>
  ) : (
    <img src="/data/logo.svg" alt="" className="h-8 w-8 rounded-md object-contain" onError={() => setErr(true)} />
  );
};

const Nav = ({ currentPage, onNavigate, navigation }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [currentPage]);
  const go = (id) => { onNavigate(id); setOpen(false); };

  return (
    <>
      <nav className="v-nav">
        <div className="wrap">
          <div className="v-nav-in">
            <button onClick={() => go('home')} className="v-logo" aria-label="Wolverine Robotics home">
              <Logo />
              <span className="text-left">Wolverine<small>FTC 33791</small></span>
            </button>
            <div className="v-links">
              {navigation.map((item) => (
                <button key={item.id} onClick={() => go(item.id)} className="v-link" aria-current={currentPage === item.id ? 'page' : undefined}>
                  {item.name.charAt(0) + item.name.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button className="p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      <div
        className="fixed inset-0 flex flex-col items-center pt-[4.5rem] md:hidden"
        style={{ zIndex: 199, background: 'var(--paper)', opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition: 'opacity .25s' }}
      >
        <div className="flex w-full flex-col items-center px-8 py-6">
          {navigation.map((item) => (
            <button key={item.id} onClick={() => go(item.id)} className="w-full border-b py-4" style={{ borderColor: 'var(--rule)' }}>
              <span className="v-h3" style={{ color: currentPage === item.id ? 'var(--blue)' : 'var(--ink)' }}>{item.name.charAt(0) + item.name.slice(1).toLowerCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Nav;
