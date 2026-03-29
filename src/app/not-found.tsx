import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-sva-blue">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Seite nicht gefunden
      </h1>
      <p className="mt-4 max-w-md text-sva-gray-600">
        Die angeforderte Seite existiert leider nicht. Möglicherweise wurde sie
        verschoben oder entfernt.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-sva-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sva-blue-light"
        >
          Zur Startseite
        </Link>
        <Link
          href="/kontakt"
          className="rounded-lg border border-sva-gray-200 px-6 py-2.5 text-sm font-medium text-sva-gray-700 transition-colors hover:bg-sva-gray-50"
        >
          Kontakt
        </Link>
      </div>
    </div>
  );
}
