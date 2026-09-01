import { useEffect, useRef, useState } from 'react'
import useReveal from '../hooks/useReveal.js'
import './StatsBar.css'

const ICONS = {
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path
        d="M12 3.5l2.47 5.18 5.63.55-4.24 3.9 1.18 5.62L12 15.9l-5.04 2.85 1.18-5.62-4.24-3.9 5.63-.55L12 3.5z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  tray: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="12" cy="7" rx="7" ry="2.6" />
      <path d="M5 7v6.5C5 15.4 8.13 17 12 17s7-1.6 7-3.5V7" strokeLinecap="round" />
      <path d="M12 17v3.5" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path
        d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 1118.5 10c0 5.14-6.5 11-6.5 11z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const STATS = [
  { type: 'count', countTo: 5, decimals: 1, suffix: ' ★', label: 'Google rating', icon: 'star' },
  {
    type: 'count',
    countTo: 4,
    decimals: 0,
    suffix: '',
    label: 'Flexible catering formats',
    icon: 'tray',
  },
  { type: 'text', value: 'Toronto & GTA', label: 'Delivery and on-site service', icon: 'pin' },
  { type: 'text', value: 'Quote within 1 business day', label: '', icon: 'clock' },
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
      <span className="stat__icon" aria-hidden="true">
        {ICONS[stat.icon]}
      </span>
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
