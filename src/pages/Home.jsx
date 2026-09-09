import { useEffect, useRef, useState } from 'react';
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

  // Round 11 item 3: the single trigger both Hero and TracingBeam key off —
  // "launched" once the dim box has scrolled out of view (the beam flies in
  // from it, the hero's photo/title/box fade away), latched back off (and
  // introRunId bumped, so Hero replays its intro from scratch) only once
  // the user scrolls all the way back to the very top. This used to be two
  // separate IntersectionObservers (one in Hero for its own fade, one in
  // TracingBeam for its reveal) independently watching the same dim box —
  // async observer callbacks that, verified directly, didn't reliably fire
  // in time on a fast/instant scroll in this project's test environment,
  // which is exactly the "beam missing" regression this replaces: a plain
  // scroll listener reads the box's current rect synchronously, so there's
  // no callback scheduling left to race.
  const [heroLaunched, setHeroLaunched] = useState(false);
  const [introRunId, setIntroRunId] = useState(0);

  useEffect(() => {
    let launched = false;
    const onScroll = () => {
      const box = dimBoxRef.current;
      if (box && !launched && box.getBoundingClientRect().bottom < 0) {
        launched = true;
        setHeroLaunched(true);
      } else if (launched && window.scrollY <= 2) {
        launched = false;
        setHeroLaunched(false);
        setIntroRunId(id => id + 1);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Header />
      <main id="sisalto">
        <Hero dimBoxRef={dimBoxRef} launched={heroLaunched} restartKey={introRunId} />
        <TracingBeam anchorFromRef={dimBoxRef} launched={heroLaunched}>
          <Tabs />
          <Location />
          <Footer />
        </TracingBeam>
      </main>
    </>
  );
}
