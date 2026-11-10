import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { datum, datumZeit } from "@/lib/antraege";
import { BELEG_ART_LABEL, anfrageLaden, euro } from "@/lib/beleganfragen";
import { alsAusgestelltMarkieren, belegFreigeben, anfrageAblehnen } from "../actions";
import { AnfrageStatusBadge } from "../status-badge";

export const metadata: Metadata = {
  title: "Spendenbeleg",
  robots: { index: false, follow: false },
};

const knopf = "rounded-md px-6 py-3 text-sm font-bold uppercase transition-colors";

export default async function SpendenbelegPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { pb } = await vorstandErforderlich();
  const { id } = await params;
  const { fehler } = await searchParams;
  const beleg = await anfrageLaden(pb, id);
  if (!beleg) notFound();

  const ausgestelltVon = beleg.expand?.ausgestellt_von;
  const felder: [string, ReactNode][] = [
    [
      "Beleg-Nr.",
      <span key="nr" className="font-mono">
        {beleg.id}
      </span>,
    ],
    ["Betrag", euro(beleg.betrag)],
    ["Überwiesen am", datum(beleg.ueberwiesen_am)],
    ["Art", BELEG_ART_LABEL[beleg.art]],
    ["Name", beleg.name],
    ["Anschrift", `${beleg.strasse}, ${beleg.plz} ${beleg.ort}`],
    [
      "E-Mail",
      <a key="mail" href={`mailto:${beleg.email}`} className="text-sva-gold hover:text-sva-gold-light">
        {beleg.email}
      </a>,
    ],
    ["Angefragt", datumZeit(beleg.created)],
  ];
  if (beleg.status !== "offen" && beleg.ausgestellt_am) {
    felder.push([
      "Erledigt",
      `${datumZeit(beleg.ausgestellt_am)}${ausgestelltVon ? ` von ${ausgestelltVon.name}` : ""}`,
    ]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin/spenden" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Spendenbelege
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase sm:text-4xl">{beleg.name}</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">
            {euro(beleg.betrag)} vom {datum(beleg.ueberwiesen_am)}
          </p>
        </div>
        <AnfrageStatusBadge status={beleg.status} className="px-4 py-1.5 text-sm" />
      </div>

      {fehler === "mail" && beleg.status === "offen" && (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Der Spendenbeleg konnte nicht verschickt werden. Die Anfrage ist weiter offen, bitte später erneut versuchen.
        </p>
      )}

      {beleg.status === "offen" && (
        <section className="mt-10 rounded-lg border-2 border-sva-gold/60 bg-sva-charcoal-light p-6">
          <h2 className="text-sm font-bold tracking-wide text-sva-gold uppercase">
            {beleg.art === "vereinfacht" ? "Geldeingang prüfen" : "Zuwendungsbestätigung ausstellen"}
          </h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sva-gray-300">
            <li>
              Auf dem Vereinskonto nach einer Überweisung über {euro(beleg.betrag)} von {beleg.name} um den{" "}
              {datum(beleg.ueberwiesen_am)} suchen.
            </li>
            {beleg.art === "vereinfacht" ? (
              <li>Ist sie da, bestätigen. Dann geht der Spendenbeleg automatisch an {beleg.email}.</li>
            ) : (
              <>
                <li>
                  Zuwendungsbestätigung nach amtlichem Muster ausstellen, unterschreiben und an den Spender schicken.
                </li>
                <li>Doppel für die Vereinsunterlagen aufbewahren.</li>
              </>
            )}
            <li>Ist keine Überweisung da, die Anfrage ablehnen. Der Spender bekommt dann nichts.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            {beleg.art === "vereinfacht" ? (
              <form action={belegFreigeben.bind(null, beleg.id)}>
                <button type="submit" className={`${knopf} bg-sva-gold text-sva-charcoal-dark hover:bg-sva-gold-light`}>
                  Geldeingang bestätigt, Beleg senden
                </button>
              </form>
            ) : (
              <form action={alsAusgestelltMarkieren.bind(null, beleg.id)}>
                <button type="submit" className={`${knopf} bg-sva-gold text-sva-charcoal-dark hover:bg-sva-gold-light`}>
                  Als ausgestellt markieren
                </button>
              </form>
            )}
            <form action={anfrageAblehnen.bind(null, beleg.id)}>
              <button
                type="submit"
                className={`${knopf} border border-sva-gray-600 text-sva-gray-300 hover:bg-sva-charcoal`}
              >
                Ablehnen
              </button>
            </form>
          </div>
        </section>
      )}

      {beleg.status === "abgelehnt" && (
        <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
          <p className="text-sva-gray-300">
            Auf dem Vereinskonto war keine passende Überweisung. Die Anfrage ist geschlossen, es wurde kein Beleg
            verschickt.
          </p>
        </section>
      )}

      {beleg.status === "versendet" && (
        <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
          <p className="text-sva-gray-300">
            Der Spendenbeleg wurde an {beleg.email} geschickt. Hier ist nichts mehr zu tun.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sva-gray-700 pt-4">
            <span className="text-white">Spendenbeleg (PDF)</span>
            {beleg.beleg_pdf ? (
              <span className="flex gap-4 text-sm font-medium">
                <a
                  href={`/admin/spenden/${beleg.id}/beleg`}
                  target="_blank"
                  rel="noopener"
                  className="text-sva-gold hover:text-sva-gold-light"
                >
                  Ansehen
                </a>
                <a
                  href={`/admin/spenden/${beleg.id}/beleg?download=1`}
                  className="text-sva-gold hover:text-sva-gold-light"
                >
                  Herunterladen
                </a>
              </span>
            ) : (
              <span className="text-sm text-sva-gray-400">nicht gespeichert</span>
            )}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
        <h2 className="text-sm font-bold tracking-wide text-sva-gold uppercase">Angaben</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
          {felder.map(([label, wert]) => (
            <div key={label} className="contents">
              <dt className="text-sm text-sva-gray-400">{label}</dt>
              <dd className="break-words text-white">{wert}</dd>
            </div>
          ))}
        </dl>
        {beleg.notiz && <p className="mt-6 whitespace-pre-wrap text-white">{beleg.notiz}</p>}
      </section>
    </div>
  );
}
