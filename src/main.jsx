import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import '@fontsource-variable/inter';
import './styles/global.css';

import Home from './pages/Home.jsx';
import ServicePage from './pages/ServicePage.jsx';
import { LanguageProvider } from './lib/LanguageContext.jsx';
import { PrefillProvider } from './lib/prefill.jsx';
import { TabsProvider } from './lib/tabs.jsx';

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  useEffect(() => {
    if (hash || state?.scrollTo) return; // the page handles these itself
    window.scrollTo(0, 0);
  }, [pathname, hash, state]);
  return null;
}

/**
 * Real hosting uses clean paths. The single-file preview build has no server
 * to fall back to index.html, so it routes on the hash instead.
 */
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

/** Old v2 URLs keep working. */
const LEGACY = { 'mast-work': 'mastotyot', 'rope-stock': 'koysivarasto', maintenance: 'huolto' };
function LegacyService() {
  const { slug } = useParams();
  return <Navigate to={LEGACY[slug] ? `/palvelut/${LEGACY[slug]}` : '/'} replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <PrefillProvider>
        <TabsProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/palvelut/:slug" element={<ServicePage />} />
              <Route path="/services/:slug" element={<LegacyService />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </TabsProvider>
      </PrefillProvider>
    </LanguageProvider>
  </React.StrictMode>
);
