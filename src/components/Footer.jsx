import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../lib/LanguageContext'
import { CONTACT } from '../lib/content'
import { scrollToId, scrollToTop } from '../lib/scroll'

export default function Footer() {
  const { t } = useLang()
  const f = t.footer
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const services = Object.entries(t.servicePage.items)

  const goContact = (e) => {
    e.preventDefault()
    if (onHome) scrollToId('contact')
    else navigate('/', { state: { scrollTo: 'contact' } })
  }

  const goHome = (e) => {
    e.preventDefault()
    if (onHome) scrollToTop()
    else navigate('/')
  }

  return (
    <footer className="relative overflow-hidden border-t border-slate-line pt-20 pb-8 md:pt-28">
      <div className="edge relative z-10 mx-auto grid max-w-[72rem] gap-x-8 gap-y-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <a href="/" onClick={goHome} className="text-ice inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="bg-ice inline-block h-9 w-9 shrink-0"
              style={{
                WebkitMask: "url('/images/logo-light.png') center / contain no-repeat",
                mask: "url('/images/logo-light.png') center / contain no-repeat",
              }}
            />
            <span className="tech text-[0.8rem] tracking-[0.14em]">Nordic Rigging</span>
          </a>
          <p className="text-fog/70 mt-5 max-w-[20rem] text-sm leading-relaxed">{f.tagline}</p>
          <p className="tech text-fog/40 mt-7 text-[10px] leading-relaxed">
            © {new Date().getFullYear()} {CONTACT.company}
            <br />
            {f.rights}
          </p>
        </div>

        <nav aria-label={f.servicesCol}>
          <h3 className="tech text-fog/45 mb-5 text-[10px]">{f.servicesCol}</h3>
          <ul className="space-y-3.5 text-sm">
            {services.map(([slug, item]) => (
              <li key={slug}>
                <Link to={`/services/${slug}`} className="text-ice/80 hover:text-cyan transition-colors duration-300">
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <a href="/#contact" onClick={goContact} className="text-ice/80 hover:text-cyan transition-colors duration-300">
                {f.yardsLink}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="tech text-fog/45 mb-5 text-[10px]">{f.contactCol}</h3>
          <ul className="space-y-3.5 text-sm">
            <li>
              <a href={CONTACT.phoneHref} className="text-ice/80 hover:text-cyan transition-colors duration-300">
                {CONTACT.phoneIntl}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="text-ice/80 hover:text-cyan transition-colors duration-300">
                {CONTACT.email}
              </a>
            </li>
            <li className="text-fog/70">{CONTACT.street}</li>
            <li className="text-fog/70">{CONTACT.postal}</li>
          </ul>
        </div>

        <div>
          <h3 className="tech text-fog/45 mb-5 text-[10px]">{f.companyCol}</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="text-fog/70">
              {f.businessId} {CONTACT.businessId}
            </li>
            <li className="text-fog/70">{f.area}</li>
          </ul>
        </div>
      </div>

      <div aria-hidden="true" className="relative mt-16 w-full select-none md:mt-24">
        <p className="display text-ice/6 text-center text-[17vw] leading-[0.78] whitespace-nowrap">
          NORDICRIGGING
        </p>
      </div>
    </footer>
  )
}
