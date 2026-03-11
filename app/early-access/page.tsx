"use client"

import Link from "next/link"
import ModelViewer from "@/components/ui/model-viewer"

export default function EarlyAccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 flex flex-col items-center">
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