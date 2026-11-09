"use server";

import { sendMail } from "@/lib/mail";
import { beleganfrageSpeichern } from "@/lib/pocketbase";
import { clientInfo, rateLimit, siteUrl } from "@/lib/request";
import { beleganfrageSchema, type BeleganfrageFormData } from "@/lib/schemas";
import { spendenGrenzeVereinfacht } from "@/lib/verein";

type Art = "vereinfacht" | "zuwendungsbestaetigung";

export type Ergebnis = { ok: true; art: Art } | { ok: false; fehler: string };

type Spende = Omit<BeleganfrageFormData, "website">;

export async function belegAnfordern(eingabe: unknown): Promise<Ergebnis> {
  const parsed = beleganfrageSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { website, ...d } = parsed.data;
  const art = d.betrag <= spendenGrenzeVereinfacht ? "vereinfacht" : "zuwendungsbestaetigung";
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true, art };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuch es später erneut." };
  }

  return anfrageSpeichern(d, art);
}

function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// Jede Anfrage wird nur gespeichert und dem Vorstand gemeldet. Den Beleg gibt es erst,
// wenn der Vorstand den Geldeingang auf dem Vereinskonto geprüft hat (/admin/spenden).
// Sonst könnte jeder einen Beleg für eine Spende anfordern, die nie überwiesen wurde.
async function anfrageSpeichern(d: Spende, art: Art): Promise<Ergebnis> {
  let id: string | null = null;
  try {
    id = await beleganfrageSpeichern({ art, ...d, ueberwiesenAm: d.datum });
  } catch (e) {
    console.error("Anfrage Spendenbeleg nicht gespeichert", e);
  }

  const vereinfacht = art === "vereinfacht";
  try {
    await sendMail({
      to: process.env.QUITTUNG_EMPFAENGER || process.env.ANTRAG_EMPFAENGER || "",
      replyTo: d.email,
      subject: `${vereinfacht ? "Spendenbeleg" : "Zuwendungsbestätigung"} angefordert: ${d.name}, ${euro(d.betrag)}`,
      text:
        `Über die Website wurde ${vereinfacht ? "ein Spendenbeleg" : "eine Zuwendungsbestätigung"} angefordert.\n\n` +
        `Name: ${d.name}\nAnschrift: ${d.strasse}, ${d.plz} ${d.ort}\nE-Mail: ${d.email}\n` +
        `Betrag: ${euro(d.betrag)}\nÜberwiesen am: ${new Date(d.datum).toLocaleDateString("de-DE", { timeZone: "UTC" })}\n\n` +
        `Bitte zuerst den Geldeingang auf dem Vereinskonto prüfen. ` +
        (vereinfacht
          ? `Ist die Spende eingegangen, im internen Bereich bestätigen. Dann geht der Spendenbeleg automatisch an den Spender.`
          : `Ist die Spende eingegangen, die Zuwendungsbestätigung ausstellen und im internen Bereich als ausgestellt markieren.`) +
        `\n\n` +
        (id ? `${siteUrl()}/admin/spenden/${id}\n\n` : "") +
        `Mit "Antworten" geht die Mail direkt an den Spender.`,
    });
  } catch (e) {
    console.error("Mail zur Spendenbeleg-Anfrage fehlgeschlagen", e);
    // Gespeichert ist die Anfrage trotzdem in der Übersicht des Vorstands.
    if (!id) return { ok: false, fehler: "Die Anfrage konnte nicht versendet werden. Bitte versuch es später erneut." };
  }
  return { ok: true, art };
}
