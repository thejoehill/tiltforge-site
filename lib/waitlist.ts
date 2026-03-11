import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

const WAITLIST_KEY = "tiltforge:waitlist"

export interface WaitlistEntry {
  email: string
  joinedAt: string
  source?: string
  notified?: boolean
}

export async function readWaitlist(): Promise<WaitlistEntry[]> {
  const entries = await redis.lrange<WaitlistEntry>(WAITLIST_KEY, 0, -1)
  return entries ?? []
}

export async function addToWaitlist(
  email: string,
  source?: string
): Promise<{ ok: boolean; duplicate: boolean }> {
  const entries = await readWaitlist()
  const normalized = email.trim().toLowerCase()

  if (entries.find((e) => e.email === normalized)) {
    return { ok: false, duplicate: true }
  }

  const entry: WaitlistEntry = {
    email: normalized,
    joinedAt: new Date().toISOString(),
    source,
    notified: false,
  }

  await redis.rpush(WAITLIST_KEY, entry)
  return { ok: true, duplicate: false }
}

export async function markNotified(emails: string[]) {
  const entries = await readWaitlist()
  const set = new Set(emails.map((e) => e.toLowerCase()))

  const updated = entries.map((e) =>
    set.has(e.email) ? { ...e, notified: true } : e
  )

  // Replace the whole list atomically
  const pipeline = redis.pipeline()
  pipeline.del(WAITLIST_KEY)
  for (const entry of updated) {
    pipeline.rpush(WAITLIST_KEY, entry)
  }
  await pipeline.exec()
}