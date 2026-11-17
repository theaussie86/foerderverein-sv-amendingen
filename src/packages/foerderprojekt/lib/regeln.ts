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

// Neue Reihenfolge der Startseite nach einem Klick. Pfeile an den Rändern ändern nichts.
export function umordnen(startseite: Foerderprojekt[], id: string, aktion: "hoch" | "runter" | "entfernen") {
  const i = startseite.findIndex((p) => p.id === id);
  if (i < 0) return startseite;
  if (aktion === "entfernen") return startseite.filter((p) => p.id !== id);
  const j = aktion === "hoch" ? i - 1 : i + 1;
  if (j < 0 || j >= startseite.length) return startseite;
  const neu = [...startseite];
  [neu[i], neu[j]] = [neu[j], neu[i]];
  return neu;
}

export function daten(p: Foerderprojekt): Foerderprojektdaten {
  return { titel: p.titel, beschreibung: p.beschreibung, jahr: p.jahr, betrag: p.betrag, startseite: p.startseite };
}
