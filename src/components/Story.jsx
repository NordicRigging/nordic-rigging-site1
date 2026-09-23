import { motion } from 'framer-motion'
import { useLang } from '../lib/LanguageContext'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Story() {
  const { t } = useLang()

  return (
    <section id="story" className="edge relative py-40 md:py-64">
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.8 }}
          className="tech text-fog/40 mb-16 text-[10px] md:mb-24"
        >
          {t.story.eyebrow}
        </motion.p>

        <div className="space-y-8 md:space-y-12">
          {t.story.sentences.map((sentence, i) => (
            <motion.p
              key={sentence}
              custom={i}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-15% 0px' }}
              className="text-ice/90 text-[clamp(1.25rem,3vw,2.1rem)] leading-[1.45] font-light"
            >
              {sentence}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  )
}
