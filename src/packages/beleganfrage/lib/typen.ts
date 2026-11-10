// Begriffe aus GLOSSARY.md, Abschnitt „Spenden“. Die Statuswerte entsprechen noch denen in
// PocketBase, ob und wie sie umbenannt werden, klärt #38.

export type BelegArt = "vereinfacht" | "zuwendungsbestaetigung";

export const ANFRAGE_STATUS = ["offen", "ausgestellt", "versendet", "abgelehnt"] as const;
export type AnfrageStatus = (typeof ANFRAGE_STATUS)[number];

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
  betrag: number;
  // YYYY-MM-DD
  tagDerSpende: string;
  notiz: string;
  angefragtAm: string;
  // Name des Vorstandsmitglieds, das die Anfrage erfasst hat. Null, wenn sie über die Website kam.
  erfasstVon: string | null;
  // Wann und von wem die Anfrage abgeschlossen wurde. Null, solange sie offen ist.
  abschluss: { am: string; von: string | null } | null;
  // Ob ein Spendenbeleg als PDF abgelegt ist.
  hatBeleg: boolean;
};

export type Listeneintrag = Pick<
  Beleganfrage,
  "id" | "art" | "status" | "name" | "ort" | "email" | "betrag" | "tagDerSpende" | "angefragtAm"
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

export type Abschluss = {
  status: Exclude<AnfrageStatus, "offen">;
  vorstandId: string;
  am: Date;
  // Nur beim vereinfachten Spendenbeleg: das verschickte PDF.
  beleg?: Datei;
};

// Schreiben läuft als Superuser, weil der Vorstand Spendenbelege nur lesen darf.
// Die Website prüft vorher die Vorstands-Session und hält fest, wer es war.
export type Schreibablage = {
  // ID der neuen Beleganfrage, null, wenn nichts gespeichert wurde (ohne PocketBase).
  speichern(neu: NeueBeleganfrage): Promise<string | null>;
  abschliessen(id: string, abschluss: Abschluss): Promise<void>;
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
