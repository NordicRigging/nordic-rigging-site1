import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
import Grain from './components/Grain'
import Landing from './routes/Landing'
import ServicePlaceholder from './routes/ServicePlaceholder'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <Grain />
      <Cursor />
      {/* Deep navy at the top of the page grading to near-black at the end. */}
      <div className="relative min-h-screen bg-[linear-gradient(180deg,#0a1826_0%,#08131f_22%,#071119_48%,#050c13_74%,#04070b_100%)]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/services/:slug" element={<ServicePlaceholder />} />
          <Route path="*" element={<ServicePlaceholder />} />
        </Routes>
      </div>
    </SmoothScroll>
  )
}
