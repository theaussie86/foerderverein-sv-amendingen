"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type AbschlussErgebnis } from "@/packages/beleganfrage/index";
import { beleganfragenFuerVorstand } from "@/packages/beleganfrage/server";
import { beleganfrageErfassenSchema } from "@/lib/schemas";
import { vorstandErforderlich } from "@/lib/vorstand-session";

async function alsVorstand() {
  const { pb, vorstand } = await vorstandErforderlich();
  return { anfragen: beleganfragenFuerVorstand(pb), vorstandId: vorstand.id };
}

// Nicht offen oder falsche Art (Doppelklick, veraltete Seite) läuft still ins Leere.
function abschluss(id: string, ergebnis: AbschlussErgebnis): void {
  if (!ergebnis.ok && ergebnis.grund === "mail") redirect(`/admin/spenden/${id}?fehler=mail`);
  revalidatePath("/admin/spenden");
  revalidatePath(`/admin/spenden/${id}`);
}

export async function alsAusgestelltMarkieren(id: string): Promise<void> {
  const { anfragen, vorstandId } = await alsVorstand();
  abschluss(id, await anfragen.alsAusgestelltMarkieren(id, vorstandId));
}

export async function belegFreigeben(id: string): Promise<void> {
  const { anfragen, vorstandId } = await alsVorstand();
  abschluss(id, await anfragen.freigeben(id, vorstandId));
}

export async function anfrageAblehnen(id: string): Promise<void> {
  const { anfragen, vorstandId } = await alsVorstand();
  abschluss(id, await anfragen.ablehnen(id, vorstandId));
}

export type ErfassenErgebnis = { ok: false; fehler: string };

// Bei Erfolg geht es weiter zur Detailansicht.
export async function beleganfrageErfassen(eingabe: unknown): Promise<ErfassenErgebnis> {
  const { anfragen, vorstandId } = await alsVorstand();
  const parsed = beleganfrageErfassenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben." };

  const { direktFreigeben, tag_der_spende, ...d } = parsed.data;
  const ergebnis = await anfragen.erfassen({ ...d, tagDerSpende: tag_der_spende }, vorstandId, { direktFreigeben });
  if (!ergebnis.ok && ergebnis.grund === "nicht-gespeichert") {
    return { ok: false, fehler: "Die Beleganfrage konnte nicht gespeichert werden." };
  }

  revalidatePath("/admin/spenden");
  revalidatePath(`/admin/spenden/${ergebnis.id}`);
  redirect(`/admin/spenden/${ergebnis.id}${ergebnis.ok ? "" : "?fehler=mail"}`);
}
