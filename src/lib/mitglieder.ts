import "server-only";
import { antraegeSeit } from "@/lib/pocketbase";
import { mitgliederbasis, mitgliederziel } from "@/lib/verein";

export type Mitgliederstand = {
  gesamt: number;
  ziel: number;
  // Neuzugänge im kürzesten Zeitraum, in dem es welche gab. Null, wenn keine.
  zuwachs: { anzahl: number; zeitraum: string } | null;
};

const TAG = 24 * 60 * 60 * 1000;

const zeitraeume = [
  { tage: 30, text: "in den letzten 30 Tagen" },
  { tage: 90, text: "in den letzten 3 Monaten" },
  { tage: 365, text: "im letzten Jahr" },
];

export async function mitgliederstand(): Promise<Mitgliederstand> {
  const stichtag = new Date(`${mitgliederbasis.stichtag}T00:00:00Z`);
  const seitStichtag = (await antraegeSeit(stichtag)) ?? 0;
  const gesamt = mitgliederbasis.anzahl + seitStichtag;
  const ziel = Math.max(mitgliederziel, Math.ceil((gesamt + 1) / 50) * 50);

  let zuwachs: Mitgliederstand["zuwachs"] = null;
  if (seitStichtag > 0) {
    for (const z of zeitraeume) {
      const seit = new Date(Math.max(Date.now() - z.tage * TAG, stichtag.getTime()));
      const anzahl = (await antraegeSeit(seit)) ?? 0;
      if (anzahl > 0) {
        zuwachs = { anzahl, zeitraum: z.text };
        break;
      }
    }
  }

  return { gesamt, ziel, zuwachs };
}
