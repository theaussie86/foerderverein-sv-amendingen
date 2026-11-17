import { ENDE_GRUND_LABEL, type Filter, type Mitglied } from "./typen";

// Spalten des CSV-Exports in fester Reihenfolge, gruppiert wie im Ausklappfeld. Notiz, interne IDs
// und der Verweis auf den Mitgliedsantrag kommen nie in den Export.
export const CSV_GRUPPEN = [
  {
    titel: "Person",
    spalten: [
      { feld: "mandatsreferenz", titel: "Mandatsreferenz" },
      { feld: "vorname", titel: "Vorname", immer: true },
      { feld: "nachname", titel: "Nachname", immer: true },
    ],
  },
  {
    titel: "Anschrift",
    spalten: [
      { feld: "strasse", titel: "Straße" },
      { feld: "plz", titel: "PLZ" },
      { feld: "ort", titel: "Ort" },
    ],
  },
  { titel: "Kontakt", spalten: [{ feld: "email", titel: "E-Mail" }] },
  {
    titel: "Bank und Mandat",
    spalten: [
      { feld: "kontoinhaber", titel: "Kontoinhaber" },
      { feld: "iban", titel: "IBAN" },
      { feld: "bic", titel: "BIC" },
      { feld: "bank", titel: "Bank" },
      { feld: "mandatDatum", titel: "Mandatsdatum" },
    ],
  },
  {
    titel: "Mitgliedschaft",
    spalten: [
      { feld: "eintrittsdatum", titel: "Eintrittsdatum" },
      { feld: "endeDatum", titel: "Ende-Datum" },
      { feld: "endeGrund", titel: "Ende-Grund" },
    ],
  },
] as const satisfies readonly {
  titel: string;
  spalten: readonly { feld: keyof Mitglied; titel: string; immer?: boolean }[];
}[];

type Spalte = (typeof CSV_GRUPPEN)[number]["spalten"][number];
export type CsvSpalte = Spalte["feld"];

const ALLE_SPALTEN: readonly Spalte[] = CSV_GRUPPEN.flatMap((g): readonly Spalte[] => g.spalten);
export const CSV_SPALTEN: readonly CsvSpalte[] = ALLE_SPALTEN.map((s) => s.feld);

export function istCsvSpalte(wert: string): wert is CsvSpalte {
  return CSV_SPALTEN.some((s) => s === wert);
}

function istImmer(s: Spalte): boolean {
  return "immer" in s && s.immer;
}

// YYYY-MM-DD als TT.MM.JJJJ, ohne Umweg über Date und Zeitzonen.
function tag(iso: string): string {
  const [j, m, t] = iso.split("-");
  return j && m && t ? `${t}.${m}.${j}` : "";
}

function wert(m: Mitglied, feld: CsvSpalte): string {
  switch (feld) {
    case "kontoinhaber":
      return m.kontoinhaber || `${m.vorname} ${m.nachname}`;
    case "iban":
      return m.iban.replace(/\s/g, "");
    case "mandatDatum":
    case "eintrittsdatum":
    case "endeDatum":
      return tag(m[feld]);
    case "endeGrund":
      return m.endeGrund ? ENDE_GRUND_LABEL[m.endeGrund] : "";
    default:
      return m[feld];
  }
}

// Schutz gegen Formel-Injektion in Excel: ein Apostroph davor macht die Zelle zu Text.
function zelle(text: string): string {
  const sicher = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[;"\r\n]/.test(sicher) ? `"${sicher.replace(/"/g, '""')}"` : sicher;
}

// Semikolon, UTF-8 mit BOM, Zeilenende CRLF. Spalten immer in der festen Reihenfolge,
// Vorname und Nachname sind immer dabei.
export function mitgliederCsv(mitglieder: readonly Mitglied[], auswahl: readonly CsvSpalte[]): string {
  const spalten = ALLE_SPALTEN.filter((s) => istImmer(s) || auswahl.includes(s.feld));
  const zeilen = [
    spalten.map((s) => zelle(s.titel)),
    ...mitglieder.map((m) => spalten.map((s) => zelle(wert(m, s.feld)))),
  ];
  return "﻿" + zeilen.map((z) => z.join(";")).join("\r\n") + "\r\n";
}

// mitglieder-2026-11-17.csv, mit Filter mitglieder-aktiv-… oder mitglieder-beendet-….
export function csvDateiname(filter: Filter | undefined, heute: string): string {
  return `mitglieder-${filter ? `${filter}-` : ""}${heute}.csv`;
}
