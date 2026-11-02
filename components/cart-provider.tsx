"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { CartItem } from "@/lib/types"
import { useRegion } from "@/components/region-provider"

type CartContextValue = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { region } = useRegion()
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const storageKey = `pawnpawn-buyer-cart:${region.id}`

  useEffect(() => {
    // Read browser storage after hydration so the server and first client
    // render agree; defer the state update outside the effect body.
    const timer = window.setTimeout(() => {
      setHydrated(false)
      setItems([])
      const saved = window.localStorage.getItem(storageKey)
      if (saved) {
        try { setItems(JSON.parse(saved) as CartItem[]) } catch { window.localStorage.removeItem(storageKey) }
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [storageKey])
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(items))
  }, [hydrated, items, storageKey])

  const value = useMemo(() => ({
    items,
    add: (item: CartItem) => setItems((current) => current.some((entry) => entry.variant.id === item.variant.id) ? current : [...current, item]),
    remove: (variantId: string) => setItems((current) => current.filter((entry) => entry.variant.id !== variantId)),
    clear: () => setItems([]),
  }), [items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}
