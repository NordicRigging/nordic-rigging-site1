import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import { useLang } from '../lib/LanguageContext.jsx';
import { useTabs } from '../lib/tabs.jsx';
import ServicesTab from './ServicesTab.jsx';
import YardsTab from './YardsTab.jsx';
import PortfolioTab from './PortfolioTab.jsx';
import AboutTab from './AboutTab.jsx';
import TabPanelFX from './TabPanelFX.jsx';
import './Tabs.css';

const PANELS = {
  palvelut: ServicesTab,
  telakat: YardsTab,
  tyot: PortfolioTab,
  meista: AboutTab
};

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Tabs() {
  const { t } = useLang();
  const { activeTab, setActiveTab } = useTabs();
  // What's actually mounted lags one crossfade behind `activeTab` — the tab
  // buttons reflect the click immediately, the panel swaps once it's faded
  // out, so switching never hard-cuts or jumps the page below it.
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const displayedRef = useRef(activeTab);
  const wrapRef = useRef(null);
  const contentRef = useRef(null);

  const items = [
    { id: 'palvelut', label: t.nav.services },
    { id: 'telakat', label: t.nav.yards },
    { id: 'tyot', label: t.nav.portfolio },
    { id: 'meista', label: t.nav.about }
  ];

  useEffect(() => {
    if (activeTab === displayedRef.current) return undefined;
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content || prefersReduced()) {
      displayedRef.current = activeTab;
      setDisplayedTab(activeTab);
      return undefined;
    }

    let cancelled = false;
    // gsap tweens aren't natively awaitable — wrap the fade-out in a real
    // Promise via onComplete, or the swap below fires on the next microtask
    // instead of after the animation actually finishes.
    const fadeOut = () =>
      new Promise(resolve => {
        gsap.to(content, { opacity: 0, y: -10, duration: 0.18, ease: 'power1.in', onComplete: resolve });
      });

    (async () => {
      gsap.set(wrap, { height: content.offsetHeight, overflow: 'hidden' });
      await fadeOut();
      if (cancelled) return;

      displayedRef.current = activeTab;
      setDisplayedTab(activeTab);
      // two frames: one for React to commit the new panel, one so its
      // natural (untouched) height is there to read before animating to it
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const freshContent = contentRef.current;
          if (cancelled || !freshContent) return;
          const endHeight = freshContent.offsetHeight;
          gsap.set(freshContent, { opacity: 0, y: 10 });
          gsap.to(wrap, {
            height: endHeight,
            duration: 0.28,
            ease: 'power2.out',
            onComplete: () => {
              if (!cancelled) gsap.set(wrap, { height: 'auto', overflow: '' });
            }
          });
          gsap.to(freshContent, { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out' });
        });
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const Panel = PANELS[displayedTab];

  return (
    <section className="section tabs" id="ratkaisut" aria-labelledby="tabs-title">
      <div className="wrap">
        <h2 id="tabs-title" className="sr-only">
          {t.tabs.sectionTitle}
        </h2>

        <div className="tabs__bar" role="tablist" aria-label={t.tabs.sectionTitle}>
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={activeTab === item.id}
              aria-controls={`panel-${item.id}`}
              className={`tabs__btn${activeTab === item.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tabs__panel" ref={wrapRef} role="tabpanel" id={`panel-${displayedTab}`} aria-labelledby={`tab-${displayedTab}`}>
          <TabPanelFX />
          <div className="tabs__panel-content" ref={contentRef}>
            <Panel />
          </div>
        </div>
      </div>
    </section>
  );
}
