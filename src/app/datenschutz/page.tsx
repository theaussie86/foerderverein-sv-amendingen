import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung des Förderverein SV Amendingen e.V.",
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Datenschutzerklärung
      </h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-sva-gray-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            1. Verantwortlicher
          </h2>
          <p>
            Förderverein SV Amendingen e.V.
            <br />
            Musterstraße 1
            <br />
            87700 Memmingen / Amendingen
            <br />
            E-Mail: foerderverein@sv-amendingen.de
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            2. Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>
            Wir erheben personenbezogene Daten nur, wenn Sie uns diese
            freiwillig mitteilen, z.B. im Rahmen einer Beitrittserklärung,
            Spende oder Kontaktanfrage. Dies können sein:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Name und Anschrift</li>
            <li>E-Mail-Adresse</li>
            <li>Geburtsdatum</li>
            <li>Bankverbindung (IBAN) bei SEPA-Lastschrift</li>
            <li>PayPal-Kontodaten bei PayPal-Zahlung</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            3. Zweck der Datenverarbeitung
          </h2>
          <p>
            Ihre Daten werden ausschließlich zur Abwicklung Ihrer
            Mitgliedschaft, Spende oder Anfrage verwendet (Art. 6 Abs. 1 lit. b
            DSGVO). Bankdaten werden nur zum Einzug von Mitgliedsbeiträgen bzw.
            Spenden genutzt.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            4. Weitergabe von Daten
          </h2>
          <p>
            Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies zur
            Vertragserfüllung erforderlich ist (z.B. an das Kreditinstitut zur
            Durchführung der SEPA-Lastschrift) oder eine gesetzliche
            Verpflichtung besteht.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            5. Speicherdauer
          </h2>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Zweck der
            Speicherung entfällt und keine gesetzlichen Aufbewahrungspflichten
            entgegenstehen. Mitgliedsdaten werden nach Beendigung der
            Mitgliedschaft unter Beachtung steuerlicher Aufbewahrungsfristen
            gelöscht.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            6. Ihre Rechte
          </h2>
          <p>Sie haben das Recht auf:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            7. Cookies und Analyse
          </h2>
          <p>
            Diese Website verwendet ausschließlich technisch notwendige Cookies.
            Analyse-Tools werden nur mit Ihrer ausdrücklichen Einwilligung
            eingesetzt.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            8. PayPal
          </h2>
          <p>
            Wenn Sie über PayPal spenden oder bezahlen, werden Ihre Daten von
            der PayPal (Europe) S.à r.l. et Cie, S.C.A. verarbeitet. Es gelten
            die{" "}
            <a
              href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sva-blue underline hover:text-sva-blue-light"
            >
              Datenschutzbestimmungen von PayPal
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-sva-gray-900">
            9. Beschwerderecht
          </h2>
          <p>
            Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu
            beschweren: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA).
          </p>
        </section>
      </div>
    </div>
  );
}
