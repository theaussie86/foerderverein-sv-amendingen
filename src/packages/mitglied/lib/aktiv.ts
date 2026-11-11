import type { Mitgliedsdaten } from "./typen";

// Läuft die Mitgliedschaft am Tag `heute` (YYYY-MM-DD)? Ein Austritt zum Jahresende wird vorab
// mit dem 31.12. eingetragen, das Mitglied zählt bis dahin mit.
export function istAktiv(m: Pick<Mitgliedsdaten, "endeDatum">, heute: string): boolean {
  return !m.endeDatum || m.endeDatum >= heute;
}
