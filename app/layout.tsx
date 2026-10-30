import type { Metadata } from "next"
import { CartProvider } from "@/components/cart-provider"
import { Header } from "@/components/header"
import "./globals.css"

export const metadata: Metadata = {
  title: "PawnPawn — stories worth keeping",
  description: "Verified celebrity drops with transparent provenance.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><CartProvider><Header /><main className="min-h-[calc(100vh-132px)]">{children}</main><footer className="border-t border-theme-border py-7 text-xs text-theme-muted"><div className="page-container">PawnPawn · verified stories, passed forward.</div></footer></CartProvider></body></html>
}
