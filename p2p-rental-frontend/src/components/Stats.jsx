const stats = [
  { value: '50K+', label: 'Verified Drivers' },
  { value: '12K+', label: 'Cars Listed' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '180+', label: 'Cities Covered' },
]

export default function Stats() {
  return (
    <section className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < stats.length - 1 ? 'md:border-r md:border-white/[0.06]' : ''}`}
            >
              <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-1.5 tracking-tight">
                {stat.value}
              </div>
              <div className="text-carbon-500 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
