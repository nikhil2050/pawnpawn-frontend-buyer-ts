export default function SellerLoading() {
  return <main className="animate-pulse px-6 py-20 md:px-[5vw]"><div className="flex items-center gap-7"><div className="size-28 rounded-full bg-theme-surface" /><div className="space-y-4"><div className="h-4 w-28 bg-theme-surface" /><div className="h-14 w-72 bg-theme-surface" /><div className="h-4 w-96 max-w-full bg-theme-surface" /></div></div><div className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="aspect-[4/5] bg-theme-surface" />)}</div></main>
}
