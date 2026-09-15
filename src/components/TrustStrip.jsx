import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

const STATS = [
  { to: 20, suffix: '+', label: 'Years' },
  { to: 100, suffix: '+', label: 'Boats serviced' },
  { to: 24, suffix: 'h', label: 'Response' },
]

function Counter({ to, suffix, label, inView }) {
  const numberRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = numberRef.current
    if (!node) return

    if (!inView) {
      node.textContent = '0'
      return
    }

    if (reduced) {
      node.textContent = String(to)
      return
    }

    // Plain ease-out tween. It settles on the number and stops — no overshoot.
    const controls = animate(0, to, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        node.textContent = String(Math.round(value))
      },
    })
    return () => controls.stop()
  }, [inView, to, reduced])

  return (
    <div className="flex flex-col gap-2">
      <p className="display-md text-ice text-[clamp(2rem,4.6vw,3.1rem)] tabular-nums">
        <span ref={numberRef}>0</span>
        <span className="text-cyan">{suffix}</span>
      </p>
      <p className="tech text-fog/50 text-[10px]">{label}</p>
    </div>
  )
}

export default function TrustStrip() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  return (
    <section ref={ref} id="trust" className="relative z-10">
      <div className="rule edge">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 py-10 md:py-14">
          {STATS.map((stat) => (
            <Counter key={stat.label} {...stat} inView={inView} />
          ))}
        </div>
      </div>
      <div className="rule" />
    </section>
  )
}
