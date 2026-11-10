import { describe, expect, test } from "bun:test";

import { gruss } from "../index";

describe("gruss", () => {
  test("normalisiert Leerzeichen im Namen", () => {
    expect(gruss("  Manu   Rothermel ")).toBe("Hallo, Manu Rothermel!");
  });

  test("leerer Name ergibt neutralen Gruß", () => {
    expect(gruss("   ")).toBe("Hallo!");
  });
});
