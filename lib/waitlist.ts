import { Redis } from "@upstash/redis"

const redis = new Redis({
  // Prefer explicit Upstash Redis env vars (used locally),
  // but fall back to Vercel KV env names in production.
  url:
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_URL ||
    "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN ||
    "",
})

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

export async function removeFromWaitlist(email: string) {
  const entries = await readWaitlist()
  const normalized = email.trim().toLowerCase()

  const remaining = entries.filter((e) => e.email !== normalized)

  const pipeline = redis.pipeline()
  pipeline.del(WAITLIST_KEY)
  for (const entry of remaining) {
    pipeline.rpush(WAITLIST_KEY, entry)
  }
  await pipeline.exec()
}