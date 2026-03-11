export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left — wordmark + tagline */}
        <div>
          <p className="text-sm font-semibold text-foreground">TiltForge</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Built to be repaired, modified, and understood.
          </p>
        </div>

        {/* Center — alpha status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          <span className="text-xs text-primary font-medium">Alpha — not taking orders yet</span>
        </div>

        {/* Right — real links only */}
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <a href="https://github.com/thejoehill/tiltforge-site" target="_blank" rel="noopener noreferrer"
            className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#waitlist"
            onClick={(e) => {
              e.preventDefault()
              const el = document.getElementById("waitlist")
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" })
            }}
            className="hover:text-foreground transition-colors">Join Waitlist</a>
          <span className="text-muted-foreground/40">© 2026</span>
        </div>

      </div>
    </footer>
  )
}