"use client"

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
      cta: "Notify Me",
      highlight: true,
      status: "alpha",
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
      cta: "Notify Me",
      highlight: false,
      status: "alpha",
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
      cta: "Notify Me",
      highlight: false,
      status: "alpha",
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
      cta: "Notify Me",
      highlight: false,
      status: "alpha",
    },
  ]

  const scrollToWaitlist = () => {
    const el = document.getElementById("waitlist")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            Choose How Deep You Want to Go.
          </h2>
          <p className="text-lg text-secondary">
            From ready-to-run units to full DIY builds and replacement parts.
          </p>
        </div>

        {/* Alpha notice */}
        <div className="flex items-center justify-center gap-2 mb-12 px-5 py-3 rounded-lg border border-primary/20 bg-primary/5 max-w-xl mx-auto">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <p className="text-sm text-foreground/70 text-center">
            <strong className="text-foreground">Not available yet.</strong> These tiers are our planned lineup.
            Join the waitlist to be notified when they launch.
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
              <p className="text-3xl font-bold text-primary mb-1">{tier.price}</p>
              <p className="text-xs text-muted-foreground mb-4 italic">Est. pricing — subject to change</p>
              <p className="text-sm text-secondary mb-6 flex-grow">{tier.description}</p>

              <ul className="space-y-2 mb-8 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-primary mt-1">+</span>
                    <span className="text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToWaitlist}
                className={`w-full h-10 rounded-md text-sm font-semibold transition-all active:scale-[0.97] ${
                  tier.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-transparent border border-border text-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
