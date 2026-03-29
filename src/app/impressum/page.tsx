import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum des Förderverein SV Amendingen e.V.",
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Impressum
      </h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-sva-gray-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Förderverein SV Amendingen e.V.
            <br />
            Musterstraße 1
            <br />
            87700 Memmingen / Amendingen
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Vertreten durch
          </h2>
          <p>
            1. Vorstand: [Name]
            <br />
            2. Vorstand: [Name]
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Kontakt
          </h2>
          <p>
            E-Mail: foerderverein@sv-amendingen.de
            <br />
            Telefon: [Telefonnummer]
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Registereintrag
          </h2>
          <p>
            Eingetragen im Vereinsregister.
            <br />
            Registergericht: Amtsgericht Memmingen
            <br />
            Registernummer: VR [Nummer]
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p>
            [Name des Verantwortlichen]
            <br />
            Musterstraße 1
            <br />
            87700 Memmingen / Amendingen
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            Haftungsausschluss
          </h2>
          <p>
            <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten
            wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine
            Gewähr übernehmen.
          </p>
          <p className="mt-2">
            <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu
            externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss
            haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter verantwortlich.
          </p>
        </section>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
          <strong>Hinweis:</strong> Alle mit [Klammern] markierten Angaben sind
          Platzhalter und müssen durch die tatsächlichen Vereinsdaten ersetzt
          werden.
        </div>
      </div>
    </div>
  );
}
