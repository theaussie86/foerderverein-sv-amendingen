import type { Metadata } from "next";
import Link from "next/link";
import type { Antrag, Sitzung } from "@/lib/antrag";
import { clientInfo } from "@/lib/request";
import { formatIban } from "@/lib/schemas";
import { seal, unseal } from "@/lib/token";
import { mandatstext, mitgliedsbeitrag, verein } from "@/lib/verein";
import { UnterschriftFormular } from "./unterschrift-formular";

export const metadata: Metadata = {
  title: "Beitrittserklärung unterschreiben",
  robots: { index: false, follow: false },
};

export default async function UnterschreibenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const antrag = unseal<Antrag>(token);

  if (!antrag) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Link ungültig</h1>
        <div className="mt-2 h-1 w-16 bg-sva-gold" />
        <p className="mt-6 text-lg text-sva-gray-300">
          Dieser Link ist abgelaufen oder ungültig. Bitte füll den Mitgliedsantrag erneut aus.
        </p>
        <Link href="/mitglied-werden" className="mt-8 inline-block rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white hover:bg-sva-green-light">
          Zum Mitgliedsantrag
        </Link>
      </div>
    );
  }

  const { ip } = await clientInfo();
  const sitzung: Sitzung = { antragId: antrag.id, geoeffnet: { zeit: new Date().toISOString(), ip } };
  const sitzungToken = seal(sitzung, 24 * 60 * 60);
  const d = antrag.daten;

  const zeilen: [string, string][] = [
    ["Mitgliedschaft", `${mitgliedsbeitrag} € / Jahr`],
    ["Name", `${d.vorname} ${d.nachname}`],
    ["Anschrift", `${d.strasse}, ${d.plz} ${d.ort}`],
    ["E-Mail", d.email],
    ...(d.geburtsdatum ? [["Geburtsdatum", new Date(d.geburtsdatum).toLocaleDateString("de-DE")] as [string, string]] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Beitrittserklärung unterschreiben</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-lg text-sva-gray-300">Bitte prüf deine Angaben und unterschreib unten.</p>

      <section className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Beitrittserklärung</h2>
        <p className="mt-2 text-sm text-sva-gray-300">
          Hiermit erkläre ich meinen Beitritt zum {verein.name} und erkenne die Vereinssatzung an.
        </p>
        <dl className="mt-6 space-y-2 text-sm">
          {zeilen.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-32 shrink-0 text-sva-gray-400">{k}</dt>
              <dd className="text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">SEPA-Lastschriftmandat</h2>
        <dl className="mt-6 space-y-2 text-sm">
          {[
            ["Zahlungsempfänger", `${verein.name}, ${verein.strasse}, ${verein.plzOrt}`],
            ["Gläubiger-ID", verein.glaeubigerId],
            ["Mandatsreferenz", antrag.mandatsreferenz],
            ["Zahlungsart", "Wiederkehrende Zahlung"],
            ["Kontoinhaber", d.kontoinhaber],
            ["IBAN", formatIban(d.iban)],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-32 shrink-0 text-sva-gray-400">{k}</dt>
              <dd className="font-mono text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm leading-relaxed text-sva-gray-300">{mandatstext()}</p>
        <p className="mt-3 text-sm text-sva-gray-300">
          Der Jahresbeitrag von {mitgliedsbeitrag} € wird jeweils zum {verein.einzugstermin} eingezogen.
        </p>
      </section>

      <UnterschriftFormular token={token} sitzungToken={sitzungToken} kontoinhaber={d.kontoinhaber} />
    </div>
  );
}
