import Button from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 900px 700px at center top 35%, rgba(0,152,255,0.2) 0%, rgba(26,28,30,0.2) 20%, rgba(26,28,30,0.6) 50%, rgba(0,0,0,1) 100%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="mb-16 flex justify-center w-full px-5">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiltForge%20logo%20dark-2Re7fY8aYvO7z3WUd7jbJWeu8NxIao.png" alt="TiltForge Logo" className="w-[95%] h-auto drop-shadow-2xl" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight mb-6 text-foreground">
          Smart Blinds.
          <br />
          <span className="text-primary">Repairable.</span> Affordable.
        </h1>

        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 text-balance">
          Meet TiltForge — the first smart blind motor powered by a harmonic drive. Stronger. Quieter. Open. Designed to
          last.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">Get TiltForge</Button>
          <Button variant="secondary">See How It Works</Button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20">
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <span className="text-sm text-secondary">Scroll to explore</span>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
