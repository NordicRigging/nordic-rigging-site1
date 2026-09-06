import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { usePrefill } from '../lib/prefill.jsx';
import { scrollToId } from '../lib/scroll.js';
import './YardsTab.css';

const YARDS_IMAGE = '/images/telakka.webp';

/**
 * Tab 2: telakat ja satamat, the B2B persona. Ported from the old standalone
 * "For yards" section — same copy, same pre-fill-the-form button — just
 * inside a tab instead of its own page section.
 */
export default function YardsTab() {
  const { t } = useLang();
  const p = t.partners;
  const { setPrefill } = usePrefill();

  const toForm = e => {
    e.preventDefault();
    setPrefill({ who: 'yard', needs: ['partner'] });
    scrollToId('yhteystiedot');
  };

  return (
    <div className="yards-tab">
      <div className="yards-tab__copy">
        <p className="eyebrow">{p.eyebrow}</p>
        <h3>{p.title}</h3>
        <p className="lede">{p.body}</p>

        <ul className="checks yards-tab__points">
          {p.points.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="btn-row">
          <a className="btn btn--accent" href="/#yhteystiedot" onClick={toForm}>
            {p.cta}
          </a>
          <a className="btn btn--ghost" href={CONTACT.phoneHref}>
            {p.call}
          </a>
        </div>
        <p className="yards-tab__ref">{p.reference}</p>
      </div>

      <div className="yards-tab__media" aria-hidden="true">
        <img src={YARDS_IMAGE} alt="" loading="lazy" decoding="async" width="1200" height="900" />
      </div>
    </div>
  );
}
