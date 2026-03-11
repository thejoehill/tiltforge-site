import Button from "@/components/ui/button"

export default function ProductTiers() {
  const tiers = [
    {
      name: "TiltForge Assembled",
      price: "$99–$119",
      description:
        "A fully assembled tilt rod drive, calibrated and ready for early testing.",
      features: [
        "Includes motor + control board",
        "Pre-assembled and bench-tested",
        "Ideal for non-DIY beta testers",
      ],
      cta: "Join Beta",
      highlight: true,
    },
    {
      name: "TiltForge Maker Kit",
      price: "$49–$69",
      description:
        "Printed parts, bearings, and hardware for hands-on builders.",
      features: [
        "Bring your own electronics or add later",
        "Great for tinkerers and modders",
        "Full mechanical transparency",
      ],
      cta: "Build One",
      highlight: false,
    },
    {
      name: "TiltForge Studio (STLs)",
      price: "$20",
      description:
        "Print and build everything yourself.",
      features: [
        "Complete mechanical design files",
        "Lifetime design revisions included",
        "For printers, hackers, and labs",
      ],
      cta: "Get Files",
      highlight: false,
    },
    {
      name: "Replacement Parts",
      price: "$3–$12",
      description:
        "Because fixing one part should never mean replacing everything.",
      features: [
        "Individual component replacements",
        "No bundles, no forced upgrades",
        "Designed to stay available",
      ],
      cta: "View Parts",
      highlight: false,
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            Choose How Deep You Want to Go.
          </h2>
          <p className="text-lg text-secondary">
            From ready-to-run units to full DIY builds and replacement parts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-lg border p-8 transition-all ${
                tier.highlight
                  ? "bg-primary/5 border-primary/40 shadow-lg"
                  : "bg-card-bg border-border hover:border-primary/20"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <p className="text-3xl font-bold text-primary mb-4">
                {tier.price}
              </p>
              <p className="text-sm text-secondary mb-6 flex-grow">
                {tier.description}
              </p>

              <ul className="space-y-2 mb-8 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-primary mt-1">+</span>
                    <span className="text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlight ? "primary" : "secondary"}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}