import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { datum, datumZeit, seitWann } from "@/lib/format";
import {
  ABLEHNUNGSGRUND_LABEL,
  BELEG_ART_LABEL,
  euro,
  istBearbeitbar,
  ZAHLUNGSWEG_LABEL,
  ZAHLUNGSWEG_PRUEFORT,
} from "@/packages/beleganfrage/anzeige";
import { ablehnungsmailVorlagen } from "@/packages/beleganfrage/index";
import { beleganfragenFuerVorstand } from "@/packages/beleganfrage/server";
import { alsWartendMarkieren } from "../actions";
import { AnfrageStatusBadge } from "../status-badge";
import { AblehnenFormular } from "./ablehnen-formular";
import { AusstellenFormular } from "./ausstellen-formular";

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
  const beleg = await beleganfragenFuerVorstand(pb).laden(id);
  if (!beleg) notFound();

  const felder: [string, ReactNode][] = [
    [
      "Beleg-Nr.",
      <span key="nr" className="font-mono">
        {beleg.id}
      </span>,
    ],
    [
      "Betrag",
      beleg.betrag === beleg.betragAngegeben
        ? euro(beleg.betrag)
        : `${euro(beleg.betrag)} eingegangen, ${euro(beleg.betragAngegeben)} angegeben`,
    ],
    ["Tag der Spende", datum(beleg.tagDerSpende)],
    ["Zahlungsweg", ZAHLUNGSWEG_LABEL[beleg.zahlungsweg]],
    ["Art", BELEG_ART_LABEL[beleg.art]],
    ["Name", beleg.name],
    ["Anschrift", `${beleg.strasse}, ${beleg.plz} ${beleg.ort}`],
    [
      "E-Mail",
      beleg.email ? (
        <a key="mail" href={`mailto:${beleg.email}`} className="text-sva-gold hover:text-sva-gold-light">
          {beleg.email}
        </a>
      ) : (
        <span key="mail" className="text-sva-gray-400">
          keine
        </span>
      ),
    ],
    ["Herkunft", beleg.erfasstVon ? `Erfasst von ${beleg.erfasstVon}` : "Über die Website"],
    ["Angefragt", datumZeit(beleg.angefragtAm)],
  ];
  const wartend = beleg.status === "wartend" ? beleg.wartend : null;
  if (wartend) {
    felder.push(["Wartet", `${seitWann(wartend.seit, new Date())}, erstmals geprüft am ${datum(wartend.seit)}`]);
    felder.push(["Zuletzt geprüft", datumZeit(wartend.zuletztGeprueft)]);
  }
  if ((beleg.status === "ausgestellt" || beleg.status === "abgelehnt") && beleg.abschluss) {
    const { am, von } = beleg.abschluss;
    felder.push([
      beleg.status === "ausgestellt" ? "Ausgestellt" : "Abgelehnt",
      `${datumZeit(am)}${von ? ` von ${von}` : ""}`,
    ]);
  }
  const bearbeitbar = istBearbeitbar(beleg.status);

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
            {euro(beleg.betrag)} vom {datum(beleg.tagDerSpende)}
          </p>
        </div>
        <AnfrageStatusBadge status={beleg.status} className="px-4 py-1.5 text-sm" />
      </div>

      {fehler === "mail" && bearbeitbar && (
        <p role="alert" className="mt-10 rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
          Der Spendenbeleg konnte nicht verschickt werden. Die Anfrage ist unverändert, bitte später erneut versuchen.
        </p>
      )}

      {bearbeitbar && (
        <section className="mt-10 rounded-lg border-2 border-sva-gold/60 bg-sva-charcoal-light p-6">
          <h2 className="text-sm font-bold tracking-wide text-sva-gold uppercase">
            {beleg.art === "vereinfacht" ? "Geldeingang prüfen" : "Zuwendungsbestätigung ausstellen"}
          </h2>
          {wartend && (
            <p className="mt-4 rounded-md border border-dashed border-sva-gold/60 px-4 py-3 text-sva-gray-300">
              Wartet {seitWann(wartend.seit, new Date())}: Beim letzten Prüfen am {datumZeit(wartend.zuletztGeprueft)}{" "}
              war die Spende noch nicht da.
            </p>
          )}
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sva-gray-300">
            <li>
              {ZAHLUNGSWEG_PRUEFORT[beleg.zahlungsweg].replace(/^./, (c) => c.toUpperCase())} nach einer Spende über{" "}
              {euro(beleg.betrag)} von {beleg.name} um den {datum(beleg.tagDerSpende)} suchen.
            </li>
            {beleg.art === "vereinfacht" ? (
              <li>
                {beleg.email
                  ? `Ist sie da, ausstellen. Dann geht der Spendenbeleg automatisch an ${beleg.email}.`
                  : "Ist sie da, ausstellen. Ohne E-Mail-Adresse geht keine Mail raus, den Spendenbeleg danach hier herunterladen und dem Spender geben."}
              </li>
            ) : (
              <>
                <li>
                  Zuwendungsbestätigung nach amtlichem Muster ausstellen, unterschreiben und an den Spender schicken.
                </li>
                <li>Doppel für die Vereinsunterlagen aufbewahren.</li>
              </>
            )}
            <li>Ist ein anderer Betrag eingegangen, ihn beim Ausstellen eintragen.</li>
            <li>Ist die Spende noch nicht da, als wartend markieren und später erneut nachsehen.</li>
          </ol>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <AusstellenFormular
              id={beleg.id}
              art={beleg.art}
              betrag={beleg.betrag}
              betragAngegeben={beleg.betragAngegeben}
              email={beleg.email}
            />
            <form action={alsWartendMarkieren.bind(null, beleg.id)}>
              <button
                type="submit"
                className={`${knopf} border border-dashed border-sva-gold/60 text-sva-gold-light hover:bg-sva-charcoal`}
              >
                {wartend ? "Erneut geprüft, noch nicht da" : "Spende noch nicht da, warten"}
              </button>
            </form>
          </div>
          <details className="mt-6 border-t border-sva-gray-700 pt-4">
            <summary className="cursor-pointer text-sm font-bold tracking-wide text-sva-gray-300 uppercase">
              Ablehnen
            </summary>
            <div className="mt-4">
              <AblehnenFormular id={beleg.id} email={beleg.email} vorlagen={ablehnungsmailVorlagen(beleg)} />
            </div>
          </details>
        </section>
      )}

      {beleg.status === "abgelehnt" && (
        <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
          <p className="text-sva-gray-300">Die Anfrage ist abgelehnt, es gibt keinen Spendenbeleg.</p>
          <p className="mt-2 text-white">
            {beleg.ablehnung ? ABLEHNUNGSGRUND_LABEL[beleg.ablehnung.grund] : "Grund nicht erfasst"}
          </p>
          {beleg.ablehnung?.begruendung && (
            <p className="mt-1 whitespace-pre-wrap text-sva-gray-300">{beleg.ablehnung.begruendung}</p>
          )}
        </section>
      )}

      {beleg.status === "ausgestellt" && beleg.art === "zuwendungsbestaetigung" && (
        <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
          <p className="text-sva-gray-300">
            Die Zuwendungsbestätigung wurde außerhalb der Website ausgestellt. Hier ist nichts mehr zu tun.
          </p>
        </section>
      )}

      {beleg.status === "ausgestellt" && beleg.art === "vereinfacht" && (
        <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
          <p className="text-sva-gray-300">
            {beleg.email
              ? `Der Spendenbeleg wurde an ${beleg.email} geschickt. Hier ist nichts mehr zu tun.`
              : "Es gab keine E-Mail-Adresse, deshalb ging keine Mail raus. Den Spendenbeleg herunterladen und dem Spender geben."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sva-gray-700 pt-4">
            <span className="text-white">Spendenbeleg (PDF)</span>
            {beleg.hatBeleg ? (
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
