import { A4, RAND } from "@/lib/pdf";
import { formatIban } from "@/lib/schemas";
import { mandatstext, mitgliedsbeitrag, verein } from "@/lib/verein";
import { protokollSeite } from "./protokoll-pdf";
import { Vordruck, type Kontext } from "./vordruck";

// Aufbau nach der Papiervorlage des Vereins (Beitrittserklärung.doc, Seite 2, #16).
// Kreditinstitut und BIC fragen wir nicht ab: Für SEPA-Lastschriften im Inland reicht die IBAN.
export async function erzeugeMandatPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const v = await Vordruck.neu("SEPA-Basis-Lastschriftmandat");
  const breite = A4[0] - 2 * RAND;

  v.text("SEPA-Basis-Lastschriftmandat", { size: 16, bold: true });
  v.text("für SEPA-Basis-Lastschriftverfahren", { size: 9, grau: true });
  v.abstand(12);

  const links = breite * 0.62;
  v.kasten(RAND, links, 70, "Name und Anschrift des Zahlungsempfängers (Gläubiger)", [
    verein.name,
    verein.strasse,
    verein.plzOrt,
  ]);
  v.kasten(RAND + links + 10, breite - links - 10, 70, "Zahlungsart", []);
  v.kreuz(RAND + links + 20, v.y - 24, ["Wiederkehrende Zahlungen/", "Recurrent Payments"]);
  v.abstand(80);

  const halb = (breite - 10) / 2;
  v.kasten(RAND, halb, 42, "Gläubiger-Identifikationsnummer", [verein.glaeubigerId]);
  v.kasten(RAND + halb + 10, halb, 42, "Mandatsreferenz", [k.antrag.mandatsreferenz]);
  v.abstand(60);

  v.text("SEPA-Basis-Lastschriftmandat", { size: 12, bold: true });
  v.abstand(4);
  v.text(mandatstext(), { size: 10 });
  v.abstand(4);
  v.text(
    `Eingezogen wird der Mitgliedsbeitrag von ${mitgliedsbeitrag} € pro Jahr, jeweils zum ${verein.einzugstermin} ` +
      `(fällt dieser Tag nicht auf einen Bankarbeitstag, am folgenden Bankarbeitstag).`,
    { size: 9, grau: true },
  );
  v.abstand(14);

  // Die Anschrift kennen wir nur, wenn das Mitglied selbst Kontoinhaber ist.
  const selbst = d.kontoinhaber.trim().toLowerCase() === `${d.vorname} ${d.nachname}`.trim().toLowerCase();
  v.text("Kontoinhaber/Zahlungspflichtiger:", { size: 10.5, bold: true });
  v.linienfeld("Name:", d.kontoinhaber, { labelBreite: 90 });
  v.linienfeld("Str./HS-Nr.:", selbst ? d.strasse : "", { labelBreite: 90 });
  v.linienfeld("PLZ/Ort:", selbst ? `${d.plz} ${d.ort}` : "", { labelBreite: 90 });
  v.linienfeld("IBAN:", formatIban(d.iban), { labelBreite: 90 });
  v.abstand(30);
  await v.unterschrift(k, "Unterschrift Kontoinhaber/in");

  protokollSeite(v, k);
  return v.doc.save();
}
