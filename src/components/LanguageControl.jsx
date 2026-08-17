import { useLang } from '../lib/LanguageContext.jsx';
import { LANGS } from '../lib/content.js';
import './LanguageControl.css';

/** Persistent FI/EN toggle, fixed to the top-right of every page. */
export function LanguageToggle() {
  const { lang, changeLanguage } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label="Language / Kieli">
      {LANGS.map(code => (
        <button
          key={code}
          type="button"
          className={`lang-toggle__btn${code === lang ? ' lang-toggle__btn--active' : ''}`}
          onClick={() => changeLanguage(code)}
          aria-pressed={code === lang}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** First-visit picker, shown when the browser language is not Finnish. */
export function LanguagePicker() {
  const { t, changeLanguage, showPicker } = useLang();
  if (!showPicker) return null;

  return (
    <div className="lang-picker" role="dialog" aria-modal="true" aria-label="Select language / Valitse kieli">
      <div className="lang-picker__card">
        <p className="eyebrow">Nordic Rigging</p>
        <h2 className="display lang-picker__title">
          Select language
          <br />
          Valitse kieli
        </h2>
        <div className="lang-picker__actions">
          <button type="button" className="btn btn--solid" onClick={() => changeLanguage('fi')}>
            {t.langPicker.fi}
          </button>
          <button type="button" className="btn" onClick={() => changeLanguage('en')}>
            {t.langPicker.en}
          </button>
        </div>
      </div>
    </div>
  );
}
