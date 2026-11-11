import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { A4, RAND, umbrechen } from "@/lib/pdf";
import { verein } from "@/lib/verein";
import type { Antrag, Protokoll } from "./antrag";

export type Kontext = { antrag: Antrag; unterschriftPng: Uint8Array; protokoll: Protokoll };

// Bausteine im Stil der Papiervorlage des Vereins (Beitrittserklärung.doc, #16): Linienfelder,
// beschriftete Kästen, Unterschrift in zwei Spalten und die Fußzeile mit dem Vorstand.

const BREITE = A4[0] - 2 * RAND;
const GRAU = rgb(0.4, 0.4, 0.4);
const LINIE = rgb(0.55, 0.55, 0.55);
const SCHWARZ = rgb(0, 0, 0);
// Unterhalb davon liegt die Fußzeile.
const FUSS_OBEN = RAND + 30;

export class Vordruck {
  y = A4[1] - RAND;
  page: PDFPage;

  private constructor(
    public doc: PDFDocument,
    public font: PDFFont,
    public bold: PDFFont,
  ) {
    this.page = doc.addPage(A4);
    this.fusszeile();
  }

  static async neu(titel: string): Promise<Vordruck> {
    const doc = await PDFDocument.create();
    doc.setTitle(titel);
    doc.setAuthor(verein.name);
    return new Vordruck(
      doc,
      await doc.embedFont(StandardFonts.Helvetica),
      await doc.embedFont(StandardFonts.HelveticaBold),
    );
  }

  neueSeite() {
    this.page = this.doc.addPage(A4);
    this.y = A4[1] - RAND;
    this.fusszeile();
  }

  abstand(px: number) {
    this.y -= px;
  }

  // Fließtext mit Umbruch. `einzug` rückt alle Zeilen ein, z. B. für Aufzählungen.
  text(s: string, opts: { size?: number; bold?: boolean; grau?: boolean; einzug?: number } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    const einzug = opts.einzug ?? 0;
    for (const zeile of umbrechen(s, font, size, BREITE - einzug)) {
      this.schreib(zeile, RAND + einzug, this.y - size, size, font, opts.grau);
      this.y -= size * 1.45;
    }
  }

  // Aufzählungspunkt mit hängendem Einzug.
  punkt(s: string, size = 9.5) {
    this.schreib("-", RAND + 4, this.y - size, size, this.font);
    this.text(s, { size, einzug: 16 });
  }

  // Bezeichnung grau, Wert fett daneben, mit Umbruch. Für Listen ohne Linien wie das Protokoll.
  feld(label: string, wert: string) {
    this.schreib(label, RAND, this.y - 10, 10, this.font, true);
    for (const zeile of umbrechen(wert, this.bold, 10, BREITE - 150)) {
      this.schreib(zeile, RAND + 150, this.y - 10, 10, this.bold);
      this.y -= 14;
    }
  }

  // Bezeichnung links, Wert fett auf einer Linie bis zum rechten Rand, wie die Felder der Papiervorlage.
  linienfeld(label: string, wert: string, opts: { labelBreite?: number; hinweis?: string } = {}) {
    const x = RAND + (opts.labelBreite ?? 110);
    const ende = opts.hinweis ? x + 150 : A4[0] - RAND;
    this.y -= 22;
    this.schreib(label, RAND, this.y + 4, 10, this.font);
    if (wert) this.schreib(wert, x + 2, this.y + 4, 10.5, this.bold);
    this.strich(x, ende, this.y);
    if (opts.hinweis) this.schreib(opts.hinweis, ende + 10, this.y + 4, 8.5, this.font, true);
  }

  // Kasten mit kleiner grauer Überschrift und Inhaltszeilen. Zeichnet ab der aktuellen Höhe, verschiebt y nicht.
  kasten(x: number, breite: number, hoehe: number, titel: string, zeilen: string[]) {
    const oben = this.y;
    this.page.drawRectangle({
      x,
      y: oben - hoehe,
      width: breite,
      height: hoehe,
      borderColor: LINIE,
      borderWidth: 0.75,
    });
    this.schreib(titel, x + 6, oben - 11, 7.5, this.font, true);
    zeilen.forEach((z, i) => this.schreib(z, x + 6, oben - 27 - i * 13, 10.5, this.bold));
  }

  // Angekreuztes Kästchen mit Beschriftung, z. B. für die Zahlungsart.
  kreuz(x: number, y: number, zeilen: string[]) {
    const g = 10;
    this.page.drawRectangle({ x, y: y - g, width: g, height: g, borderColor: SCHWARZ, borderWidth: 0.75 });
    this.page.drawLine({ start: { x: x + 2, y: y - g + 2 }, end: { x: x + g - 2, y: y - 2 }, thickness: 1 });
    this.page.drawLine({ start: { x: x + 2, y: y - 2 }, end: { x: x + g - 2, y: y - g + 2 }, thickness: 1 });
    zeilen.forEach((z, i) => this.schreib(z, x + g + 6, y - 9 - i * 12, 9.5, this.font));
  }

  // Unterschrift in zwei Spalten wie auf Papier: links Ort und Datum, rechts das Unterschriftsbild.
  async unterschrift({ antrag, unterschriftPng, protokoll }: Kontext, wer: string) {
    const spalte = (BREITE - 40) / 2;
    const rechts = RAND + spalte + 40;
    const bild = await this.doc.embedPng(unterschriftPng);
    const hoehe = Math.min(64, (bild.height / bild.width) * spalte);
    const breite = (bild.width / bild.height) * hoehe;

    this.y -= hoehe + 4;
    const datum = new Date(protokoll.unterschrieben.zeit).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
    this.schreib(`${antrag.daten.ort}, ${datum}`, RAND + 2, this.y + 4, 10.5, this.bold);
    this.page.drawImage(bild, { x: rechts, y: this.y + 2, width: breite, height: hoehe });
    this.strich(RAND, RAND + spalte, this.y);
    this.strich(rechts, rechts + spalte, this.y);
    this.y -= 12;
    this.schreib("Ort, Datum", RAND, this.y, 8.5, this.font, true);
    this.schreib(wer, rechts, this.y, 8.5, this.font, true);
    this.y -= 11;
    this.schreib(
      `elektronisch unterschrieben am ${formatZeit(protokoll.unterschrieben.zeit)}`,
      rechts,
      this.y,
      7.5,
      this.font,
      true,
    );
  }

  // Wie auf der Papiervorlage: Vorsitz und Stellvertretung, dazu die Vereinsanschrift statt der Privatanschriften.
  private fusszeile() {
    this.strich(RAND, A4[0] - RAND, FUSS_OBEN);
    const zeilen = [
      `Vorsitzender: ${verein.vorsitz} · stellvertr. Vorsitzender: ${verein.stellvertretung}`,
      `${verein.name} · ${verein.strasse} · ${verein.plzOrt}`,
      `${verein.registergericht}, ${verein.registernummer} · ${verein.email}`,
    ];
    zeilen.forEach((z, i) => this.schreib(z, RAND, FUSS_OBEN - 12 - i * 10, 7.5, this.font, true));
  }

  private strich(von: number, bis: number, y: number) {
    this.page.drawLine({ start: { x: von, y }, end: { x: bis, y }, thickness: 0.6, color: LINIE });
  }

  private schreib(s: string, x: number, y: number, size: number, font: PDFFont, grau = false) {
    this.page.drawText(s, { x, y, size, font, color: grau ? GRAU : SCHWARZ });
  }
}

export function formatZeit(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "medium" });
}
