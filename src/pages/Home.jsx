import FilmSequence from '../components/FilmSequence.jsx';
import Contact from '../components/Contact.jsx';
import Services from '../components/Services.jsx';
import Spinlock from '../components/Spinlock.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <main>
      <FilmSequence />
      <Contact />
      <Services />
      <Spinlock />
      <Footer />
    </main>
  );
}
