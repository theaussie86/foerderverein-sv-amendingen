import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";
import { mitgliedsantraegeFuerVorstand } from "@/packages/mitgliedsantrag/server";
import { MitgliedFormular } from "../mitglied-formular";
import { formularwerte } from "../werte";

export const metadata: Metadata = {
  title: "Mitglied anlegen",
  robots: { index: false, follow: false },
};

// Tag in deutscher Zeit als YYYY-MM-DD.
const tag = (iso: string) => (iso ? new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }) : "");

// Mit ?antrag=<id> übernimmt der Vorstand einen Online-Mitgliedsantrag als Mitglied.
export default async function MitgliedAnlegenPage({ searchParams }: { searchParams: Promise<{ antrag?: string }> }) {
  const { pb } = await vorstandErforderlich();
  const { antrag: antragId } = await searchParams;
  const mitglieder = mitgliederFuerVorstand(pb);

  let werte = formularwerte({ mandatsreferenz: await mitglieder.neueMandatsreferenz() });
  let herkunft: string | null = null;
  if (antragId) {
    const schonMitglied = await mitglieder.zuAntrag(antragId);
    if (schonMitglied) redirect(`/admin/mitglieder/${schonMitglied}`);
    const a = await mitgliedsantraegeFuerVorstand(pb).laden(antragId);
    if (a) {
      herkunft = `${a.vorname} ${a.nachname}`;
      const selbst = a.kontoinhaber.trim().toLowerCase() === `${a.vorname} ${a.nachname}`.trim().toLowerCase();
      werte = formularwerte({
        // Das Mandat wurde mit dieser Referenz unterschrieben, sie gilt weiter.
        mandatsreferenz: a.mandatsreferenz,
        vorname: a.vorname,
        nachname: a.nachname,
        strasse: a.strasse,
        plz: a.plz,
        ort: a.ort,
        email: a.email,
        kontoinhaber: selbst ? "" : a.kontoinhaber,
        iban: a.iban,
        mandatDatum: tag(a.unterschrieben_am),
        antragId: a.id,
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin/mitglieder" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Mitglieder
      </Link>
      <h1 className="mt-6 text-3xl font-black text-white uppercase sm:text-4xl">Mitglied anlegen</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-sva-gray-300">
        {herkunft
          ? `Angaben aus dem Online-Mitgliedsantrag von ${herkunft}. Bitte das Eintrittsdatum eintragen, das ist der Tag der Aufnahme.`
          : "Für Mitgliedsanträge auf Papier. Die Mandatsreferenz ist die nächste freie Nummer."}
      </p>
      <MitgliedFormular id="" werte={werte} />
    </div>
  );
}
