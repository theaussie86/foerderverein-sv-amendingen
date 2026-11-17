// Entry Point: echte Umgebung mit PocketBase.
import "server-only";
import { superuser } from "@/lib/pocketbase";
import { foerderprojekte } from "./index";
import { pocketbaseAblage } from "./lib/ablage-pocketbase";

// Für den internen Bereich. Nur nach vorstandErforderlich aufrufen: Die Collection-Regeln sind null,
// gelesen und geschrieben wird als Superuser.
export function foerderprojekteFuerVorstand() {
  return foerderprojekte({ ablage: pocketbaseAblage(superuser) });
}

// Für die öffentliche Website: liefert nur, was auf der Startseite steht. Liest als Superuser,
// weil die Collection-Regeln null sind.
export function foerderprojekteFuerWebsite(): Pick<
  ReturnType<typeof foerderprojekte>,
  "startseite" | "oeffentlichesBild"
> {
  return foerderprojekte({ ablage: pocketbaseAblage(superuser) });
}
