"use server";

import { clientInfo } from "@/lib/request";
import { unterschriftSchema } from "@/lib/schemas";
import type { Ergebnis } from "@/packages/mitgliedsantrag";
import { mitgliedsantraegeFuerWebsite } from "@/packages/mitgliedsantrag/server";

export async function unterschreiben(eingabe: unknown): Promise<Ergebnis> {
  const parsed = unterschriftSchema.safeParse(eingabe);
  if (!parsed.success)
    return { ok: false, fehler: parsed.error.issues[0]?.message ?? "Bitte prüf deine Unterschrift." };

  return mitgliedsantraegeFuerWebsite().unterschreiben(parsed.data, await clientInfo());
}
