import { NextRequest, NextResponse } from "next/server"
import { addToWaitlist, readWaitlist } from "@/lib/waitlist"

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY ?? "change-me-in-env"

// POST /api/waitlist  — public: register an email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? "").trim().toLowerCase()
    const source = body.source ?? "unknown"

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    const result = addToWaitlist(email, source)

    if (result.duplicate) {
      return NextResponse.json({ message: "You're already on the list!" }, { status: 200 })
    }

    return NextResponse.json({ message: "You're on the list! We'll reach out when early access opens." }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 })
  }
}

// GET /api/waitlist?key=<ADMIN_SECRET_KEY>  — admin: read full list
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  const entries = readWaitlist()
  return NextResponse.json({ count: entries.length, entries })
}
