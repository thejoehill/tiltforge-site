\"use client\"

import { useEffect, useState } from "react"

const LAUNCH_DATE = new Date("2026-04-01T15:00:00.000Z") // change this to your real early-access open time

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const now = new Date().getTime()
  const target = LAUNCH_DATE.getTime()
  const diff = Math.max(target - now, 0)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

export default function EarlyAccessPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const isLive =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl text-center space-y-10">
        <div className="space-y-3">
          <p className="text-xs tracking-[0.25em] uppercase text-primary/80">Early Access</p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            TiltForge early access is coming online.
          </h1>
          <p className="text-sm md:text-base text-secondary max-w-xl mx-auto">
            You&apos;re on the list. When the countdown hits zero, we&apos;ll open the doors for the
            first wave of testers and send you a personal invite.
          </p>
        </div>

        <div className="inline-flex items-stretch gap-3 bg-card-bg border border-border rounded-2xl px-6 py-5">
          {["Days", "Hours", "Minutes", "Seconds"].map((label, idx) => {
            const value =
              label === "Days"
                ? timeLeft.days
                : label === "Hours"
                ? timeLeft.hours
                : label === "Minutes"
                ? timeLeft.minutes
                : timeLeft.seconds
          ;  return (
              <div
                key={label}
                className="min-w-[70px] flex flex-col items-center justify-center px-2"
              >
                <div className="text-2xl md:text-3xl font-mono font-semibold tabular-nums">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-secondary">
                  {label}
                </div>
              </div>
            )})}
        </div>

        <div className="space-y-4 text-sm text-secondary max-w-xl mx-auto">
          {isLive ? (
            <p className="text-primary">
              Early access is live. Check your inbox for your personal invite, or contact us at
              hello@tiltforge.com if you think you were missed.
            </p>
          ) : (
            <>
              <p>
                We&apos;re finalizing hardware and firmware, shaking out any last bugs, and getting
                shipping ready. Your place in line is saved.
              </p>
              <p className="text-xs text-muted-foreground">
                This page updates in real time. When the timer hits zero, the first early access
                invites go out to the waitlist.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

