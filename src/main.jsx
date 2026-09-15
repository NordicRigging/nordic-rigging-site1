import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Self-hosted type. Archivo is loaded from its width-axis build so the display
// face is genuinely condensed (font-stretch 62%) rather than scaled.
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
