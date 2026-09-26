import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowNarrowLeft, IconArrowNarrowRight } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { cn } from '../lib/utils'

export function Carousel({ items, initialScroll = 0 }) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      checkScrollability()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScroll])

  const checkScrollability = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })

  return (
    <div className="relative w-full">
      <div
        className="no-scrollbar flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-6"
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        <div className={cn('flex flex-row justify-start gap-4 px-4')}>
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: 0.15 * index, ease: 'easeOut' },
              }}
              key={'card' + index}
              className="rounded-3xl last:pr-[6%]"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-2 mr-4 flex justify-end gap-2">
        <button
          type="button"
          className="border-slate-line text-fog relative z-40 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-30"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Edellinen"
        >
          <IconArrowNarrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="border-slate-line text-fog relative z-40 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-30"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Seuraava"
        >
          <IconArrowNarrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

/** Whole card is a direct link to the service's own page - no in-between modal. */
export function Card({ card }) {
  return (
    <Link
      to={card.link}
      className="border-slate-line relative z-10 flex w-[19rem] flex-col overflow-hidden rounded-3xl border text-left"
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden">
        <BlurImage src={card.src} alt={card.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(4,7,11,0.5)] to-transparent" />
      </div>
      <div className="bg-navy-900 flex flex-1 flex-col p-6">
        <p className="tech text-cyan text-[10px]">{card.category}</p>
        <p className="display-md text-ice mt-2 text-[clamp(1.4rem,5.5vw,1.7rem)] [text-wrap:balance]">{card.title}</p>
        <p className="text-fog mt-4 text-sm leading-relaxed">{card.description}</p>
        {card.outcome && (
          <p className="text-fog/90 mt-4 text-sm leading-relaxed">
            <strong className="text-ice">{card.outcomeLabel}:</strong> {card.outcome}
          </p>
        )}
        {card.ctaLabel && <p className="tech text-cyan mt-6 text-[10px]">{card.ctaLabel} &rarr;</p>}
      </div>
    </Link>
  )
}

export function BlurImage({ src, alt, className, ...rest }) {
  const [isLoading, setLoading] = useState(true)
  return (
    <img
      className={cn('h-full w-full transition duration-300', isLoading ? 'blur-sm' : 'blur-0', className)}
      onLoad={() => setLoading(false)}
      src={src}
      loading="lazy"
      decoding="async"
      alt={alt}
      {...rest}
    />
  )
}
