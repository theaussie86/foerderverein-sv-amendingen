// Entry Point: echte Umgebung mit PocketBase.
import "server-only";
import type PocketBase from "pocketbase";
import { superuser } from "@/lib/pocketbase";
import { mitglieder } from "./index";
import { pocketbaseAblage } from "./lib/ablage-pocketbase";

// Für den internen Bereich. pb ist der Client des angemeldeten Vorstands (vorstandErforderlich),
// gelesen und geschrieben wird mit dessen Rechten, damit die API-Regeln der Collection greifen.
export function mitgliederFuerVorstand(pb: PocketBase) {
  return mitglieder({ ablage: pocketbaseAblage(() => Promise.resolve(pb)), jetzt: () => new Date() });
}

// Für den Mitgliederzähler der Website. Zählt als Superuser, null ohne PocketBase.
export async function mitgliederFuerWebsite() {
  if (!(await superuser())) return null;
  const { anzahlAktiv, verknuepfteAntraege } = mitglieder({
    ablage: pocketbaseAblage(superuser),
    jetzt: () => new Date(),
  });
  return { anzahlAktiv, verknuepfteAntraege };
}
