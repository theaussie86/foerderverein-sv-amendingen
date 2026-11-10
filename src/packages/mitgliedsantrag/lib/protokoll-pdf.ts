import type { PDFDocument, PDFFont } from "pdf-lib";
import { A4, RAND, Schreiber } from "@/lib/pdf";
import type { Antrag, Protokoll } from "./antrag";
import { pruefsumme } from "./pruefsumme";

// Bausteine, die Beitrittserklärung und SEPA-Mandat gemeinsam haben: Unterschriftsblock und Protokollseite.

export type Kontext = { antrag: Antrag; unterschriftPng: Uint8Array; protokoll: Protokoll };

export function formatZeit(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "medium" });
}

export async function unterschrift(
  doc: PDFDocument,
  s: Schreiber,
  { antrag, unterschriftPng, protokoll }: Kontext,
  name: string,
) {
  const datum = new Date(protokoll.unterschrieben.zeit).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
  s.feld("Ort, Datum", `${antrag.daten.ort}, ${datum}`);
  s.abstand(10);
  const bild = await doc.embedPng(unterschriftPng);
  const breite = 200;
  const hoehe = (bild.height / bild.width) * breite;
  s.abstand(hoehe);
  s.page.drawImage(bild, { x: RAND, y: s.y, width: breite, height: hoehe });
  s.abstand(4);
  s.linie();
  s.text(`${name}, elektronisch unterschrieben am ${formatZeit(protokoll.unterschrieben.zeit)}`, {
    size: 8,
    grau: true,
  });
}

export function protokollSeite(
  doc: PDFDocument,
  font: PDFFont,
  bold: PDFFont,
  { antrag, unterschriftPng, protokoll }: Kontext,
) {
  const d = antrag.daten;
  const p = new Schreiber(doc.addPage(A4), font, bold);
  p.text("Protokoll der elektronischen Unterschrift", { size: 16, bold: true });
  p.abstand(8);
  p.feld("Antrags-ID", antrag.id);
  p.feld("Unterzeichner/in", `${d.kontoinhaber} (${d.email})`);
  p.abstand(10);
  p.text("Ablauf", { size: 12, bold: true });
  p.abstand(4);
  p.feld("Antrag eingereicht", `${formatZeit(protokoll.eingereicht.zeit)}, IP ${protokoll.eingereicht.ip}`);
  p.feld("Bestätigungslink", `per E-Mail an ${d.email} versandt`);
  p.feld("Link geöffnet", `${formatZeit(protokoll.geoeffnet.zeit)}, IP ${protokoll.geoeffnet.ip}`);
  p.feld("Unterschrieben", `${formatZeit(protokoll.unterschrieben.zeit)}, IP ${protokoll.unterschrieben.ip}`);
  p.feld("Browser", protokoll.unterschrieben.userAgent);
  p.abstand(10);
  p.feld("Prüfsumme (SHA-256)", pruefsumme(antrag, unterschriftPng));
  p.abstand(14);
  p.text(
    "Die Unterschrift wurde auf der Website des Vereins nach Bestätigung der E-Mail-Adresse über einen persönlichen, " +
      "zeitlich begrenzten Link geleistet. Beitrittserklärung und SEPA-Lastschriftmandat wurden mit derselben Unterschrift " +
      "unterzeichnet. Die Prüfsumme bezieht sich auf die Antragsdaten und das Unterschriftsbild.",
    { size: 9, grau: true },
  );
}
