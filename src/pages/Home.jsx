import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import PillNav from '../components/PillNav.jsx';
import FilmSequence from '../components/FilmSequence.jsx';
import Services from '../components/Services.jsx';
import Spinlock from '../components/Spinlock.jsx';
import Story from '../components/Story.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import { scrollToId } from '../lib/scroll.js';

export default function Home() {
  const { state } = useLocation();

  // Arriving from a service page via the nav: scroll to the requested section
  // once this page has actually laid out.
  useEffect(() => {
    const target = state?.scrollTo;
    if (!target) return undefined;
    const raf = requestAnimationFrame(() => scrollToId(target));
    return () => cancelAnimationFrame(raf);
  }, [state]);

  return (
    <main>
      <PillNav />
      <FilmSequence />
      <Services />
      <Spinlock />
      <Story />
      <Contact />
      <Footer />
    </main>
  );
}
