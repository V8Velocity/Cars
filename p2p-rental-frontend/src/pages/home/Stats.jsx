const DEFAULT_STATS = [
  { value: '50K+', label: 'Verified Drivers' },
  { value: '12K+', label: 'Cars Listed' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '180+', label: 'Cities Covered' },
]

function StatCard({ value, label, hasBorder }) {
  return (
    <div
      className={`text-center px-4 py-2 ${hasBorder ? 'md:border-r md:border-white/[0.06]' : ''}`}
      role="group"
      aria-label={`${value} ${label}`}
    >
      <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2 tracking-tight">
        {value}
      </div>
      <div className="text-carbon-400 text-sm font-medium">{label}</div>
    </div>
  )
}

export default function Stats({ stats = DEFAULT_STATS }) {
  return (
    <section className="relative py-12 px-6" aria-label="Platform statistics">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              hasBorder={i < stats.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
