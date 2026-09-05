import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import '@fontsource-variable/inter';
import './styles/global.css';

import Home from './pages/Home.jsx';
import ServicePage from './pages/ServicePage.jsx';
import { LanguageProvider } from './lib/LanguageContext.jsx';
import { PrefillProvider } from './lib/prefill.jsx';

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  useEffect(() => {
    if (hash || state?.scrollTo) return; // the page handles these itself
    window.scrollTo(0, 0);
  }, [pathname, hash, state]);
  return null;
}

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
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/palvelut/:slug" element={<ServicePage />} />
            <Route path="/services/:slug" element={<LegacyService />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PrefillProvider>
    </LanguageProvider>
  </React.StrictMode>
);
