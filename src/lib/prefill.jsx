import { createContext, useContext, useMemo, useState } from 'react';

/**
 * Lets any button on the site pre-select the contact form ("who" and
 * "needs") before scrolling there, so a yard clicking "let's talk" lands on
 * a form already set to "boatyard or marina".
 */
const PrefillContext = createContext(null);

export function PrefillProvider({ children }) {
  const [prefill, setPrefill] = useState(null);
  const value = useMemo(() => ({ prefill, setPrefill }), [prefill]);
  return <PrefillContext.Provider value={value}>{children}</PrefillContext.Provider>;
}

export function usePrefill() {
  const ctx = useContext(PrefillContext);
  if (!ctx) throw new Error('usePrefill must be used inside <PrefillProvider>');
  return ctx;
}
