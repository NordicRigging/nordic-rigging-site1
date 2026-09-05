import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Stage from '../components/Stage.jsx';
import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import RigSense from '../components/RigSense.jsx';
import Partners from '../components/Partners.jsx';
import Location from '../components/Location.jsx';
import Footer from '../components/Footer.jsx';
import { scrollToId } from '../lib/scroll.js';

export default function Home() {
  const { state, hash } = useLocation();

  // Arriving from a service page (state) or a deep link (hash): scroll once laid out.
  useEffect(() => {
    const target = state?.scrollTo || (hash ? hash.slice(1) : '');
    if (!target) return undefined;
    const raf = requestAnimationFrame(() => scrollToId(target));
    return () => cancelAnimationFrame(raf);
  }, [state, hash]);

  return (
    <>
      <Header />
      <main id="sisalto">
        <Stage>
          <Hero />
          <Services />
        </Stage>
        <div className="after-stage">
          <RigSense />
          <Partners />
          <Location />
          <Footer />
        </div>
      </main>
    </>
  );
}
