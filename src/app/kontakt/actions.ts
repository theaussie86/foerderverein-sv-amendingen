"use server";

import { sendMail } from "@/lib/mail";
import { clientInfo, rateLimit } from "@/lib/request";
import { kontaktSchema } from "@/lib/schemas";
import { verein } from "@/lib/verein";

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

// Nachrichten werden nicht gespeichert, nur ans Vereinspostfach weitergeleitet.
// "Antworten" im Postfach geht direkt an den Absender.
export async function nachrichtSenden(eingabe: unknown): Promise<Ergebnis> {
  const parsed = kontaktSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüfen Sie Ihre Angaben." };

  const { website, name, email, betreff, nachricht } = parsed.data;
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Nachrichten in kurzer Zeit. Bitte versuchen Sie es später erneut." };
  }

  try {
    await sendMail({
      to: process.env.KONTAKT_EMPFAENGER || verein.email,
      replyTo: email,
      subject: `Kontaktformular: ${betreff?.trim() || name}`,
      text:
        `Nachricht über das Kontaktformular der Website.\n\n` +
        `Name: ${name}\nE-Mail: ${email}\n` +
        (betreff?.trim() ? `Betreff: ${betreff.trim()}\n` : "") +
        `\n${nachricht}\n\n` +
        `Mit "Antworten" geht die Mail direkt an ${name}.`,
    });
  } catch (e) {
    console.error("Kontaktformular konnte nicht versendet werden", e);
    return {
      ok: false,
      fehler: `Die Nachricht konnte nicht versendet werden. Bitte schreiben Sie uns direkt an ${verein.email}.`,
    };
  }
  return { ok: true };
}
