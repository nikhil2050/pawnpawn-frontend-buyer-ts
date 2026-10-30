import { LineageTimeline } from "@/components/lineage-timeline"
import type { LineageEntry, Product } from "@/lib/types"

type ProductAccordionsProps = {
  product: Product
  lineage: LineageEntry[]
  condition: string
}

const disclosureClass = "group border-t border-theme-border py-4 last:border-b"
const summaryClass = "flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:content-none"

/** Native disclosures keep the below-the-fold item dossier accessible without client state. */
export function ProductAccordions({ product, lineage, condition }: ProductAccordionsProps) {
  return <div className="mt-7">
    <details className={disclosureClass} open>
      <summary className={summaryClass}>Specifications &amp; material notes <span className="text-theme-accent transition-transform group-open:rotate-45">+</span></summary>
      <div className="pt-4 text-sm leading-6 text-theme-muted">
        <p>{product.description ?? "A verified cultural piece with a story worth carrying forward."}</p>
        {product.options?.length ? <dl className="mt-4">{product.options.map((option) => <div key={option.title} className="flex justify-between gap-5 border-t border-theme-border py-3 first:border-t-0"><dt>{option.title}</dt><dd className="m-0 text-right text-theme-primary">{option.values.map((value) => value.value).join(", ")}</dd></div>)}</dl> : null}
      </div>
    </details>
    <details className={disclosureClass}>
      <summary className={summaryClass}>Condition & authentication <span className="text-theme-accent transition-transform group-open:rotate-45">+</span></summary>
      <p className="pt-4 text-sm leading-6 text-theme-muted"><span className="font-medium text-theme-primary">{condition}.</span> PawnPawn HQ receives this one-of-one item, performs its authentication review, and prepares its certificate before insured dispatch.</p>
    </details>
    <details className={disclosureClass}>
      <summary className={summaryClass}>Ownership chain <span className="text-theme-accent transition-transform group-open:rotate-45">+</span></summary>
      <div className="pt-5"><LineageTimeline lineage={lineage} /></div>
    </details>
  </div>
}
