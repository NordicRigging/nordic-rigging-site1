import FilmSequence from '../components/FilmSequence.jsx';
import Services from '../components/Services.jsx';
import Spinlock from '../components/Spinlock.jsx';
import Story from '../components/Story.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import { LanguageToggle } from '../components/LanguageControl.jsx';

export default function Home() {
  return (
    <main>
      <LanguageToggle />
      <FilmSequence />
      <Services />
      <Spinlock />
      <Story />
      <Contact />
      <Footer />
    </main>
  );
}
