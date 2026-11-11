import { describe, expect, test } from "bun:test";
import { mitglieder, naechsteMandatsreferenz } from "../index";
import { daten, FakeAblage } from "./fakes";

function aufbau(jetzt = "2026-11-11T10:00:00.000Z") {
  const ablage = new FakeAblage();
  return { ablage, m: mitglieder({ ablage, jetzt: () => new Date(jetzt) }) };
}

describe("anlegen", () => {
  test("speichert einheitliche Schreibweise", async () => {
    const { ablage, m } = aufbau();
    const ergebnis = await m.anlegen(
      daten({ vorname: "  Max ", email: " Max@Example.DE", iban: "de89 3704 0044 0532 0130 00", bic: "cobade ffxxx" }),
    );
    expect(ergebnis.ok).toBe(true);
    expect(ablage.mitglieder[0]).toMatchObject({
      vorname: "Max",
      email: "max@example.de",
      iban: "DE89370400440532013000",
      bic: "COBADEFFXXX",
    });
  });

  test("lehnt eine vergebene Mandatsreferenz ab", async () => {
    const { m } = aufbau();
    await m.anlegen(daten({ mandatsreferenz: "7" }));
    expect(await m.anlegen(daten({ mandatsreferenz: "7", vorname: "Erika" }))).toEqual({
      ok: false,
      grund: "mandatsreferenz-vergeben",
    });
  });

  test("ein Online-Mitgliedsantrag wird nur einmal Mitglied", async () => {
    const { m } = aufbau();
    await m.anlegen(daten({ mandatsreferenz: "FV-1", antragId: "a1" }));
    expect(await m.anlegen(daten({ mandatsreferenz: "FV-2", antragId: "a1" }))).toEqual({
      ok: false,
      grund: "antrag-vergeben",
    });
  });

  test("ohne Ende-Datum gibt es keinen Grund", async () => {
    const { ablage, m } = aufbau();
    await m.anlegen(daten({ endeGrund: "austritt" }));
    expect(ablage.mitglieder[0]?.endeGrund).toBe("");
  });
});

describe("aendern", () => {
  test("darf die eigene Mandatsreferenz behalten", async () => {
    const { m } = aufbau();
    const neu = await m.anlegen(daten({ mandatsreferenz: "3" }));
    if (!neu.ok) throw new Error("nicht angelegt");
    expect(await m.aendern(neu.id, daten({ mandatsreferenz: "3", ort: "Amendingen" }))).toEqual({
      ok: true,
      id: neu.id,
    });
  });

  test("meldet unbekannte Mitglieder", async () => {
    const { m } = aufbau();
    expect(await m.aendern("gibts-nicht", daten())).toEqual({ ok: false, grund: "nicht-gefunden" });
  });
});

describe("Mandatsreferenz für neue Mitglieder", () => {
  test("nächste Zahl nach der höchsten, Online-Referenzen zählen nicht", () => {
    expect(naechsteMandatsreferenz(["1", "102", "17", "FV-3F2A9C1B"])).toBe("103");
  });

  test("ohne Mitglieder beginnt sie bei 1", async () => {
    const { m } = aufbau();
    expect(await m.neueMandatsreferenz()).toBe("1");
  });
});

describe("anzahlAktiv", () => {
  test("zählt Mitglieder mit Ende in der Zukunft mit, beendete nicht", async () => {
    const { m } = aufbau("2026-11-11T10:00:00.000Z");
    await m.anlegen(daten({ mandatsreferenz: "1" }));
    await m.anlegen(daten({ mandatsreferenz: "2", endeDatum: "2026-12-31", endeGrund: "austritt" }));
    await m.anlegen(daten({ mandatsreferenz: "3", endeDatum: "2025-12-31", endeGrund: "austritt" }));
    expect(await m.anzahlAktiv()).toBe(2);
  });

  test("der Tag richtet sich nach deutscher Zeit", async () => {
    // 31.12. 23:30 Uhr UTC ist in Berlin schon der 1.1., das Mitglied zählt nicht mehr.
    const { m } = aufbau("2026-12-31T23:30:00.000Z");
    await m.anlegen(daten({ endeDatum: "2026-12-31", endeGrund: "austritt" }));
    expect(await m.anzahlAktiv()).toBe(0);
  });
});
