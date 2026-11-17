import { BILD_MAX_BYTES, BILD_TYPEN, type Foerderprojekt, type Foerderprojektdaten } from "./typen";

export function bildGueltig(bild: File): boolean {
  return bild.size > 0 && bild.size <= BILD_MAX_BYTES && BILD_TYPEN.some((t) => t === bild.type);
}

export function normalisieren(d: Foerderprojektdaten): Foerderprojektdaten {
  return { ...d, titel: d.titel.trim().replace(/\s+/g, " "), beschreibung: d.beschreibung.trim() };
}

// Startseite in der gepflegten Reihenfolge, darunter die übrigen, neueste zuerst.
export function sortieren(alle: Foerderprojekt[]) {
  return {
    startseite: alle.filter((p) => p.startseite).sort((a, b) => a.reihenfolge - b.reihenfolge),
    weitere: alle.filter((p) => !p.startseite).sort((a, b) => b.angelegt.localeCompare(a.angelegt)),
  };
}

// Neue Startseiten-Förderprojekte hängen hinten an.
export function naechsterPlatz(startseite: Foerderprojekt[]): number {
  return Math.max(0, ...startseite.map((p) => p.reihenfolge)) + 1;
}
