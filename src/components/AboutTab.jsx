import { useLang } from '../lib/LanguageContext.jsx';
import Team from './Team.jsx';
import './AboutTab.css';

/**
 * Tab 4: tietoa meistä. The company story (father and son, Turku) plus the
 * crew list from Team.jsx — same component the service pages use, so a
 * portrait dropped into public/images/team/ shows up everywhere at once.
 */
export default function AboutTab() {
  const { t } = useLang();
  const s = t.story;

  return (
    <div className="about-tab">
      <p className="eyebrow">{s.eyebrow}</p>
      <p className="lede about-tab__intro">{s.intro}</p>
      <p className="about-tab__highlight">{s.highlight}</p>

      <Team />
    </div>
  );
}
