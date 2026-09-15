import { useLang } from '../lib/LanguageContext'

/** Mirrors HUD's fixed instrumentation styling, opposite corner. */
export default function LanguageToggle() {
  const { lang, t, changeLanguage } = useLang()

  return (
    <div className="edge pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-end md:inset-x-auto md:right-10 md:top-8">
      <div className="tech pointer-events-auto flex items-center gap-2 text-[10px]">
        {['fi', 'en'].map(code => (
          <button
            key={code}
            type="button"
            onClick={() => changeLanguage(code)}
            aria-pressed={lang === code}
            className={`transition-colors duration-300 ${lang === code ? 'text-ice' : 'text-fog/45 hover:text-fog/80'}`}
          >
            {t.langToggle[code]}
          </button>
        ))}
      </div>
    </div>
  )
}
