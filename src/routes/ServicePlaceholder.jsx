import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const TITLES = {
  'mast-work': 'Mast Work',
  'rope-stock': 'Rope Stock',
  maintenance: 'Maintenance',
}

export default function ServicePlaceholder() {
  const { slug } = useParams()
  const title = TITLES[slug]

  return (
    <main className="edge flex min-h-screen flex-col justify-center py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-4xl"
      >
        <p className="tech text-fog/40 text-[10px]">{title ? 'Services' : 'Not found'}</p>
        <h1 className="display text-ice mt-8 text-[clamp(2.6rem,9vw,7rem)]">
          {title ?? 'Off chart'}
        </h1>
        <p className="text-fog mt-10 max-w-md text-base leading-relaxed">
          {title ? 'Placeholder page.' : 'No page at this address.'}
        </p>
        <Link
          to="/"
          className="tech text-fog/50 hover:text-cyan mt-14 inline-block text-[10px] transition-colors duration-300"
        >
          &larr; Back
        </Link>
      </motion.div>
    </main>
  )
}
