// Entry Point ohne "server-only": Typen und Labels für Seiten und Client-Komponenten.
import { ENDE_GRUENDE, type EndeGrund, type Filter } from "./lib/typen";

export { ENDE_GRUENDE } from "./lib/typen";
export type { EndeGrund, Filter, Listeneintrag, Mitglied, Mitgliedsdaten, Trefferliste } from "./lib/typen";
export { istAktiv } from "./lib/aktiv";

export const ENDE_GRUND_LABEL: Record<EndeGrund, string> = {
  austritt: "Austritt",
  ausschluss: "Ausschluss",
  tod: "Tod",
};

export const FILTER = ["aktiv", "beendet"] as const satisfies readonly Filter[];

export const FILTER_LABEL: Record<Filter, string> = { aktiv: "Aktiv", beendet: "Beendet" };

export function istFilter(wert: string | undefined): wert is Filter {
  return FILTER.some((f) => f === wert);
}

export function istEndeGrund(wert: string): wert is EndeGrund {
  return ENDE_GRUENDE.some((g) => g === wert);
}
