import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { z } from "zod";
import { seal, unseal } from "./token";

const schema = z.object({ name: z.string(), betrag: z.number() });

afterEach(() => setSystemTime());

describe("Token", () => {
  test("öffnet versiegelte Daten wieder", () => {
    const daten = { name: "Erika", betrag: 20 };
    expect(unseal(seal(daten, 60), schema)).toEqual(daten);
  });

  test("Inhalt mit falscher Form liefert null", () => {
    expect(unseal(seal({ name: "Erika" }, 60), schema)).toBeNull();
  });

  test("abgelaufener Token liefert null", () => {
    const token = seal({ name: "Erika", betrag: 20 }, 60);
    setSystemTime(new Date(Date.now() + 61_000));
    expect(unseal(token, schema)).toBeNull();
  });

  test("manipulierter Token liefert null", () => {
    const token = seal({ name: "Erika", betrag: 20 }, 60);
    const kaputt = token.slice(0, -2) + (token.endsWith("A") ? "BB" : "AA");
    expect(unseal(kaputt, schema)).toBeNull();
    expect(unseal("kein-token", schema)).toBeNull();
  });

  test("zu kurzer Schlüssel wird abgelehnt", () => {
    const vorher = process.env.ANTRAG_SECRET;
    process.env.ANTRAG_SECRET = "zu-kurz";
    try {
      expect(() => seal({}, 60)).toThrow("ANTRAG_SECRET");
    } finally {
      process.env.ANTRAG_SECRET = vorher;
    }
  });
});
