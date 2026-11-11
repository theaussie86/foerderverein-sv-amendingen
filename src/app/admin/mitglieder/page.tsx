import type { Metadata } from "next";
import Link from "next/link";
import { datum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { FILTER, FILTER_LABEL, istFilter, type Filter, type Trefferliste } from "@/packages/mitglied/anzeige";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";
import { abmelden } from "../actions";
import { AdminNav } from "../admin-nav";
import { heute, MitgliedBadge } from "./mitglied-badge";

export const metadata: Metadata = {
  title: "Mitglieder",
  robots: { index: false, follow: false },
};

type Suchparameter = { q?: string; filter?: string; seite?: string };

function listenLink({ q, filter, seite }: { q: string; filter?: Filter; seite?: number }): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (filter) p.set("filter", filter);
  if (seite && seite > 1) p.set("seite", String(seite));
  const s = p.toString();
  return s ? `/admin/mitglieder?${s}` : "/admin/mitglieder";
}

export default async function MitgliederPage({ searchParams }: { searchParams: Promise<Suchparameter> }) {
  const { pb, vorstand } = await vorstandErforderlich();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const filter = istFilter(params.filter) ? params.filter : undefined;
  const seite = Math.max(1, Number.parseInt(params.seite ?? "1", 10) || 1);

  let liste: Trefferliste | null = null;
  try {
    liste = await mitgliederFuerVorstand(pb).suchen({ suche: q, filter, seite });
  } catch (e) {
    console.error("Mitglieder konnten nicht geladen werden", e instanceof Error ? e.message : e);
  }
  const tag = heute();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <AdminNav pb={pb} aktiv="mitglieder" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase sm:text-4xl">Mitglieder</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 max-w-2xl text-sva-gray-300">
            Alle Mitglieder, egal ob ihr Mitgliedsantrag online oder auf Papier kam. Online-Anträge übernimmst du in der
            Detailansicht des Antrags.
          </p>
          <p className="mt-2 text-sm text-sva-gray-400">Angemeldet als {vorstand.name || vorstand.email}.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/mitglieder/neu"
            className="rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light"
          >
            Mitglied anlegen
          </Link>
          <form action={abmelden}>
            <button
              type="submit"
              className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal-light"
            >
              Abmelden
            </button>
          </form>
        </div>
      </div>

      <form action="/admin/mitglieder" role="search" className="mt-10 flex flex-col gap-3 sm:flex-row">
        {filter && <input type="hidden" name="filter" value={filter} />}
        <label htmlFor="q" className="sr-only">
          Mitglieder durchsuchen
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Name, E-Mail, Ort, IBAN oder Mandatsreferenz"
          className="w-full rounded-md border border-sva-gray-600 bg-sva-charcoal-light px-4 py-2.5 text-white placeholder:text-sva-gray-400 focus:border-sva-gold focus:ring-1 focus:ring-sva-gold focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-sva-gold px-6 py-2.5 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light"
        >
          Suchen
        </button>
      </form>

      <nav aria-label="Nach Mitgliedschaft filtern" className="mt-4 flex flex-wrap gap-2">
        {[undefined, ...FILTER].map((f) => (
          <Link
            key={f ?? "alle"}
            href={listenLink({ q, filter: f })}
            aria-current={f === filter ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              f === filter
                ? "border-sva-gold bg-sva-gold font-semibold text-sva-charcoal-dark"
                : "border-sva-gray-600 text-sva-gray-300 hover:bg-sva-charcoal-light",
            )}
          >
            {f ? FILTER_LABEL[f] : "Alle"}
          </Link>
        ))}
      </nav>

      {!liste ? (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Die Mitglieder konnten gerade nicht geladen werden. Bitte später erneut probieren.
        </p>
      ) : liste.eintraege.length === 0 ? (
        <p className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-sva-gray-300">
          {q || filter ? "Keine Mitglieder gefunden, die zur Suche passen." : "Bisher sind keine Mitglieder erfasst."}
        </p>
      ) : (
        <>
          <p className="mt-8 text-sm text-sva-gray-400">
            {liste.anzahl === 1 ? "1 Mitglied" : `${liste.anzahl} Mitglieder`}
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-sva-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-sva-charcoal-dark text-xs tracking-wide text-sva-gray-400 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Ort
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    E-Mail
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    Mandatsreferenz
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    Eintritt
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sva-gray-700 bg-sva-charcoal-light">
                {liste.eintraege.map((m) => (
                  <tr key={m.id} className="relative transition-colors hover:bg-sva-gray-700/50">
                    <td className="px-4 py-3 font-medium text-white">
                      {/* Der Link überspannt per ::after die ganze Zeile. */}
                      <Link href={`/admin/mitglieder/${m.id}`} className="after:absolute after:inset-0">
                        {m.nachname}, {m.vorname}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 sm:table-cell">{m.ort || "-"}</td>
                    <td className="hidden px-4 py-3 text-sva-gray-300 md:table-cell">{m.email || "-"}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-sva-gray-300 lg:table-cell">
                      {m.mandatsreferenz}
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-sva-gray-300 lg:table-cell">
                      {m.eintrittsdatum ? datum(m.eintrittsdatum) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <MitgliedBadge m={m} heute={tag} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {liste.seiten > 1 && (
            <nav aria-label="Seiten" className="mt-6 flex items-center justify-between text-sm">
              {seite > 1 ? (
                <Link
                  href={listenLink({ q, filter, seite: seite - 1 })}
                  className="font-medium text-sva-gold hover:text-sva-gold-light"
                >
                  ← Zurück
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sva-gray-400">
                Seite {seite} von {liste.seiten}
              </span>
              {seite < liste.seiten ? (
                <Link
                  href={listenLink({ q, filter, seite: seite + 1 })}
                  className="font-medium text-sva-gold hover:text-sva-gold-light"
                >
                  Weiter →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
