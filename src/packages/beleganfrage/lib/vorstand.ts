import { belegDateiname } from "./format";
import { spendenbelegMail } from "./mails";
import { belegArt } from "./regeln";
import { spendenbelegPdf } from "./spendenbeleg-pdf";
import type {
  BelegArt,
  Beleganfrage,
  Leseablage,
  Postausgang,
  Schreibablage,
  Spenderangaben,
  Suche,
  Trefferliste,
} from "./typen";

export type VorstandsUmgebung = {
  lesen: Leseablage;
  schreiben: Schreibablage;
  post: Postausgang;
  jetzt: () => Date;
};

export type AbschlussErgebnis = { ok: true } | { ok: false; grund: "nicht-offen" | "falsche-art" | "mail" };

export type ErfassenErgebnis =
  | { ok: true; id: string }
  | { ok: false; grund: "nicht-gespeichert" }
  // Gespeichert, aber direktFreigeben scheiterte am Versand des Spendenbelegs. Die Anfrage ist weiter offen.
  | { ok: false; grund: "mail"; id: string };

export type BelegPdf =
  | { ok: true; dateiname: string; inhalt: ReadableStream<Uint8Array> }
  | { ok: false; grund: "nicht-gefunden" | "fehler" };

// Welche Art ein Abschluss verlangt. Ablehnen geht bei jeder Art.
const VERLANGT: Record<"freigeben" | "ausstellen", BelegArt> = {
  freigeben: "vereinfacht",
  ausstellen: "zuwendungsbestaetigung",
};

export function vorstand(u: VorstandsUmgebung) {
  // Lädt mit den Rechten des Vorstands, damit nur sichtbare und noch offene Anfragen
  // abgeschlossen werden. Doppelklicks laufen so ins Leere.
  async function offeneAnfrage(id: string): Promise<Beleganfrage | null> {
    const anfrage = await u.lesen.laden(id);
    return anfrage?.status === "offen" ? anfrage : null;
  }

  // Bis 300 €: Der Vorstand hat den Geldeingang geprüft, erst jetzt gibt es den Spendenbeleg.
  // Ohne E-Mail-Adresse geht keine Mail raus, der Beleg liegt dann nur zum Herunterladen bereit.
  // Scheitert die Mail, bleibt die Anfrage offen.
  async function belegVersenden(anfrage: Beleganfrage, vorstandId: string): Promise<AbschlussErgebnis> {
    const beleg = { dateiname: belegDateiname(anfrage), inhalt: await spendenbelegPdf(anfrage) };
    if (anfrage.email) {
      try {
        await u.post.senden({ to: anfrage.email, ...spendenbelegMail(anfrage), attachments: [beleg] });
      } catch (e) {
        console.error("Spendenbeleg konnte nicht versendet werden", e);
        return { ok: false, grund: "mail" };
      }
    }
    await u.schreiben.abschliessen(anfrage.id, { status: "versendet", vorstandId, am: u.jetzt(), beleg });
    return { ok: true };
  }

  // Über 300 €: Der Vorsitz hat die Zuwendungsbestätigung außerhalb der Website ausgestellt.
  async function ausgestellt(anfrage: Beleganfrage, vorstandId: string): Promise<AbschlussErgebnis> {
    await u.schreiben.abschliessen(anfrage.id, { status: "ausgestellt", vorstandId, am: u.jetzt() });
    return { ok: true };
  }

  async function abschliessen(
    id: string,
    vorstandId: string,
    aktion: keyof typeof VERLANGT,
  ): Promise<AbschlussErgebnis> {
    const anfrage = await offeneAnfrage(id);
    if (!anfrage) return { ok: false, grund: "nicht-offen" };
    if (anfrage.art !== VERLANGT[aktion]) return { ok: false, grund: "falsche-art" };
    return aktion === "freigeben" ? belegVersenden(anfrage, vorstandId) : ausgestellt(anfrage, vorstandId);
  }

  return {
    freigeben: (id: string, vorstandId: string) => abschliessen(id, vorstandId, "freigeben"),

    alsAusgestelltMarkieren: (id: string, vorstandId: string) => abschliessen(id, vorstandId, "ausstellen"),

    // Keine passende Spende auf dem Konto: Beleganfrage ablehnen, es geht nichts raus.
    async ablehnen(id: string, vorstandId: string): Promise<AbschlussErgebnis> {
      const anfrage = await offeneAnfrage(id);
      if (!anfrage) return { ok: false, grund: "nicht-offen" };
      await u.schreiben.abschliessen(id, { status: "abgelehnt", vorstandId, am: u.jetzt() });
      return { ok: true };
    },

    // Der Vorstand erfasst eine Beleganfrage für einen Spender, der sich nicht über die Website
    // gemeldet hat. Anders als auf der Website geht keine Mail an den Vorstand. Mit direktFreigeben
    // hat der Vorstand den Geldeingang schon gesehen und die Anfrage wird sofort abgeschlossen.
    async erfassen(
      angaben: Spenderangaben & { notiz: string },
      vorstandId: string,
      { direktFreigeben }: { direktFreigeben: boolean },
    ): Promise<ErfassenErgebnis> {
      const art = belegArt(angaben.betrag);
      let id: string | null = null;
      try {
        id = await u.schreiben.speichern({ ...angaben, art, erfasstVon: vorstandId });
      } catch (e) {
        console.error("Beleganfrage konnte nicht erfasst werden", e);
      }
      if (!id) return { ok: false, grund: "nicht-gespeichert" };

      if (direktFreigeben) {
        const anfrage = await offeneAnfrage(id);
        if (anfrage) {
          const ergebnis =
            art === "vereinfacht" ? await belegVersenden(anfrage, vorstandId) : await ausgestellt(anfrage, vorstandId);
          if (!ergebnis.ok) return { ok: false, grund: "mail", id };
        }
      }
      return { ok: true, id };
    },

    laden: (id: string): Promise<Beleganfrage | null> => u.lesen.laden(id),

    suchen: (suche: Suche): Promise<Trefferliste> => u.lesen.suchen(suche),

    // Null, wenn die Ablage nicht antwortet. Die Zahl ist nur ein Hinweis in der Navigation.
    async anzahlOffen(): Promise<number | null> {
      try {
        return await u.lesen.anzahlOffen();
      } catch {
        return null;
      }
    },

    // Der abgelegte Spendenbeleg, unter demselben Namen wie im Mailanhang.
    async belegPdf(id: string): Promise<BelegPdf> {
      const anfrage = await u.lesen.laden(id);
      if (!anfrage?.hatBeleg) return { ok: false, grund: "nicht-gefunden" };
      try {
        const inhalt = await u.lesen.belegDatei(id);
        if (!inhalt) return { ok: false, grund: "nicht-gefunden" };
        return { ok: true, dateiname: belegDateiname(anfrage), inhalt };
      } catch (e) {
        console.error("Spendenbeleg konnte nicht geladen werden", e);
        return { ok: false, grund: "fehler" };
      }
    },
  };
}
