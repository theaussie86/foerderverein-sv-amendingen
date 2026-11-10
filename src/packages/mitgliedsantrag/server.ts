// Entry Point: der Mitgliedsantrag mit echter Umgebung (PocketBase als Superuser, Resend, AES-Token).
import "server-only";
import { randomUUID } from "node:crypto";
import { sendMail } from "@/lib/mail";
import { superuserPocketbase } from "@/lib/pocketbase";
import { siteUrl } from "@/lib/request";
import { seal, unseal } from "@/lib/token";
import { mitgliedsantraege } from "./index";
import { pocketbaseAblage } from "./lib/ablage-pocketbase";

export const mitgliedsantrag = mitgliedsantraege({
  ablage: pocketbaseAblage(superuserPocketbase),
  postausgang: { senden: sendMail },
  siegel: { versiegeln: seal, entsiegeln: unseal },
  jetzt: () => new Date(),
  neueId: randomUUID,
  // Getter, damit die Umgebungsvariablen erst beim Aufruf gelesen werden.
  get linkBasis() {
    return siteUrl();
  },
  get antragEmpfaenger() {
    return process.env.ANTRAG_EMPFAENGER ?? "";
  },
});
