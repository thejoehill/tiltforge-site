"use client"

import { useState } from "react"

export default function AlphaBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2.5 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* Pulsing alpha dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Alpha</span>
      </div>

      <p className="text-xs text-foreground/80 text-center">
        TiltForge is in active development —{" "}
        <strong className="text-foreground">not taking orders yet.</strong>{" "}
        <a
          href="#waitlist"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          Join the waitlist
        </a>{" "}
        to follow along and help shape what we build.
      </p>

      <button
        onClick={() => setDismissed(true)}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
