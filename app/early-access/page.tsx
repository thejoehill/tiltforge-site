"use client"

import Link from "next/link"
import ModelViewer from "@/components/ui/model-viewer"
import { useEffect, useState } from "react"

function BlindsReveal() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 300)
    const t2 = setTimeout(() => setHidden(true), 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (hidden) return null

  const slats = Array.from({ length: 14 })

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{
        background: "radial-gradient(circle at top, #05070b 0, #020308 45%, #000 100%)",
        perspective: "1200px",
        opacity: open ? 0 : 1,
        transition: "opacity 700ms ease-out 900ms",
      }}
    >
      <div className="relative w-full h-full flex flex-col">
        {slats.map((_, i) => {
          const delay = 120 + Math.random() * 80
          return (
            <div
              key={i}
              style={{
                flex: 1,
                transformOrigin: "center",
                transform: open ? "rotateX(0deg)" : "rotateX(80deg)",
                transition: `transform 850ms cubic-bezier(0.19, 1, 0.22, 1) ${delay}ms`,
                background:
                  "linear-gradient(to bottom, #05070b 0%, #05070b 20%, #030408 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                boxShadow: open
                  ? "inset 0 0 0 rgba(0,0,0,0)"
                  : "0 1px 4px rgba(0,0,0,0.45)",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function EarlyAccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 flex flex-col items-center relative overflow-hidden">
      <BlindsReveal />
      <div className="w-full max-w-5xl space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs tracking-[0.25em] uppercase text-primary/80">Early Access</p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            TiltForge early access opens Spring 2026.
          </h1>
          <p className="text-sm md:text-base text-secondary max-w-xl mx-auto">
            You&apos;re on the list. We&apos;ll email you as soon as the first wave of hardware is ready
            to ship so you can claim your spot.
          </p>
        </div>

        <div className="space-y-3 text-sm text-secondary max-w-xl mx-auto text-center">
          <p>
            Right now we&apos;re dialing in the mechanics, firmware, and packaging for the first units.
          </p>
          <p>
            As we get closer, this page will turn into a live countdown and we&apos;ll share more details
            about pricing, timelines, and how early access will work.
          </p>
        </div>

        <div className="mt-8">
          <ModelViewer />
        </div>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
          >
            ← Back to tiltforge.com
          </Link>
        </div>
      </div>
    </main>
  )
}