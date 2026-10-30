"use client"

import { useState } from "react"
import { ListingImage } from "@/components/listing-image"

type ProductGalleryProps = {
  images: string[]
  title: string
}

/** Keeps image selection local; Product and Listing state stays on the backend. */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  return <div className="grid gap-3 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
    <div aria-label="Product images" className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
      {images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show image ${index + 1} of ${images.length}`} aria-current={index === activeIndex} className={`aspect-square w-16 shrink-0 overflow-hidden rounded-lg border bg-theme-surface transition sm:w-auto ${index === activeIndex ? "border-theme-accent" : "border-theme-border hover:border-theme-primary"}`}>
        <img src={image} alt="" className="size-full object-cover" onError={(event) => { event.currentTarget.style.opacity = "0" }} />
      </button>)}
    </div>
    <div className="aspect-[4/5] overflow-hidden rounded-xl border border-theme-border bg-theme-surface sm:min-h-[36rem]">
      <ListingImage src={activeImage} alt={title} className="size-full object-cover" />
    </div>
  </div>
}
