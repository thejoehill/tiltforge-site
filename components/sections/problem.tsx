export default function Problem() {
  const issues = ["Weak gearboxes", "Non-repairable", "Closed ecosystems", "Poor torque", "Loud operation"]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            Stop Paying $199 for Blind Motors You Can't Repair.
          </h2>
          <p className="text-lg text-secondary max-w-2xl">
            Most smart blind motors are fragile, overpriced, and disposable. When a $0.10 gear strips, the entire $199
            unit is useless.
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
