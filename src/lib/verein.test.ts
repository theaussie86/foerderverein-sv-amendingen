import { describe, expect, test } from "bun:test";
import { glaeubigerIdGueltig, paypalLink, steuerbeguenstigung, verein } from "./verein";

const zweck = "Förderung des Sports";

describe("steuerbeguenstigung", () => {
  test("ohne Bescheid nur der Zweck, keine Steuernummer", () => {
    const satz = steuerbeguenstigung("FV", { zweck, bescheid: null });
    expect(satz).toBe("Der FV verfolgt steuerbegünstigte Zwecke: Förderung des Sports.");
  });

  test("mit Bescheid Finanzamt, Steuernummer, Datum und Zeitraum", () => {
    const satz = steuerbeguenstigung("FV", {
      zweck,
      bescheid: {
        finanzamt: "Memmingen",
        steuernummer: "123/456/78901",
        datum: "01.02.2026",
        veranlagungszeitraum: "2024",
      },
    });
    expect(satz).toContain("Finanzamtes Memmingen, StNr. 123/456/78901, vom 01.02.2026");
    expect(satz).toContain("Veranlagungszeitraum 2024");
  });
});

describe("glaeubigerIdGueltig", () => {
  test("Testnummer der Bundesbank ist gültig", () => {
    expect(glaeubigerIdGueltig("DE98ZZZ09999999999")).toBe(true);
  });

  test("falsche Prüfziffer ist ungültig", () => {
    expect(glaeubigerIdGueltig("DE00ZZZ00000000000")).toBe(false);
    expect(glaeubigerIdGueltig("DE97ZZZ09999999999")).toBe(false);
  });

  test("die Gläubiger-ID des Fördervereins ist gültig", () => {
    expect(glaeubigerIdGueltig(verein.glaeubigerId)).toBe(true);
  });
});

describe("paypalLink", () => {
  test("ohne Betrag nur der paypal.me-Link", () => {
    expect(paypalLink()).toBe("https://paypal.me/foerdervereinsva");
    expect(paypalLink(0)).toBe("https://paypal.me/foerdervereinsva");
  });

  test("ganze Beträge ohne Nachkommastellen", () => {
    expect(paypalLink(25)).toBe("https://paypal.me/foerdervereinsva/25EUR");
  });

  test("krumme Beträge mit Punkt und zwei Stellen", () => {
    expect(paypalLink(12.5)).toBe("https://paypal.me/foerdervereinsva/12.50EUR");
  });
});
