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
            <li>Bankverbindung (IBAN) bei SEPA-Lastschrift</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Zweck der Datenverarbeitung</h2>
          <p>Ihre Daten werden ausschließlich zur Abwicklung Ihrer Mitgliedschaft, Spende oder Anfrage verwendet (Art. 6 Abs. 1 lit. b DSGVO).</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Online-Mitgliedsantrag und elektronische Unterschrift</h2>
          <p>Wenn Sie online Mitglied werden, verarbeiten wir die Angaben aus dem Formular (Name, Anschrift, E-Mail-Adresse, Geburtsdatum, Kontoinhaber, IBAN) zur Durchführung der Mitgliedschaft und zum Einzug des Beitrags per SEPA-Lastschrift (Art. 6 Abs. 1 lit. b DSGVO).</p>
          <p className="mt-2">Zur Bestätigung erhalten Sie einen persönlichen Link per E-Mail. Ihre Angaben sind in diesem Link verschlüsselt enthalten und werden bis zur Unterschrift nicht auf unserem Server gespeichert. Beim Absenden, beim Öffnen des Links und bei der Unterschrift protokollieren wir Zeitpunkt, IP-Adresse und Browserkennung. Dieses Protokoll dient als Nachweis für die Erteilung des Lastschriftmandats (Art. 6 Abs. 1 lit. c und f DSGVO).</p>
          <p className="mt-2">Die unterschriebene Beitrittserklärung wird als PDF an den Vorstand und an Sie gesendet und für die Dauer der Mitgliedschaft aufbewahrt, als Mandatsnachweis mindestens 14 Monate nach der letzten Lastschrift.</p>
          <p className="mt-2">Für den Versand der E-Mails nutzen wir den Dienst Resend (Resend, Inc., USA) als Auftragsverarbeiter. Die Übermittlung erfolgt auf Grundlage der EU-Standardvertragsklauseln.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Weitergabe von Daten</h2>
          <p>Eine Weitergabe an Dritte erfolgt nur zur Vertragserfüllung (z.B. SEPA-Lastschrift) oder bei gesetzlicher Verpflichtung.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Speicherdauer</h2>
          <p>Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Ihre Rechte</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li><li>Berichtigung (Art. 16 DSGVO)</li><li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung (Art. 18 DSGVO)</li><li>Datenübertragbarkeit (Art. 20 DSGVO)</li><li>Widerspruch (Art. 21 DSGVO)</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Cookies und Analyse</h2>
          <p>Diese Website verwendet ausschließlich technisch notwendige Cookies. Analyse-Tools werden nur mit Ihrer Einwilligung eingesetzt.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Beschwerderecht</h2>
          <p>Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA).</p>
        </section>
      </div>
    </div>
  );
}
