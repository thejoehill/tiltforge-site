"use client"

import ModelViewer from "@/components/ui/model-viewer"

export default function HowItWorks() {
  const specs = [
    "Cycloid gear reduction delivers high torque in a compact form factor",
    "Friction clutch couples the drive to your existing tilt rod",
    "Clutch slips safely under overload — no stripped gears, no broken blinds",
    "Manual pull cord works normally at any time, powered or not",
    "No blind replacement or permanent modification required",
    "Only a handful of 3D-printed structural components",
    "Built from standard, off-the-shelf hardware throughout",
  ]

  return (
    <section className="w-full py-20 md:py-32 bg-card-bg/50">

      {/* Header + specs — constrained width */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
          Simple. Intentional. Mechanical.
        </h2>
        <p className="text-lg text-secondary mb-10 max-w-2xl">
          TiltForge uses a cycloid gear reduction to drive a friction clutch that
          turns the same tilt rod your blinds already have — automatically, quietly,
          and without permanently modifying anything.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {specs.map((spec) => (
            <div key={spec} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-background">✓</span>
              </div>
              <p className="text-sm text-secondary leading-snug">{spec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width 3D viewer */}
      <div className="w-full px-4 md:px-8">
        <ModelViewer />
      </div>

    </section>
  )
}
