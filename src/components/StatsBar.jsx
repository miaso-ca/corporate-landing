const STATS = [
  { value: '5.0 ★', label: 'Google rating' },
  { value: '4', label: 'Flexible catering formats' },
  { value: 'Toronto & GTA', label: 'Delivery and on-site service' },
  { value: '1 day', label: 'Quote turnaround' },
]

export default function StatsBar() {
  return (
    <section className="section section--dark">
      <h2 style={{ color: '#fff', marginBottom: 32 }}>Corporate Events, Thoughtfully Handled</h2>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {STATS.map((s) => (
          <div className="stat" key={s.label} style={{ color: '#fff' }}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
