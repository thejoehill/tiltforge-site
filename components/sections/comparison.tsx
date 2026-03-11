export default function Comparison() {
  const features = [
    "Typical Price",
    "Retrofits Existing Blinds",
    "Manual Control Preserved",
    "Repairable",
    "Open / Modifiable",
    "Replacement Parts Available",
    "DIY Friendly",
  ]

  const competitors = [
    {
      name: "TiltForge",
      specs: ["$99–$119", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
      highlight: true,
    },
    {
      name: "SwitchBot",
      specs: ["$69", "Partial", "No", "No", "Limited", "No", "No"],
      highlight: false,
    },
    {
      name: "Tilt",
      specs: ["$199", "No", "No", "No", "No", "No", "No"],
      highlight: false,
    },
    {
      name: "iBlinds",
      specs: ["$129", "No", "No", "No", "Partial", "No", "No"],
      highlight: false,
    },
    {
      name: "Somfy",
      specs: ["$249+", "No", "No", "No", "No", "No", "No"],
      highlight: false,
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32 bg-card-bg/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            How TiltForge Is Actually Different
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b border-border font-semibold">
                  Feature
                </th>
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`text-center p-4 border-b ${
                      comp.highlight
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    } font-semibold`}
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={feature}
                  className={idx % 2 === 0 ? "bg-background/30" : ""}
                >
                  <td className="p-4 border-b border-border font-medium text-secondary">
                    {feature}
                  </td>

                  {competitors.map((comp) => {
                    const value = comp.specs[features.indexOf(feature)]

                    return (
                      <td
                        key={`${comp.name}-${feature}`}
                        className={`text-center p-4 border-b ${
                          comp.highlight
                            ? "border-primary/20 bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        {value === "Yes" ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
                            ✓
                          </span>
                        ) : value === "No" ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span className="text-secondary text-sm">
                            {value}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}