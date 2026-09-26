import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/utils'
import { useOutsideClick } from '../hooks/use-outside-click'

export const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
})

export function Carousel({ items, initialScroll = 0 }) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const handleCardClose = (index) => {
    if (!carouselRef.current) return
    const cardWidth = 304
    const gap = 16
    carouselRef.current.scrollTo({ left: (cardWidth + gap) * (index + 1), behavior: 'smooth' })
    setCurrentIndex(index)
  }

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
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
    </CarouselContext.Provider>
  )
}

export function Card({ card, index }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const { onCardClose } = useContext(CarouselContext)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') handleClose()
    }
    document.body.style.overflow = open ? 'hidden' : ''
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useOutsideClick(containerRef, () => handleClose())

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    onCardClose(index)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-[rgba(4,7,11,0.85)] backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              ref={containerRef}
              className="border-slate-line bg-navy-900 relative z-[60] mx-auto my-10 h-fit max-w-lg rounded-3xl border p-6"
            >
              <button
                type="button"
                className="border-slate-line text-fog sticky top-0 ml-auto flex h-9 w-9 items-center justify-center rounded-full border bg-[rgba(10,24,38,0.8)]"
                onClick={handleClose}
                aria-label="Sulje"
              >
                <IconX className="h-5 w-5" />
              </button>
              <p className="tech text-cyan mt-5 text-[10px]">{card.category}</p>
              <p className="display-md text-ice mt-3 text-[clamp(1.7rem,7vw,2.4rem)]">{card.title}</p>
              <div className="mt-6 space-y-5">
                <p className="text-fog text-base leading-relaxed">{card.description}</p>
                {card.outcome && (
                  <p className="text-fog/90 text-sm leading-relaxed">
                    <strong className="text-ice">{card.outcomeLabel}:</strong> {card.outcome}
                  </p>
                )}
                {card.link && (
                  <Link
                    to={card.link}
                    className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss inline-block border px-6 py-3 text-[10px] transition-colors duration-300"
                  >
                    {card.ctaLabel}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={handleOpen}
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
      </button>
    </>
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
