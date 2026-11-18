// Begriff „Förderprojekt“ aus GLOSSARY.md. Titel und Beschreibung sind Pflicht, Jahr und Betrag optional.

// Höchstens so viele Förderprojekte stehen auf der Startseite.
export const STARTSEITE_PLAETZE = 4;

// Nur JPEG und PNG: kein SVG (Skript-Risiko), kein WebP (PocketBase verkleinert es zu größeren PNGs).
export const BILD_TYPEN = ["image/jpeg", "image/png"] as const;
export const BILD_MAX_BYTES = 5 * 1024 * 1024;

// Verkleinerungen, die PocketBase für das Bildfeld anbietet (Feld `thumbs` in der Migration).
export const BILD_GROESSEN = { kachel: "800x600", quadrat: "160x160" } as const;
export type Bildgroesse = keyof typeof BILD_GROESSEN;

// Was der Vorstand im Formular pflegt. Die Reihenfolge vergibt das Paket.
export type Foerderprojektdaten = {
  titel: string;
  beschreibung: string;
  jahr: number | null;
  // Ganze Euro.
  betrag: number | null;
  startseite: boolean;
};

export type Foerderprojekt = Foerderprojektdaten & {
  id: string;
  // Dateiname des Bildes in PocketBase, ändert sich mit jedem neuen Bild. Leer ohne Bild: Dann zeigt
  // die Website das Standardbild aus Wappen und Titel.
  bild: string;
  // Platz auf der Startseite, aufsteigend. Ohne Bedeutung, solange startseite falsch ist.
  reihenfolge: number;
  angelegt: string;
};

export type Speicherergebnis =
  | { ok: true; id: string }
  | {
      ok: false;
      grund: "pflichtfeld-fehlt" | "bild-ungueltig" | "startseite-voll" | "nicht-gefunden";
    };

// Oben die Förderprojekte auf der Startseite in ihrer Reihenfolge, darunter die übrigen.
export type Liste = { startseite: Foerderprojekt[]; weitere: Foerderprojekt[]; voll: boolean };

// Knöpfe im Admin-Reiter: Pfeile ↑↓, „Auf die Startseite“, „Von Startseite nehmen“.
export const STARTSEITE_AKTIONEN = ["hoch", "runter", "aufnehmen", "entfernen"] as const;
export type Startseitenaktion = (typeof STARTSEITE_AKTIONEN)[number];

export type Ordnungsergebnis = { ok: true } | { ok: false; grund: "startseite-voll" | "nicht-gefunden" };

// Beim Ändern: neues Bild, "entfernen" (zurück zum Standardbild) oder null (Bild bleibt).
export type Bildaenderung = File | "entfernen" | null;

export type Bild = { inhalt: ReadableStream<Uint8Array>; contentType: string };

// --- Seams -------------------------------------------------------------------

export type Gespeichert = Foerderprojektdaten & { reihenfolge: number };

export type Ablage = {
  alle(): Promise<Foerderprojekt[]>;
  laden(id: string): Promise<Foerderprojekt | null>;
  anlegen(daten: Gespeichert, bild: File | null): Promise<{ id: string }>;
  aendern(id: string, daten: Gespeichert, bild: Bildaenderung): Promise<void>;
  loeschen(id: string): Promise<void>;
  // Verkleinertes Bild, null wenn es das Förderprojekt nicht gibt oder PocketBase es nicht liefert.
  bild(projekt: Foerderprojekt, groesse: Bildgroesse): Promise<Bild | null>;
};
