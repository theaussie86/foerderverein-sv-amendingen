import { describe, expect, test } from "bun:test";
import { antragSchema } from "./antrag";
import { pruefsumme } from "./pdf";
import { UNTERSCHRIFT_PREFIX } from "./schemas";
import { seal, unseal } from "./token";

// Goldtest für die Prüfsumme des Mitgliedsantrags. Sie steht im PDF und belegt, dass Antragsdaten
// und Unterschrift zusammengehören. Die Werte unten wurden mit dem Code vor dem Umbau zum Paket
// mitgliedsantrag erzeugt und dürfen sich nie ändern. Schlägt der Test fehl, ist die Prüfsumme
// alter Anträge nicht mehr nachvollziehbar: Code zurückdrehen, nicht die Goldwerte anpassen.

// 1x1-PNG, so wie es aus dem Unterschriftsfeld als Data-URL kommt.
const UNTERSCHRIFT =
  UNTERSCHRIFT_PREFIX +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// Die Bytes werden so dekodiert wie in unterschreiben().
const png = Buffer.from(UNTERSCHRIFT.slice(UNTERSCHRIFT_PREFIX.length), "base64");

// Felder absichtlich nicht in Schema-Reihenfolge: Das Schema legt die Reihenfolge fest, nicht die Eingabe.
const eingabe = {
  eingereicht: { ip: "203.0.113.7", zeit: "2026-11-10T09:15:00.000Z" },
  daten: {
    iban: "DE89370400440532013000",
    kontoinhaber: "Jürgen Größer",
    geburtsdatum: "2010-05-17",
    email: "juergen@example.org",
    ort: "Mindelheim",
    plz: "87719",
    strasse: "Hauptstraße 1",
    nachname: "Größer",
    vorname: "Jürgen",
  },
  mandatsreferenz: "FV-3F2A9C1B",
  id: "3f2a9c1b-7d4e-4a6b-9c8d-1e2f3a4b5c6d",
};

// Unabhängig nachgerechnet: SHA-256 über das JSON in Schema-Reihenfolge
// (id, mandatsreferenz, daten{vorname … iban}, eingereicht{zeit, ip}) als UTF-8, gefolgt von den PNG-Bytes.
const GOLD_MIT_GEBURTSDATUM = "6369956c5c4bc1a456fabdd6ba32589a49aacd36ff1c61acf07892c925641063";
const GOLD_OHNE_GEBURTSDATUM = "9685106b6cd7472f10877f27e822f7224f3e50a9e50473769faf15fba39b032a";

describe("Prüfsumme (Goldtest)", () => {
  test("bleibt für einen festen Antrag und ein festes PNG gleich", () => {
    expect(pruefsumme(antragSchema.parse(eingabe), png)).toBe(GOLD_MIT_GEBURTSDATUM);
  });

  test("bleibt ohne Geburtsdatum gleich", () => {
    const { geburtsdatum: _g, ...ohne } = eingabe.daten;
    expect(pruefsumme(antragSchema.parse({ ...eingabe, daten: ohne }), png)).toBe(GOLD_OHNE_GEBURTSDATUM);
  });

  test("überlebt den Weg durch den Unterschriftslink", () => {
    const antrag = unseal(seal(antragSchema.parse(eingabe), 60), antragSchema);
    expect(antrag).not.toBeNull();
    if (antrag) expect(pruefsumme(antrag, png)).toBe(GOLD_MIT_GEBURTSDATUM);
  });
});
