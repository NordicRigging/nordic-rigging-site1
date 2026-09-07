import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Tabs from '../components/Tabs.jsx';
import Location from '../components/Location.jsx';
import Footer from '../components/Footer.jsx';
import TracingBeam from '../components/TracingBeam.jsx';
import { scrollToId } from '../lib/scroll.js';
import { useTabs } from '../lib/tabs.jsx';

export default function Home() {
  const { state, hash } = useLocation();
  const { setActiveTab } = useTabs();
  // Shared with TracingBeam: it watches this node to know when the hero's
  // contact card has scrolled out of view, so the beam can detach from
  // there and settle at the page's left edge.
  const dimBoxRef = useRef(null);

  // Arriving from a service page (state, optionally naming a tab) or a deep
  // link (hash): select the tab and scroll once laid out.
  useEffect(() => {
    const target = state?.scrollTo || (hash ? hash.slice(1) : '');
    if (state?.tab) setActiveTab(state.tab);
    if (!target) return undefined;
    const raf = requestAnimationFrame(() => scrollToId(target));
    return () => cancelAnimationFrame(raf);
  }, [state, hash, setActiveTab]);

  return (
    <>
      <Header />
      <main id="sisalto">
        <Hero dimBoxRef={dimBoxRef} />
        <TracingBeam anchorFromRef={dimBoxRef}>
          <Tabs />
          <Location />
          <Footer />
        </TracingBeam>
      </main>
    </>
  );
}
