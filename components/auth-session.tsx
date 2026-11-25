"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type BuyerSessionRole = "BUYER" | "CELEBRITY_SELLER"

type BuyerSession = {
  token: string
  role: BuyerSessionRole | null
  startSession: (token: string, role: BuyerSessionRole) => void
  clearSession: () => void
}

const BuyerSessionContext = createContext<BuyerSession | null>(null)

/**
 * Holds an authenticated Customer token only for the current browser session.
 * It deliberately avoids browser storage and URL parameters. See
 * documentation/AI_CONTEXT.md#unified-password-login.
 */
export function BuyerSessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("")
  const [role, setRole] = useState<BuyerSessionRole | null>(null)
  const value = useMemo<BuyerSession>(() => ({
    token,
    role,
    startSession: (nextToken, nextRole) => {
      setToken(nextToken)
      setRole(nextRole)
    },
    clearSession: () => {
      setToken("")
      setRole(null)
    },
  }), [role, token])

  return <BuyerSessionContext.Provider value={value}>{children}</BuyerSessionContext.Provider>
}

export function useBuyerSession() {
  const session = useContext(BuyerSessionContext)
  if (!session) throw new Error("useBuyerSession must be used inside BuyerSessionProvider")
  return session
}
