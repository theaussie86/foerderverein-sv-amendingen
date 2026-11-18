// Entry Point: Förderprojekte pflegen. Die Ablage wird hineingereicht, die echte mit PocketBase
// baut server.ts, Tests nehmen Fakes.
import { bildGueltig, daten as angaben, naechsterPlatz, normalisieren, sortieren, umordnen } from "./lib/regeln";
import {
  STARTSEITE_PLAETZE,
  type Ablage,
  type Bild,
  type Bildaenderung,
  type Bildgroesse,
  type Foerderprojekt,
  type Foerderprojektdaten,
  type Liste,
  type Ordnungsergebnis,
  type Speicherergebnis,
  type Startseitenaktion,
} from "./lib/typen";

export type {
  Ablage,
  Bild,
  Bildaenderung,
  Bildgroesse,
  Foerderprojekt,
  Foerderprojektdaten,
  Gespeichert,
  Liste,
  Ordnungsergebnis,
  Speicherergebnis,
  Startseitenaktion,
} from "./lib/typen";
export { BILD_GROESSEN, BILD_MAX_BYTES, BILD_TYPEN, STARTSEITE_AKTIONEN, STARTSEITE_PLAETZE } from "./lib/typen";

export type Umgebung = { ablage: Ablage };

export function foerderprojekte({ ablage }: Umgebung) {
  // Prüft die Angaben und vergibt den Platz auf der Startseite. 0 heißt: nicht auf der Startseite.
  async function platz(
    daten: Foerderprojektdaten,
    bild: File | null,
    bisher: Foerderprojekt | null,
  ): Promise<{ ok: true; reihenfolge: number } | Extract<Speicherergebnis, { ok: false }>> {
    if (!daten.titel || !daten.beschreibung) return { ok: false, grund: "pflichtfeld-fehlt" };
    if (bild && !bildGueltig(bild)) return { ok: false, grund: "bild-ungueltig" };
    if (!daten.startseite) return { ok: true, reihenfolge: 0 };
    if (bisher?.startseite) return { ok: true, reihenfolge: bisher.reihenfolge };
    const { startseite } = sortieren(await ablage.alle());
    if (startseite.length >= STARTSEITE_PLAETZE) return { ok: false, grund: "startseite-voll" };
    return { ok: true, reihenfolge: naechsterPlatz(startseite) };
  }

  // Was Besucher sehen: angehakte Förderprojekte in der gepflegten Reihenfolge, höchstens 4.
  async function startseite(): Promise<Foerderprojekt[]> {
    return sortieren(await ablage.alle()).startseite.slice(0, STARTSEITE_PLAETZE);
  }

  return {
    startseite,

    // Einzige Sperre für Bilder ohne Anmeldung: nur Förderprojekte, die auf der Startseite zu sehen sind,
    // und nur mit dem aktuellen Dateinamen.
    async oeffentlichesBild(id: string, datei: string, groesse: Bildgroesse): Promise<Bild | null> {
      const projekt = (await startseite()).find((p) => p.id === id);
      if (!projekt || !datei || projekt.bild !== datei) return null;
      return ablage.bild(projekt, groesse);
    },

    async liste(): Promise<Liste> {
      const { startseite, weitere } = sortieren(await ablage.alle());
      return { startseite, weitere, voll: startseite.length >= STARTSEITE_PLAETZE };
    },

    laden: (id: string): Promise<Foerderprojekt | null> => ablage.laden(id),

    async anlegen(eingabe: Foerderprojektdaten, bild: File | null): Promise<Speicherergebnis> {
      const daten = normalisieren(eingabe);
      const p = await platz(daten, bild, null);
      if (!p.ok) return p;
      const { id } = await ablage.anlegen({ ...daten, reihenfolge: p.reihenfolge }, bild);
      return { ok: true, id };
    },

    // Ohne bild bleibt das bisherige Bild (oder das Standardbild), "entfernen" führt zurück zum
    // Standardbild. Wer neu auf die Startseite kommt, hängt hinten an.
    async aendern(id: string, eingabe: Foerderprojektdaten, bild: Bildaenderung): Promise<Speicherergebnis> {
      const bisher = await ablage.laden(id);
      if (!bisher) return { ok: false, grund: "nicht-gefunden" };
      const daten = normalisieren(eingabe);
      const p = await platz(daten, bild instanceof File ? bild : null, bisher);
      if (!p.ok) return p;
      await ablage.aendern(id, { ...daten, reihenfolge: p.reihenfolge }, bild);
      return { ok: true, id };
    },

    // Pfeile und Knöpfe im Admin-Reiter. Danach sind die Plätze lückenlos 1, 2, 3 …, wer von der
    // Startseite genommen wird, bekommt 0. Gespeichert wird nur, was sich geändert hat.
    async startseiteAendern(id: string, aktion: Startseitenaktion): Promise<Ordnungsergebnis> {
      const projekt = await ablage.laden(id);
      if (!projekt) return { ok: false, grund: "nicht-gefunden" };
      const { startseite } = sortieren(await ablage.alle());
      if (aktion === "aufnehmen" && projekt.startseite) return { ok: true };
      if (aktion === "aufnehmen" && startseite.length >= STARTSEITE_PLAETZE) {
        return { ok: false, grund: "startseite-voll" };
      }
      const neu = aktion === "aufnehmen" ? [...startseite, projekt] : umordnen(startseite, id, aktion);
      if (projekt.startseite && !neu.some((p) => p.id === id)) {
        await ablage.aendern(id, { ...angaben(projekt), startseite: false, reihenfolge: 0 }, null);
      }
      for (const [i, p] of neu.entries()) {
        if (p.startseite && p.reihenfolge === i + 1) continue;
        await ablage.aendern(p.id, { ...angaben(p), startseite: true, reihenfolge: i + 1 }, null);
      }
      return { ok: true };
    },

    loeschen: (id: string): Promise<void> => ablage.loeschen(id),

    async bild(id: string, groesse: Bildgroesse): Promise<Bild | null> {
      const projekt = await ablage.laden(id);
      return projekt ? ablage.bild(projekt, groesse) : null;
    },
  };
}
