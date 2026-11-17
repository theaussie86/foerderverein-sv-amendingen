import { describe, expect, test } from "bun:test";
import { jahrUndBetrag, oeffentlicheBildUrl } from "../anzeige";

describe("jahrUndBetrag", () => {
  test("Jahr und Betrag mit Punkt", () => {
    expect(jahrUndBetrag({ jahr: 2026, betrag: 1000 })).toBe("2026 · 1.000 €");
  });
  test("nur, was gesetzt ist", () => {
    expect(jahrUndBetrag({ jahr: 2025, betrag: null })).toBe("2025");
    expect(jahrUndBetrag({ jahr: null, betrag: 450 })).toBe("450 €");
    expect(jahrUndBetrag({ jahr: null, betrag: null })).toBe("");
  });
});

describe("oeffentlicheBildUrl", () => {
  test("Dateiname im Pfad, Verkleinerung als Parameter", () => {
    expect(oeffentlicheBildUrl({ id: "abc", bild: "schuhe_x1y2.jpg" }, "kachel")).toBe(
      "/foerderprojekte/abc/bild/schuhe_x1y2.jpg",
    );
    expect(oeffentlicheBildUrl({ id: "abc", bild: "a b.png" }, "quadrat")).toBe(
      "/foerderprojekte/abc/bild/a%20b.png?groesse=quadrat",
    );
  });
});
