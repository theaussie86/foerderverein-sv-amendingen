import { describe, expect, test } from "bun:test";
import { belegArt } from "./verein";

describe("belegArt", () => {
  test("bis einschließlich 300 € gibt es den vereinfachten Spendenbeleg", () => {
    expect(belegArt(50)).toBe("vereinfacht");
    expect(belegArt(300)).toBe("vereinfacht");
  });

  test("darüber braucht es eine Zuwendungsbestätigung", () => {
    expect(belegArt(300.01)).toBe("zuwendungsbestaetigung");
    expect(belegArt(500)).toBe("zuwendungsbestaetigung");
  });
});
