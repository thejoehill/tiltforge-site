import Button from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 pt-28 pb-24 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />

      {/* Spotlight + ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary spotlight */}
        <div
          className="absolute left-1/2 top-[28%]
                     h-[420px] w-[420px]
                     -translate-x-1/2 -translate-y-1/2
                     rounded-full bg-primary/30 blur-[120px]"
        />

        {/* Ambient fade */}
        <div
          className="absolute inset-0
                     bg-gradient-to-b
                     from-transparent
                     via-black/40
                     to-black"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiltForge%20logo%20dark-2Re7fY8aYvO7z3WUd7jbJWeu8NxIao.png"
            alt="TiltForge Logo"
            className="h-24 md:h-28 w-auto"
            style={{
              filter: "drop-shadow(0 0 40px rgba(0,152,255,0.25))",
            }}
          />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight mb-6 text-foreground">
          Smart Blinds.
          <br />
          <span className="text-primary">Repairable.</span> Affordable.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 text-balance">
          Meet TiltForge — the first smart blind motor powered by a harmonic drive.
          Stronger. Quieter. Open. Designed to last.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">Get TiltForge</Button>
          <Button variant="secondary">See How It Works</Button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20">
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <span className="text-sm text-secondary">Scroll to explore</span>
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
