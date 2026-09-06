import { PORTFOLIO } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './PortfolioTab.css';

/**
 * Tab 3: tehdyt työt. A plain grid rather than a carousel — nothing to
 * operate, every photo visible at once, and a new entry in PORTFOLIO
 * (src/lib/content.js) is all a future photo needs.
 */
export default function PortfolioTab() {
  const { lang, t } = useLang();
  const p = t.portfolio;

  return (
    <div className="portfolio-tab">
      <p className="eyebrow">{p.eyebrow}</p>
      <h3>{p.title}</h3>
      <p className="lede">{p.lede}</p>

      <ul className="portfolio-grid">
        {PORTFOLIO.map(item => (
          <li key={item.id} className="portfolio-grid__item">
            <img src={item.image} alt={item[lang].caption} loading="lazy" decoding="async" width="800" height="600" />
            <span className="portfolio-grid__caption">{item[lang].caption}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
