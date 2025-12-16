import Icon from "@/components/ui/icon"

export default function Ecosystem() {
  const platforms = [
    { name: "Home Assistant", icon: "home" },
    { name: "Tuya", icon: "cloud" },
    { name: "Alexa", icon: "speaker" },
    { name: "Google Home", icon: "microchip" },
    { name: "SmartThings", icon: "network" },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-balance mb-8">Works Where You Already Live.</h2>

        <p className="text-lg text-secondary max-w-2xl mx-auto mb-16">
          TiltForge doesn't lock you into anything. Control it with the platforms you already use.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card-bg border border-border hover:border-primary/40 transition-colors group"
            >
              <Icon name={platform.icon} className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{platform.name}</span>
            </div>
          ))}
        </div>

        <div className="inline-block bg-primary/10 border border-primary/30 rounded-lg px-6 py-3">
          <p className="text-primary font-semibold">Matter support coming soon</p>
        </div>
      </div>
    </section>
  )
}
