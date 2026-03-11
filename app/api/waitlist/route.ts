import { NextRequest, NextResponse } from "next/server"
import { addToWaitlist, readWaitlist, removeFromWaitlist } from "@/lib/waitlist"

// Use explicit admin key in production, and a sensible default in local dev
const ADMIN_KEY =
  process.env.ADMIN_SECRET_KEY ||
  (process.env.NODE_ENV !== "production" ? "tiltforge-admin-2026" : "change-me-in-env")
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ""
const FROM_EMAIL = process.env.FROM_EMAIL ?? "TiltForge <hello@tiltforge.com>"

const LOGO_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiltForge%20logo%20dark-2Re7fY8aYvO7z3WUd7jbJWeu8NxIao.png"

// POST /api/waitlist  — public: register an email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? "").trim().toLowerCase()
    const source = body.source ?? "unknown"

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    const result = await addToWaitlist(email, source)

    // Fire confirmation email — non-blocking (even if already on the list)
    sendConfirmationEmail(email).catch((err) =>
      console.error("Confirmation email failed:", err)
    )

    const message = result.duplicate
      ? "You're already on the list! We just re-sent your confirmation email."
      : "You're on the list! Check your inbox for a confirmation."

    return NextResponse.json({ message }, { status: 200 })
  } catch (err) {
    console.error("Waitlist POST error:", err)
    return NextResponse.json({ error: "Server error." }, { status: 500 })
  }
}

// GET /api/waitlist?key=<ADMIN_SECRET_KEY>  — admin: read full list
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  const entries = await readWaitlist()
  return NextResponse.json({ count: entries.length, entries })
}

// DELETE /api/waitlist  — admin: remove an email (manual unsubscribe)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const key = body.key as string | undefined
    const email = (body.email as string | undefined)?.trim().toLowerCase()

    if (key !== ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    await removeFromWaitlist(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Waitlist DELETE error:", err)
    return NextResponse.json({ error: "Server error." }, { status: 500 })
  }
}

async function sendConfirmationEmail(to: string) {
  if (!RESEND_API_KEY) return

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: "You're on the TiltForge early access list",
      html: confirmationHTML(),
      text: `You're in!\n
Thanks for joining the TiltForge early access list. We're building a smarter, repairable smart blind motor — and you'll be among the first to get your hands on one.\n
We'll reach out personally when early access opens.\n
In the meantime, you can see more about TiltForge here:
https://tiltforge.com/early-access\n
If you'd like to unsubscribe from the early access list, just reply to this email with "unsubscribe" or email hello@tiltforge.com.\n
— The TiltForge Team`,
    }),
  })
}

function confirmationHTML(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:36px 40px;text-align:center">
            <img src="${LOGO_URL}" alt="TiltForge" width="240" style="display:block;margin:0 auto;max-width:240px;height:auto" />
          </td>
        </tr>
        <tr>
          <td style="background:linear-gradient(135deg,#0098ff18 0%,#0a0a0a 100%);padding:48px 40px 36px;text-align:center;border-bottom:1px solid #1a1a1a">
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#0098ff">Early Access</p>
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#f5f5f5;line-height:1.3">You're on the list.</h1>
            <p style="margin:0;font-size:16px;color:#888;line-height:1.6">
              We'll reach out personally when early access opens.<br/>You'll be among the first to get your hands on one.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 20px;font-size:15px;color:#aaa;line-height:1.7">
              TiltForge is a magnetically-coupled tilt rod drive that automates your existing blinds
              without replacing them — designed to be repaired, modified, and understood.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
              <tr><td style="border-top:1px solid #1e1e1e"></td></tr>
            </table>
            <p style="margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#555">What happens next</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;font-size:18px">🔔</td>
                <td style="padding:8px 0;font-size:14px;color:#999;line-height:1.5">Personal invite when early access opens</td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;font-size:18px">💰</td>
                <td style="padding:8px 0;font-size:14px;color:#999;line-height:1.5">Early access pricing before public launch</td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;font-size:18px">🛠️</td>
                <td style="padding:8px 0;font-size:14px;color:#999;line-height:1.5">Direct line to share feedback and shape the product</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 40px;text-align:center">
            <a href="https://tiltforge.com/early-access" style="display:inline-block;padding:14px 36px;background:#0098ff;color:#000;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.02em">
              See How It Works →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #161616;font-size:12px;color:#444;text-align:center;line-height:1.6">
            You're receiving this because you joined the TiltForge early access list.<br/>
            TiltForge © 2026 — Built to be repaired, not replaced.<br/>
            <span style="font-size:11px;color:#555;">
              To unsubscribe, reply to this email with "unsubscribe" or email
              <a href="mailto:hello@tiltforge.com?subject=Unsubscribe%20from%20TiltForge%20early%20access" style="color:#888;text-decoration:underline;"> hello@tiltforge.com</a>.
            </span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}