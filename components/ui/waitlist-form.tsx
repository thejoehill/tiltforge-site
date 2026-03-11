"use client"

import { useState } from "react"

interface WaitlistFormProps {
  variant?: "hero" | "section" | "compact"
  placeholder?: string
  buttonText?: string
  successMessage?: string
}

export default function WaitlistForm({
  variant = "section",
  placeholder = "your@email.com",
  buttonText = "Get Early Access",
  successMessage = "You're on the list. We'll be in touch.",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email.")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      // ── Buttondown integration ──────────────────────────────────────────────
      // 1. Create a free account at https://buttondown.com
      // 2. Go to Settings → API Keys → copy your key
      // 3. Replace "YOUR_BUTTONDOWN_API_KEY" below with your actual key
      // 4. Optionally set NEXT_PUBLIC_BUTTONDOWN_API_KEY in your .env.local
      //    and use process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY here
      // ───────────────────────────────────────────────────────────────────────
      const API_KEY = process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY ?? "YOUR_BUTTONDOWN_API_KEY"

      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tags: ["early-access", "alpha"],
          metadata: {
            source: "tiltforge-website",
            variant,
          },
        }),
      })

      if (res.ok || res.status === 201) {
        setStatus("success")
        setEmail("")
      } else if (res.status === 400) {
        // Already subscribed is treated as success UX-wise
        const body = await res.json().catch(() => ({}))
        if (JSON.stringify(body).includes("already")) {
          setStatus("success")
          setEmail("")
        } else {
          setStatus("error")
          setErrorMsg("Something went wrong. Try again.")
        }
      } else {
        setStatus("error")
        setErrorMsg("Something went wrong. Try again.")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Network error. Check your connection.")
    }
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-lg border border-primary/40 bg-primary/10 ${
          variant === "hero" ? "max-w-md mx-auto" : "max-w-sm"
        }`}
      >
        <span className="text-primary text-xl">✓</span>
        <p className="text-sm text-foreground font-medium">{successMessage}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 ${variant === "hero" ? "w-full max-w-md mx-auto" : "w-full max-w-sm"}`}
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrorMsg("")
          }}
          placeholder={placeholder}
          disabled={status === "loading"}
          className="
            flex-1 h-11 px-4 rounded-md
            bg-input border border-border
            text-foreground placeholder:text-muted-foreground
            text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60
            disabled:opacity-50
            transition-all
          "
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="
            h-11 px-5 rounded-md
            bg-primary text-white font-semibold text-sm
            hover:bg-primary/90 active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all whitespace-nowrap
            relative overflow-hidden
          "
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Joining…
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-400 ml-1">{errorMsg}</p>
      )}

      <p className="text-xs text-muted-foreground ml-1">
        No spam. Alpha updates only. Unsubscribe anytime.
      </p>
    </form>
  )
}