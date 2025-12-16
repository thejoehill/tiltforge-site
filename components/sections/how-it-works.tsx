export default function HowItWorks() {
  const specs = [
    "Wave generator with 22T spur gear",
    "1–3 start worm options for speed control",
    "18:1 harmonic drive ratio",
    "Massive torque in a tiny footprint",
    "Quiet, fluid rotation",
    "Zero gear stripping",
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32 bg-card-bg/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-balance mb-8">Smooth, Silent, Strong.</h2>
            <p className="text-lg text-secondary mb-8">Thanks to engineering that actually makes sense.</p>

            <div className="space-y-4 mb-10">
              {specs.map((spec) => (
                <div key={spec} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-background">✓</span>
                  </div>
                  <p className="text-base text-secondary">{spec}</p>
                </div>
              ))}
            </div>

            <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              See Internal Design
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="relative aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <p className="text-secondary">Harmonic Drive Animation</p>
              <p className="text-xs text-muted mt-2">(Interactive 3D model area)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
