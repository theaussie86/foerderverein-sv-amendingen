import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { antragLaden, DATEIEN, datum, datumZeit, type Dateifeld } from "@/lib/antraege";
import { formatIban } from "@/lib/schemas";
import { StatusBadge } from "../../status-badge";

export const metadata: Metadata = {
  title: "Mitgliedsantrag",
  robots: { index: false, follow: false },
};

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-sva-gold">{titel}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Felder({ felder }: { felder: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
      {felder.map(([label, wert]) => (
        <div key={label} className="contents">
          <dt className="text-sm text-sva-gray-400">{label}</dt>
          <dd className="break-words text-white">{wert || <span className="text-sva-gray-400">-</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AntragPage({ params }: { params: Promise<{ id: string }> }) {
  const { pb } = await vorstandErforderlich();
  const { id } = await params;
  const antrag = await antragLaden(pb, id);
  if (!antrag) notFound();

  const p = antrag.protokoll;
  const dateiLink = (feld: Dateifeld) => `/admin/antraege/${antrag.id}/dateien/${feld}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Anträge
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">
            {antrag.vorname} {antrag.nachname}
          </h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">
            Mandatsreferenz <span className="font-mono text-white">{antrag.mandatsreferenz}</span>
          </p>
        </div>
        <StatusBadge status={antrag.status} className="px-4 py-1.5 text-sm" />
      </div>

      <div className="mt-10 grid gap-6">
        <Abschnitt titel="Dokumente">
          <ul className="divide-y divide-sva-gray-700">
            {(Object.keys(DATEIEN) as Dateifeld[]).map((feld) => (
              <li key={feld} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="text-white">{DATEIEN[feld]}</span>
                {antrag[feld] ? (
                  <span className="flex gap-4 text-sm font-medium">
                    <a href={dateiLink(feld)} target="_blank" rel="noopener" className="text-sva-gold hover:text-sva-gold-light">
                      Ansehen
                    </a>
                    <a href={`${dateiLink(feld)}?download=1`} className="text-sva-gold hover:text-sva-gold-light">
                      Herunterladen
                    </a>
                  </span>
                ) : (
                  <span className="text-sm text-sva-gray-400">nicht vorhanden</span>
                )}
              </li>
            ))}
          </ul>
        </Abschnitt>

        <Abschnitt titel="Persönliche Daten">
          <Felder
            felder={[
              ["Vorname", antrag.vorname],
              ["Nachname", antrag.nachname],
              ["Straße", antrag.strasse],
              ["PLZ und Ort", `${antrag.plz} ${antrag.ort}`],
              ["E-Mail", <a key="mail" href={`mailto:${antrag.email}`} className="text-sva-gold hover:text-sva-gold-light">{antrag.email}</a>],
              ["Geburtsdatum", datum(antrag.geburtsdatum)],
            ]}
          />
        </Abschnitt>

        <Abschnitt titel="Beitrag und Lastschrift">
          <Felder
            felder={[
              ["Jahresbeitrag", antrag.jahresbeitrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" })],
              ["Kontoinhaber", antrag.kontoinhaber],
              ["IBAN", <span key="iban" className="font-mono">{formatIban(antrag.iban)}</span>],
              ["Mandatsreferenz", <span key="ref" className="font-mono">{antrag.mandatsreferenz}</span>],
            ]}
          />
        </Abschnitt>

        <Abschnitt titel="Protokoll">
          <Felder
            felder={[
              ["Eingereicht", p?.eingereicht && `${datumZeit(p.eingereicht.zeit)} · IP ${p.eingereicht.ip}`],
              ["Link geöffnet", p?.geoeffnet && `${datumZeit(p.geoeffnet.zeit)} · IP ${p.geoeffnet.ip}`],
              ["Unterschrieben", p?.unterschrieben && `${datumZeit(p.unterschrieben.zeit)} · IP ${p.unterschrieben.ip}`],
              ["Browser", p?.unterschrieben?.userAgent && <span key="ua" className="text-sm text-sva-gray-300">{p.unterschrieben.userAgent}</span>],
              ["Prüfsumme", <span key="hash" className="font-mono text-xs text-sva-gray-300">{antrag.pruefsumme}</span>],
              ["Antrags-ID", <span key="aid" className="font-mono text-xs text-sva-gray-300">{antrag.antrag_id}</span>],
            ]}
          />
        </Abschnitt>

        {antrag.notiz && (
          <Abschnitt titel="Notiz">
            <p className="whitespace-pre-wrap text-white">{antrag.notiz}</p>
          </Abschnitt>
        )}
      </div>
    </div>
  );
}
