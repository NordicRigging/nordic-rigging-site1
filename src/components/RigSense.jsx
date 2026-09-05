import { useLang } from '../lib/LanguageContext.jsx';
import './RigSense.css';

export const RIGSENSE_IMAGE = '/images/rig-sense.webp';

export default function RigSense() {
  const { t } = useLang();
  const r = t.rigsense;

  return (
    <section className="section section--deep rigsense" id="rig-sense" aria-labelledby="rigsense-title">
      <div className="wrap rigsense__grid">
        <figure className="rigsense__figure">
          <div className="rigsense__glow" aria-hidden="true" />
          <img src={RIGSENSE_IMAGE} alt={r.imageAlt} loading="lazy" decoding="async" width="462" height="1600" />
          <figcaption className="rigsense__badge">{r.badge}</figcaption>
        </figure>

        <div className="rigsense__copy">
          <p className="eyebrow">{r.eyebrow}</p>
          <h2 id="rigsense-title">{r.title}</h2>
          <p className="lede">{r.body}</p>

          <ol className="rigsense__points">
            {r.points.map((p, i) => (
              <li key={p.title}>
                <span className="rigsense__n" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
