"use client"

import { useState } from "react"

export default function FAQ() {
  const [open, setOpen] = useState(0)

  const faqs = [
    {
      q: "Does TiltForge work with Tuya?",
      a: "Yes. The MVP uses Tuya for reliable control and broad platform compatibility. Future integration paths are evaluated carefully, but stability comes first.",
    },
    {
      q: "Can I install it myself?",
      a: "Yes. TiltForge is designed as a straightforward retrofit onto your existing tilt rod mechanism. Most installs take only a few minutes with basic tools.",
    },
    {
      q: "What happens if something breaks?",
      a: "You replace the failed part — not the entire device. TiltForge uses standard hardware and a small number of printed components specifically so repairs are practical.",
    },
    {
      q: "Will it still work if the power or software fails?",
      a: "Yes. The magnetic coupling allows the mechanism to safely slip, so you can continue using the pull cord manually at any time.",
    },
    {
      q: "Will it fit my blinds?",
      a: "TiltForge is designed for standard tilt-rod blinds. If your blinds tilt using a traditional rod and cord mechanism, it will likely fit. Edge cases exist, and we’re happy to help verify compatibility.",
    },
    {
      q: "Can I print or modify the parts myself?",
      a: "Yes. The design is intentionally maker-friendly. You can print your own parts, modify them, or build the entire device from files if that’s your preference.",
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-balance text-center mb-16">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setOpen(open === idx ? -1 : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-card-bg/50 transition-colors"
              >
                <h3 className="font-semibold text-lg pr-4">
                  {faq.q}
                </h3>
                <svg
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                    open === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7-7m0 0L5 14m7-7v12"
                  />
                </svg>
              </button>

              {open === idx && (
                <div className="px-6 pb-6 pt-0 text-secondary border-t border-border">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}