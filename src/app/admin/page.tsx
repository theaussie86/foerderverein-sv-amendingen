import type { Metadata } from "next";
import Link from "next/link";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { antraegeSuchen, datumZeit, istStatus, STATUS, STATUS_LABEL, type Status } from "@/lib/antraege";
import { cn } from "@/lib/utils";
import { abmelden } from "./actions";
import { StatusBadge } from "./status-badge";

export const metadata: Metadata = {
  title: "Interner Bereich",
  robots: { index: false, follow: false },
};

type Suchparameter = { q?: string; status?: string; seite?: string };

function listenLink({ q, status, seite }: { q: string; status?: Status; seite?: number }): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (status) p.set("status", status);
  if (seite && seite > 1) p.set("seite", String(seite));
  const s = p.toString();
  return s ? `/admin?${s}` : "/admin";
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Suchparameter> }) {
  const { pb, vorstand } = await vorstandErforderlich();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status = istStatus(params.status) ? params.status : undefined;
  const seite = Math.max(1, Number.parseInt(params.seite ?? "1", 10) || 1);

  let liste: Awaited<ReturnType<typeof antraegeSuchen>> | null = null;
  try {
    liste = await antraegeSuchen(pb, { suche: q, status, seite });
  } catch (e) {
    console.error("Antragsliste konnte nicht geladen werden", e instanceof Error ? e.message : e);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Mitgliedsanträge</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">Angemeldet als {vorstand.name || vorstand.email}.</p>
        </div>
        <form action={abmelden}>
          <button type="submit" className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal-light">
            Abmelden
          </button>
        </form>
      </div>

      <form action="/admin" role="search" className="mt-10 flex flex-col gap-3 sm:flex-row">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="q" className="sr-only">Anträge durchsuchen</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Name, E-Mail, Ort, IBAN oder Mandatsreferenz"
          className="w-full rounded-md border border-sva-gray-600 bg-sva-charcoal-light px-4 py-2.5 text-white placeholder:text-sva-gray-400 focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold"
        />
        <button type="submit" className="rounded-md bg-sva-gold px-6 py-2.5 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light">
          Suchen
        </button>
      </form>

      <nav aria-label="Nach Status filtern" className="mt-4 flex flex-wrap gap-2">
        {[undefined, ...STATUS].map((s) => (
          <Link
            key={s ?? "alle"}
            href={listenLink({ q, status: s })}
            aria-current={s === status ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              s === status
                ? "border-sva-gold bg-sva-gold text-sva-charcoal-dark font-semibold"
                : "border-sva-gray-600 text-sva-gray-300 hover:bg-sva-charcoal-light",
            )}
          >
            {s ? STATUS_LABEL[s] : "Alle"}
          </Link>
        ))}
      </nav>

      {!liste ? (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Die Anträge konnten gerade nicht geladen werden. Bitte später erneut probieren.
        </p>
      ) : liste.items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-sva-gray-300">
          {q || status ? "Keine Anträge gefunden, die zur Suche passen." : "Bisher sind keine Anträge eingegangen."}
        </p>
      ) : (
        <>
          <p className="mt-8 text-sm text-sva-gray-400">
            {liste.totalItems === 1 ? "1 Antrag" : `${liste.totalItems} Anträge`}
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-sva-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-sva-charcoal-dark text-xs uppercase tracking-wide text-sva-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">E-Mail</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Ort</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Mandatsreferenz</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Unterschrieben</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sva-gray-700 bg-sva-charcoal-light">
                {liste.items.map((a) => (
                  <tr key={a.id} className="relative transition-colors hover:bg-sva-gray-700/50">
                    <td className="px-4 py-3 font-medium text-white">
                      {/* Der Link überspannt per ::after die ganze Zeile. */}
                      <Link href={`/admin/antraege/${a.id}`} className="after:absolute after:inset-0">
                        {a.nachname}, {a.vorname}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 md:table-cell">{a.email}</td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 sm:table-cell">{a.ort}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-sva-gray-300 lg:table-cell">{a.mandatsreferenz}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sva-gray-300">{datumZeit(a.unterschrieben_am)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {liste.totalPages > 1 && (
            <nav aria-label="Seiten" className="mt-6 flex items-center justify-between text-sm">
              {seite > 1 ? (
                <Link href={listenLink({ q, status, seite: seite - 1 })} className="font-medium text-sva-gold hover:text-sva-gold-light">
                  ← Zurück
                </Link>
              ) : <span />}
              <span className="text-sva-gray-400">Seite {seite} von {liste.totalPages}</span>
              {seite < liste.totalPages ? (
                <Link href={listenLink({ q, status, seite: seite + 1 })} className="font-medium text-sva-gold hover:text-sva-gold-light">
                  Weiter →
                </Link>
              ) : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
