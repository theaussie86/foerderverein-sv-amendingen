import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { datum, datumZeit } from "@/lib/antraege";
import { BELEG_ART_LABEL, belegLaden, euro } from "@/lib/spendenbelege";
import { alsAusgestelltMarkieren } from "../actions";
import { BelegStatusBadge } from "../status-badge";

export const metadata: Metadata = {
  title: "Spendenbeleg",
  robots: { index: false, follow: false },
};

export default async function SpendenbelegPage({ params }: { params: Promise<{ id: string }> }) {
  const { pb } = await vorstandErforderlich();
  const { id } = await params;
  const beleg = await belegLaden(pb, id);
  if (!beleg) notFound();

  const ausgestelltVon = beleg.expand?.ausgestellt_von;
  const felder: [string, ReactNode][] = [
    ["Betrag", euro(beleg.betrag)],
    ["Überwiesen am", datum(beleg.ueberwiesen_am)],
    ["Art", BELEG_ART_LABEL[beleg.art]],
    ["Name", beleg.name],
    ["Anschrift", `${beleg.strasse}, ${beleg.plz} ${beleg.ort}`],
    ["E-Mail", <a key="mail" href={`mailto:${beleg.email}`} className="text-sva-gold hover:text-sva-gold-light">{beleg.email}</a>],
    ["Angefragt", datumZeit(beleg.created)],
  ];
  if (beleg.status === "ausgestellt") {
    felder.push(["Ausgestellt", `${datumZeit(beleg.ausgestellt_am)}${ausgestelltVon ? ` von ${ausgestelltVon.name}` : ""}`]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin/spenden" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Spendenbelege
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">{beleg.name}</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">{euro(beleg.betrag)} vom {datum(beleg.ueberwiesen_am)}</p>
        </div>
        <BelegStatusBadge status={beleg.status} className="px-4 py-1.5 text-sm" />
      </div>

      {beleg.status === "offen" && (
        <section className="mt-10 rounded-lg border-2 border-sva-gold/60 bg-sva-charcoal-light p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-sva-gold">Zuwendungsbestätigung ausstellen</h2>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sva-gray-300">
            <li>Geldeingang über {euro(beleg.betrag)} auf dem Vereinskonto prüfen.</li>
            <li>Zuwendungsbestätigung nach amtlichem Muster ausstellen, unterschreiben und an den Spender schicken.</li>
            <li>Doppel für die Vereinsunterlagen aufbewahren.</li>
          </ol>
          <form action={alsAusgestelltMarkieren.bind(null, beleg.id)} className="mt-6">
            <button type="submit" className="rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light">
              Als ausgestellt markieren
            </button>
          </form>
        </section>
      )}

      {beleg.status === "versendet" && (
        <p className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-sva-gray-300">
          Der vereinfachte Spendenbeleg wurde direkt nach der Anfrage automatisch an {beleg.email} geschickt.
          Hier ist nichts zu tun.
        </p>
      )}

      <section className="mt-6 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-sva-gold">Angaben</h2>
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
