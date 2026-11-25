"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { useBuyerSession } from "@/components/auth-session"
import { backendUrl } from "@/lib/medusa"

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"
const sellerStudioUrl = (process.env.NEXT_PUBLIC_SELLER_STUDIO_URL ?? "http://localhost:3001").replace(/\/$/, "")

type AuthPayload = { token?: string; message?: string }

/**
 * Uses Medusa Customer email/password auth, then derives the marketplace role
 * from the Seller profile rather than asking a buyer to select a role. See
 * documentation/AI_CONTEXT.md#unified-password-login.
 */
export function LoginForm() {
  const router = useRouter()
  const { startSession } = useBuyerSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const authResponse = await fetch(`${backendUrl}/auth/customer/emailpass`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-publishable-api-key": publishableKey },
        body: JSON.stringify({ email, password }),
      })
      const auth = await authResponse.json().catch(() => ({})) as AuthPayload
      if (!authResponse.ok || !auth.token) throw new Error(auth.message ?? "Email or password is incorrect.")

      const sellerResponse = await fetch(`${backendUrl}/store/seller/me`, {
        headers: { "x-publishable-api-key": publishableKey, authorization: `Bearer ${auth.token}` },
      })
      if (sellerResponse.ok) {
        startSession(auth.token, "CELEBRITY_SELLER")
        // The Seller app owns a separate in-memory session. Never transfer a
        // bearer token through a query string. See AI_CONTEXT.md#unified-password-login.
        window.location.assign(new URL("/studio", sellerStudioUrl).toString())
        return
      }
      if (sellerResponse.status !== 403 && sellerResponse.status !== 404) {
        const seller = await sellerResponse.json().catch(() => ({})) as AuthPayload
        throw new Error(seller.message ?? "We could not determine this account's marketplace access.")
      }
      startSession(auth.token, "BUYER")
      router.replace("/")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in could not be completed.")
    } finally {
      setLoading(false)
    }
  }

  return <form className="elevated-panel mx-auto w-full max-w-md p-7 sm:p-9" onSubmit={submit}>
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">PawnPawn account</p>
    <h1 className="mt-3 font-display text-5xl tracking-[-0.05em]">Welcome back.</h1>
    <p className="mt-4 text-sm leading-6 text-theme-muted">Sign in once. PawnPawn recognizes whether you collect culture or manage a verified celebrity store.</p>
    <div className="mt-8 grid gap-5">
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="theme-input rounded-lg border border-theme-border bg-theme-base px-3 py-3 text-sm normal-case tracking-normal text-theme-primary outline-none focus:border-theme-accent" placeholder="you@example.com" /></label>
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="theme-input rounded-lg border border-theme-border bg-theme-base px-3 py-3 text-sm normal-case tracking-normal text-theme-primary outline-none focus:border-theme-accent" placeholder="Your password" /></label>
    </div>
    {error && <p role="alert" className="mt-5 text-sm text-theme-editorial">{error}</p>}
    <button className="primary-action mt-7 w-full" disabled={loading}>{loading ? "Opening your account…" : "Sign in"}</button>
  </form>
}
