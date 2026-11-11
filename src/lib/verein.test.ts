import { describe, expect, test } from "bun:test";
import { steuerbeguenstigung } from "./verein";

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
