import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json")

export interface WaitlistEntry {
  email: string
  joinedAt: string
  source?: string // e.g. "hero", "final-cta", "product-tiers"
  notified?: boolean
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, "[]", "utf-8")
}

export function readWaitlist(): WaitlistEntry[] {
  ensureFile()
  const raw = fs.readFileSync(WAITLIST_FILE, "utf-8")
  return JSON.parse(raw) as WaitlistEntry[]
}

export function writeWaitlist(entries: WaitlistEntry[]) {
  ensureFile()
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf-8")
}

export function addToWaitlist(email: string, source?: string): { ok: boolean; duplicate: boolean } {
  const entries = readWaitlist()
  const normalized = email.trim().toLowerCase()
  if (entries.find((e) => e.email === normalized)) {
    return { ok: false, duplicate: true }
  }
  entries.push({ email: normalized, joinedAt: new Date().toISOString(), source, notified: false })
  writeWaitlist(entries)
  return { ok: true, duplicate: false }
}

export function markNotified(emails: string[]) {
  const entries = readWaitlist()
  const set = new Set(emails.map((e) => e.toLowerCase()))
  entries.forEach((e) => { if (set.has(e.email)) e.notified = true })
  writeWaitlist(entries)
}
