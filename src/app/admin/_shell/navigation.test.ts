import { describe, expect, test } from "bun:test";
import { aktiverBereich } from "./navigation";

describe("aktiverBereich", () => {
  test("ordnet Unterseiten ihrem Bereich zu", () => {
    expect(aktiverBereich("/admin")).toBe("antraege");
    expect(aktiverBereich("/admin/antraege/abc")).toBe("antraege");
    expect(aktiverBereich("/admin/mitglieder/neu")).toBe("mitglieder");
    expect(aktiverBereich("/admin/spenden/xyz")).toBe("spenden");
    expect(aktiverBereich("/admin/foerderprojekte")).toBe("foerderprojekte");
  });
});
