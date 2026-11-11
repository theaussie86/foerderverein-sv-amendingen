import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { datumZeit } from "@/lib/format";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";
import { MitgliedFormular } from "../mitglied-formular";
import { MitgliedBadge, heute } from "../mitglied-badge";
import { formularwerte } from "../werte";

export const metadata: Metadata = {
  title: "Mitglied",
  robots: { index: false, follow: false },
};

export default async function MitgliedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { pb } = await vorstandErforderlich();
  const { id } = await params;
  const { gespeichert } = await searchParams;
  const m = await mitgliederFuerVorstand(pb).laden(id);
  if (!m) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin/mitglieder" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Mitglieder
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase sm:text-4xl">
            {m.vorname} {m.nachname}
          </h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">
            Mandatsreferenz <span className="font-mono text-white">{m.mandatsreferenz}</span>
            {m.antragId && (
              <>
                {" · "}
                <Link href={`/admin/antraege/${m.antragId}`} className="text-sva-gold hover:text-sva-gold-light">
                  Online-Mitgliedsantrag
                </Link>
              </>
            )}
          </p>
        </div>
        <MitgliedBadge m={m} heute={heute()} className="px-4 py-1.5 text-sm" />
      </div>
      {gespeichert && (
        <p
          role="status"
          className="mt-6 rounded-md border border-sva-green-light/50 bg-sva-green/20 p-4 text-sm text-green-300"
        >
          Gespeichert.
        </p>
      )}
      <MitgliedFormular key={m.geaendert} id={m.id} werte={formularwerte(m)} />
      <p className="mt-6 text-xs text-sva-gray-400">
        Angelegt {datumZeit(m.angelegt)} · zuletzt geändert {datumZeit(m.geaendert)}
      </p>
    </div>
  );
}
