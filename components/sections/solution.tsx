import Icon from "@/components/ui/icon"

export default function Solution() {
  const features = [
    {
      title: "Cycloid Drive Mechanism",
      description:
        "A compact cycloid drive turns the same tilt spool your blinds already use — delivering high torque in a small package, without forcing a redesign.",
      icon: "gear",
    },
    {
      title: "Manual Control Always Preserved",
      description:
        "A friction clutch disengages automatically when you grab the pull cord — so you're never locked out of your own blinds, even if power or software fails.",
      icon: "hand",
    },
    {
      title: "Inexpensive to Repair",
      description:
        "Designed around standard off-the-shelf hardware and a handful of printed parts. Replace the one thing that breaks — not the entire device.",
      icon: "wrench",
    },
    {
      title: "Open by Design",
      description:
        "Tuya support for the MVP, with future paths toward local control and broader ecosystems. No sealed boxes. No vendor lock-in.",
      icon: "network",
    },
    {
      title: "Built for Builders",
      description:
        "Available assembled, as a kit, or as downloadable files. Full mechanical transparency — understand and modify every part of what you own.",
      icon: "code",
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32 bg-card-bg/50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Automation That Respects the Hardware You Already Own.
          </h2>
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