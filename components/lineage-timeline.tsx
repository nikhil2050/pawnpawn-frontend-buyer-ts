import type { LineageEntry } from "@/lib/types"

export function LineageTimeline({ lineage }: { lineage: LineageEntry[] }) {
  if (!lineage.length) return <div className="border-l-2 border-theme-accent p-5 text-sm leading-6 text-theme-muted">This is the first public chapter of this piece. Its PawnPawn authentication record starts with this drop.</div>
  return <ol className="border-l border-theme-border">
    {lineage.map((entry, index) => <li key={entry.id} className="relative pb-10 pl-8 last:pb-0">
      <span aria-hidden className="absolute -left-1.5 top-1 size-3 rounded-full bg-theme-accent" />
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-theme-accent">{index === 0 ? "Original provenance" : "Verified transfer"}</p>
      <h3 className="font-display text-2xl tracking-[-0.04em]">{entry.seller?.store_name ?? entry.seller?.handle ?? "Verified owner"}</h3>
      <p className="mt-2 text-xs text-theme-muted">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(entry.transacted_at))}{entry.price != null ? ` · ${String(entry.price)}` : ""}</p>
    </li>)}
  </ol>
}
