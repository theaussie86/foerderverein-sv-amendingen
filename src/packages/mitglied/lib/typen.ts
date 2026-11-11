// Begriffe aus GLOSSARY.md, Abschnitte „Mitgliedschaft“ und „Beitrag und Einzug“.

export const ENDE_GRUENDE = ["austritt", "ausschluss", "tod"] as const;
export type EndeGrund = (typeof ENDE_GRUENDE)[number];

// Daten eines Mitglieds, wie der Vorstand sie pflegt. Datumsfelder als YYYY-MM-DD, leer = unbekannt.
export type Mitgliedsdaten = {
  mandatsreferenz: string;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  // Leer, wenn das Mitglied selbst Kontoinhaber ist.
  kontoinhaber: string;
  // Ohne Leerzeichen, großgeschrieben.
  iban: string;
  bic: string;
  bank: string;
  eintrittsdatum: string;
  // Tag, an dem der Kontoinhaber das Mandat unterschrieben hat.
  mandatDatum: string;
  // Ende der Mitgliedschaft. Beide leer, solange sie läuft.
  endeDatum: string;
  endeGrund: EndeGrund | "";
  // ID des Online-Mitgliedsantrags, aus dem das Mitglied stammt. Leer bei Papieranträgen.
  antragId: string;
  notiz: string;
};

export type Mitglied = Mitgliedsdaten & { id: string; angelegt: string; geaendert: string };

export type Listeneintrag = Pick<
  Mitglied,
  "id" | "mandatsreferenz" | "vorname" | "nachname" | "ort" | "email" | "eintrittsdatum" | "endeDatum" | "endeGrund"
>;

export type Trefferliste = { eintraege: Listeneintrag[]; anzahl: number; seiten: number };

// "aktiv": Mitgliedschaft läuft heute. "beendet": Ende der Mitgliedschaft liegt hinter uns.
export type Filter = "aktiv" | "beendet";

export type Suche = { suche: string; filter?: Filter; seite: number };

// --- Seams -------------------------------------------------------------------

export type Speicherergebnis =
  { ok: true; id: string } | { ok: false; grund: "mandatsreferenz-vergeben" | "antrag-vergeben" | "nicht-gefunden" };

export type Ablage = {
  suchen(suche: Suche, heute: string): Promise<Trefferliste>;
  laden(id: string): Promise<Mitglied | null>;
  anlegen(daten: Mitgliedsdaten): Promise<Speicherergebnis>;
  aendern(id: string, daten: Mitgliedsdaten): Promise<Speicherergebnis>;
  // Alle vergebenen Mandatsreferenzen, auch die beendeter Mitglieder.
  mandatsreferenzen(): Promise<string[]>;
  // Mitglieder, deren Mitgliedschaft heute läuft.
  anzahlAktiv(heute: string): Promise<number>;
  // IDs der Online-Mitgliedsanträge, aus denen schon ein Mitglied entstanden ist.
  verknuepfteAntraege(): Promise<string[]>;
  // ID des Mitglieds, das aus dem Online-Mitgliedsantrag entstanden ist, sonst null.
  zuAntrag(antragId: string): Promise<string | null>;
};
