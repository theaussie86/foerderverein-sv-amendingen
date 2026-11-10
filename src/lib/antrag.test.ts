import { describe, expect, test } from "bun:test";
import { antragSchema } from "./antrag";

const antrag = {
  id: "a1",
  mandatsreferenz: "SVA-001",
  daten: {
    vorname: "Erika",
    nachname: "Mustermann",
    strasse: "Hauptstraße 1",
    plz: "87719",
    ort: "Mindelheim",
    email: "erika@example.org",
    geburtsdatum: "",
    kontoinhaber: "Erika Mustermann",
    iban: "DE89370400440532013000",
  },
  eingereicht: { zeit: "2026-11-10T10:00:00.000Z", ip: "127.0.0.1" },
};

describe("antragSchema", () => {
  test("akzeptiert den Antrag aus dem Unterschriftslink", () => {
    expect(antragSchema.parse(antrag)).toEqual(antrag);
  });

  // Die Prüfsumme hängt an JSON.stringify, also an der Reihenfolge der Felder.
  test("behält die Feldreihenfolge bei", () => {
    expect(JSON.stringify(antragSchema.parse(antrag))).toBe(JSON.stringify(antrag));
  });

  test("lehnt fehlende Antragsdaten ab", () => {
    expect(antragSchema.safeParse({ ...antrag, daten: {} }).success).toBe(false);
  });
});
