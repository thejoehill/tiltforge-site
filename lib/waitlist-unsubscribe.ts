import crypto from "crypto"

const SECRET = process.env.WAITLIST_UNSUBSCRIBE_SECRET ?? "change-me-in-env"

export function makeUnsubToken(email: string): string {
  const normalized = email.trim().toLowerCase()
  const hmac = crypto.createHmac("sha256", SECRET)
  hmac.update(normalized)
  const sig = hmac.digest("base64url")
  const payload = `${normalized}:${sig}`
  return Buffer.from(payload, "utf8").toString("base64url")
}

export function verifyUnsubToken(token: string | null): string | null {
  if (!token) return null
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8")
    const [email, sig] = decoded.split(":")
    if (!email || !sig) return null

    const hmac = crypto.createHmac("sha256", SECRET)
    hmac.update(email)
    const expected = hmac.digest("base64url")

    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

    return email
  } catch {
    return null
  }
}

