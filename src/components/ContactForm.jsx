import { useEffect, useId, useRef, useState } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { buildMailto, buildMessage, buildSubject } from '../lib/message.js';
import { usePrefill } from '../lib/prefill.jsx';
import './ContactForm.css';

/**
 * One form for both audiences. With VITE_FORM_ENDPOINT set (Formspree or any
 * endpoint that accepts JSON and answers 2xx) it posts there; without it the
 * form composes a ready-made email in the visitor's mail app, so it works with
 * no backend at all.
 */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';

export default function ContactForm() {
  const { t, lang } = useLang();
  const f = t.form;
  const { prefill, setPrefill } = usePrefill();
  const uid = useId();

  const [who, setWho] = useState('private');
  const [needs, setNeeds] = useState(() => new Set());
  const [values, setValues] = useState({ name: '', phone: '', email: '', boat: '', message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | sentMail | error | invalid
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!prefill) return;
    if (prefill.who) setWho(prefill.who);
    if (prefill.needs) setNeeds(new Set(prefill.needs));
    setStatus('idle');
    setPrefill(null);
    // let the scroll finish, then put the cursor in the first field
    const id = setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 700);
    return () => clearTimeout(id);
  }, [prefill, setPrefill]);

  const set = key => e => setValues(v => ({ ...v, [key]: e.target.value }));

  const toggleNeed = id =>
    setNeeds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSubmit = async e => {
    e.preventDefault();
    if (values.website) return; // honeypot: bots fill hidden fields
    if (!values.name.trim() || (!values.phone.trim() && !values.email.trim())) {
      setStatus('invalid');
      return;
    }

    const needLabels = f.needOptions.filter(o => needs.has(o.id)).map(o => o.label);
    const subject = buildSubject({ ...values, who }, f);
    const body = buildMessage({ ...values, who }, f, needLabels);

    if (ENDPOINT) {
      setStatus('sending');
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: subject,
            who,
            name: values.name.trim(),
            phone: values.phone.trim(),
            email: values.email.trim(),
            boat: values.boat.trim(),
            needs: needLabels,
            message: values.message.trim(),
            lang,
            text: body
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus('sent');
      } catch {
        setStatus('error');
      }
      return;
    }

    const mailto = buildMailto(CONTACT.email, subject, body);
    setStatus('sentMail');
    window.location.assign(mailto);
  };

  const whoOptions = [
    { id: 'private', label: f.whoPrivate, hint: f.whoPrivateHint },
    { id: 'yard', label: f.whoYard, hint: f.whoYardHint }
  ];

  if (status === 'sent') {
    return (
      <div className="cform cform--done" role="status">
        <h3 className="cform__title">{f.title}</h3>
        <p className="cform__ok">{f.success}</p>
        <p className="cform__or">
          {f.orCall}: <a href={CONTACT.phoneHref}>{CONTACT.phoneIntl}</a>
        </p>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`} data-endpoint={ENDPOINT ? 'remote' : 'mailto'}>
      <div className="cform__head">
        <h3 className="cform__title" id={`${uid}-title`}>
          {f.title}
        </h3>
        <p className="cform__lede">{f.lede}</p>
      </div>

      <fieldset className="cform__who">
        <legend className="cform__label">{f.who}</legend>
        <div className="cform__who-grid">
          {whoOptions.map(o => (
            <label key={o.id} className={`who${who === o.id ? ' is-active' : ''}`}>
              <input type="radio" name="who" value={o.id} checked={who === o.id} onChange={() => setWho(o.id)} />
              <span className="who__label">{o.label}</span>
              <span className="who__hint">{o.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="cform__grid">
        <div className="field">
          <label className="cform__label" htmlFor={`${uid}-name`}>
            {f.name}
          </label>
          <input id={`${uid}-name`} ref={firstFieldRef} name="name" autoComplete="name" required value={values.name} onChange={set('name')} />
        </div>
        <div className="field">
          <label className="cform__label" htmlFor={`${uid}-phone`}>
            {f.phone}
          </label>
          <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} />
        </div>
        <div className="field">
          <label className="cform__label" htmlFor={`${uid}-email`}>
            {f.email}
          </label>
          <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label className="cform__label" htmlFor={`${uid}-boat`}>
            {who === 'yard' ? f.org : f.boat} <span className="cform__opt">({f.optional})</span>
          </label>
          <input id={`${uid}-boat`} name="boat" value={values.boat} onChange={set('boat')} />
        </div>
      </div>

      <fieldset className="cform__needs">
        <legend className="cform__label">
          {f.needs} <span className="cform__opt">({f.optional})</span>
        </legend>
        <div className="chips">
          {f.needOptions.map(o => (
            <label key={o.id} className={`chip${needs.has(o.id) ? ' is-on' : ''}`}>
              <input type="checkbox" name="needs" value={o.id} checked={needs.has(o.id)} onChange={() => toggleNeed(o.id)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="cform__label" htmlFor={`${uid}-message`}>
          {f.message}
        </label>
        <textarea id={`${uid}-message`} name="message" rows="5" placeholder={f.messagePlaceholder} value={values.message} onChange={set('message')} />
      </div>

      <div className="cform__hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex="-1" autoComplete="off" value={values.website} onChange={set('website')} />
        </label>
      </div>

      {status === 'invalid' && (
        <p className="cform__msg cform__msg--warn" role="alert">
          {f.required}
        </p>
      )}
      {status === 'error' && (
        <p className="cform__msg cform__msg--warn" role="alert">
          {f.error} <a href={CONTACT.phoneHref}>{CONTACT.phoneIntl}</a> · <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
      )}
      {status === 'sentMail' && (
        <p className="cform__msg cform__msg--ok" role="status">
          {f.successMail}
        </p>
      )}

      <div className="cform__foot">
        <button className="btn btn--accent cform__submit" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? f.sending : f.submit}
        </button>
        <p className="cform__or">
          {f.orCall}: <a href={CONTACT.phoneHref}>{CONTACT.phoneIntl}</a>
        </p>
      </div>
      <p className="cform__privacy">{f.privacy}</p>
    </form>
  );
}
