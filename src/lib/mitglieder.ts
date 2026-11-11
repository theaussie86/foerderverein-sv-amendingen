import "server-only";
import { connection } from "next/server";
import { mitgliederFuerWebsite } from "@/packages/mitglied/server";
import { mitgliedsantraegeFuerWebsite } from "@/packages/mitgliedsantrag/server";
import { mitgliederziel } from "@/lib/verein";

export type Mitgliederstand = {
  gesamt: number;
  ziel: number;
  // Online-Neuzugänge im kürzesten Zeitraum, in dem es welche gab. Null, wenn keine.
  zuwachs: { anzahl: number; zeitraum: string } | null;
};

const TAG = 24 * 60 * 60 * 1000;

const zeitraeume = [
  { tage: 30, text: "in den letzten 30 Tagen" },
  { tage: 90, text: "in den letzten 3 Monaten" },
  { tage: 365, text: "im letzten Jahr" },
];

// Mitgliederzähler auf der Startseite: alle Mitglieder, deren Mitgliedschaft läuft, plus online
// unterschriebene Mitgliedsanträge, die der Vorstand noch nicht als Mitglied erfasst hat.
// Null ohne PocketBase oder wenn es nicht antwortet, dann zeigt die Startseite keinen Zähler.
// Wird bei jedem Aufruf frisch gezählt: Beim Docker-Build gibt es kein PocketBase, ein vorgerenderter
// Zähler würde nach jedem Deploy fehlen.
export async function mitgliederstand(): Promise<Mitgliederstand | null> {
  await connection();
  try {
    const mitglieder = await mitgliederFuerWebsite();
    if (!mitglieder) return null;
    const antraege = mitgliedsantraegeFuerWebsite();
    const [aktiv, verknuepft] = await Promise.all([mitglieder.anzahlAktiv(), mitglieder.verknuepfteAntraege()]);
    const offen = await antraege.anzahlSeit(new Date(0), verknuepft);
    if (offen === null) return null;

    const gesamt = aktiv + offen;
    const ziel = Math.max(mitgliederziel, Math.ceil((gesamt + 1) / 50) * 50);

    let zuwachs: Mitgliederstand["zuwachs"] = null;
    for (const z of zeitraeume) {
      const anzahl = (await antraege.anzahlSeit(new Date(Date.now() - z.tage * TAG))) ?? 0;
      if (anzahl > 0) {
        zuwachs = { anzahl, zeitraum: z.text };
        break;
      }
    }
    return { gesamt, ziel, zuwachs };
  } catch (e) {
    console.error("Mitgliederzähler konnte nicht geladen werden", e instanceof Error ? e.message : e);
    return null;
  }
}
