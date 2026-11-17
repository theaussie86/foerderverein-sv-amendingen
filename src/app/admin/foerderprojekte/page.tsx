import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { jahrUndBetrag, STARTSEITE_PLAETZE, type Foerderprojekt, type Liste } from "@/packages/foerderprojekt/anzeige";
import { foerderprojekteFuerVorstand } from "@/packages/foerderprojekt/server";
import { abmelden } from "../actions";
import { AdminNav } from "../admin-nav";
import { FoerderprojektFormular } from "./foerderprojekt-formular";

export const metadata: Metadata = {
  title: "Förderprojekte",
  robots: { index: false, follow: false },
};

type Suchparameter = { neu?: string; bearbeiten?: string; gespeichert?: string; geloescht?: string };

const bildUrl = (p: Foerderprojekt) => `/admin/foerderprojekte/${p.id}/bild?v=${encodeURIComponent(p.bild)}`;

export default async function FoerderprojektePage({ searchParams }: { searchParams: Promise<Suchparameter> }) {
  const { pb } = await vorstandErforderlich();
  const params = await searchParams;

  let liste: Liste | null = null;
  try {
    liste = await foerderprojekteFuerVorstand().liste();
  } catch (e) {
    console.error("Förderprojekte konnten nicht geladen werden", e instanceof Error ? e.message : e);
  }
  const alle = liste ? [...liste.startseite, ...liste.weitere] : [];
  const voll = liste?.voll ?? false;
  const neu = params.neu !== undefined;

  function zeile(p: Foerderprojekt) {
    if (params.bearbeiten === p.id) {
      return (
        <li key={p.id}>
          <FoerderprojektFormular projekt={p} bildUrl={bildUrl(p)} startseiteGesperrt={voll && !p.startseite} />
        </li>
      );
    }
    const unterzeile = jahrUndBetrag(p);
    return (
      <li
        key={p.id}
        className="flex items-center gap-4 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-3"
      >
        <Image
          src={bildUrl(p)}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded-md bg-sva-gray-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{p.titel}</p>
          {unterzeile && <p className="text-sm text-sva-gray-400">{unterzeile}</p>}
        </div>
        {p.startseite && (
          <span className="hidden rounded-full bg-sva-gold/15 px-3 py-1 text-xs font-semibold text-sva-gold sm:inline">
            Startseite
          </span>
        )}
        <Link
          href={`/admin/foerderprojekte?bearbeiten=${p.id}`}
          className="rounded-md border border-sva-gray-600 px-4 py-2 text-sm text-sva-gray-300 transition-colors hover:bg-sva-charcoal"
        >
          Bearbeiten
        </Link>
      </li>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <AdminNav pb={pb} aktiv="foerderprojekte" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase sm:text-4xl">Förderprojekte</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 max-w-2xl text-sva-gray-300">
            Was der Förderverein finanziert hat. Höchstens {STARTSEITE_PLAETZE} Förderprojekte erscheinen auf der
            Startseite unter „Kleine Beiträge, die man sieht“, neu angehakte hinten.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/foerderprojekte?neu"
            className="rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light"
          >
            Förderprojekt anlegen
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

      {(params.gespeichert || params.geloescht) && (
        <p role="status" className="mt-8 rounded-lg border border-sva-gold/40 bg-sva-gold/10 p-4 text-sva-gray-200">
          {params.gespeichert ? "Förderprojekt gespeichert." : "Förderprojekt gelöscht."}
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
        <>
          <p className="mt-8 text-sm text-sva-gray-400">
            Auf der Startseite: {liste.startseite.length} von {STARTSEITE_PLAETZE} Plätzen
          </p>
          <ul className="mt-3 space-y-3">{alle.map(zeile)}</ul>
        </>
      )}
    </div>
  );
}
