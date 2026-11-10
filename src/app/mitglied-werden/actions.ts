"use server";

import { clientInfo, rateLimit } from "@/lib/request";
import { mitgliedSchema } from "@/lib/schemas";
import type { Ergebnis } from "@/packages/mitgliedsantrag";
import { mitgliedsantrag } from "@/packages/mitgliedsantrag/server";

export async function antragEinreichen(eingabe: unknown): Promise<Ergebnis> {
  const parsed = mitgliedSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf deine Angaben." };

  const { mandat: _m, datenschutz: _d, website, ...daten } = parsed.data;
  // Bots bekommen eine scheinbare Erfolgsmeldung, damit sie nicht weiterprobieren.
  if (website) return { ok: true };

  const herkunft = await clientInfo();
  if (!rateLimit(herkunft.ip, 5, 60 * 60 * 1000)) {
    return { ok: false, fehler: "Zu viele Anträge in kurzer Zeit. Bitte versuch es später erneut." };
  }

  return mitgliedsantrag.einreichen(daten, herkunft);
}
