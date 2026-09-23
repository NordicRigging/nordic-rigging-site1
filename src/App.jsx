import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
import Grain from './components/Grain'
import Nav from './components/Nav'
import Landing from './routes/Landing'
import ServicePlaceholder from './routes/ServicePlaceholder'
import { LanguageProvider } from './lib/LanguageContext'
import { scrollToId } from './lib/scroll'

function ScrollToTop() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const target = location.state?.scrollTo
    if (target) {
      // wait for the just-mounted route's content to lay out before measuring it
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(target)))
      navigate(location.pathname, { replace: true, state: {} })
      return
    }
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <ScrollToTop />
        <Grain />
        <Cursor />
        <Nav />
        {/* Deep navy at the top of the page grading to near-black at the end. */}
        <div className="relative min-h-screen bg-[linear-gradient(180deg,#0a1826_0%,#08131f_22%,#071119_48%,#050c13_74%,#04070b_100%)]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/services/:slug" element={<ServicePlaceholder />} />
            <Route path="*" element={<ServicePlaceholder />} />
          </Routes>
        </div>
      </SmoothScroll>
    </LanguageProvider>
  )
}
