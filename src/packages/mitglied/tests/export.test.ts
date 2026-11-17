import { describe, expect, test } from "bun:test";
import { CSV_SPALTEN, mitglieder, type CsvSpalte, type Mitgliedsdaten } from "../index";
import { daten, FakeAblage, FakeMitgliedsantraege } from "./fakes";

async function aufbau(liste: Partial<Mitgliedsdaten>[], jetzt = "2026-11-17T10:00:00.000Z") {
  const ablage = new FakeAblage();
  const m = mitglieder({ ablage, mitgliedsantraege: new FakeMitgliedsantraege(), jetzt: () => new Date(jetzt) });
  for (const [i, teil] of liste.entries()) await m.anlegen(daten({ mandatsreferenz: String(i + 1), ...teil }));
  return m;
}

function zeilen(inhalt: string): string[] {
  return inhalt.replace(/^﻿/, "").split("\r\n").slice(0, -1);
}

async function exportiere(
  liste: Partial<Mitgliedsdaten>[],
  spalten: readonly CsvSpalte[] = CSV_SPALTEN,
  suche: { suche: string; filter?: "aktiv" | "beendet" } = { suche: "" },
) {
  return (await aufbau(liste)).exportieren(suche, spalten);
}

describe("CSV-Export", () => {
  test("UTF-8 mit BOM, Semikolon, CRLF und alle Spalten in fester Reihenfolge", async () => {
    const { inhalt } = await exportiere([{}]);
    expect(inhalt.startsWith("﻿")).toBe(true);
    expect(zeilen(inhalt)[0]).toBe(
      "Mandatsreferenz;Vorname;Nachname;Straße;PLZ;Ort;E-Mail;Kontoinhaber;IBAN;BIC;Bank;Mandatsdatum;Eintrittsdatum;Ende-Datum;Ende-Grund",
    );
  });

  test("Reihenfolge der Auswahl spielt keine Rolle, Vorname und Nachname sind immer dabei", async () => {
    const { inhalt } = await exportiere([{ email: "max@example.de" }], ["email", "ort", "mandatsreferenz"]);
    expect(zeilen(inhalt)).toEqual([
      "Mandatsreferenz;Vorname;Nachname;Ort;E-Mail",
      "1;Max;Muster;Memmingen;max@example.de",
    ]);
  });

  test("ohne Auswahl bleiben Vorname und Nachname", async () => {
    const { inhalt } = await exportiere([{}], []);
    expect(zeilen(inhalt)).toEqual(["Vorname;Nachname", "Max;Muster"]);
  });

  test("Datum als TT.MM.JJJJ, IBAN ohne Leerzeichen, Ende-Grund als Wort", async () => {
    const { inhalt } = await exportiere(
      [
        {
          iban: "DE89 3704 0044 0532 0130 00",
          mandatDatum: "2020-03-01",
          eintrittsdatum: "2020-03-15",
          endeDatum: "2025-12-31",
          endeGrund: "ausschluss",
        },
      ],
      ["iban", "mandatDatum", "eintrittsdatum", "endeDatum", "endeGrund"],
    );
    expect(zeilen(inhalt)[1]).toBe("Max;Muster;DE89370400440532013000;01.03.2020;15.03.2020;31.12.2025;Ausschluss");
  });

  test("leere Datumsfelder und Ende-Grund bleiben leer", async () => {
    const { inhalt } = await exportiere([{}], ["eintrittsdatum", "endeDatum", "endeGrund"]);
    expect(zeilen(inhalt)[1]).toBe("Max;Muster;;;");
  });

  test("leerer Kontoinhaber wird Vorname Nachname", async () => {
    const { inhalt } = await exportiere(
      [{}, { nachname: "Beispiel", kontoinhaber: "Erika Beispiel" }],
      ["kontoinhaber"],
    );
    expect(zeilen(inhalt).slice(1)).toEqual(["Max;Beispiel;Erika Beispiel", "Max;Muster;Max Muster"]);
  });

  test("entschärft Formeln und setzt Sonderzeichen in Anführungszeichen", async () => {
    const { inhalt } = await exportiere(
      [{ vorname: "=SUMME(A1)", nachname: "+49", strasse: "-1", ort: "@x", bank: 'Bank; "Süd"' }],
      ["strasse", "ort", "bank"],
    );
    expect(zeilen(inhalt)[1]).toBe(`'=SUMME(A1);'+49;'-1;'@x;"Bank; ""Süd"""`);
  });

  test("Notiz und Mitgliedsantrag kommen nie in den Export", async () => {
    const { inhalt } = await exportiere([{ notiz: "geheim", antragId: "antrag-xyz" }]);
    expect(inhalt).not.toContain("geheim");
    expect(inhalt).not.toContain("antrag-xyz");
    expect(inhalt).not.toContain("m1");
  });

  test("exportiert genau die Treffer von Filter und Suche, sortiert nach Namen", async () => {
    const liste = [
      { vorname: "Max", nachname: "Muster" },
      { vorname: "Erika", nachname: "Muster", endeDatum: "2025-12-31", endeGrund: "austritt" as const },
      { vorname: "Anna", nachname: "Muster", endeDatum: "2026-12-31", endeGrund: "austritt" as const },
      { vorname: "Max", nachname: "Andere", ort: "Ulm" },
    ];
    const namen = (inhalt: string) => zeilen(inhalt).slice(1);
    expect(namen((await exportiere(liste, [])).inhalt)).toEqual([
      "Max;Andere",
      "Anna;Muster",
      "Erika;Muster",
      "Max;Muster",
    ]);
    expect(namen((await exportiere(liste, [], { suche: "", filter: "aktiv" })).inhalt)).toEqual([
      "Max;Andere",
      "Anna;Muster",
      "Max;Muster",
    ]);
    expect(namen((await exportiere(liste, [], { suche: "max muster", filter: "aktiv" })).inhalt)).toEqual([
      "Max;Muster",
    ]);
    expect(namen((await exportiere(liste, [], { suche: "", filter: "beendet" })).inhalt)).toEqual(["Erika;Muster"]);
  });
});

describe("Dateiname", () => {
  test("ohne Filter, aktiv und beendet, Tag in deutscher Zeit", async () => {
    const m = await aufbau([], "2026-11-17T23:30:00.000Z");
    expect((await m.exportieren({ suche: "egal" }, [])).dateiname).toBe("mitglieder-2026-11-18.csv");
    expect((await m.exportieren({ suche: "", filter: "aktiv" }, [])).dateiname).toBe("mitglieder-aktiv-2026-11-18.csv");
    expect((await m.exportieren({ suche: "", filter: "beendet" }, [])).dateiname).toBe(
      "mitglieder-beendet-2026-11-18.csv",
    );
  });
});
