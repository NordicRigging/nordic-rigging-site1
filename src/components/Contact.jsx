import './Contact.css';

export default function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="section__head">
        <p className="eyebrow">Contact</p>
        <h2 className="display section__title" id="contact-title">
          Talk to the crew
        </h2>
        <p className="section__lede">
          Based in Turku, working the coast across Varsinais-Suomi and Uusimaa. Tell us your boat,
          your rig, and what needs doing.
        </p>
      </div>

      <a className="contact__mail display" href="mailto:sales@nordicrigging.fi">
        sales@nordicrigging.fi
      </a>

      <dl className="contact__meta">
        <div>
          <dt>Base</dt>
          <dd>Turku, Finland</dd>
        </div>
        <div>
          <dt>Service area</dt>
          <dd>Varsinais-Suomi &amp; Uusimaa</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href="mailto:sales@nordicrigging.fi">sales@nordicrigging.fi</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
