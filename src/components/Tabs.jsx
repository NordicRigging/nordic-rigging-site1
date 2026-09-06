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

export default function Tabs() {
  const { t } = useLang();
  const { activeTab, setActiveTab } = useTabs();

  const items = [
    { id: 'palvelut', label: t.nav.services },
    { id: 'telakat', label: t.nav.yards },
    { id: 'tyot', label: t.nav.portfolio },
    { id: 'meista', label: t.nav.about }
  ];

  const Panel = PANELS[activeTab];

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

        <div className="tabs__panel" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          <TabPanelFX />
          <div className="tabs__panel-content">
            <Panel />
          </div>
        </div>
      </div>
    </section>
  );
}
