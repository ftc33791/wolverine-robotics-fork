/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WOLVERINE ROBOTICS — App.jsx
 *  Root component: routing, page transitions, nav/footer shell.
 *  All site content is imported from src/data.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── Data ──────────────────────────────────────────────────────────
import { NAVIGATION, TEAM, PAST_MEMBERS, ROBOTS, SPONSORS } from './data.js';

// ── UI Shell ──────────────────────────────────────────────────────
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import BlueprintBackground from './components/BlueprintBackground.jsx';

// ── Pages ─────────────────────────────────────────────────────────
import HomePage     from './pages/HomePage.jsx';
import AboutPage    from './pages/AboutPage.jsx';
import TeamPage     from './pages/TeamPage.jsx';
import RobotsPage   from './pages/RobotsPage.jsx';
import SponsorsPage from './pages/SponsorsPage.jsx';
import ContactPage  from './pages/ContactPage.jsx';
import GalleryPage  from './pages/GalleryPage.jsx';

// ── Scouting page (code lives in src/pages/ScoutingPage.jsx) ─────
import ScoutingPage from './pages/ScoutingPage.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
// Valid page ids <-> URL paths (e.g. 'about' <-> '/about', 'home' <-> '/')
const VALID_PAGES = ['home', 'about', 'team', 'robots', 'gallery', 'sponsors', 'contact', 'scouting'];

const pageFromPath = (pathname) => {
  const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
  return VALID_PAGES.includes(slug) ? slug : 'home';
};

const pathFromPage = (id) => (id === 'home' ? '/' : `/${id}`);

const App = () => {
  const initialPage = typeof window !== 'undefined' ? pageFromPath(window.location.pathname) : 'home';
  const [currentPage,  setCurrentPage]  = useState(initialPage);
  const [displayPage,  setDisplayPage]  = useState(initialPage);

  // Page transition
  useEffect(() => {
    if (currentPage === displayPage) return;
    // The "claw" page transition was cut 2026-10-02 (effects cut; see WORKLOG):
    // pages now switch instantly.
    window.scrollTo(0, 0);
    setDisplayPage(currentPage);
  }, [currentPage]);

  // Keep the URL in sync with the active page, and support browser back/forward
  useEffect(() => {
    const onPopState = () => setCurrentPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (id) => {
    if (!VALID_PAGES.includes(id)) id = 'home';
    const path = pathFromPage(id);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPage(id);
  };

  const renderPage = () => {
    switch (displayPage) {
      case 'home':     return <HomePage     onNavigate={navigate} teamMembers={TEAM} />;
      case 'about':    return <AboutPage    onNavigate={navigate} />;
      case 'team':     return <TeamPage     teamMembers={TEAM} pastMembers={PAST_MEMBERS} />;
      case 'robots':   return <RobotsPage   robots={ROBOTS} />;
      case 'sponsors': return <SponsorsPage sponsors={SPONSORS} onNavigate={navigate} />;
      case 'contact':  return <ContactPage  />;
      case 'gallery':  return <GalleryPage  />;
      case 'scouting': return <ScoutingPage />;
      default:         return <HomePage     onNavigate={navigate} teamMembers={TEAM} />;
    }
  };

  // The "INITIALIZING SYSTEM" loading screen was removed 2026-10-02 (Dev's list).

  return (
    <>
      <div className="bp-page"><BlueprintBackground /></div>
      <Nav
        currentPage={currentPage}
        onNavigate={navigate}
        navigation={NAVIGATION}
      />
      <div style={{ minHeight: '100vh' }}>
        {renderPage()}
      </div>
      {/* Hide footer on scouting page for wider layout */}
      {displayPage !== 'scouting' && (
        <Footer onNavigate={navigate} navigation={NAVIGATION} />
      )}
    </>
  );
};

export default App;
