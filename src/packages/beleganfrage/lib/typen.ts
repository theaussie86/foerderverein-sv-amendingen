// Begriffe aus GLOSSARY.md, Abschnitt „Spenden“.

export type BelegArt = "vereinfacht" | "zuwendungsbestaetigung";

export const ANFRAGE_STATUS = ["offen", "wartend", "ausgestellt", "abgelehnt"] as const;
export type AnfrageStatus = (typeof ANFRAGE_STATUS)[number];

// Feste Gründe für eine Ablehnung. Weicht nur der Betrag ab, ist das ein Fall für die Betragskorrektur.
export const ABLEHNUNGSGRUENDE = ["nicht-eingegangen", "doppelt", "keine-spende", "sonstiges"] as const;
export type Ablehnungsgrund = (typeof ABLEHNUNGSGRUENDE)[number];

// Bei "sonstiges" mit eigener Begründung, sonst ist sie leer.
export type Ablehnung = { grund: Ablehnungsgrund; begruendung: string };

export type Beleganfrage = {
  // Zugleich die Belegnummer.
  id: string;
  art: BelegArt;
  status: AnfrageStatus;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  // Leer, wenn der Vorstand die Anfrage ohne E-Mail-Adresse erfasst hat.
  email: string;
  // Der maßgebliche Betrag, nach einer Betragskorrektur der eingegangene.
  betrag: number;
  // Was der Spender angegeben hat (oder der Vorstand beim Erfassen).
  betragAngegeben: number;
  // YYYY-MM-DD
  tagDerSpende: string;
  notiz: string;
  angefragtAm: string;
  // Name des Vorstandsmitglieds, das die Anfrage erfasst hat. Null, wenn sie über die Website kam.
  erfasstVon: string | null;
  // Seit wann die Anfrage wartet und wann der Vorstand zuletzt das Vereinskonto geprüft hat.
  // Null, wenn sie nie wartend war.
  wartend: { seit: string; zuletztGeprueft: string } | null;
  // Wann und von wem die Anfrage abgeschlossen wurde. Null, solange sie offen oder wartend ist.
  abschluss: { am: string; von: string | null } | null;
  // Null, wenn nicht abgelehnt oder abgelehnt, bevor es Ablehnungsgründe gab.
  ablehnung: Ablehnung | null;
  // Ob ein Spendenbeleg als PDF abgelegt ist.
  hatBeleg: boolean;
};

export type Listeneintrag = Pick<
  Beleganfrage,
  | "id"
  | "art"
  | "status"
  | "name"
  | "ort"
  | "email"
  | "betrag"
  | "betragAngegeben"
  | "tagDerSpende"
  | "angefragtAm"
  | "wartend"
>;

export type Trefferliste = { eintraege: Listeneintrag[]; anzahl: number; seiten: number };

export type Suche = { suche: string; status?: AnfrageStatus; seite: number };

// Was der Spender oder der Vorstand angibt.
export type Spenderangaben = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  betrag: number;
  tagDerSpende: string;
};

export type Datei = { dateiname: string; inhalt: Uint8Array };

export type Mail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: Datei[];
};

// --- Seams -------------------------------------------------------------------

export type NeueBeleganfrage = Spenderangaben & { art: BelegArt; notiz: string; erfasstVon: string | null };

export type Abschluss = { vorstandId: string; am: Date } & (
  | {
      status: "ausgestellt";
      // Maßgeblicher Betrag und Art, nach einer Betragskorrektur geändert.
      betrag: number;
      art: BelegArt;
      // Nur beim vereinfachten Spendenbeleg: das erzeugte PDF.
      beleg?: Datei;
    }
  | { status: "abgelehnt"; ablehnung: Ablehnung }
);

// Schreiben läuft als Superuser, weil der Vorstand Spendenbelege nur lesen darf.
// Die Website prüft vorher die Vorstands-Session und hält fest, wer es war.
export type Schreibablage = {
  // ID der neuen Beleganfrage, null, wenn nichts gespeichert wurde (ohne PocketBase).
  speichern(neu: NeueBeleganfrage): Promise<string | null>;
  abschliessen(id: string, abschluss: Abschluss): Promise<void>;
  // Betragskorrektur ohne Abschluss, wenn daraus eine Zuwendungsbestätigung wird.
  betragKorrigieren(id: string, korrektur: { betrag: number; art: BelegArt }): Promise<void>;
  // Setzt den Status auf wartend. seit bleibt beim erneuten Markieren gleich.
  wartendMarkieren(id: string, wartend: { seit: Date; zuletztGeprueft: Date }): Promise<void>;
};

// Lesen läuft mit den Rechten des angemeldeten Vorstandsmitglieds.
export type Leseablage = {
  laden(id: string): Promise<Beleganfrage | null>;
  suchen(suche: Suche): Promise<Trefferliste>;
  anzahlOffen(): Promise<number>;
  // Null, wenn kein Beleg abgelegt ist. Wirft, wenn die Datei nicht geladen werden kann.
  belegDatei(id: string): Promise<ReadableStream<Uint8Array> | null>;
};

export type Postausgang = { senden(mail: Mail): Promise<void> };
