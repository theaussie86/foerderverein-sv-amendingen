"use server";

import { sendMail } from "@/lib/mail";
import { clientInfo, rateLimit } from "@/lib/request";
import { quittungSchema } from "@/lib/schemas";

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

// Die Quittung wird erst ausgestellt, nachdem der Vorstand den Geldeingang auf dem Konto geprüft hat.
export async function quittungAnfordern(eingabe: unknown): Promise<Ergebnis> {
  const parsed = quittungSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { website, ...d } = parsed.data;
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuch es später erneut." };
  }

  const betrag = d.betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  const datum = new Date(d.datum).toLocaleDateString("de-DE");
  try {
    await sendMail({
      to: process.env.QUITTUNG_EMPFAENGER || process.env.ANTRAG_EMPFAENGER || "",
      replyTo: d.email,
      subject: `Spendenquittung angefordert: ${d.name}, ${betrag}`,
      text:
        `Über die Website wurde eine Spendenquittung angefordert.\n\n` +
        `Name: ${d.name}\nAnschrift: ${d.strasse}, ${d.plz} ${d.ort}\nE-Mail: ${d.email}\n` +
        `Betrag: ${betrag}\nÜberwiesen am: ${datum}\n\n` +
        `Bitte erst nach Prüfung des Geldeingangs auf dem Vereinskonto die Zuwendungsbestätigung ausstellen. ` +
        `Mit "Antworten" geht die Mail direkt an den Spender.`,
    });
  } catch (e) {
    console.error("Quittungsanfrage fehlgeschlagen", e);
    return { ok: false, fehler: "Die Anfrage konnte nicht versendet werden. Bitte versuch es später erneut." };
  }
  return { ok: true };
}
