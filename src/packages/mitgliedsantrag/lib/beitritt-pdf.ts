import { neuesDokument } from "@/lib/pdf";
import { mitgliedsbeitrag, verein } from "@/lib/verein";
import { protokollSeite, unterschrift, type Kontext } from "./protokoll-pdf";

export async function erzeugeBeitrittPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const { doc, font, bold, s } = await neuesDokument("Beitrittserklärung");
  s.text(`Hiermit erkläre ich meinen Beitritt zum ${verein.name} und erkenne die Vereinssatzung an.`);
  s.abstand(10);
  s.feld("Mitgliedschaft", `${mitgliedsbeitrag} € pro Jahr`);
  s.feld("Name", `${d.vorname} ${d.nachname}`);
  s.feld("Anschrift", `${d.strasse}, ${d.plz} ${d.ort}`);
  s.feld("E-Mail", d.email);
  if (d.geburtsdatum) s.feld("Geburtsdatum", new Date(d.geburtsdatum).toLocaleDateString("de-DE"));
  s.feld("Zahlung", `per SEPA-Lastschrift, Mandatsreferenz ${k.antrag.mandatsreferenz}`);
  s.abstand(14);
  await unterschrift(doc, s, k, "Unterschrift Mitglied bzw. Erziehungsberechtigte/r");
  protokollSeite(doc, font, bold, k);
  return doc.save();
}
