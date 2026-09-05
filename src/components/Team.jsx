import { useState } from 'react';

import { TEAM } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './Team.css';

function Avatar({ person, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const initials = person.name
    .split(' ')
    .map(w => w[0])
    .join('');
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {person.photo && !failed ? (
        <img src={person.photo} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

/** The compact "done by" strip used inside every service block. */
export function CrewLine() {
  const { lang, t } = useLang();
  return (
    <div className="crew">
      <span className="crew__label">{t.team.pageLine}</span>
      <ul className="crew__list">
        {TEAM.map(p => (
          <li key={p.id} className="crew__person">
            <Avatar person={p} size="sm" />
            <span>
              <strong>{p.name}</strong>
              <span className="crew__role">{p[lang].role}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The full card: names, roles and the two-sentence story. */
export default function Team() {
  const { lang, t } = useLang();
  return (
    <div className="team" id="tekijat">
      <div className="team__copy">
        <p className="eyebrow">{t.team.eyebrow}</p>
        <h2>{t.team.title}</h2>
        <p className="lede">{t.team.body}</p>
      </div>
      <ul className="team__list">
        {TEAM.map(p => (
          <li key={p.id} className="team__person">
            <Avatar person={p} size="lg" />
            <div>
              <strong className="team__name">{p.name}</strong>
              <div className="team__role">{p[lang].role}</div>
              <p className="team__line">{p[lang].line}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
