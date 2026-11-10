import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { verein } from "@/lib/verein";

export const A4: [number, number] = [595.28, 841.89];
export const RAND = 56;
const BREITE = A4[0] - 2 * RAND;

// Allgemeine Bausteine für PDFs des Vereins. Mitgliedsantrag und Spendenbeleg bauen darauf auf.
export class Schreiber {
  y = A4[1] - RAND;
  constructor(
    public page: PDFPage,
    private font: PDFFont,
    private bold: PDFFont,
  ) {}

  text(s: string, opts: { size?: number; bold?: boolean; grau?: boolean } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    for (const zeile of umbrechen(s, font, size, BREITE)) {
      this.page.drawText(zeile, {
        x: RAND,
        y: this.y - size,
        size,
        font,
        color: opts.grau ? rgb(0.4, 0.4, 0.4) : rgb(0, 0, 0),
      });
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
    this.page.drawLine({
      start: { x: RAND, y: this.y },
      end: { x: A4[0] - RAND, y: this.y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
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

export async function neuesDokument(titel: string) {
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

export type Spende = {
  belegNr: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  betrag: number;
  datum: string;
};

// Beleg für den vereinfachten Zuwendungsnachweis bis 300 € (§ 50 Abs. 4 Satz 1 Nr. 2 Buchst. b EStDV).
// Er bestätigt keinen Geldeingang, den belegt der Kontoauszug des Spenders. Trotzdem geht er erst raus,
// wenn der Vorstand die Überweisung auf dem Vereinskonto gesehen hat (/admin/spenden).
export async function erzeugeSpendenbelegPdf(spende: Spende): Promise<Uint8Array> {
  const st = verein.steuer;
  const { doc, s } = await neuesDokument("Spendenbeleg");
  s.text("Beleg für den vereinfachten Zuwendungsnachweis nach § 50 Abs. 4 EStDV", { bold: true });
  s.abstand(10);
  s.feld("Beleg-Nr.", spende.belegNr);
  s.feld("Spender/in", spende.name);
  s.feld("Anschrift", `${spende.strasse}, ${spende.plz} ${spende.ort}`);
  s.feld("Betrag", spende.betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
  s.feld("Tag der Spende", new Date(spende.datum).toLocaleDateString("de-DE", { timeZone: "UTC" }));
  s.feld("Empfänger", `${verein.bank.kontoinhaber}, IBAN ${verein.bank.iban}`);
  s.feld("Art der Zuwendung", "Geldzuwendung (Spende), kein Mitgliedsbeitrag");
  s.abstand(14);
  s.text(
    `Der ${verein.name} ist wegen ${st.zweck} nach dem Freistellungsbescheid des Finanzamtes ${st.finanzamt}, ` +
      `StNr. ${st.steuernummer}, vom ${st.bescheidDatum} für den letzten Veranlagungszeitraum ${st.veranlagungszeitraum} ` +
      `nach § 5 Abs. 1 Nr. 9 KStG von der Körperschaftsteuer und nach § 3 Nr. 6 GewStG von der Gewerbesteuer befreit.`,
  );
  s.abstand(6);
  s.text(`Die Zuwendung wird ausschließlich für diesen Zweck verwendet.`);
  s.abstand(14);
  s.linie();
  s.text(
    "Hinweis: Dieser Beleg gilt nur zusammen mit dem Kontoauszug oder der Buchungsbestätigung der Bank, aus dem " +
      "Name und Konto von Auftraggeber und Empfänger, Betrag und Buchungstag hervorgehen. Er ist keine " +
      "Zuwendungsbestätigung nach amtlichem Muster und wird maschinell erstellt, deshalb ohne Unterschrift.",
    { size: 9, grau: true },
  );
  return doc.save();
}
