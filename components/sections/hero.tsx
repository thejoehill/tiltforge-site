"use client"

import { useEffect, useRef, useState } from "react"
import Button from "@/components/ui/button"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 50, y: 30 })

  /* Track scroll */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Track mouse for spotlight parallax */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMouse({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  /* Derived animation values */
  const logoScale = Math.max(0.85, 1 - scrollY * 0.0006)
  const glowOpacity = Math.max(0, 0.35 - scrollY * 0.0009)

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex items-center justify-center px-6 pt-28 pb-24 overflow-hidden"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />

      {/* Spotlight + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full bg-primary blur-[140px] transition-opacity duration-300"
          style={{
            width: 480,
            height: 480,
            opacity: glowOpacity,
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
       {/* Logo */}
<div className="mb-8 flex justify-center">
  <img
    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiltForge%20logo%20dark-2Re7fY8aYvO7z3WUd7jbJWeu8NxIao.png"
    alt="TiltForge Logo"
    className="h-32 md:h-40 w-auto transition-transform duration-300"
    style={{
      transform: `scale(${Math.max(0.92, 1 - scrollY * 0.0004)})`,
      filter: "drop-shadow(0 0 55px rgba(0,152,255,0.35))",
    }}
  />
</div>


        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground">
          Smart Blinds.
          <br />
          <span className="text-primary">Repairable.</span> Affordable.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10">
          Meet TiltForge — the first smart blind motor powered by a harmonic drive.
          Stronger. Quieter. Open. Designed to last.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-md bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button variant="primary" className="relative z-10">
              Get TiltForge
            </Button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 rounded-md bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button variant="secondary" className="relative z-10">
              See How It Works
            </Button>
          </div>
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
