"use server";

import { revalidatePath } from "next/cache";
import type { Ablehnungsergebnis } from "@/packages/mitgliedsantrag/entscheidung";
import { mitgliedsantraegeFuerEntscheidung } from "@/packages/mitgliedsantrag/server";
import { mitgliedsantragAblehnenSchema } from "@/lib/schemas";
import { vorstandErforderlich } from "@/lib/vorstand-session";

export type AblehnenErgebnis = { ok: true } | { ok: false; fehler: string };

const MELDUNG: Record<Exclude<Ablehnungsergebnis, { ok: true }>["grund"], string> = {
  "nicht-gefunden": "Den Mitgliedsantrag gibt es nicht.",
  "nicht-ablehnbar":
    "Der Mitgliedsantrag ist nicht mehr eingegangen oder schon Mitglied und kann nicht abgelehnt werden.",
  "grund-fehlt": "Bitte einen Grund angeben.",
  mail: "Die Mail konnte nicht verschickt werden. Der Mitgliedsantrag ist unverändert, bitte später erneut versuchen.",
};

export async function mitgliedsantragAblehnen(id: string, eingabe: unknown): Promise<AblehnenErgebnis> {
  await vorstandErforderlich();
  const parsed = mitgliedsantragAblehnenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben zur Ablehnung." };

  const ergebnis = await mitgliedsantraegeFuerEntscheidung().ablehnen(id, parsed.data);
  if (!ergebnis.ok) return { ok: false, fehler: MELDUNG[ergebnis.grund] };

  revalidatePath("/admin");
  revalidatePath(`/admin/antraege/${id}`);
  return { ok: true };
}
