import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-sva-gold">404</p>
      <h1 className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl">Seite nicht gefunden</h1>
      <p className="mt-4 max-w-md text-sva-gray-300">Die angeforderte Seite existiert leider nicht.</p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="rounded-md bg-sva-green px-6 py-2.5 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">Zur Startseite</Link>
        <Link href="/kontakt" className="rounded-md border border-sva-gray-600 px-6 py-2.5 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal-light">Kontakt</Link>
      </div>
    </div>
  );
}
