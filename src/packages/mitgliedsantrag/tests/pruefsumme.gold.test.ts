import { describe, expect, test } from "bun:test";
import { seal, unseal } from "@/lib/token";
import { mitgliedsantraege } from "../index";
import { fakeUmgebung } from "./fakes";

// Goldtest für die Prüfsumme des Mitgliedsantrags. Sie steht im PDF und belegt, dass Antragsdaten
// und Unterschrift zusammengehören. Die Werte unten wurden mit dem Code vor dem Umbau zum Paket
// mitgliedsantrag erzeugt (Commit 3bd6f1f) und dürfen sich nie ändern. Schlägt der Test fehl, ist die
// Prüfsumme alter Anträge nicht mehr nachvollziehbar: Code zurückdrehen, nicht die Goldwerte anpassen.

// 1x1-PNG, so wie es aus dem Unterschriftsfeld als Data-URL kommt.
const UNTERSCHRIFT =
  "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// Inhalt des Unterschriftslinks. Felder absichtlich nicht in Schema-Reihenfolge:
// Das Schema legt die Reihenfolge fest, nicht der Token.
const linkInhalt = {
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

const herkunft = { ip: "198.51.100.2", userAgent: "Testbrowser/1.0" };

// Unterschreibt mit dem echten Siegel (AES-GCM aus src/lib/token.ts) und gibt die gespeicherte Prüfsumme zurück.
async function unterschreibe(inhalt: unknown) {
  const { umgebung, ablage, postausgang } = fakeUmgebung();
  const antraege = mitgliedsantraege({ ...umgebung, siegel: { versiegeln: seal, entsiegeln: unseal } });
  const token = seal(inhalt, 60);
  const geoeffnet = antraege.oeffnen(token, herkunft);
  expect(geoeffnet).not.toBeNull();
  const ergebnis = await antraege.unterschreiben(
    { token, sitzungToken: geoeffnet?.sitzungToken ?? "", unterschrift: UNTERSCHRIFT },
    herkunft,
  );
  expect(ergebnis).toEqual({ ok: true });
  return { pruefsumme: ablage.gespeichert[0]?.pruefsumme, vorstandMail: postausgang.gesendet[0]?.text };
}

describe("Prüfsumme (Goldtest)", () => {
  test("bleibt für einen festen Antrag und ein festes PNG gleich", async () => {
    const { pruefsumme, vorstandMail } = await unterschreibe(linkInhalt);
    expect(pruefsumme).toBe(GOLD_MIT_GEBURTSDATUM);
    expect(vorstandMail).toContain(`Prüfsumme: ${GOLD_MIT_GEBURTSDATUM}`);
  });

  test("bleibt ohne Geburtsdatum gleich", async () => {
    const { geburtsdatum: _g, ...ohne } = linkInhalt.daten;
    const { pruefsumme } = await unterschreibe({ ...linkInhalt, daten: ohne });
    expect(pruefsumme).toBe(GOLD_OHNE_GEBURTSDATUM);
  });
});
