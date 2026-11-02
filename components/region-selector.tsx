"use client"

import { useRegion } from "@/components/region-provider"
import { BUYER_REGIONS, BuyerRegionId, EU_REGION_ID, INDIA_REGION_ID } from "@/lib/regions"

export function RegionSelector() {
  const { region, setRegionId } = useRegion()
  return <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-theme-muted">Region<select aria-label="Shopping region" value={region.id} onChange={(event) => setRegionId(event.target.value as BuyerRegionId)} className="ml-1 rounded-full border border-theme-border bg-theme-surface px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-theme-primary outline-none focus:border-theme-accent"><option value={EU_REGION_ID}>{BUYER_REGIONS[EU_REGION_ID].label}</option><option value={INDIA_REGION_ID}>{BUYER_REGIONS[INDIA_REGION_ID].label}</option></select></label>
}
