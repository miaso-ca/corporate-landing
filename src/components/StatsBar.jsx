import { useEffect, useRef, useState } from 'react'
import useReveal from '../hooks/useReveal.js'
import './StatsBar.css'

const STATS = [
  { type: 'count', countTo: 5, decimals: 1, suffix: ' ★', label: 'Google rating' },
  { type: 'count', countTo: 4, decimals: 0, suffix: '', label: 'Flexible catering formats' },
  { type: 'text', value: 'Toronto & GTA', label: 'Delivery and on-site service' },
  { type: 'text', value: 'Quote within 1 business day', label: '' },
]

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Counts 0 -> target once `active` turns true. No library — just rAF.
function useCountUp(target, decimals, active, duration = 1100) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true

    if (prefersReducedMotion()) {
      setValue(target)
      return
    }

    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      if (progress < 1) {
        setValue(target * eased)
        frame = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration])

  return value.toFixed(decimals)
}

function Stat({ stat, delay }) {
  const { ref, visible } = useReveal({ delay })
  const isCount = stat.type === 'count'
  const count = useCountUp(isCount ? stat.countTo : 0, isCount ? stat.decimals : 0, visible && isCount)

  return (
    <div
      className={`stat reveal ${visible ? 'reveal--visible' : ''}`}
      ref={ref}
      style={{ color: '#fff' }}
    >
      <b>{isCount ? `${count}${stat.suffix}` : stat.value}</b>
      {stat.label && <span>{stat.label}</span>}
    </div>
  )
}

export default function StatsBar() {
  return (
    <div className="section-dark">
      <section className="section stats-bar">
        <h2 className="stats-bar__heading">Corporate Events, Thoughtfully Handled</h2>
        <div className="stats-bar__grid">
          {STATS.map((s, i) => (
            <Stat key={s.value ?? s.countTo} stat={s} delay={i * 100} />
          ))}
        </div>
      </section>
    </div>
  )
}
