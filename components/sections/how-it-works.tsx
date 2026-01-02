export default function HowItWorks() {
  const specs = [
    "Magnetically coupled drive engages the existing tilt spool",
    "Axial motor rotation mimics the original pull-cord action",
    "Slip-safe magnetic interface preserves manual control",
    "No blind replacement or permanent modification required",
    "Only four 3D-printed structural components",
    "Built from standard, off-the-shelf hardware",
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32 bg-card-bg/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-balance mb-8">
              Simple. Intentional. Mechanical.
            </h2>

            <p className="text-lg text-secondary mb-8">
              TiltForge works by turning the same spool your blinds already use —
              just automatically, and without breaking anything.
            </p>

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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="relative aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🧲⚙️</div>
              <p className="text-secondary">Magnetic Tilt Rod Drive</p>
              <p className="text-xs text-muted mt-2">
                (Interactive exploded-view model)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}