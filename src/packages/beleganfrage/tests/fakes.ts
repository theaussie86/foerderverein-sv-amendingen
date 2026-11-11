import type {
  Abschluss,
  BelegArt,
  Beleganfrage,
  Leseablage,
  Mail,
  NeueBeleganfrage,
  Postausgang,
  Schreibablage,
  Trefferliste,
} from "../index";

type Eintrag = Beleganfrage & { pdf?: Uint8Array };

const VORSTAENDE: Record<string, string> = { v1: "Manu Rothermel", v2: "Christoph Weißsteiner" };

const ausfall = (text: string) => Promise.reject(new Error(text));

// PocketBase im Speicher. Mit den Schaltern lassen sich Ausfälle nachstellen.
export class Ablage implements Leseablage, Schreibablage {
  eintraege = new Map<string, Eintrag>();
  speichernFehlschlagen = false;
  lesenFehlschlagen = false;
  dateiFehlschlagen = false;
  private naechste = 1;

  speichern(neu: NeueBeleganfrage): Promise<string | null> {
    if (this.speichernFehlschlagen) return ausfall("PocketBase nicht erreichbar");
    const id = `anfrage${this.naechste++}`;
    const { erfasstVon, ...rest } = neu;
    this.eintraege.set(id, {
      ...rest,
      id,
      betragAngegeben: neu.betrag,
      status: "offen",
      angefragtAm: "2026-11-10 08:00:00.000Z",
      erfasstVon: erfasstVon ? (VORSTAENDE[erfasstVon] ?? "Vorstand") : null,
      wartend: null,
      ablehnung: null,
      abschluss: null,
      hatBeleg: false,
    });
    return Promise.resolve(id);
  }

  abschliessen(id: string, a: Abschluss): Promise<void> {
    const e = this.eintraege.get(id);
    if (!e) return ausfall("404");
    e.status = a.status;
    e.abschluss = { am: a.am.toISOString(), von: VORSTAENDE[a.vorstandId] ?? null };
    if (a.status === "abgelehnt") e.ablehnung = a.ablehnung;
    if (a.status === "ausgestellt") {
      e.betrag = a.betrag;
      e.art = a.art;
    }
    if (a.status === "ausgestellt" && a.beleg) {
      e.pdf = a.beleg.inhalt;
      e.hatBeleg = true;
    }
    return Promise.resolve();
  }

  betragKorrigieren(id: string, k: { betrag: number; art: BelegArt }): Promise<void> {
    const e = this.eintraege.get(id);
    if (!e) return ausfall("404");
    e.betrag = k.betrag;
    e.art = k.art;
    return Promise.resolve();
  }

  wartendMarkieren(id: string, w: { seit: Date; zuletztGeprueft: Date }): Promise<void> {
    const e = this.eintraege.get(id);
    if (!e) return ausfall("404");
    e.status = "wartend";
    e.wartend = { seit: w.seit.toISOString(), zuletztGeprueft: w.zuletztGeprueft.toISOString() };
    return Promise.resolve();
  }

  laden(id: string): Promise<Beleganfrage | null> {
    const e = this.eintraege.get(id);
    if (!e) return Promise.resolve(null);
    const { pdf: _pdf, ...anfrage } = e;
    return Promise.resolve(structuredClone(anfrage));
  }

  suchen(): Promise<Trefferliste> {
    const eintraege = [...this.eintraege.values()];
    return Promise.resolve({ eintraege, anzahl: eintraege.length, seiten: 1 });
  }

  anzahlOffen(): Promise<number> {
    if (this.lesenFehlschlagen) return ausfall("PocketBase nicht erreichbar");
    return Promise.resolve([...this.eintraege.values()].filter((e) => e.status === "offen").length);
  }

  belegDatei(id: string): Promise<ReadableStream<Uint8Array> | null> {
    if (this.dateiFehlschlagen) return ausfall("502");
    const pdf = this.eintraege.get(id)?.pdf;
    return Promise.resolve(pdf ? new Blob([new Uint8Array(pdf)]).stream() : null);
  }
}

export class Post implements Postausgang {
  gesendet: Mail[] = [];
  fehlschlagen = false;

  senden(mail: Mail): Promise<void> {
    if (this.fehlschlagen) return ausfall("Resend nicht erreichbar");
    this.gesendet.push(mail);
    return Promise.resolve();
  }
}

export const JETZT = new Date("2026-11-10T09:30:00.000Z");
