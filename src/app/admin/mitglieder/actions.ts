"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Speicherergebnis } from "@/packages/mitglied/index";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";
import { mitgliedPflegeSchema } from "@/lib/schemas";
import { vorstandErforderlich } from "@/lib/vorstand-session";

export type Speicherfehler = { ok: false; fehler: string };

const MELDUNG: Record<Exclude<Speicherergebnis, { ok: true }>["grund"], string> = {
  "mandatsreferenz-vergeben": "Diese Mandatsreferenz hat schon ein anderes Mitglied.",
  "antrag-vergeben": "Aus diesem Mitgliedsantrag ist schon ein Mitglied entstanden.",
  "nicht-gefunden": "Das Mitglied gibt es nicht mehr.",
};

// Legt ein Mitglied an (id leer) oder ändert es. Bei Erfolg geht es weiter zur Detailansicht.
export async function mitgliedSpeichern(id: string, eingabe: unknown): Promise<Speicherfehler> {
  const { pb } = await vorstandErforderlich();
  const parsed = mitgliedPflegeSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben." };

  const mitglieder = mitgliederFuerVorstand(pb);
  let ergebnis: Speicherergebnis;
  try {
    ergebnis = id ? await mitglieder.aendern(id, parsed.data) : await mitglieder.anlegen(parsed.data);
  } catch (e) {
    console.error("Mitglied konnte nicht gespeichert werden", e instanceof Error ? e.message : e);
    return { ok: false, fehler: "Das Mitglied konnte nicht gespeichert werden." };
  }
  if (!ergebnis.ok) return { ok: false, fehler: MELDUNG[ergebnis.grund] };

  revalidatePath("/admin/mitglieder");
  revalidatePath(`/admin/mitglieder/${ergebnis.id}`);
  if (parsed.data.antragId) revalidatePath(`/admin/antraege/${parsed.data.antragId}`);
  redirect(`/admin/mitglieder/${ergebnis.id}?gespeichert=1`);
}
