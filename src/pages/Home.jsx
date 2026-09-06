import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Tabs from '../components/Tabs.jsx';
import Location from '../components/Location.jsx';
import Footer from '../components/Footer.jsx';
import { scrollToId } from '../lib/scroll.js';
import { useTabs } from '../lib/tabs.jsx';

export default function Home() {
  const { state, hash } = useLocation();
  const { setActiveTab } = useTabs();

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
        <Hero />
        <Tabs />
        <Location />
        <Footer />
      </main>
    </>
  );
}
