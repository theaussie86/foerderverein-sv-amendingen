import type { Metadata } from "next";
import Link from "next/link";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { datum, datumZeit } from "@/lib/antraege";
import { BELEG_STATUS, BELEG_STATUS_LABEL, belegeSuchen, euro, istBelegStatus, type BelegStatus } from "@/lib/spendenbelege";
import { cn } from "@/lib/utils";
import { abmelden } from "../actions";
import { AdminNav } from "../admin-nav";
import { BelegStatusBadge } from "./status-badge";

export const metadata: Metadata = {
  title: "Spendenbelege",
  robots: { index: false, follow: false },
};

type Suchparameter = { q?: string; status?: string; seite?: string };

function listenLink({ q, status, seite }: { q: string; status?: BelegStatus; seite?: number }): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (status) p.set("status", status);
  if (seite && seite > 1) p.set("seite", String(seite));
  const s = p.toString();
  return s ? `/admin/spenden?${s}` : "/admin/spenden";
}

export default async function SpendenbelegePage({ searchParams }: { searchParams: Promise<Suchparameter> }) {
  const { pb, vorstand } = await vorstandErforderlich();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status = istBelegStatus(params.status) ? params.status : undefined;
  const seite = Math.max(1, Number.parseInt(params.seite ?? "1", 10) || 1);

  let liste: Awaited<ReturnType<typeof belegeSuchen>> | null = null;
  try {
    liste = await belegeSuchen(pb, { suche: q, status, seite });
  } catch (e) {
    console.error("Spendenbelege konnten nicht geladen werden", e instanceof Error ? e.message : e);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <AdminNav pb={pb} aktiv="spenden" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Spendenbelege</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 max-w-2xl text-sva-gray-300">
            Bis 300 € verschickt die Website den Spendenbeleg automatisch. Darüber bitte den Geldeingang prüfen,
            die Zuwendungsbestätigung ausstellen und die Anfrage hier als ausgestellt markieren.
          </p>
          <p className="mt-2 text-sm text-sva-gray-400">Angemeldet als {vorstand.name || vorstand.email}.</p>
        </div>
        <form action={abmelden}>
          <button type="submit" className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal-light">
            Abmelden
          </button>
        </form>
      </div>

      <form action="/admin/spenden" role="search" className="mt-10 flex flex-col gap-3 sm:flex-row">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="q" className="sr-only">Spendenbelege durchsuchen</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Name, E-Mail, Ort oder Straße"
          className="w-full rounded-md border border-sva-gray-600 bg-sva-charcoal-light px-4 py-2.5 text-white placeholder:text-sva-gray-400 focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold"
        />
        <button type="submit" className="rounded-md bg-sva-gold px-6 py-2.5 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light">
          Suchen
        </button>
      </form>

      <nav aria-label="Nach Status filtern" className="mt-4 flex flex-wrap gap-2">
        {[undefined, ...BELEG_STATUS].map((s) => (
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
            {s ? BELEG_STATUS_LABEL[s] : "Alle"}
          </Link>
        ))}
      </nav>

      {!liste ? (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Die Spendenbelege konnten gerade nicht geladen werden. Bitte später erneut probieren.
        </p>
      ) : liste.items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-sva-gray-300">
          {q || status ? "Keine Anfragen gefunden, die zur Suche passen." : "Bisher sind keine Anfragen eingegangen."}
        </p>
      ) : (
        <>
          <p className="mt-8 text-sm text-sva-gray-400">
            {liste.totalItems === 1 ? "1 Anfrage" : `${liste.totalItems} Anfragen`}
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-sva-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-sva-charcoal-dark text-xs uppercase tracking-wide text-sva-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Betrag</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Überwiesen am</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">E-Mail</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Angefragt</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sva-gray-700 bg-sva-charcoal-light">
                {liste.items.map((b) => (
                  <tr key={b.id} className="relative transition-colors hover:bg-sva-gray-700/50">
                    <td className="px-4 py-3 font-medium text-white">
                      {/* Der Link überspannt per ::after die ganze Zeile. */}
                      <Link href={`/admin/spenden/${b.id}`} className="after:absolute after:inset-0">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums text-white">{euro(b.betrag)}</td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 sm:table-cell">{datum(b.ueberwiesen_am)}</td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 md:table-cell">{b.email}</td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-sva-gray-300 lg:table-cell">{datumZeit(b.created)}</td>
                    <td className="px-4 py-3"><BelegStatusBadge status={b.status} /></td>
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
