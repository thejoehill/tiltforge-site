import Icon from "@/components/ui/icon"

export default function Solution() {
  const features = [
    {
      title: "Harmonic Drive Torque",
      description: "A compact 38T/36T harmonic gearbox delivers unmatched power and smoothness.",
      icon: "gear",
    },
    {
      title: "Fully Repairable",
      description: "Every part can be replaced for $4–$12. Never throw away a motor again.",
      icon: "wrench",
    },
    {
      title: "Open Ecosystem",
      description: "Works with Tuya now. Matter upgrade coming.",
      icon: "network",
    },
    {
      title: "Affordable",
      description: "Premium performance at half the cost of big brands.",
      icon: "tag",
    },
    {
      title: "DIY or Ready-To-Install",
      description: "Print it. Build it. Or buy it fully assembled.",
      icon: "code",
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32 bg-card-bg/50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">A Smarter Way to Automate Your Blinds.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-6">
              <div className="flex-shrink-0">
                <Icon name={feature.icon} className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
