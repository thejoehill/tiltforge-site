import ModelViewer from "@/components/ui/model-viewer"

export default function HowItWorks() {
  const specs = [
    "Cycloid gear reduction delivers high torque in a compact form factor",
    "Friction clutch couples the drive to your existing tilt rod",
    "Clutch slips safely under overload — no stripped gears, no broken blinds",
    "Manual pull cord works normally at any time, powered or not",
    "No blind replacement or permanent modification required",
    "Only a handful of 3D-printed structural components",
    "Built from standard, off-the-shelf hardware throughout",
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
              TiltForge uses a cycloid gear reduction to drive a friction clutch that
              turns the same tilt rod your blinds already have — automatically, quietly,
              and without permanently modifying anything.
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

          <ModelViewer />
        </div>
      </div>
    </section>
  )
}
