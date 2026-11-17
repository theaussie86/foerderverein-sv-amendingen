// Entry Point ohne "server-only": Typen und Grenzen für Seiten, Client-Komponenten und Schemas.
export { BILD_MAX_BYTES, BILD_TYPEN, STARTSEITE_PLAETZE } from "./lib/typen";
export type { Foerderprojekt, Foerderprojektdaten, Liste } from "./lib/typen";

// „2026 · 1.000 €“, leer ohne Jahr und Betrag.
export function jahrUndBetrag(p: { jahr: number | null; betrag: number | null }): string {
  return [p.jahr, p.betrag === null ? null : `${p.betrag.toLocaleString("de-DE")} €`].filter(Boolean).join(" · ");
}
