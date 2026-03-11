"use client"

import { useEffect, useRef, useState } from "react"
import WaitlistForm from "@/components/ui/waitlist-form"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 50, y: 30 })

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const clamp = (v: number) => Math.max(0, Math.min(100, v))
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      setMouse({
        x: clamp(((e.clientX - rect.left) / rect.width) * 100),
        y: clamp(((e.clientY - rect.top) / rect.height) * 100),
      })
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [])

  const logoScale = Math.max(0.78, 1 - scrollY * 0.00035)
  const glowOpacity = Math.max(0, 0.45 - scrollY * 0.0009)

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />

      {/* Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full bg-primary blur-[220px] transition-opacity duration-300"
          style={{
            width: 760,
            height: 760,
            opacity: glowOpacity,
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center pt-32">
        {/* LOGO */}
        <div className="mb-24 flex justify-center w-full">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiltForge%20logo%20dark-2Re7fY8aYvO7z3WUd7jbJWeu8NxIao.png"
            alt="TiltForge Logo"
            className="w-[90vw] max-w-[900px] lg:max-w-[1000px] h-auto transition-transform duration-300"
            style={{
              transform: `scale(${logoScale})`,
              filter: `drop-shadow(0 0 90px rgba(0,152,255,${glowOpacity}))`,
            }}
          />
        </div>

        {/* HEADLINE */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-10 text-foreground">
          Smart Blinds.
          <br />
          <span className="text-primary">Retrofit.</span> Repairable.
        </h1>

        {/* SUBHEAD */}
        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-6">
          Meet TiltForge — a compact cycloidal-drive tilt rod motor with a friction clutch that
          automates your existing blinds without replacing them.
          Simple hardware. Standard parts. Built to be fixed, not thrown away.
        </p>

        {/* ALPHA BADGE */}
        <div className="flex items-center gap-2 mb-10 px-4 py-2 rounded-full bg-primary/10 border border-primary/25">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Alpha</span>
          <span className="text-xs text-muted-foreground">— Not taking orders yet. Join the waitlist below.</span>
        </div>

        {/* WAITLIST FORM */}
        <div id="waitlist" className="w-full max-w-md mx-auto mb-24">
          <WaitlistForm
            variant="hero"
            buttonText="Get Early Access"
            successMessage="You're on the list. Alpha updates coming your way."
          />
        </div>

        {/* SCROLL INDICATOR */}
        <div className="pb-16">
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