import { describe, expect, test } from "bun:test";
import { auswerten, type Stammdaten } from "./auswerten";

const IBAN = "DE89 3704 0044 0532 0130 00";

function zeile(teil: Partial<Stammdaten["mitglieder"][number]> = {}): Stammdaten["mitglieder"][number] {
  return {
    nr: "1",
    mref: "1",
    nachname: "Muster",
    vorname: "Max",
    strasse: "Hauptstraße",
    hausnummer: "1",
    plz: "87700",
    ort: "Memmingen",
    iban: IBAN,
    bic: "COBADEFFXXX",
    bank: "Commerzbank",
    email: "",
    ...teil,
  };
}

function stammdaten(teil: Partial<Stammdaten> = {}): Stammdaten {
  return { mitglieder: [zeile()], emails: [], ereignisse: [], ...teil };
}

describe("auswerten", () => {
  test("übernimmt die Zeile mit Hausnummer in der Straße und normalisierter IBAN", () => {
    const { mitglieder, hinweise } = auswerten(stammdaten(), []);
    expect(mitglieder[0]).toMatchObject({
      mandatsreferenz: "1",
      strasse: "Hauptstraße 1",
      plz: "87700",
      iban: "DE89370400440532013000",
      kontoinhaber: "",
      eintrittsdatum: "",
    });
    expect(hinweise).toEqual([]);
  });

  test("ergänzt die E-Mail aus dem Blatt mit den Adressen, Schreibweise egal", () => {
    const { mitglieder } = auswerten(
      stammdaten({
        mitglieder: [zeile({ vorname: "Max " })],
        emails: [{ nachname: "muster", vorname: "max", email: "Max@Example.de" }],
      }),
      [],
    );
    expect(mitglieder[0]?.email).toBe("max@example.de");
  });

  test("Eintrittsdatum aus dem letzten Beitritt, wenn der Name passt", () => {
    const { mitglieder } = auswerten(
      stammdaten({
        ereignisse: [
          { datum: "2015-07-02", name: "Alt, Anna", mref: "1", art: "Beitritt" },
          { datum: "2018-06-02", name: "Alt, Anna", mref: "1", art: "Kündigung" },
          { datum: "2025-05-01", name: "Muster, Max", mref: "1", art: "Beitritt" },
        ],
      }),
      [],
    );
    expect(mitglieder[0]?.eintrittsdatum).toBe("2025-05-01");
  });

  test("kein Eintrittsdatum, wenn die Mandatsreferenz zuletzt jemand anderem gehörte", () => {
    const { mitglieder, hinweise } = auswerten(
      stammdaten({ ereignisse: [{ datum: "2017-01-16", name: "Alt, Anna", mref: "1", art: "Kündigung" }] }),
      [],
    );
    expect(mitglieder[0]?.eintrittsdatum).toBe("");
    expect(hinweise).toEqual([]);
  });

  test("meldet ein Mitglied, dessen letzter Eintrag eine Kündigung ist", () => {
    const { hinweise } = auswerten(
      stammdaten({ ereignisse: [{ datum: "2024-04-07", name: "Muster, Max", mref: "1", art: "Kündigung" }] }),
      [],
    );
    expect(hinweise).toEqual(["Nr. 1: letzter Eintrag im Verlauf ist „Kündigung“, steht aber in der Mitgliederliste."]);
  });

  test("meldet ungültige IBAN, lückenhafte Anschrift und Hausnummern als Bruch", () => {
    const { mitglieder, hinweise } = auswerten(
      stammdaten({
        mitglieder: [
          zeile({ nr: "1", mref: "1", iban: "DE00 1234" }),
          zeile({ nr: "2", mref: "2", strasse: "", hausnummer: "", plz: "" }),
          zeile({ nr: "3", mref: "3", hausnummer: "17 1/2" }),
        ],
      }),
      [],
    );
    expect(hinweise).toEqual([
      "Nr. 1: IBAN ungültig (Prüfsumme oder Länge).",
      "Nr. 2: Anschrift unvollständig.",
      "Nr. 3: Hausnummer „17 1/2“ prüfen (stand als Bruch in Excel).",
    ]);
    expect(mitglieder[1]).toMatchObject({ strasse: "", plz: "" });
  });

  test("ergänzt die führende Null der PLZ", () => {
    const { mitglieder } = auswerten(stammdaten({ mitglieder: [zeile({ plz: "1067" })] }), []);
    expect(mitglieder[0]?.plz).toBe("01067");
  });

  test("verknüpft den Online-Mitgliedsantrag über IBAN und Nachname", () => {
    const antraege = [{ id: "a1", nachname: "Muster", iban: "DE89370400440532013000", mandatsreferenz: "FV-3F2A9C1B" }];
    const { mitglieder, hinweise } = auswerten(stammdaten(), antraege);
    expect(mitglieder[0]?.antragId).toBe("a1");
    expect(hinweise).toEqual(["Nr. 1: Online-Antrag mit Mandatsreferenz FV-3F2A9C1B, in Excel 1. Übernommen: 1."]);
  });

  test("meldet doppelte Mandatsreferenzen", () => {
    const { hinweise } = auswerten(stammdaten({ mitglieder: [zeile(), zeile({ nr: "2", vorname: "Erika" })] }), []);
    expect(hinweise).toEqual(["Mandatsreferenz 1 ist doppelt vergeben."]);
  });
});
