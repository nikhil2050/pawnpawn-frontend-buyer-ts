"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCart } from "@/components/cart-provider"
import { RegionSelector } from "@/components/region-selector"

export function Header() {
  const { items } = useCart()
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

  return <header className="glass-header sticky top-0 z-50 border-b border-theme-border backdrop-blur-xl"><div className="page-container flex h-20 items-center justify-between">
    <Link href="/" className="font-display text-3xl tracking-[-0.07em]" aria-label="PawnPawn home">pawn<span className="text-theme-accent">pawn</span></Link>
    <nav aria-label="Primary" className="flex items-center gap-5 text-xs text-theme-muted md:gap-7">
      <Link className="hidden transition-colors hover:text-theme-primary sm:block" href="/#drops">Drops</Link>
      <Link className="hidden transition-colors hover:text-theme-primary sm:block" href="/#how-it-works">How it works</Link>
      <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid size-9 place-items-center rounded-full border border-theme-border text-theme-primary transition-transform hover:scale-105">
        {isLight ? "◐" : "◑"}
      </button>
      <RegionSelector />
      <Link href="/checkout" className="flex items-center gap-2 text-theme-primary">Cart <span aria-label={`${items.length} items`} className="grid size-5 place-items-center rounded-full bg-theme-accent text-[10px] font-bold text-theme-base">{items.length}</span></Link>
    </nav>
  </div></header>
}
