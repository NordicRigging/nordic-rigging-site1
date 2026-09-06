import { createContext, useContext, useMemo, useState } from 'react';

/**
 * Which of the four tabs under the hero is open. A nav link or a button
 * elsewhere on the page (e.g. "let's talk" on a service card) can select a
 * tab before scrolling to it, the same way prefill.jsx pre-selects the
 * contact form.
 */
export const TABS = ['palvelut', 'telakat', 'tyot', 'meista'];
const DEFAULT_TAB = 'palvelut';

const TabsContext = createContext(null);

export function TabsProvider({ children }) {
  const [activeTab, setActiveTabState] = useState(DEFAULT_TAB);
  const setActiveTab = id => TABS.includes(id) && setActiveTabState(id);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used inside <TabsProvider>');
  return ctx;
}
