import type { Ablage, Bildaenderung, Bildgroesse, Foerderprojekt, Foerderprojektdaten, Gespeichert } from "../index";

// Ablage im Speicher. Merkt sich, welche Datei zuletzt hochgeladen wurde.
export class FakeAblage implements Ablage {
  projekte: Foerderprojekt[] = [];
  private naechsteId = 1;

  alle() {
    return Promise.resolve([...this.projekte]);
  }

  laden(id: string) {
    return Promise.resolve(this.projekte.find((p) => p.id === id) ?? null);
  }

  anlegen(daten: Gespeichert, bild: File | null) {
    const id = `f${this.naechsteId}`;
    const angelegt = `2026-11-${String(this.naechsteId++).padStart(2, "0")} 10:00:00.000Z`;
    this.projekte.push({ ...daten, id, bild: bild?.name ?? "", angelegt });
    return Promise.resolve({ id });
  }

  aendern(id: string, daten: Gespeichert, bild: Bildaenderung) {
    this.projekte = this.projekte.map((p) =>
      p.id === id ? { ...p, ...daten, bild: bild === "entfernen" ? "" : (bild?.name ?? p.bild) } : p,
    );
    return Promise.resolve();
  }

  loeschen(id: string) {
    this.projekte = this.projekte.filter((p) => p.id !== id);
    return Promise.resolve();
  }

  bild(projekt: Foerderprojekt, groesse: Bildgroesse) {
    const inhalt = new Blob([`${projekt.bild}:${groesse}`]).stream();
    return Promise.resolve({ inhalt, contentType: "image/jpeg" });
  }
}

export function daten(teil: Partial<Foerderprojektdaten> = {}): Foerderprojektdaten {
  return {
    titel: "Schuhwaschanlage",
    beschreibung: "Saubere Schuhe, sauberes Vereinsheim.",
    jahr: 2026,
    betrag: 1000,
    startseite: false,
    ...teil,
  };
}

export function bild(name = "bild.jpg", type = "image/jpeg", bytes = 10): File {
  return new File([new Uint8Array(bytes)], name, { type });
}
