"use server";

import { belegArt, type BelegArt } from "@/packages/beleganfrage/anzeige";
import { beleganfragenFuerWebsite } from "@/packages/beleganfrage/server";
import { clientInfo, rateLimit } from "@/lib/request";
import { beleganfrageSchema } from "@/lib/schemas";

export type Ergebnis = { ok: true; art: BelegArt } | { ok: false; fehler: string };

export async function belegAnfordern(eingabe: unknown): Promise<Ergebnis> {
  const parsed = beleganfrageSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { website, tag_der_spende, ...d } = parsed.data;
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true, art: belegArt(d.betrag) };

  const { ip } = await clientInfo();
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuch es später erneut." };
  }

  const ergebnis = await beleganfragenFuerWebsite().stellen({ ...d, tagDerSpende: tag_der_spende });
  if (!ergebnis.ok) {
    return { ok: false, fehler: "Die Anfrage konnte nicht versendet werden. Bitte versuch es später erneut." };
  }
  return ergebnis;
}
