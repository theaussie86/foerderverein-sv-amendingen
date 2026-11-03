"use server";

import { sendMail } from "@/lib/mail";
import { erzeugeSpendenbelegPdf } from "@/lib/pdf";
import { neueRecordId, spendenbelegSpeichern, type PdfAnhang } from "@/lib/pocketbase";
import { clientInfo, rateLimit, siteUrl } from "@/lib/request";
import { quittungSchema, type QuittungFormData } from "@/lib/schemas";
import { spendenGrenzeVereinfacht, verein } from "@/lib/verein";

export type Ergebnis = { ok: true; art: "vereinfacht" | "zuwendungsbestaetigung" } | { ok: false; fehler: string };

type Spende = Omit<QuittungFormData, "website">;

export async function quittungAnfordern(eingabe: unknown): Promise<Ergebnis> {
  const parsed = quittungSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { website, ...d } = parsed.data;
  const art = d.betrag <= spendenGrenzeVereinfacht ? "vereinfacht" : "zuwendungsbestaetigung";
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true, art };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuch es später erneut." };
  }

  return art === "vereinfacht" ? belegVersenden(d) : bestaetigungAnfragen(d);
}

function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function speichern(
  d: Spende,
  art: "vereinfacht" | "zuwendungsbestaetigung",
  status: "versendet" | "offen",
  beleg?: { id: string; pdf: PdfAnhang },
) {
  return spendenbelegSpeichern({ art, status, ...d, ueberwiesenAm: d.datum, ...beleg });
}

// Bis 300 € geht der Beleg sofort per Mail an den Spender und wird samt PDF zur Übersicht gespeichert.
// Die ID des Eintrags steht als Beleg-Nr. im PDF und im Dateinamen, so passen Mail, PDF und Eintrag zusammen.
async function belegVersenden(d: Spende): Promise<Ergebnis> {
  const id = neueRecordId();
  let pdf: PdfAnhang;
  try {
    pdf = {
      filename: `Spendenbeleg_${d.datum.replace(/[^0-9-]/g, "")}_${id}.pdf`,
      content: Buffer.from(await erzeugeSpendenbelegPdf({ ...d, belegNr: id })),
    };
    await sendMail({
      to: d.email,
      subject: `Dein Spendenbeleg über ${euro(d.betrag)}`,
      text:
        `Hallo ${d.name},\n\n` +
        `vielen Dank für deine Spende an den ${verein.name}!\n\n` +
        `Im Anhang findest du den Spendenbeleg. Bis 300 € genügt dem Finanzamt dieser Beleg zusammen mit deinem ` +
        `Kontoauszug, auf dem die Überweisung an uns zu sehen ist. Heb bitte beides für deine Steuererklärung auf.\n\n` +
        `Viele Grüße\n${verein.name}`,
      attachments: [pdf],
    });
  } catch (e) {
    console.error("Spendenbeleg konnte nicht versendet werden", e);
    return { ok: false, fehler: "Der Beleg konnte nicht versendet werden. Bitte versuch es später erneut." };
  }

  try {
    await speichern(d, "vereinfacht", "versendet", { id, pdf });
  } catch (e) {
    console.error("Spendenbeleg versendet, aber nicht gespeichert", e);
  }
  return { ok: true, art: "vereinfacht" };
}

// Über 300 € stellt der Vorsitz die Zuwendungsbestätigung aus, nachdem er den Geldeingang geprüft hat.
async function bestaetigungAnfragen(d: Spende): Promise<Ergebnis> {
  let id: string | null = null;
  try {
    id = await speichern(d, "zuwendungsbestaetigung", "offen");
  } catch (e) {
    console.error("Anfrage Zuwendungsbestätigung nicht gespeichert", e);
  }

  try {
    await sendMail({
      to: process.env.QUITTUNG_EMPFAENGER || process.env.ANTRAG_EMPFAENGER || "",
      replyTo: d.email,
      subject: `Zuwendungsbestätigung angefordert: ${d.name}, ${euro(d.betrag)}`,
      text:
        `Über die Website wurde eine Zuwendungsbestätigung angefordert.\n\n` +
        `Name: ${d.name}\nAnschrift: ${d.strasse}, ${d.plz} ${d.ort}\nE-Mail: ${d.email}\n` +
        `Betrag: ${euro(d.betrag)}\nÜberwiesen am: ${new Date(d.datum).toLocaleDateString("de-DE", { timeZone: "UTC" })}\n\n` +
        `Bitte erst nach Prüfung des Geldeingangs auf dem Vereinskonto die Zuwendungsbestätigung ausstellen. ` +
        `Mit "Antworten" geht die Mail direkt an den Spender.\n\n` +
        (id ? `Danach im internen Bereich als ausgestellt markieren:\n${siteUrl()}/admin/spenden/${id}` : ""),
    });
  } catch (e) {
    console.error("Mail zur Zuwendungsbestätigung fehlgeschlagen", e);
    // Gespeichert ist die Anfrage trotzdem in der Übersicht des Vorstands.
    if (!id) return { ok: false, fehler: "Die Anfrage konnte nicht versendet werden. Bitte versuch es später erneut." };
  }
  return { ok: true, art: "zuwendungsbestaetigung" };
}
