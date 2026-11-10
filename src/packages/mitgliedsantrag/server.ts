// Entry Point: echte Umgebung mit PocketBase, Resend und AES-Token.
import "server-only";
import { randomUUID } from "node:crypto";
import type PocketBase from "pocketbase";
import { sendMail } from "@/lib/mail";
import { superuser } from "@/lib/pocketbase";
import { siteUrl } from "@/lib/request";
import { seal, unseal } from "@/lib/token";
import type { Antragsliste } from "./anzeige";
import { mitgliedsantraege } from "./index";
import { pocketbaseAblage } from "./lib/ablage-pocketbase";
import { datei, laden, suchen, type Suche } from "./lib/vorstandssicht";

// Für die öffentliche Website: einreichen, öffnen, unterschreiben und der Mitgliederzähler.
// Gespeichert und gezählt wird als Superuser.
export function mitgliedsantraegeFuerWebsite() {
  return mitgliedsantraege({
    ablage: pocketbaseAblage(superuser),
    postausgang: { senden: sendMail },
    siegel: { versiegeln: seal, entsiegeln: unseal },
    jetzt: () => new Date(),
    neueId: randomUUID,
    linkBasis: siteUrl(),
    antragEmpfaenger: process.env.ANTRAG_EMPFAENGER ?? "",
  });
}

// Für den internen Bereich. pb ist der Client des angemeldeten Vorstands (vorstandErforderlich),
// gelesen wird mit dessen Rechten, damit die API-Regeln der Collection greifen.
export function mitgliedsantraegeFuerVorstand(pb: PocketBase) {
  return {
    suchen: (anfrage: Suche): Promise<Antragsliste> => suchen(pb, anfrage),
    // Null, wenn es den Mitgliedsantrag nicht gibt.
    laden: (id: string) => laden(pb, id),
    // Beitrittserklärung, Mandat oder Unterschriftsbild zum Durchreichen an den Browser.
    datei: (id: string, feld: string) => datei(pb, id, feld),
  };
}
