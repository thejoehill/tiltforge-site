import { NextRequest, NextResponse } from "next/server"
import { readWaitlist, markNotified } from "@/lib/waitlist"

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY ?? "change-me-in-env"
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ""
const FROM_EMAIL = process.env.FROM_EMAIL ?? "TiltForge <hello@tiltforge.com>"

// POST /api/waitlist/send
// Body: { key, subject, body, onlyUnnotified?: boolean, testEmail?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.key !== ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { subject, body: emailBody, onlyUnnotified = true, testEmail } = body

    if (!subject || !emailBody) {
      return NextResponse.json({ error: "subject and body are required." }, { status: 400 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured." }, { status: 500 })
    }

    // If testEmail is provided, only send to that address
    let recipients: string[]
    if (testEmail) {
      recipients = [testEmail]
    } else {
      const entries = readWaitlist()
      recipients = onlyUnnotified
        ? entries.filter((e) => !e.notified).map((e) => e.email)
        : entries.map((e) => e.email)
    }

    if (recipients.length === 0) {
      return NextResponse.json({ message: "No recipients to send to.", sent: 0 })
    }

    // Send in batches of 50 via Resend batch API
    const BATCH_SIZE = 50
    let sent = 0
    const failed: string[] = []

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      const messages = batch.map((to) => ({
        from: FROM_EMAIL,
        to,
        subject,
        html: buildEmailHTML(emailBody),
        text: emailBody,
      }))

      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      })

      if (res.ok) {
        sent += batch.length
      } else {
        const err = await res.text()
        console.error("Resend batch error:", err)
        failed.push(...batch)
      }
    }

    // Mark successfully sent (non-test) emails as notified
    if (!testEmail && sent > 0) {
      const sentEmails = recipients.filter((e) => !failed.includes(e))
      markNotified(sentEmails)
    }

    return NextResponse.json({
      message: `Sent to ${sent} recipients.`,
      sent,
      failed: failed.length,
      failedEmails: failed,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error." }, { status: 500 })
  }
}

function buildEmailHTML(text: string): string {
  // Converts plain newlines to HTML paragraphs, wraps in a clean branded template
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#0098ff14;border-bottom:1px solid #0098ff33;padding:32px 40px;text-align:center">
            <span style="font-size:22px;font-weight:700;color:#0098ff;letter-spacing:0.04em">TiltForge</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;font-size:15px;color:#d4d4d4">
            ${paragraphs}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #222;font-size:12px;color:#555;text-align:center">
            You're receiving this because you joined the TiltForge early access list.<br/>
            TiltForge © 2026 — Built to be repaired, not replaced.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
