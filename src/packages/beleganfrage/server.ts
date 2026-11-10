// Entry Point: echte Umgebung mit PocketBase und Resend.
import "server-only";
import type PocketBase from "pocketbase";
import { sendMail } from "@/lib/mail";
import { superuser } from "@/lib/pocketbase";
import { siteUrl } from "@/lib/request";
import { vorstandsBeleganfragen, websiteBeleganfragen, type Postausgang } from "./index";
import { leseablage, schreibablage } from "./lib/ablage-pocketbase";

const post: Postausgang = {
  senden: ({ attachments, ...mail }) =>
    sendMail({
      ...mail,
      attachments: attachments?.map((a) => ({ filename: a.dateiname, content: Buffer.from(a.inhalt) })),
    }),
};

// Für die öffentliche Website: nur Anfragen stellen, ohne Lesezugriff.
export function beleganfragenFuerWebsite() {
  return websiteBeleganfragen({
    schreiben: schreibablage(superuser),
    post,
    vorstandPostfach: process.env.QUITTUNG_EMPFAENGER || process.env.ANTRAG_EMPFAENGER || "",
    siteUrl: siteUrl(),
  });
}

// Für den internen Bereich. pb ist der Client des angemeldeten Vorstands (vorstandErforderlich),
// gelesen wird mit dessen Rechten, geschrieben als Superuser.
export function beleganfragenFuerVorstand(pb: PocketBase) {
  return vorstandsBeleganfragen({
    lesen: leseablage(pb),
    schreiben: schreibablage(superuser),
    post,
    jetzt: () => new Date(),
  });
}
