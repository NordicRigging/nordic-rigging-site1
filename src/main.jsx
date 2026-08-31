import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import '@fontsource/anton';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono';
import './styles/global.css';

import Home from './pages/Home.jsx';
import ServicePage from './pages/ServicePage.jsx';
import { LanguageProvider } from './lib/LanguageContext.jsx';
import { LanguagePicker } from './components/LanguageControl.jsx';

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  useEffect(() => {
    // a hash or an explicit scrollTo intent owns the scroll position instead
    if (hash || state?.scrollTo) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, state]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <LanguagePicker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services/:slug" element={<ServicePage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);
