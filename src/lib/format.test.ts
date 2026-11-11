import { describe, expect, test } from "bun:test";
import { seitWann } from "./format";

const JETZT = new Date("2026-11-24T10:00:00.000Z");
const vor = (tage: number) => new Date(JETZT.getTime() - tage * 86_400_000).toISOString();

describe("seitWann", () => {
  test("Tage", () => {
    expect(seitWann(vor(0.2), JETZT)).toBe("seit heute");
    expect(seitWann(vor(1), JETZT)).toBe("seit gestern");
    expect(seitWann(vor(5), JETZT)).toBe("seit 5 Tagen");
    expect(seitWann(vor(13), JETZT)).toBe("seit 13 Tagen");
  });

  test("Wochen ab 14 Tagen", () => {
    expect(seitWann(vor(14), JETZT)).toBe("seit 2 Wochen");
    expect(seitWann(vor(23), JETZT)).toBe("seit 3 Wochen");
  });

  test("Monate ab 8 Wochen", () => {
    expect(seitWann(vor(56), JETZT)).toBe("seit 2 Monaten");
    expect(seitWann(vor(200), JETZT)).toBe("seit 6 Monaten");
  });

  test("Jahre ab 2 Jahren", () => {
    expect(seitWann(vor(400), JETZT)).toBe("seit 13 Monaten");
    expect(seitWann(vor(800), JETZT)).toBe("seit 2 Jahren");
  });
});
