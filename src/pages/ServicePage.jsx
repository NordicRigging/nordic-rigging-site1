import { Link, Navigate, useParams } from 'react-router-dom';

import Footer from '../components/Footer.jsx';
import { serviceBySlug } from '../lib/services.js';
import './ServicePage.css';

export default function ServicePage() {
  const { slug } = useParams();
  const service = serviceBySlug(slug);

  if (!service) return <Navigate to="/" replace />;

  return (
    <main>
      <section className="service-hero" style={{ background: service.fallback }}>
        <img
          className="service-hero__img"
          src={service.image}
          alt=""
          onError={e => (e.currentTarget.style.display = 'none')}
        />
        <div className="service-hero__inner">
          <Link className="service-hero__back" to="/">
            ← Nordic Rigging
          </Link>
          <p className="eyebrow">Service</p>
          <h1 className="display service-hero__title">{service.label}</h1>
        </div>
      </section>

      <section className="section service-body">
        <p className="service-body__blurb">{service.blurb}</p>
        <ul className="service-body__points">
          {service.points.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <a className="btn btn--solid" href="mailto:sales@nordicrigging.fi">
          Ask about {service.label.toLowerCase()}
        </a>
      </section>

      <Footer />
    </main>
  );
}
