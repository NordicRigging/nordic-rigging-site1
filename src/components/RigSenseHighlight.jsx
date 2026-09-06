import { useLang } from '../lib/LanguageContext.jsx';
import './RigSenseHighlight.css';

export const RIGSENSE_IMAGE = '/images/rig-sense.webp';

/**
 * The Spinlock Rig-Sense Pro gets its own highlighted paragraph inside the
 * services tab: the gauge photo, why measured tension beats a feel-based
 * guess, in three sentences rather than the old standalone section's full
 * breakdown.
 */
export default function RigSenseHighlight() {
  const { t } = useLang();
  const r = t.rigsense;

  return (
    <aside className="rigsense-hl" aria-labelledby="rigsense-hl-title">
      <div className="rigsense-hl__media">
        <img src={RIGSENSE_IMAGE} alt={r.imageAlt} loading="lazy" decoding="async" width="462" height="1600" />
      </div>
      <div className="rigsense-hl__copy">
        <p className="eyebrow">{r.eyebrow}</p>
        <h3 id="rigsense-hl-title">{r.title}</h3>
        <p>{r.body}</p>
        <p className="rigsense-hl__point">{r.points[0].text}</p>
        <span className="rigsense-hl__badge">{r.badge}</span>
      </div>
    </aside>
  );
}
