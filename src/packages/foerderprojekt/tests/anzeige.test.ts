import { describe, expect, test } from "bun:test";
import { jahrUndBetrag } from "../anzeige";

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
