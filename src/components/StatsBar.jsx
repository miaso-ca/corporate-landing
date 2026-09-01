import useReveal from '../hooks/useReveal.js'

const STATS = [
  { value: '5.0 ★', label: 'Google rating' },
  { value: '4', label: 'Flexible catering formats' },
  { value: 'Toronto & GTA', label: 'Delivery and on-site service' },
  { value: '1 day', label: 'Quote turnaround' },
]

function Stat({ value, label, delay }) {
  const { ref, visible } = useReveal({ delay })
  return (
    <div
      className={`stat reveal ${visible ? 'reveal--visible' : ''}`}
      ref={ref}
      style={{ color: '#fff' }}
    >
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="section section--dark">
      <h2 style={{ color: '#fff', marginBottom: 32 }}>Corporate Events, Thoughtfully Handled</h2>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {STATS.map((s, i) => (
          <Stat key={s.label} value={s.value} label={s.label} delay={i * 100} />
        ))}
      </div>
    </section>
  )
}
