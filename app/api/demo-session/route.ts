import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  // Development-only investor helper. See documentation/AI_CONTEXT.md#checkout.
  // It prevents local demo credentials from becoming browser-visible bundle data.
  if (process.env.NODE_ENV === "production") return NextResponse.json({ message: "Demo sessions are disabled." }, { status: 404 })

  const backendUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, "")
  const email = process.env.DEMO_BUYER_EMAIL ?? "sarah.johnson@gmail.com"
  const password = process.env.DEMO_BUYER_PASSWORD ?? "buyer1234"
  const response = await fetch(`${backendUrl}/auth/customer/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.token) return NextResponse.json({ message: payload.message ?? "Demo login could not start." }, { status: response.status || 502 })
  return NextResponse.json({ token: payload.token })
}
