"use client"

import { useState, useEffect } from "react"

interface WaitlistEntry {
  email: string
  joinedAt: string
  source?: string
  notified?: boolean
}

export default function AdminWaitlistPage() {
  const [key, setKey] = useState("")
  const [authed, setAuthed] = useState(false)
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Email blast state
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [onlyUnnotified, setOnlyUnnotified] = useState(true)
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState("")

  async function fetchList() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/waitlist?key=${encodeURIComponent(key)}`)
      if (!res.ok) { setError("Invalid key or server error."); setLoading(false); return }
      const data = await res.json()
      setEntries(data.entries)
      setAuthed(true)
    } catch {
      setError("Failed to connect.")
    }
    setLoading(false)
  }

  async function sendBlast(isTest: boolean) {
    setSending(true)
    setSendResult("")
    try {
      const res = await fetch("/api/waitlist/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          subject,
          body,
          onlyUnnotified,
          testEmail: isTest ? testEmail : undefined,
        }),
      })
      const data = await res.json()
      setSendResult(data.message ?? data.error ?? "Done.")
      if (!isTest) await fetchList() // refresh notified flags
    } catch {
      setSendResult("Send failed.")
    }
    setSending(false)
  }

  const unnotifiedCount = entries.filter((e) => !e.notified).length

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card-bg border border-border rounded-xl p-8">
          <h1 className="text-xl font-bold mb-6 text-foreground">TiltForge Admin</h1>
          <input
            type="password"
            placeholder="Admin secret key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchList()}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm mb-3 focus:outline-none focus:border-primary/60"
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={fetchList}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading ? "Checking…" : "Login"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Waitlist Admin</h1>
            <p className="text-secondary text-sm mt-1">
              {entries.length} total · {unnotifiedCount} not yet notified
            </p>
          </div>
          <button
            onClick={fetchList}
            className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition"
          >
            Refresh
          </button>
        </div>

        {/* Entries table */}
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Source</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-left px-5 py-3">Notified</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.email} className={`border-b border-border/50 hover:bg-background/40 transition ${i % 2 === 0 ? "" : "bg-background/20"}`}>
                    <td className="px-5 py-3 font-mono text-xs">{e.email}</td>
                    <td className="px-5 py-3 text-secondary">{e.source ?? "—"}</td>
                    <td className="px-5 py-3 text-secondary">{new Date(e.joinedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {e.notified
                        ? <span className="text-primary text-xs font-medium">✓ Yes</span>
                        : <span className="text-secondary text-xs">No</span>}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-secondary">No entries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email blast composer */}
        <div className="bg-card-bg border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Send Early Access Email</h2>

          <div>
            <label className="block text-xs text-secondary mb-1.5 uppercase tracking-wide">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="TiltForge Early Access is Open"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1.5 uppercase tracking-wide">Body (plain text / newlines → paragraphs)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder={`Hey,\n\nWe're thrilled to open TiltForge early access to our first wave of testers...\n\nHead here to claim your spot: https://tiltforge.com/early-access\n\nThanks for believing in this early.\n— The TiltForge Team`}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary/60 resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUnnotified}
                onChange={(e) => setOnlyUnnotified(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-secondary">Only send to un-notified ({unnotifiedCount})</span>
            </label>
          </div>

          {/* Test send */}
          <div className="flex gap-3 items-center">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test to: your@email.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
            />
            <button
              onClick={() => sendBlast(true)}
              disabled={sending || !testEmail || !subject || !body}
              className="px-4 py-2.5 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition disabled:opacity-40"
            >
              Send Test
            </button>
          </div>

          {sendResult && (
            <p className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">{sendResult}</p>
          )}

          <button
            onClick={() => sendBlast(false)}
            disabled={sending || !subject || !body}
            className="w-full py-3 rounded-lg bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
          >
            {sending ? "Sending…" : `Blast to ${onlyUnnotified ? unnotifiedCount : entries.length} recipients`}
          </button>
        </div>

      </div>
    </div>
  )
}