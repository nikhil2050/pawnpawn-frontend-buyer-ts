import type { Metadata } from "next"
import { BuyerSessionProvider } from "@/components/auth-session"
import { CartProvider } from "@/components/cart-provider"
import { Header } from "@/components/header"
import { RegionProvider } from "@/components/region-provider"
import { regionFromCountry, regionIdFor } from "@/lib/regions"
import { cookies, headers } from "next/headers"
import "./globals.css"

export const metadata: Metadata = {
  title: "PawnPawn — stories worth keeping",
  description: "Verified celebrity drops with transparent provenance.",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const requestHeaders = await headers()
  const explicitRegion = cookieStore.get("pawn_region_id")?.value
  const initialRegionId = explicitRegion ? regionIdFor(explicitRegion) : regionFromCountry(requestHeaders.get("cf-ipcountry"))
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><BuyerSessionProvider><RegionProvider initialRegionId={initialRegionId}><CartProvider><Header /><main className="min-h-[calc(100vh-132px)]">{children}</main><footer className="border-t border-theme-border py-7 text-xs text-theme-muted"><div className="page-container">PawnPawn · verified stories, passed forward.</div></footer></CartProvider></RegionProvider></BuyerSessionProvider></body></html>
}
