import HUD from '../components/HUD'
import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import Services from '../components/Services'
import Spinlock from '../components/Spinlock'
import Story from '../components/Story'
import Contact from '../components/Contact'

export default function Landing() {
  return (
    <>
      <HUD />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Spinlock />
        <Story />
        <Contact />
      </main>
    </>
  )
}
