// Entry Point: Vorstandssicht auf die Mitgliedsanträge. Bekommt den PocketBase-Client des angemeldeten
// Vorstands (vorstandErforderlich().pb), damit die API-Regeln der Collection greifen.
import "server-only";
import type PocketBase from "pocketbase";
import type { ListResult } from "pocketbase";
import type { Antragszeile } from "./anzeige";
import { datei, laden, suchen, type Datei, type Suche } from "./lib/vorstandssicht";

export type { Datei, Suche };
export type Antragsliste = ListResult<Antragszeile>;

export function antragsverwaltung(pb: PocketBase) {
  return {
    suchen: (anfrage: Suche): Promise<Antragsliste> => suchen(pb, anfrage),
    // Null, wenn es den Antrag nicht gibt.
    laden: (id: string) => laden(pb, id),
    // Beitrittserklärung, Mandat oder Unterschriftsbild zum Durchreichen an den Browser.
    datei: (id: string, feld: string) => datei(pb, id, feld),
  };
}
