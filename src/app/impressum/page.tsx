import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum", description: "Impressum des Förderverein SV Amendingen e.V." };

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Impressum</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-sva-gray-200">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Angaben gemäß § 5 TMG</h2>
          <p>Förderverein SV Amendingen e.V.<br />Musterstraße 1<br />87700 Memmingen / Amendingen</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Vertreten durch</h2>
          <p>1. Vorstand: Manuel Rothermel<br />2. Vorstand: Christian Geiger</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Kontakt</h2>
          <p>E-Mail: foerderverein@sv-amendingen.de<br />Telefon: [Telefonnummer]</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Registereintrag</h2>
          <p>Eingetragen im Vereinsregister.<br />Registergericht: Amtsgericht Memmingen<br />Registernummer: VR [Nummer]</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>[Name des Verantwortlichen]<br />Musterstraße 1<br />87700 Memmingen / Amendingen</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Haftungsausschluss</h2>
          <p><strong className="text-white">Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
          <p className="mt-2"><strong className="text-white">Haftung für Links:</strong> Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.</p>
        </section>
        <div className="rounded-md border border-sva-gold/30 bg-sva-gold/10 p-4 text-xs text-sva-gold">
          <strong>Hinweis:</strong> Alle mit [Klammern] markierten Angaben sind Platzhalter und müssen durch die tatsächlichen Vereinsdaten ersetzt werden.
        </div>
      </div>
    </div>
  );
}
