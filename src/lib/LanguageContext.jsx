import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CONTENT } from './content.js';

const STORAGE_KEY = 'userLang';

const LanguageContext = createContext(null);

/** Finnish unless the browser is set to something else; a saved choice always wins. */
function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && CONTENT[saved]) return saved;
  } catch {
    /* private mode */
  }
  const browser = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : 'fi';
  return browser.startsWith('fi') || browser === '' ? 'fi' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  const changeLanguage = useCallback(next => {
    if (!CONTENT[next]) return;
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice simply will not persist */
    }
  }, []);

  useEffect(() => {
    const t = CONTENT[lang];
    document.documentElement.lang = t.htmlLang;
    document.title = t.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t.meta.description);
  }, [lang]);

  const value = useMemo(() => ({ lang, t: CONTENT[lang], changeLanguage }), [lang, changeLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
