import type PocketBase from "pocketbase";
import { ClientResponseError } from "pocketbase";
import { z } from "zod";
import { BILD_GROESSEN, type Ablage, type Foerderprojekt, type Gespeichert } from "./typen";

// Einzige Stelle, die die Collection "foerderprojekte" kennt. Die Collection-Regeln sind null,
// gelesen und geschrieben wird als Superuser.

const COLLECTION = "foerderprojekte";

// Zahlenfelder sind in PocketBase nie leer, 0 heißt: nicht angegeben.
const optional = z.number().transform((n) => (n === 0 ? null : n));

const record = z.object({
  id: z.string(),
  titel: z.string(),
  beschreibung: z.string(),
  bild: z.string(),
  jahr: optional,
  betrag: optional,
  startseite: z.boolean(),
  reihenfolge: z.number(),
  created: z.string(),
});

function foerderprojekt(r: z.infer<typeof record>): Foerderprojekt {
  return {
    id: r.id,
    titel: r.titel,
    beschreibung: r.beschreibung,
    bild: r.bild,
    jahr: r.jahr,
    betrag: r.betrag,
    startseite: r.startseite,
    reihenfolge: r.reihenfolge,
    angelegt: r.created,
  };
}

function felder(d: Gespeichert) {
  return {
    titel: d.titel,
    beschreibung: d.beschreibung,
    jahr: d.jahr ?? 0,
    betrag: d.betrag ?? 0,
    startseite: d.startseite,
    reihenfolge: d.reihenfolge,
  };
}

export function pocketbaseAblage(client: () => Promise<PocketBase | null>): Ablage {
  async function pb(): Promise<PocketBase> {
    const c = await client();
    if (!c) throw new Error("PocketBase ist nicht konfiguriert.");
    return c;
  }

  return {
    async alle() {
      const c = await pb();
      const alle = await c.collection(COLLECTION).getFullList({ sort: "reihenfolge,-created" });
      return alle.map((r) => foerderprojekt(record.parse(r)));
    },

    async laden(id) {
      const c = await pb();
      try {
        return foerderprojekt(record.parse(await c.collection(COLLECTION).getOne(id)));
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 404) return null;
        throw e;
      }
    },

    async anlegen(daten, bild) {
      const c = await pb();
      const r = await c.collection(COLLECTION).create(bild ? { ...felder(daten), bild } : felder(daten));
      return { id: z.object({ id: z.string() }).parse(r).id };
    },

    async aendern(id, daten, bild) {
      const c = await pb();
      await c.collection(COLLECTION).update(id, bild ? { ...felder(daten), bild } : felder(daten));
    },

    async loeschen(id) {
      const c = await pb();
      try {
        await c.collection(COLLECTION).delete(id);
      } catch (e) {
        if (!(e instanceof ClientResponseError && e.status === 404)) throw e;
      }
    },

    // Das Bildfeld ist nicht geschützt, ein Token braucht es nicht. PocketBase selbst ist nicht öffentlich.
    async bild(projekt, groesse) {
      const c = await pb();
      const url = c.files.getURL({ id: projekt.id, collectionName: COLLECTION }, projekt.bild, {
        thumb: BILD_GROESSEN[groesse],
      });
      const antwort = await fetch(url, { cache: "no-store" });
      if (!antwort.ok || !antwort.body) {
        console.error("Bild des Förderprojekts konnte nicht geladen werden", antwort.status);
        return null;
      }
      return { inhalt: antwort.body, contentType: antwort.headers.get("Content-Type") ?? "application/octet-stream" };
    },
  };
}
