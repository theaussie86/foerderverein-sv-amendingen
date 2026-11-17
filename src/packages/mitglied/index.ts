// Entry Point: Mitglieder pflegen und zählen. Die Ablage wird hineingereicht, die echte
// mit PocketBase baut server.ts, Tests nehmen Fakes.
import { csvDateiname, mitgliederCsv, type CsvSpalte } from "./lib/csv";
import { naechsteMandatsreferenz, normalisieren } from "./lib/regeln";
import type { Ablage, Gesamtsuche, Mitglied, Mitgliedsdaten, Speicherergebnis, Suche, Trefferliste } from "./lib/typen";

export type {
  Ablage,
  EndeGrund,
  Filter,
  Gesamtsuche,
  Listeneintrag,
  Mitglied,
  Mitgliedsdaten,
  Speicherergebnis,
  Suche,
  Trefferliste,
} from "./lib/typen";
export { istAktiv } from "./lib/aktiv";
export { CSV_SPALTEN, type CsvSpalte } from "./lib/csv";
export { naechsteMandatsreferenz, normalisieren } from "./lib/regeln";

export type Umgebung = {
  ablage: Ablage;
  mitgliedsantraege: {
    // Falsch bei einem abgelehnten oder unbekannten Online-Mitgliedsantrag.
    annehmbar(antragId: string): Promise<boolean>;
    // Setzt einen Online-Mitgliedsantrag auf „angenommen“. Wirft, wenn das nicht klappt.
    annehmen(antragId: string): Promise<void>;
  };
  jetzt(): Date;
};

// Kalendertag in deutscher Zeit, damit ein Ende am 31.12. bis Mitternacht zählt.
function heute(jetzt: Date): string {
  return jetzt.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function mitglieder(u: Umgebung) {
  return {
    suchen: (suche: Suche): Promise<Trefferliste> => u.ablage.suchen(suche, heute(u.jetzt())),

    laden: (id: string): Promise<Mitglied | null> => u.ablage.laden(id),

    // CSV mit genau den Mitgliedern, die die Liste bei dieser Suche zeigt, über alle Seiten.
    async exportieren(suche: Gesamtsuche, spalten: readonly CsvSpalte[]) {
      const tag = heute(u.jetzt());
      return {
        inhalt: mitgliederCsv(await u.ablage.alle(suche, tag), spalten),
        dateiname: csvDateiname(suche.filter, tag),
      };
    },

    // Aufnahme: Stammt das Mitglied aus einem Online-Mitgliedsantrag, wird dieser im selben Vorgang
    // angenommen. Klappt das nicht, bleibt das Mitglied trotzdem gespeichert. Aus einem abgelehnten
    // Mitgliedsantrag entsteht kein Mitglied.
    async anlegen(daten: Mitgliedsdaten): Promise<Speicherergebnis> {
      if (daten.antragId && !(await u.mitgliedsantraege.annehmbar(daten.antragId))) {
        return { ok: false, grund: "antrag-nicht-uebernehmbar" };
      }
      const ergebnis = await u.ablage.anlegen(normalisieren(daten));
      if (ergebnis.ok && daten.antragId) {
        try {
          await u.mitgliedsantraege.annehmen(daten.antragId);
        } catch (e) {
          console.error(`Mitgliedsantrag ${daten.antragId} konnte nicht angenommen werden`, e);
        }
      }
      return ergebnis;
    },

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
