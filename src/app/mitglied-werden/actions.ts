"use server";

import { randomUUID } from "node:crypto";
import { LINK_GUELTIG_TAGE, type Antrag } from "@/lib/antrag";
import { sendMail } from "@/lib/mail";
import { clientInfo, rateLimit, siteUrl } from "@/lib/request";
import { mitgliedSchema, normalizeIban } from "@/lib/schemas";
import { seal } from "@/lib/token";
import { verein } from "@/lib/verein";

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

export async function antragEinreichen(eingabe: unknown): Promise<Ergebnis> {
  const parsed = mitgliedSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { mandat: _m, datenschutz: _d, website, ...daten } = parsed.data;
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anträge in kurzer Zeit. Bitte versuch es später erneut." };
  }

  const id = randomUUID();
  const antrag: Antrag = {
    id,
    mandatsreferenz: `FV-${id.slice(0, 8).toUpperCase()}`,
    daten: { ...daten, iban: normalizeIban(daten.iban) },
    eingereicht: { zeit: new Date().toISOString(), ip },
  };
  try {
    const link = `${siteUrl()}/unterschreiben/${seal(antrag, LINK_GUELTIG_TAGE * 24 * 60 * 60)}`;
    await sendMail({
      to: daten.email,
      subject: "Bitte bestätigen: deine Beitrittserklärung zum Förderverein SV Amendingen",
      text:
        `Hallo ${daten.vorname},\n\n` +
        `vielen Dank für dein Interesse am ${verein.name}!\n\n` +
        `Bitte öffne den folgenden Link, prüf deine Angaben und unterschreib deine Beitrittserklärung ` +
        `mit dem SEPA-Lastschriftmandat:\n\n${link}\n\n` +
        `Der Link ist ${LINK_GUELTIG_TAGE} Tage gültig. Falls du keinen Antrag gestellt hast, ignorier diese E-Mail einfach.\n\n` +
        `Sportliche Grüße\n${verein.name}`,
    });
  } catch (e) {
    console.error("Bestätigungsmail fehlgeschlagen", e);
    return { ok: false, fehler: "Die E-Mail konnte nicht versendet werden. Bitte versuch es später erneut." };
  }
  return { ok: true };
}
