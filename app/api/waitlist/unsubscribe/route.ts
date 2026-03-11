import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { removeFromWaitlist } from "@/lib/waitlist"
import { verifyUnsubToken } from "@/lib/waitlist-unsubscribe"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  const email = verifyUnsubToken(token)

  if (!email) {
    return new Response(
      `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>TiltForge — Unsubscribe</title></head>
<body style="margin:0;padding:40px;background:#050608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5;">
  <div style="max-width:560px;margin:40px auto;padding:32px 28px;border-radius:16px;background:#111214;border:1px solid #27282c;">
    <h1 style="margin:0 0 16px;font-size:22px;">Link not valid</h1>
    <p style="margin:0 0 12px;font-size:14px;color:#c4c4c4;line-height:1.6;">
      This unsubscribe link is invalid or has already been used.
    </p>
    <p style="margin:0;font-size:14px;color:#8a8a8a;line-height:1.6;">
      If you still want to be removed from the TiltForge early access list, please email
      <a href="mailto:hello@tiltforge.com" style="color:#4db5ff;text-decoration:none;">hello@tiltforge.com</a>.
    </p>
  </div>
</body>
</html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  await removeFromWaitlist(email)

  return new Response(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>TiltForge — Unsubscribed</title></head>
<body style="margin:0;padding:40px;background:#050608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5;">
  <div style="max-width:560px;margin:40px auto;padding:32px 28px;border-radius:16px;background:#111214;border:1px solid #27282c;text-align:left;">
    <h1 style="margin:0 0 16px;font-size:22px;">You’re unsubscribed.</h1>
    <p style="margin:0 0 12px;font-size:14px;color:#c4c4c4;line-height:1.6;">
      <strong>${email}</strong> has been removed from the TiltForge early access waitlist.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#8a8a8a;line-height:1.6;">
      If this was a mistake, you can re-join any time from the site.
    </p>
    <p style="margin:0;font-size:14px;">
      <a href="https://tiltforge.com" style="display:inline-block;padding:10px 20px;border-radius:8px;background:#4db5ff;color:#050608;font-weight:600;font-size:13px;text-decoration:none;">
        Back to tiltforge.com
      </a>
    </p>
  </div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  )
}

