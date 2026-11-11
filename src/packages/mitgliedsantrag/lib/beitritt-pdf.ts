import { formatIban } from "@/lib/schemas";
import { mitgliedsbeitrag, verein } from "@/lib/verein";
import { protokollSeite } from "./protokoll-pdf";
import { Vordruck, type Kontext } from "./vordruck";

// Aufbau und Wortlaut nach der Papiervorlage des Vereins (Beitrittserklärung.doc, #16).
// Das Einwilligungsblatt nach § 33 BDSG alter Fassung ist durch Datenschutzhinweise nach Art. 13 DSGVO ersetzt.
export async function erzeugeBeitrittPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const v = await Vordruck.neu("Beitrittserklärung");

  v.text("Beitrittserklärung", { size: 22, bold: true });
  v.abstand(12);
  v.text("Hiermit erklärt", { size: 11 });
  v.abstand(2);
  v.linienfeld("Name*:", d.nachname);
  v.linienfeld("Vorname*:", d.vorname);
  v.linienfeld("PLZ*:", d.plz);
  v.linienfeld("Wohnort*:", d.ort);
  v.linienfeld("Straße/HS-Nr.*:", d.strasse);
  v.linienfeld("Geb.-Datum:", d.geburtsdatum ? new Date(d.geburtsdatum).toLocaleDateString("de-DE") : "");
  v.linienfeld("Tel. privat:", d.telefon ?? "");
  v.linienfeld("Handy:", d.handy ?? "");
  v.linienfeld("E-Mail-Adresse*:", d.email);
  v.abstand(10);
  v.linienfeld("Eintrittsdatum:", "", { hinweis: "Wird durch den Verein ausgefüllt!" });
  v.abstand(8);
  v.text("*Pflichtfelder", { size: 8.5, grau: true });
  v.abstand(10);

  v.text(`ihren / seinen Eintritt beim „${verein.name}“.`, { size: 11 });
  v.abstand(8);
  v.text(
    `Die Satzung des „${verein.name}“ in der derzeit gültigen Fassung sowie den derzeitigen ` +
      `Mindestjahresbeitrag in Höhe von ${mitgliedsbeitrag},- Euro erkenne ich an.`,
    { size: 11 },
  );
  v.abstand(6);
  v.text(
    `Der Beitrag wird per SEPA-Lastschrift vom Konto ${formatIban(d.iban)} eingezogen, ` +
      `Mandatsreferenz ${k.antrag.mandatsreferenz} (siehe SEPA-Lastschriftmandat).`,
    { size: 9, grau: true },
  );
  v.abstand(26);
  await v.unterschrift(k, "Unterschrift");

  datenschutzhinweise(v);
  protokollSeite(v, k);
  return v.doc.save();
}

// Informationspflicht nach Art. 13 DSGVO. Keine Einwilligung: Rechtsgrundlage ist die Mitgliedschaft.
function datenschutzhinweise(v: Vordruck) {
  v.neueSeite();
  v.text("Datenschutzhinweise zur Mitgliedschaft", { size: 16, bold: true });
  v.text("Informationen nach Art. 13 Datenschutz-Grundverordnung (DSGVO)", { size: 9, grau: true });

  const abschnitt = (titel: string) => {
    v.abstand(10);
    v.text(titel, { size: 10.5, bold: true });
    v.abstand(1);
  };

  abschnitt("Verantwortlicher");
  v.text(`${verein.name}, ${verein.strasse}, ${verein.plzOrt}, E-Mail: ${verein.email}`, { size: 9.5 });

  abschnitt("Welche Daten wir verarbeiten");
  v.text(
    "Zum Zweck der Mitgliederverwaltung und -betreuung werden folgende Daten der Mitglieder gespeichert und verarbeitet:",
    { size: 9.5 },
  );
  for (const p of [
    "Name, Vorname",
    "Adresse",
    "Geburtsdatum (freiwillige Angabe)",
    "Telefonnummer und Handynummer (freiwillige Angaben)",
    "E-Mail-Adresse",
    "Bankdaten und Kontoinhaber für Beitragszahlungen per Lastschrift",
    "Eintrittsdatum",
    "bei Online-Anträgen das Protokoll der elektronischen Unterschrift (Zeitpunkte, IP-Adressen, Browserkennung)",
  ]) {
    v.punkt(p);
  }

  abschnitt("Zweck und Rechtsgrundlage");
  v.text(
    "Wir verarbeiten die Daten, um die Mitgliedschaft durchzuführen und den Mitgliedsbeitrag per SEPA-Lastschrift " +
      "einzuziehen (Art. 6 Abs. 1 lit. b DSGVO). Das Protokoll der elektronischen Unterschrift dient als Nachweis des " +
      "Lastschriftmandats (Art. 6 Abs. 1 lit. c und f DSGVO). Ohne die Pflichtangaben ist eine Mitgliedschaft nicht " +
      "möglich. Freiwillige Angaben nutzen wir nur zur Kontaktaufnahme im Rahmen der Mitgliedschaft.",
    { size: 9.5 },
  );

  abschnitt("Empfänger");
  v.text(
    "Mitgliederverzeichnisse werden nur an Vorstandsmitglieder und sonstige Mitglieder ausgehändigt, die im Verein " +
      "eine besondere Funktion ausüben, welche die Kenntnis der Mitgliederdaten erfordert. Für den Lastschrifteinzug " +
      "erhält die Bank des Vereins die nötigen Bankdaten. E-Mails versenden wir über einen Auftragsverarbeiter. " +
      "Die Daten werden durch geeignete technische und organisatorische Maßnahmen vor der Kenntnisnahme Dritter geschützt.",
    { size: 9.5 },
  );

  abschnitt("Speicherdauer");
  v.text(
    "Wir speichern die Daten für die Dauer der Mitgliedschaft. Danach löschen wir sie, soweit keine gesetzlichen " +
      "Aufbewahrungspflichten entgegenstehen. Das Lastschriftmandat bewahren wir mindestens 14 Monate nach der letzten " +
      "Lastschrift auf.",
    { size: 9.5 },
  );

  abschnitt("Ihre Rechte");
  v.text(
    "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit " +
      "und Widerspruch (Art. 15 bis 21 DSGVO). Freiwillige Angaben löschen wir auf Wunsch jederzeit. Sie können sich " +
      "bei einer Aufsichtsbehörde beschweren, zuständig ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA).",
    { size: 9.5 },
  );
  v.abstand(10);
  v.text("Die vollständige Datenschutzerklärung steht unter foerderverein-sv-amendingen.de/datenschutz.", {
    size: 9,
    grau: true,
  });
}
