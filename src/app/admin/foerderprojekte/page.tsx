import type { Metadata } from "next";
import Link from "next/link";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { STARTSEITE_PLAETZE, type Liste } from "@/packages/foerderprojekt/anzeige";
import { foerderprojekteFuerVorstand } from "@/packages/foerderprojekt/server";
import { FoerderprojektFormular } from "./foerderprojekt-formular";
import { StartseitenPlaetze } from "./startseiten-plaetze";

export const metadata: Metadata = {
  title: "Förderprojekte",
  robots: { index: false, follow: false },
};

type Suchparameter = { neu?: string; bearbeiten?: string; gespeichert?: string; geloescht?: string; fehler?: string };

const FEHLER: Record<string, string> = {
  "startseite-voll": `Auf der Startseite sind schon alle ${STARTSEITE_PLAETZE} Plätze belegt.`,
  "nicht-gefunden": "Das Förderprojekt gibt es nicht mehr.",
  speichern: "Die Startseite konnte nicht geändert werden.",
};

export default async function FoerderprojektePage({ searchParams }: { searchParams: Promise<Suchparameter> }) {
  await vorstandErforderlich();
  const params = await searchParams;

  let liste: Liste | null = null;
  try {
    liste = await foerderprojekteFuerVorstand().liste();
  } catch (e) {
    console.error("Förderprojekte konnten nicht geladen werden", e instanceof Error ? e.message : e);
  }
  const alle = liste ? [...liste.startseite, ...liste.weitere] : [];
  const fehler = params.fehler === undefined ? null : (FEHLER[params.fehler] ?? "Unbekanntes Förderprojekt.");
  const voll = liste?.voll ?? false;
  const neu = params.neu !== undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Förderprojekte</h1>
          <p className="mt-4 max-w-2xl text-sva-gray-300">
            Was der Förderverein finanziert hat. Höchstens {STARTSEITE_PLAETZE} Förderprojekte erscheinen auf der
            Startseite unter „Kleine Beiträge, die man sieht“. Die Reihenfolge stellen die Pfeile ein.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/foerderprojekte?neu"
            className="rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
          >
            Förderprojekt anlegen
          </Link>
        </div>
      </div>

      {(params.gespeichert || params.geloescht) && (
        <p role="status" className="mt-8 rounded-lg border border-sva-gold/40 bg-sva-gold/10 p-4 text-sva-gray-200">
          {params.gespeichert ? "Förderprojekt gespeichert." : "Förderprojekt gelöscht."}
        </p>
      )}

      {fehler && (
        <p role="alert" className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {fehler}
        </p>
      )}

      {neu && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-white">Neues Förderprojekt</h2>
          <FoerderprojektFormular projekt={null} bildUrl={null} startseiteGesperrt={voll} />
        </div>
      )}

      {!liste ? (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Die Förderprojekte konnten gerade nicht geladen werden. Bitte später erneut probieren.
        </p>
      ) : alle.length === 0 ? (
        <p className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-sva-gray-300">
          Bisher sind keine Förderprojekte erfasst.
        </p>
      ) : (
        <StartseitenPlaetze liste={liste} bearbeiten={params.bearbeiten} />
      )}
    </div>
  );
}
