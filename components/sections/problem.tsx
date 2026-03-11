export default function Problem() {
  const issues = [
    "Full blind replacement just to add automation",
    "Disposable motors with no repair path",
    "Manual control lost when the motor fails",
    "Closed ecosystems and locked-down firmware",
    "Designs that ignore how blinds already work",
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            Smart Blinds Shouldn’t Mean Disposable Blinds.
          </h2>

          <p className="text-lg text-secondary max-w-2xl">
            Most “smart” blind solutions force you to replace perfectly good hardware
            with sealed motors that can’t be repaired, modified, or even manually used
            when something goes wrong.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {issues.map((issue) => (
            <div
              key={issue}
              className="flex items-start gap-4 p-6 rounded-lg bg-card-bg border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-lg font-medium">{issue}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}