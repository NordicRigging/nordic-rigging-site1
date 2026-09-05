import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { usePrefill } from '../lib/prefill.jsx';
import { scrollToId } from '../lib/scroll.js';
import './Partners.css';

export const PARTNERS_IMAGE = '/images/telakka.webp';

export default function Partners() {
  const { t } = useLang();
  const p = t.partners;
  const { setPrefill } = usePrefill();

  const toForm = e => {
    e.preventDefault();
    setPrefill({ who: 'yard', needs: ['partner'] });
    scrollToId('yhteystiedot');
  };

  return (
    <section className="section partners" id="telakoille" aria-labelledby="partners-title">
      <div className="wrap">
        <div className="partners__card">
          <div className="partners__copy">
            <p className="eyebrow">{p.eyebrow}</p>
            <h2 id="partners-title">{p.title}</h2>
            <p className="lede">{p.body}</p>

            <ul className="checks partners__points">
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
            <p className="partners__ref">{p.reference}</p>
          </div>

          <div className="partners__media" aria-hidden="true">
            <img src={PARTNERS_IMAGE} alt="" loading="lazy" decoding="async" width="1200" height="900" />
          </div>
        </div>
      </div>
    </section>
  );
}
