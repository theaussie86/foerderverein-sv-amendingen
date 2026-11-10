// Entry Point ohne "server-only": Typen, Labels und Formatierung für Seiten und Client-Komponenten.
import { ANFRAGE_STATUS, type AnfrageStatus } from "./lib/typen";

export { ANFRAGE_STATUS } from "./lib/typen";
export type { AnfrageStatus, BelegArt, Beleganfrage, Listeneintrag, Trefferliste } from "./lib/typen";
export { belegArt, spendenGrenzeVereinfacht } from "./lib/regeln";
export { euro } from "./lib/format";

export const ANFRAGE_STATUS_LABEL: Record<AnfrageStatus, string> = {
  offen: "Offen",
  ausgestellt: "Ausgestellt",
  versendet: "Beleg versendet",
  abgelehnt: "Abgelehnt",
};

export const BELEG_ART_LABEL = {
  vereinfacht: "Vereinfachter Beleg (bis 300 €)",
  zuwendungsbestaetigung: "Zuwendungsbestätigung",
} as const;

export function istAnfrageStatus(wert: string | undefined): wert is AnfrageStatus {
  return ANFRAGE_STATUS.some((s) => s === wert);
}
