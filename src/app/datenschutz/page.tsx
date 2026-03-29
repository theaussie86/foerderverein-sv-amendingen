import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz", description: "Datenschutzerklärung des Förderverein SV Amendingen e.V." };

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Datenschutzerklärung</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-sva-gray-200">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Verantwortlicher</h2>
          <p>Förderverein SV Amendingen e.V.<br />Musterstraße 1<br />87700 Memmingen / Amendingen<br />E-Mail: foerderverein@sv-amendingen.de</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p>Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Name und Anschrift</li><li>E-Mail-Adresse</li><li>Geburtsdatum</li>
            <li>Bankverbindung (IBAN) bei SEPA-Lastschrift</li><li>PayPal-Kontodaten bei PayPal-Zahlung</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Zweck der Datenverarbeitung</h2>
          <p>Ihre Daten werden ausschließlich zur Abwicklung Ihrer Mitgliedschaft, Spende oder Anfrage verwendet (Art. 6 Abs. 1 lit. b DSGVO).</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Weitergabe von Daten</h2>
          <p>Eine Weitergabe an Dritte erfolgt nur zur Vertragserfüllung (z.B. SEPA-Lastschrift) oder bei gesetzlicher Verpflichtung.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Speicherdauer</h2>
          <p>Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Ihre Rechte</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li><li>Berichtigung (Art. 16 DSGVO)</li><li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung (Art. 18 DSGVO)</li><li>Datenübertragbarkeit (Art. 20 DSGVO)</li><li>Widerspruch (Art. 21 DSGVO)</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Cookies und Analyse</h2>
          <p>Diese Website verwendet ausschließlich technisch notwendige Cookies. Analyse-Tools werden nur mit Ihrer Einwilligung eingesetzt.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. PayPal</h2>
          <p>Wenn Sie über PayPal bezahlen, gelten die <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-sva-gold underline hover:text-sva-gold-light">Datenschutzbestimmungen von PayPal</a>.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Beschwerderecht</h2>
          <p>Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA).</p>
        </section>
      </div>
    </div>
  );
}
