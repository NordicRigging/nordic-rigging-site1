import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer__brand">Nordic Rigging</span>
      <span>Turku · Varsinais-Suomi &amp; Uusimaa</span>
      <a href="mailto:sales@nordicrigging.fi">sales@nordicrigging.fi</a>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
