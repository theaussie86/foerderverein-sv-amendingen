// Entry Point: Mitglieder pflegen und zählen. Die Ablage wird hineingereicht, die echte
// mit PocketBase baut server.ts, Tests nehmen Fakes.
import { naechsteMandatsreferenz, normalisieren } from "./lib/regeln";
import type { Ablage, Mitglied, Mitgliedsdaten, Speicherergebnis, Suche, Trefferliste } from "./lib/typen";

export type {
  Ablage,
  EndeGrund,
  Filter,
  Listeneintrag,
  Mitglied,
  Mitgliedsdaten,
  Speicherergebnis,
  Suche,
  Trefferliste,
} from "./lib/typen";
export { istAktiv } from "./lib/aktiv";
export { naechsteMandatsreferenz, normalisieren } from "./lib/regeln";

export type Umgebung = { ablage: Ablage; jetzt(): Date };

// Kalendertag in deutscher Zeit, damit ein Ende am 31.12. bis Mitternacht zählt.
function heute(jetzt: Date): string {
  return jetzt.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function mitglieder(u: Umgebung) {
  return {
    suchen: (suche: Suche): Promise<Trefferliste> => u.ablage.suchen(suche, heute(u.jetzt())),

    laden: (id: string): Promise<Mitglied | null> => u.ablage.laden(id),

    anlegen: (daten: Mitgliedsdaten): Promise<Speicherergebnis> => u.ablage.anlegen(normalisieren(daten)),

    aendern: (id: string, daten: Mitgliedsdaten): Promise<Speicherergebnis> =>
      u.ablage.aendern(id, normalisieren(daten)),

    // Vorschlag für ein neues Mitglied: die nächste freie Zahl nach der höchsten vergebenen.
    async neueMandatsreferenz(): Promise<string> {
      return naechsteMandatsreferenz(await u.ablage.mandatsreferenzen());
    },

    anzahlAktiv: (): Promise<number> => u.ablage.anzahlAktiv(heute(u.jetzt())),

    verknuepfteAntraege: (): Promise<string[]> => u.ablage.verknuepfteAntraege(),

    zuAntrag: (antragId: string): Promise<string | null> => u.ablage.zuAntrag(antragId),
  };
}
