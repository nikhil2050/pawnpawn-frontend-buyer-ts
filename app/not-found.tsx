import Link from "next/link"

export default function NotFound() { return <section className="grid min-h-[65vh] place-content-center gap-6 px-6 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Not found</p><h1 className="font-display text-[clamp(3rem,7vw,6rem)] tracking-editorial">That story has moved on.</h1><Link className="justify-self-center bg-theme-accent px-5 py-3 text-xs font-semibold text-theme-base" href="/">Return to the drops</Link></section> }
