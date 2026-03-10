"use client"

import { useState } from "react"

interface WaitlistFormProps {
  source?: string
  placeholder?: string
  buttonText?: string
  className?: string
}

export default function WaitlistForm({
  source = "unknown",
  placeholder = "you@email.com",
  buttonText = "Join Early Access",
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      setStatus("success")
      setMessage(data.message ?? "You're on the list!")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Try again.")
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 ${className}`}>
        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-primary font-medium">{message}</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 w-full max-w-md ${className}`}>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setMessage("") }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="
            flex-1 min-w-0 px-4 py-3 rounded-lg
            bg-card-bg border border-border
            text-foreground placeholder:text-secondary
            focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30
            transition-all text-sm
          "
          disabled={status === "loading"}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="
            px-5 py-3 rounded-lg font-semibold text-sm whitespace-nowrap
            bg-primary text-black
            hover:bg-primary/90 active:scale-[0.97]
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all
          "
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Joining…
            </span>
          ) : buttonText}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400 pl-1">{message}</p>
      )}
    </div>
  )
}
