import { describe, expect, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import { erzeugeSpendenbelegPdf } from "./pdf";

describe("Spendenbeleg-PDF", () => {
  test("erzeugt ein lesbares PDF, auch mit Umlauten", async () => {
    const bytes = await erzeugeSpendenbelegPdf({
      belegNr: "2026-001",
      name: "Jürgen Größer",
      strasse: "Hauptstraße 1",
      plz: "87719",
      ort: "Mindelheim",
      betrag: 150,
      datum: "2026-11-01",
    });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });
});
