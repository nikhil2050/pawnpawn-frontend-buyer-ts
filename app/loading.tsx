export default function Loading() {
  return <main className="page-container animate-pulse py-24"><div className="h-4 w-40 bg-theme-surface" /><div className="mt-6 h-28 max-w-3xl bg-theme-surface" /><div className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index}><div className="aspect-[4/5] bg-theme-surface" /><div className="mt-4 h-4 w-2/3 bg-theme-surface" /><div className="mt-3 h-3 w-1/3 bg-theme-surface" /></div>)}</div></main>
}
