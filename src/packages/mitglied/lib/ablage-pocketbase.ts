import type PocketBase from "pocketbase";
import { ClientResponseError } from "pocketbase";
import { z } from "zod";
import { ENDE_GRUENDE, type Ablage, type Listeneintrag, type Mitglied, type Mitgliedsdaten } from "./typen";

// Einzige Stelle, die die Collection "mitglieder" kennt. Übersetzt zwischen den Feldnamen in
// PocketBase und den Begriffen des Glossars.

const PRO_SEITE = 50;
const SUCHFELDER = ["vorname", "nachname", "email", "ort", "plz", "strasse", "mandatsreferenz", "iban", "kontoinhaber"];

// PocketBase liefert Datumsfelder als "2025-05-01 00:00:00.000Z" oder leer.
const tag = z.string().transform((s) => s.slice(0, 10));

const listenRecord = z.object({
  id: z.string(),
  mandatsreferenz: z.string(),
  vorname: z.string(),
  nachname: z.string(),
  ort: z.string(),
  email: z.string(),
  eintrittsdatum: tag,
  ende_datum: tag,
  ende_grund: z.enum(ENDE_GRUENDE).or(z.literal("")),
});

const record = listenRecord.extend({
  strasse: z.string(),
  plz: z.string(),
  kontoinhaber: z.string(),
  iban: z.string(),
  bic: z.string(),
  bank: z.string(),
  mandat_datum: tag,
  antrag: z.string(),
  notiz: z.string(),
  created: z.string(),
  updated: z.string(),
});

const LISTENFELDER = Object.keys(listenRecord.shape).join(",");

// Antwort von PocketBase bei Validierungsfehlern: { data: { feld: { code, message } } }.
const feldfehler = z.object({ data: z.record(z.string(), z.object({ code: z.string() }).partial()) });

function listeneintrag(r: z.infer<typeof listenRecord>): Listeneintrag {
  return {
    id: r.id,
    mandatsreferenz: r.mandatsreferenz,
    vorname: r.vorname,
    nachname: r.nachname,
    ort: r.ort,
    email: r.email,
    eintrittsdatum: r.eintrittsdatum,
    endeDatum: r.ende_datum,
    endeGrund: r.ende_grund,
  };
}

function mitglied(r: z.infer<typeof record>): Mitglied {
  return {
    ...listeneintrag(r),
    strasse: r.strasse,
    plz: r.plz,
    kontoinhaber: r.kontoinhaber,
    iban: r.iban,
    bic: r.bic,
    bank: r.bank,
    mandatDatum: r.mandat_datum,
    antragId: r.antrag,
    notiz: r.notiz,
    angelegt: r.created,
    geaendert: r.updated,
  };
}

const pbTag = (t: string) => (t ? `${t} 00:00:00.000Z` : "");

function felder(d: Mitgliedsdaten) {
  return {
    mandatsreferenz: d.mandatsreferenz,
    vorname: d.vorname,
    nachname: d.nachname,
    strasse: d.strasse,
    plz: d.plz,
    ort: d.ort,
    email: d.email,
    kontoinhaber: d.kontoinhaber,
    iban: d.iban,
    bic: d.bic,
    bank: d.bank,
    eintrittsdatum: pbTag(d.eintrittsdatum),
    mandat_datum: pbTag(d.mandatDatum),
    ende_datum: pbTag(d.endeDatum),
    ende_grund: d.endeGrund,
    antrag: d.antragId,
    notiz: d.notiz,
  };
}

// Doppelte Mandatsreferenz oder ein Antrag, der schon einem anderen Mitglied gehört.
function speicherfehler(err: unknown) {
  if (!(err instanceof ClientResponseError)) return null;
  if (err.status === 404) return { ok: false, grund: "nicht-gefunden" } as const;
  const f = feldfehler.safeParse(err.response).data?.data;
  if (f?.mandatsreferenz?.code === "validation_not_unique")
    return { ok: false, grund: "mandatsreferenz-vergeben" } as const;
  if (f?.antrag?.code === "validation_not_unique") return { ok: false, grund: "antrag-vergeben" } as const;
  return null;
}

// Läuft mit dem Client des angemeldeten Vorstands (Lesen und Schreiben) oder als Superuser (Zähler).
export function pocketbaseAblage(client: () => Promise<PocketBase | null>): Ablage {
  async function pb(): Promise<PocketBase> {
    const c = await client();
    if (!c) throw new Error("PocketBase ist nicht konfiguriert.");
    return c;
  }

  async function speichern(aktion: () => Promise<{ id: string }>) {
    try {
      const { id } = await aktion();
      return { ok: true, id } as const;
    } catch (err) {
      const fehler = speicherfehler(err);
      if (fehler) return fehler;
      throw err;
    }
  }

  return {
    async suchen({ suche, filter, seite }, heute) {
      const c = await pb();
      const teile: string[] = [];
      const params: Record<string, string> = { heute: pbTag(heute) };
      // Jedes Suchwort muss in mindestens einem Feld vorkommen, damit "Max Muster" Vor- und Nachnamen findet.
      suche
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .forEach((wort, i) => {
          params[`w${i}`] = wort;
          params[`W${i}`] = wort.replace(/\s/g, "").toUpperCase();
          teile.push(`(${SUCHFELDER.map((f) => `${f} ~ {:${f === "iban" ? "W" : "w"}${i}}`).join(" || ")})`);
        });
      if (filter === "aktiv") teile.push('(ende_datum = "" || ende_datum >= {:heute})');
      if (filter === "beendet") teile.push('(ende_datum != "" && ende_datum < {:heute})');

      const liste = await c.collection("mitglieder").getList(seite, PRO_SEITE, {
        filter: c.filter(teile.join(" && "), params),
        sort: "nachname,vorname",
        fields: LISTENFELDER,
      });
      return {
        eintraege: liste.items.map((r) => listeneintrag(listenRecord.parse(r))),
        anzahl: liste.totalItems,
        seiten: liste.totalPages,
      };
    },

    async laden(id) {
      const c = await pb();
      try {
        return mitglied(record.parse(await c.collection("mitglieder").getOne(id)));
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 404) return null;
        throw e;
      }
    },

    async anlegen(daten) {
      const c = await pb();
      return speichern(() => c.collection("mitglieder").create(felder(daten)));
    },

    async aendern(id, daten) {
      const c = await pb();
      return speichern(() => c.collection("mitglieder").update(id, felder(daten)));
    },

    async mandatsreferenzen() {
      const c = await pb();
      const alle = await c.collection("mitglieder").getFullList({ fields: "mandatsreferenz" });
      return alle.map((r) => z.object({ mandatsreferenz: z.string() }).parse(r).mandatsreferenz);
    },

    async anzahlAktiv(heute) {
      const c = await pb();
      const liste = await c.collection("mitglieder").getList(1, 1, {
        filter: c.filter('ende_datum = "" || ende_datum >= {:heute}', { heute: pbTag(heute) }),
        fields: "id",
      });
      return liste.totalItems;
    },

    async verknuepfteAntraege() {
      const c = await pb();
      const alle = await c.collection("mitglieder").getFullList({ filter: 'antrag != ""', fields: "antrag" });
      return alle.map((r) => z.object({ antrag: z.string() }).parse(r).antrag);
    },

    async zuAntrag(antragId) {
      const c = await pb();
      const liste = await c.collection("mitglieder").getList(1, 1, {
        filter: c.filter("antrag = {:antragId}", { antragId }),
        fields: "id",
      });
      return liste.items[0]?.id ?? null;
    },
  };
}
