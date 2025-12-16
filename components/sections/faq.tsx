"use client"

import { useState } from "react"

export default function FAQ() {
  const [open, setOpen] = useState(0)

  const faqs = [
    {
      q: "Does TiltForge work with Tuya?",
      a: "Yes — and Matter support is coming soon. We're committed to keeping TiltForge compatible with the platforms you already use.",
    },
    {
      q: "Can I install it myself?",
      a: "Absolutely. Installation takes just minutes. We provide detailed guides and video tutorials to make the process seamless.",
    },
    {
      q: "What if a gear breaks?",
      a: "Replace it for $4–$12. That's the whole point. No more buying new motors just because one part failed. Our modular design makes repairs simple.",
    },
    {
      q: "Will it fit my blinds?",
      a: "TiltForge fits all standard tilt-rod blinds. If you're unsure about your specific setup, our support team is happy to help.",
    },
    {
      q: "Can I print my own parts?",
      a: "Yes. Get the STL pack for $20 and print every part yourself. We include lifetime design updates as improvements are made.",
    },
  ]

  return (
    <section className="w-full px-6 py-20 md:py-32">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-balance text-center mb-16">Frequently Asked Questions</h2>

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
                <h3 className="font-semibold text-lg pr-4">{faq.q}</h3>
                <svg
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                    open === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                </svg>
              </button>

              {open === idx && <div className="px-6 pb-6 pt-0 text-secondary border-t border-border">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
