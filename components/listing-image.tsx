"use client"

import { useState } from "react"

type ListingImageProps = {
  src?: string
  alt: string
  className?: string
  fallbackLabel?: string
}

/** Seller image URLs are external and may fail independently of catalog data. */
export function ListingImage({ src, alt, className = "", fallbackLabel = "PawnPawn" }: ListingImageProps) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return <div role="img" aria-label={alt} className={`image-fallback grid place-items-center font-display text-xl text-theme-muted ${className}`}>{fallbackLabel}</div>
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}
