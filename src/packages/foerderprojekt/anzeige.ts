// Entry Point ohne "server-only": Typen und Grenzen für Seiten, Client-Komponenten und Schemas.
import type { Bildgroesse } from "./lib/typen";

export { BILD_MAX_BYTES, BILD_TYPEN, STARTSEITE_AKTIONEN, STARTSEITE_PLAETZE } from "./lib/typen";
export type { Bildgroesse, Foerderprojekt, Foerderprojektdaten, Liste, Startseitenaktion } from "./lib/typen";

// „2026 · 1.000 €“, leer ohne Jahr und Betrag.
export function jahrUndBetrag(p: { jahr: number | null; betrag: number | null }): string {
  return [p.jahr, p.betrag === null ? null : `${p.betrag.toLocaleString("de-DE")} €`].filter(Boolean).join(" · ");
}

// Öffentliche Bild-Route der Startseite. Der Dateiname ändert sich mit jedem neuen Bild, die URL also auch.
// Ohne Parameter die große Verkleinerung.
export function oeffentlicheBildUrl(p: { id: string; bild: string }, groesse: Bildgroesse): string {
  const pfad = `/foerderprojekte/${encodeURIComponent(p.id)}/bild/${encodeURIComponent(p.bild)}`;
  return groesse === "kachel" ? pfad : `${pfad}?groesse=${groesse}`;
}
