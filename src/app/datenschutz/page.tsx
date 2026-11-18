import type { Metadata } from "next";
import { verein } from "@/lib/verein";

export const metadata: Metadata = { title: "Datenschutz", description: `Datenschutzerklärung des ${verein.name}` };

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white uppercase sm:text-4xl">Datenschutzerklärung</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-sva-gray-200">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Verantwortlicher</h2>
          <p>
            {verein.name}
            <br />
            {verein.strasse}
            <br />
            {verein.plzOrt}
            <br />
            E-Mail: {verein.email}
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            2. Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Name und Anschrift</li>
            <li>E-Mail-Adresse</li>
            <li>Geburtsdatum (freiwillig)</li>
            <li>Telefon- und Handynummer (freiwillig)</li>
            <li>Bankverbindung (IBAN) bei SEPA-Lastschrift</li>
            <li>Betrag, Tag und Zahlungsweg einer Spende, wenn Sie einen Spendenbeleg anfordern</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Zweck der Datenverarbeitung</h2>
          <p>
            Ihre Daten werden ausschließlich zur Abwicklung Ihrer Mitgliedschaft, Spende oder Anfrage verwendet (Art. 6
            Abs. 1 lit. b DSGVO).
          </p>
          <p className="mt-2">
            Nachrichten über das Kontaktformular leiten wir per E-Mail an das Postfach des Vereins weiter (Versand über
            Resend, siehe Abschnitt 5). Wir speichern sie nicht auf der Website und nutzen sie nur zur Beantwortung
            Ihrer Anfrage.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Hosting und Server-Logs</h2>
          <p>
            Website und Datenbank laufen auf einem Server von Hostinger (Hostinger International Ltd., Larnaka, Zypern).
            Hostinger verarbeitet die dort gespeicherten Daten als Auftragsverarbeiter nach Art. 28 DSGVO und nur nach
            unseren Weisungen.
          </p>
          <p className="mt-2">
            Beim Aufruf der Website verarbeitet der Server technisch notwendige Angaben: IP-Adresse, Zeitpunkt,
            aufgerufene Seite und Browserkennung. Wir brauchen sie, um die Seite auszuliefern, Fehler zu finden und
            Angriffe abzuwehren (Art. 6 Abs. 1 lit. f DSGVO). Die Server-Logs werden nur kurz gespeichert und
            automatisch überschrieben. Wir werten sie nicht zu Statistikzwecken aus und führen sie nicht mit anderen
            Daten zusammen.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            5. Online-Mitgliedsantrag und elektronische Unterschrift
          </h2>
          <p>
            Wenn Sie online Mitglied werden, verarbeiten wir die Angaben aus dem Formular (Name, Anschrift,
            E-Mail-Adresse, Kontoinhaber, IBAN, freiwillig Geburtsdatum, Telefon und Handy) zur Durchführung der
            Mitgliedschaft und zum Einzug des Beitrags per SEPA-Lastschrift (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
          <p className="mt-2">
            Zur Bestätigung erhalten Sie einen persönlichen Link per E-Mail. Ihre Angaben sind in diesem Link
            verschlüsselt enthalten und werden bis zur Unterschrift nicht auf unserem Server gespeichert. Beim Absenden,
            beim Öffnen des Links und bei der Unterschrift protokollieren wir Zeitpunkt, IP-Adresse und Browserkennung.
            Dieses Protokoll dient als Nachweis für die Erteilung des Lastschriftmandats (Art. 6 Abs. 1 lit. c und f
            DSGVO).
          </p>
          <p className="mt-2">
            Die unterschriebene Beitrittserklärung wird als PDF an den Vorstand und an Sie gesendet und für die Dauer
            der Mitgliedschaft aufbewahrt, als Mandatsnachweis mindestens 14 Monate nach der letzten Lastschrift.
          </p>
          <p className="mt-2">
            Für den Versand der E-Mails nutzen wir den Dienst Resend (Resend, Inc., USA) als Auftragsverarbeiter. Die
            E-Mails werden über Server in der EU (Irland) verarbeitet. Da Resend seinen Sitz in den USA hat, ist ein
            Zugriff aus den USA nicht auszuschließen. Die Übermittlung erfolgt auf Grundlage der
            EU-Standardvertragsklauseln.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Spenden und Spendenbelege</h2>
          <p>
            Wenn Sie einen Spendenbeleg anfordern, speichern wir Name, Anschrift, E-Mail-Adresse, Betrag, Tag und
            Zahlungsweg der Spende. Der Vorstand prüft damit den Geldeingang und stellt den Beleg aus. Rechtsgrundlage
            ist Ihre Anfrage (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
          <p className="mt-2">
            Der Verein muss eine Kopie jeder Zuwendungsbestätigung und die Unterlagen zur Spende aufbewahren (§ 50
            EStDV, § 147 AO). Diese Daten speichern wir deshalb für die Dauer der steuerlichen Aufbewahrungsfristen
            (Art. 6 Abs. 1 lit. c DSGVO) und löschen sie danach.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe an Dritte erfolgt nur zur Vertragserfüllung (z.B. SEPA-Lastschrift) oder bei gesetzlicher
            Verpflichtung.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt und keine gesetzlichen
            Aufbewahrungspflichten bestehen. Im Einzelnen:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Mitgliedsdaten: für die Dauer der Mitgliedschaft</li>
            <li>Lastschriftmandat: mindestens 14 Monate nach der letzten Lastschrift</li>
            <li>Spendenbelege und Unterlagen zur Spende: für die Dauer der steuerlichen Aufbewahrungsfristen</li>
            <li>Kontaktanfragen: bis die Anfrage erledigt ist</li>
            <li>Server-Logs: kurzzeitig, sie werden automatisch überschrieben</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Ihre Rechte</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-4 font-semibold text-white">Widerspruchsrecht</p>
          <p className="mt-1">
            Soweit wir Daten auf Grundlage berechtigter Interessen verarbeiten (Art. 6 Abs. 1 lit. f DSGVO), etwa
            Server-Logs und das Protokoll der elektronischen Unterschrift, können Sie dem jederzeit aus Gründen
            widersprechen, die sich aus Ihrer besonderen Situation ergeben. Wir verarbeiten die Daten dann nicht mehr,
            es sei denn, es gibt zwingende schutzwürdige Gründe oder sie dienen der Geltendmachung, Ausübung oder
            Verteidigung von Rechtsansprüchen.
          </p>
          <p className="mt-4 font-semibold text-white">Widerruf des SEPA-Lastschriftmandats</p>
          <p className="mt-1">
            Sie können das Lastschriftmandat jederzeit widerrufen, formlos per E-Mail an {verein.email} oder per Post an
            den Verein. Ab dann ziehen wir keine Beiträge mehr ein. Bereits eingezogene Lastschriften können Sie
            innerhalb von acht Wochen bei Ihrer Bank zurückgeben.
          </p>
          <p className="mt-2">Für alle Anliegen zu Ihren Daten genügt eine E-Mail an {verein.email}.</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">10. Cookies und Analyse</h2>
          <p>
            Diese Website setzt keine Analyse-, Tracking- oder Marketing-Dienste ein. Schriftarten und Videos werden von
            unserem eigenen Server ausgeliefert, es werden dabei keine Daten an Dritte übertragen.
          </p>
          <p className="mt-2">Gespeichert wird nur, was technisch notwendig ist (§ 25 Abs. 2 Nr. 2 TDDDG):</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <span className="font-mono text-xs">vorstand_token</span> (Cookie): hält die Anmeldung im
              Vorstandsbereich. Wird nur nach dem Login gesetzt und mit dem Logout oder dem Ablauf der Sitzung gelöscht.
            </li>
            <li>
              <span className="font-mono text-xs">sva_cookie_hinweis</span> (localStorage): merkt sich, dass Sie den
              Cookie-Hinweis gelesen haben. Bleibt gespeichert, bis Sie Ihre Browserdaten löschen.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">11. Beschwerderecht</h2>
          <p>Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA).</p>
        </section>
      </div>
    </div>
  );
}
