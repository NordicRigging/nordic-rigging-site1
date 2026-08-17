import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CONTENT } from './content.js';

const STORAGE_KEY = 'userLang';

const LanguageContext = createContext(null);

/**
 * Same language pattern as the previous build:
 *   - Finnish is the default
 *   - a saved choice in localStorage('userLang') always wins
 *   - a visitor whose browser is not Finnish, and who has never chosen, is
 *     offered the picker once
 * The persistent FI/EN toggle is new — the old site could only be switched on
 * that first-visit overlay.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fi');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    const browserLang = typeof navigator !== 'undefined' ? navigator.language || '' : '';

    if (saved && CONTENT[saved]) {
      setLang(saved);
    } else if (!browserLang.toLowerCase().startsWith('fi')) {
      setShowPicker(true);
    }
  }, []);

  const changeLanguage = useCallback(next => {
    if (!CONTENT[next]) return;
    setLang(next);
    setShowPicker(false);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice simply won't persist */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = CONTENT[lang].htmlLang;
  }, [lang]);

  const value = useMemo(
    () => ({ lang, t: CONTENT[lang], changeLanguage, showPicker, dismissPicker: () => setShowPicker(false) }),
    [lang, changeLanguage, showPicker]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
