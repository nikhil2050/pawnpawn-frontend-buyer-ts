"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCart } from "@/components/cart-provider"
import { useBuyerSession } from "@/components/auth-session"
import { RegionSelector } from "@/components/region-selector"

const GUARANTEES = [
  "One of one · never restocked",
  "Proceeds can support the seller's chosen charity",
  "Every piece authenticated by HQ",
  "Sellers verified in person",
  "Insured, tracked delivery",
]

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3 5-6M14 4s2 1 4 4 2 5 0 7-2 4-4 4c-4 0-5-3-5-3z" />
    </svg>
  )
}

export function Header() {
  const { items, clear } = useCart()
  const { token, clearSession } = useBuyerSession()
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    // Apply the saved presentation preference after hydration so the server
    // markup remains deterministic and React avoids a synchronous effect update.
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("pawnpawn-theme") === "light"
      setIsLight(saved)
      document.documentElement.dataset.theme = saved ? "light" : "dark"
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function toggleTheme() {
    const next = !isLight
    setIsLight(next)
    document.documentElement.dataset.theme = next ? "light" : "dark"
    window.localStorage.setItem("pawnpawn-theme", next ? "light" : "dark")
  }

  function handleSignOut() {
    clearSession()
    clear()
    window.location.href = "/"
  }

  return <>
    <div
      data-slot="hq-ticker"
      className="overflow-hidden bg-theme-accent py-2 text-xs tracking-wide text-theme-base"
    >
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-20" aria-hidden={copy === 1}>
            {GUARANTEES.map((text) => (
              <span key={`${copy}-${text}`} className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-theme-accent" />
                {text}
              </span>
            ))}
            {GUARANTEES.map((text) => (
              <span key={`${copy}-b-${text}`} className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-theme-accent" />
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
    <header className="glass-header sticky top-0 z-50 border-b border-theme-border backdrop-blur-xl"><div className="page-container flex h-20 items-center justify-between">
    <Link href="/" className="font-display text-3xl tracking-[-0.07em]" aria-label="PawnPawn home">pawn<span className="text-theme-accent">pawn</span></Link>
    <nav aria-label="Primary" className="flex items-center gap-5 text-xs text-theme-muted md:gap-7">
      <Link className="hidden text-theme-accent hover:text-theme-primary transition-colors sm:block" href="/#drops">Drops</Link>
      <Link className="hidden text-theme-accent hover:text-theme-primary transition-colors sm:block" href="/#sell-with-us">Sell with us</Link>
      <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid size-9 place-items-center rounded-full border border-theme-border text-theme-primary transition-transform hover:scale-105">
        {isLight ? "◐" : "◑"}
      </button>
      <RegionSelector />
      {token ? (
        <button type="button" onClick={handleSignOut} className="primary-action">Sign out</button>
      ) : (
        <Link href="/login" className="primary-action">Sign in</Link>
      )}
      {token && (
        <Link href="/checkout" className="flex items-center gap-2 text-theme-primary">Cart <span aria-label={`${items.length} items`} className="grid size-5 place-items-center rounded-full bg-theme-accent text-[10px] font-bold text-theme-base">{items.length}</span></Link>
      )}
    </nav>
  </div></header>
  </>
}
