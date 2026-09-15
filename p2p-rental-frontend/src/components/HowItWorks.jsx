const steps = [
  {
    number: '01',
    title: 'Find Your Car',
    description: 'Browse thousands of verified cars near you. Filter by type, price, features, or availability.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Book Instantly',
    description: 'Reserve in seconds with our seamless booking flow. Instant confirmation, no waiting around.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Pick Up & Drive',
    description: 'Meet the owner or use contactless keyless entry. Comprehensive insurance coverage included.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Rate & Review',
    description: 'Share your experience to help the community. Build your trusted driver reputation.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="label mb-3">Simple Process</p>
          <h2 className="section-title mb-5">
            How <span className="gradient-text">DriveShare</span> Works
          </h2>
          <p className="text-carbon-500 text-base max-w-lg mx-auto leading-relaxed">
            Rent a car in minutes, not hours. Our streamlined process puts you on the road fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px">
                  <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>
              )}

              <div className="rounded-2xl bg-carbon-900/50 border border-white/[0.04] hover:border-neon-cyan/15 p-6 transition-all duration-500 h-full group-hover:bg-carbon-900/70">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/[0.08] border border-neon-cyan/15 flex items-center justify-center text-neon-cyan mb-5 group-hover:bg-neon-cyan/15 group-hover:shadow-lg group-hover:shadow-neon-cyan/10 transition-all duration-300">
                  {step.icon}
                </div>
                <div className="text-[10px] font-bold text-carbon-600 uppercase tracking-[0.25em] mb-2">
                  Step {step.number}
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-carbon-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="glass inline-flex items-center gap-5 px-6 py-4 rounded-xl">
            <p className="text-white text-sm font-medium">Ready to hit the road?</p>
            <button className="btn-primary py-2 px-5 text-xs">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
