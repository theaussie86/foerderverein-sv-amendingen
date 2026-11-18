import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { datum, datumZeit } from "@/lib/format";
import { ablehnbar, DATEIEN, istDateifeld, uebernehmbar, type Dateifeld } from "@/packages/mitgliedsantrag/anzeige";
import { mitgliedsantraegeFuerVorstand } from "@/packages/mitgliedsantrag/server";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";
import { formatIban } from "@/lib/schemas";
import { StatusBadge } from "../../status-badge";
import { AblehnenFormular } from "./ablehnen-formular";
import { DokumentAnsicht, type Dokument } from "./dokument-ansicht";

export const metadata: Metadata = {
  title: "Mitgliedsantrag",
  robots: { index: false, follow: false },
};

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
      <h2 className="text-sm font-bold tracking-wide text-sva-gold uppercase">{titel}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Felder({ felder }: { felder: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
      {felder.map(([label, wert]) => (
        <div key={label} className="contents">
          <dt className="text-sm text-sva-gray-400">{label}</dt>
          <dd className="min-w-0 [overflow-wrap:anywhere] text-white">
            {wert || <span className="text-sva-gray-400">-</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AntragPage({ params }: { params: Promise<{ id: string }> }) {
  const { pb } = await vorstandErforderlich();
  const { id } = await params;
  const antrag = await mitgliedsantraegeFuerVorstand(pb).laden(id);
  if (!antrag) notFound();
  const mitgliedId = await mitgliederFuerVorstand(pb).zuAntrag(antrag.id);

  const p = antrag.protokoll;
  const dateiLink = (feld: Dateifeld) => `/admin/antraege/${antrag.id}/dateien/${feld}`;
  const dokumente: Dokument[] = Object.keys(DATEIEN)
    .filter(istDateifeld)
    .filter((feld) => !!antrag[feld])
    .map((feld) => ({
      feld,
      label: feld === "mandat_pdf" ? "SEPA-Mandat" : DATEIEN[feld],
      href: dateiLink(feld),
      bild: feld === "unterschrift",
    }));
  const kannAblehnen = ablehnbar(antrag.status, !!mitgliedId);
  const kannUebernehmen = !mitgliedId && uebernehmbar(antrag.status);
  const uebernehmenKnopf = kannUebernehmen && (
    <Link
      href={`/admin/mitglieder/neu?antrag=${antrag.id}`}
      className="rounded-md bg-sva-gold px-5 py-2.5 text-sm font-bold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
    >
      Als Mitglied übernehmen
    </Link>
  );

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link href="/admin" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Anträge
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {antrag.vorname} {antrag.nachname}
          </h1>
          <p className="mt-4 text-sva-gray-300">
            Mandatsreferenz <span className="font-mono text-white">{antrag.mandatsreferenz}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={antrag.status} className="px-4 py-1.5 text-sm" />
          {mitgliedId && (
            <Link
              href={`/admin/mitglieder/${mitgliedId}`}
              className="text-sm font-medium text-sva-gold hover:text-sva-gold-light"
            >
              Zum Mitglied →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-start">
        {/* Auf dem Handy löst sich die linke Spalte auf, damit die Entscheidung unter den Dokumenten steht. */}
        <div className="contents xl:grid xl:gap-6">
          {antrag.status === "abgelehnt" && (
            <Abschnitt titel="Ablehnung">
              <Felder
                felder={[
                  [
                    "Grund (intern)",
                    <p key="grund" className="whitespace-pre-wrap">
                      {antrag.ablehnungsgrund}
                    </p>,
                  ],
                ]}
              />
            </Abschnitt>
          )}

          <Abschnitt titel="Persönliche Daten">
            <Felder
              felder={[
                ["Vorname", antrag.vorname],
                ["Nachname", antrag.nachname],
                ["Straße", antrag.strasse],
                ["PLZ und Ort", `${antrag.plz} ${antrag.ort}`],
                [
                  "E-Mail",
                  <a key="mail" href={`mailto:${antrag.email}`} className="text-sva-gold hover:text-sva-gold-light">
                    {antrag.email}
                  </a>,
                ],
                ["Geburtsdatum", datum(antrag.geburtsdatum)],
                ["Telefon privat", antrag.telefon],
                ["Handy", antrag.handy],
              ]}
            />
          </Abschnitt>

          <Abschnitt titel="Beitrag und Lastschrift">
            <Felder
              felder={[
                ["Jahresbeitrag", antrag.jahresbeitrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" })],
                ["Kontoinhaber", antrag.kontoinhaber],
                [
                  "IBAN",
                  <span key="iban" className="font-mono">
                    {formatIban(antrag.iban)}
                  </span>,
                ],
                [
                  "Mandatsreferenz",
                  <span key="ref" className="font-mono">
                    {antrag.mandatsreferenz}
                  </span>,
                ],
              ]}
            />
          </Abschnitt>

          <Abschnitt titel="Protokoll">
            <Felder
              felder={[
                ["Eingereicht", p?.eingereicht && `${datumZeit(p.eingereicht.zeit)} · IP ${p.eingereicht.ip}`],
                ["Link geöffnet", p?.geoeffnet && `${datumZeit(p.geoeffnet.zeit)} · IP ${p.geoeffnet.ip}`],
                [
                  "Unterschrieben",
                  p?.unterschrieben && `${datumZeit(p.unterschrieben.zeit)} · IP ${p.unterschrieben.ip}`,
                ],
                [
                  "Browser",
                  p?.unterschrieben?.userAgent && (
                    <span key="ua" className="text-sm text-sva-gray-300">
                      {p.unterschrieben.userAgent}
                    </span>
                  ),
                ],
                [
                  "Prüfsumme",
                  <span key="hash" className="font-mono text-xs text-sva-gray-300">
                    {antrag.pruefsumme}
                  </span>,
                ],
                [
                  "Antrags-ID",
                  <span key="aid" className="font-mono text-xs text-sva-gray-300">
                    {antrag.antrag_id}
                  </span>,
                ],
              ]}
            />
          </Abschnitt>

          {antrag.notiz && (
            <Abschnitt titel="Notiz">
              <p className="whitespace-pre-wrap text-white">{antrag.notiz}</p>
            </Abschnitt>
          )}

          {(kannAblehnen || kannUebernehmen) && (
            <section
              aria-labelledby="entscheidung"
              className="order-last rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 xl:order-none"
            >
              <h2 id="entscheidung" className="text-lg font-bold text-white">
                Entscheidung
              </h2>
              <p className="mt-1 text-sm text-sva-gray-300">
                Unterlagen geprüft? Dann den Antrag als Mitglied übernehmen oder ablehnen.
              </p>
              <div className="mt-5">
                {kannAblehnen ? (
                  <AblehnenFormular id={antrag.id} email={antrag.email} daneben={uebernehmenKnopf} />
                ) : (
                  uebernehmenKnopf
                )}
              </div>
            </section>
          )}
        </div>
        <div className="h-[75dvh] min-h-[28rem] xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)]">
          <DokumentAnsicht dokumente={dokumente} />
        </div>
      </div>
    </div>
  );
}
