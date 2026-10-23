import "server-only";
import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Antrag, Protokoll } from "@/lib/antrag";
import { formatIban } from "@/lib/schemas";
import { mandatstext, mitgliedschaften, verein } from "@/lib/verein";

const A4: [number, number] = [595.28, 841.89];
const RAND = 56;
const BREITE = A4[0] - 2 * RAND;

export function formatZeit(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "medium" });
}

// Prüfsumme über Antragsdaten und Unterschrift. Steht im PDF und belegt, dass beides
// zusammengehört und nachträglich nicht verändert wurde.
export function pruefsumme(antrag: Antrag, unterschriftPng: Uint8Array): string {
  return createHash("sha256").update(JSON.stringify(antrag)).update(unterschriftPng).digest("hex");
}

class Schreiber {
  y = A4[1] - RAND;
  constructor(public page: PDFPage, private font: PDFFont, private bold: PDFFont) {}

  text(s: string, opts: { size?: number; bold?: boolean; grau?: boolean } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    for (const zeile of umbrechen(s, font, size, BREITE)) {
      this.page.drawText(zeile, { x: RAND, y: this.y - size, size, font, color: opts.grau ? rgb(0.4, 0.4, 0.4) : rgb(0, 0, 0) });
      this.y -= size * 1.4;
    }
  }

  feld(label: string, wert: string) {
    this.page.drawText(label, { x: RAND, y: this.y - 10, size: 10, font: this.font, color: rgb(0.4, 0.4, 0.4) });
    for (const zeile of umbrechen(wert, this.bold, 10, BREITE - 150)) {
      this.page.drawText(zeile, { x: RAND + 150, y: this.y - 10, size: 10, font: this.bold });
      this.y -= 14;
    }
  }

  abstand(px: number) {
    this.y -= px;
  }

  linie() {
    this.page.drawLine({ start: { x: RAND, y: this.y }, end: { x: A4[0] - RAND, y: this.y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    this.y -= 12;
  }
}

function umbrechen(text: string, font: PDFFont, size: number, max: number): string[] {
  const zeilen: string[] = [];
  let zeile = "";
  for (const wort of text.split(/\s+/)) {
    const test = zeile ? `${zeile} ${wort}` : wort;
    if (font.widthOfTextAtSize(test, size) > max && zeile) {
      zeilen.push(zeile);
      zeile = wort;
    } else {
      zeile = test;
    }
  }
  if (zeile) zeilen.push(zeile);
  return zeilen;
}

type Kontext = { antrag: Antrag; unterschriftPng: Uint8Array; protokoll: Protokoll };

async function neuesDokument(titel: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(titel);
  doc.setAuthor(verein.name);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = new Schreiber(doc.addPage(A4), font, bold);
  s.text(verein.name, { size: 9, grau: true });
  s.text(`${verein.strasse}, ${verein.plzOrt}`, { size: 9, grau: true });
  s.abstand(16);
  s.text(titel, { size: 20, bold: true });
  s.abstand(8);
  return { doc, font, bold, s };
}

async function unterschrift(doc: PDFDocument, s: Schreiber, { antrag, unterschriftPng, protokoll }: Kontext, name: string) {
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
  s.text(`${name}, elektronisch unterschrieben am ${formatZeit(protokoll.unterschrieben.zeit)}`, { size: 8, grau: true });
}

function protokollSeite(doc: PDFDocument, font: PDFFont, bold: PDFFont, { antrag, unterschriftPng, protokoll }: Kontext) {
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

export async function erzeugeBeitrittPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const art = mitgliedschaften[d.memberType];
  const { doc, font, bold, s } = await neuesDokument("Beitrittserklärung");
  s.text(`Hiermit erkläre ich meinen Beitritt zum ${verein.name} und erkenne die Vereinssatzung an.`);
  s.abstand(10);
  s.feld("Mitgliedschaft", `${art.label}, ${art.beitrag} € pro Jahr`);
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

export async function erzeugeMandatPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const art = mitgliedschaften[d.memberType];
  const { doc, font, bold, s } = await neuesDokument("SEPA-Lastschriftmandat");
  s.feld("Zahlungsempfänger", `${verein.name}, ${verein.strasse}, ${verein.plzOrt}`);
  s.feld("Gläubiger-ID", verein.glaeubigerId);
  s.feld("Mandatsreferenz", k.antrag.mandatsreferenz);
  s.feld("Zahlungsart", "Wiederkehrende Zahlung");
  s.feld("Verwendung", `Mitgliedsbeitrag ${d.vorname} ${d.nachname}, ${art.beitrag} € pro Jahr`);
  s.abstand(8);
  s.text(mandatstext());
  s.abstand(4);
  s.text(`Der Jahresbeitrag wird jeweils zum ${verein.einzugstermin} eingezogen (fällt dieser Tag nicht auf einen Bankarbeitstag, am folgenden Bankarbeitstag).`);
  s.abstand(10);
  s.feld("Kontoinhaber", d.kontoinhaber);
  s.feld("IBAN", formatIban(d.iban));
  s.abstand(4);
  await unterschrift(doc, s, k, `Unterschrift Kontoinhaber/in (${d.kontoinhaber})`);
  protokollSeite(doc, font, bold, k);
  return doc.save();
}
