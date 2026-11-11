// Entry Point ohne "server-only": Typen, Labels und Formatierung für Seiten und Client-Komponenten.
import { spendenGrenzeVereinfacht } from "./lib/regeln";
import { ABLEHNUNGSGRUENDE, ANFRAGE_STATUS, type Ablehnungsgrund, type AnfrageStatus } from "./lib/typen";

export { ABLEHNUNGSGRUENDE, ANFRAGE_STATUS } from "./lib/typen";
export type { Ablehnungsgrund, AnfrageStatus, BelegArt, Beleganfrage, Listeneintrag, Trefferliste } from "./lib/typen";
export { belegArt, istBearbeitbar, spendenGrenzeVereinfacht } from "./lib/regeln";
export { euro } from "./lib/format";

export const ANFRAGE_STATUS_LABEL: Record<AnfrageStatus, string> = {
  offen: "Offen",
  wartend: "Wartend",
  ausgestellt: "Ausgestellt",
  abgelehnt: "Abgelehnt",
};

export const ABLEHNUNGSGRUND_LABEL: Record<Ablehnungsgrund, string> = {
  "nicht-eingegangen": "Spende nicht eingegangen",
  doppelt: "Doppelte Anfrage",
  "keine-spende": "Keine Spende",
  sonstiges: "Sonstiges",
};

// Bei Spam (Sonstiges) geht standardmäßig keine Ablehnungsmail raus.
export function ablehnungsmailVoreingestellt(grund: Ablehnungsgrund): boolean {
  return grund !== "sonstiges";
}

export const BELEG_ART_LABEL = {
  vereinfacht: `Vereinfachter Beleg (bis ${spendenGrenzeVereinfacht} €)`,
  zuwendungsbestaetigung: "Zuwendungsbestätigung",
} as const;

export function istAnfrageStatus(wert: string | undefined): wert is AnfrageStatus {
  return ANFRAGE_STATUS.some((s) => s === wert);
}

export function istAblehnungsgrund(wert: string): wert is Ablehnungsgrund {
  return ABLEHNUNGSGRUENDE.some((g) => g === wert);
}
