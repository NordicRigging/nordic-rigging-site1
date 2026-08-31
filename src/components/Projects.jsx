import { useLang } from '../lib/LanguageContext.jsx';
import './Projects.css';

/**
 * Deliberately sparse: a heading and one line. It is a section we have not
 * filled yet, not a gap — so it keeps the page's rhythm and vertical measure
 * rather than collapsing to nothing.
 */
export default function Projects() {
  const { t } = useLang();
  const p = t.projects;

  return (
    <section className="section projects" id="projects" aria-labelledby="projects-title">
      <div className="projects__inner">
        <h2 className="display section__title projects__title" id="projects-title">
          {p.title}
        </h2>
        <p className="projects__line">{p.line}</p>
        <span className="projects__rule" aria-hidden="true" />
      </div>
    </section>
  );
}
