// Entry Point ohne "server-only": Typen und Labels für die Anzeige der Mitgliedsanträge im Vorstandsbereich.
import type { ListResult, RecordModel } from "pocketbase";
import type { Protokoll } from "./lib/antrag";

export type { Protokoll };

export const STATUS = ["eingegangen", "angenommen", "abgelehnt", "ausgetreten"] as const;
export type Status = (typeof STATUS)[number];

export const STATUS_LABEL: Record<Status, string> = {
  eingegangen: "Eingegangen",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
  ausgetreten: "Ausgetreten",
};

export function istStatus(wert: string | undefined): wert is Status {
  return STATUS.some((s) => s === wert);
}

// Feldnamen wie in der PocketBase-Collection "mitgliedsantraege" (#38).
export type Mitgliedsantrag = RecordModel & {
  antrag_id: string;
  mandatsreferenz: string;
  status: Status;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  geburtsdatum: string;
  kontoinhaber: string;
  iban: string;
  jahresbeitrag: number;
  eingereicht_am: string;
  unterschrieben_am: string;
  protokoll: Protokoll;
  pruefsumme: string;
  unterschrift: string;
  beitritt_pdf: string;
  mandat_pdf: string;
  notiz: string;
  created: string;
  updated: string;
};

export type Antragszeile = Pick<
  Mitgliedsantrag,
  "id" | "mandatsreferenz" | "status" | "vorname" | "nachname" | "ort" | "email" | "unterschrieben_am"
>;

export type Antragsliste = ListResult<Antragszeile>;

// Dateifelder, die über /admin/antraege/[id]/dateien/[feld] ausgeliefert werden.
export const DATEIEN = {
  beitritt_pdf: "Beitrittserklärung",
  mandat_pdf: "SEPA-Lastschriftmandat",
  unterschrift: "Unterschrift",
} as const;
export type Dateifeld = keyof typeof DATEIEN;

export function istDateifeld(feld: string): feld is Dateifeld {
  return Object.hasOwn(DATEIEN, feld);
}
