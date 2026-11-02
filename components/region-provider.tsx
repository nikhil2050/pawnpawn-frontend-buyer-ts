"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { BuyerRegion, BuyerRegionId, isBuyerRegionId, regionFor, regionIdFor } from "@/lib/regions"

type RegionContextValue = {
  region: BuyerRegion
  setRegionId: (id: BuyerRegionId) => void
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined)
const cookieName = "pawn_region_id"
const storageName = "pawn_region_id"

/**
 * Keeps the selected territory in a session value and cookie. The cookie lets
 * Server Components fetch the correct catalog; the session value restores an
 * explicit buyer choice when a stale browser has no cookie. See AI_CONTEXT.md §5.5.
 */
export function RegionProvider({ initialRegionId, children }: { initialRegionId: BuyerRegionId; children: React.ReactNode }) {
  const [regionId, setRegionIdState] = useState<BuyerRegionId>(initialRegionId)

  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageName)
    const hasCookie = document.cookie.split(";").some((part) => part.trim().startsWith(`${cookieName}=`))
    const savedRegionId = saved && (isBuyerRegionId(saved) || saved === "reg_eu" || saved === "reg_in") ? regionIdFor(saved) : undefined
    if (!hasCookie && savedRegionId && savedRegionId !== initialRegionId) {
      document.cookie = `${cookieName}=${savedRegionId}; path=/; max-age=2592000; samesite=lax`
      window.location.reload()
      return
    }
    window.sessionStorage.setItem(storageName, initialRegionId)
  }, [initialRegionId])

  const value = useMemo(() => ({
    region: regionFor(regionId),
    setRegionId: (id: BuyerRegionId) => {
      window.sessionStorage.setItem(storageName, id)
      document.cookie = `${cookieName}=${id}; path=/; max-age=2592000; samesite=lax`
      setRegionIdState(id)
      // Server Components must refetch using the explicit region cookie.
      window.location.reload()
    },
  }), [regionId])
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}

export function useRegion() {
  const context = useContext(RegionContext)
  if (!context) throw new Error("useRegion must be used inside RegionProvider")
  return context
}
