import { useLang } from '../lib/LanguageContext.jsx';
import './Story.css';

export default function Story() {
  const { t } = useLang();
  const s = t.story;

  return (
    <section className="section story" id="story" aria-labelledby="story-title">
      <div className="story__grid">
        <div className="story__intro">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 className="display section__title" id="story-title">
            {s.heading}
          </h2>
          <p className="story__lede">{s.intro}</p>

          <dl className="story__values">
            {s.values.map(v => (
              <div key={v.label}>
                <dt>{v.label}</dt>
                <dd>{v.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="story__body">
          {s.paragraphs.map(p => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <blockquote className="story__highlight">{s.highlight}</blockquote>
        </div>
      </div>
    </section>
  );
}
