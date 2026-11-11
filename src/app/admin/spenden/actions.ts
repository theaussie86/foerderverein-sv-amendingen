"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type AbschlussErgebnis } from "@/packages/beleganfrage/index";
import { beleganfragenFuerVorstand } from "@/packages/beleganfrage/server";
import { beleganfrageAblehnenSchema, beleganfrageAusstellenSchema, beleganfrageErfassenSchema } from "@/lib/schemas";
import { vorstandErforderlich } from "@/lib/vorstand-session";

async function alsVorstand() {
  const { pb, vorstand } = await vorstandErforderlich();
  return { anfragen: beleganfragenFuerVorstand(pb), vorstandId: vorstand.id };
}

function aktualisieren(id: string): void {
  revalidatePath("/admin/spenden");
  revalidatePath(`/admin/spenden/${id}`);
}

export type AktionsFehler = { ok: false; fehler: string };
type AktionsErgebnis = AktionsFehler | { ok: true };

// Bereits abgeschlossen (Doppelklick, veraltete Seite) läuft still ins Leere, die Seite zeigt den neuen Stand.
function nachAbschluss(id: string, ergebnis: AbschlussErgebnis, mailFehler: string): AktionsErgebnis {
  if (!ergebnis.ok && ergebnis.grund === "mail") return { ok: false, fehler: mailFehler };
  aktualisieren(id);
  return { ok: true };
}

export async function beleganfrageAusstellen(id: string, eingabe: unknown): Promise<AktionsErgebnis> {
  const { anfragen, vorstandId } = await alsVorstand();
  const parsed = beleganfrageAusstellenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte den eingegangenen Betrag prüfen." };
  return nachAbschluss(
    id,
    await anfragen.ausstellen(id, vorstandId, parsed.data.eingegangen),
    "Der Spendenbeleg konnte nicht verschickt werden. Die Anfrage ist unverändert, bitte später erneut versuchen.",
  );
}

export async function beleganfrageAblehnen(id: string, eingabe: unknown): Promise<AktionsErgebnis> {
  const { anfragen, vorstandId } = await alsVorstand();
  const parsed = beleganfrageAblehnenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben zur Ablehnung." };
  const { grund, begruendung, mailSenden, mailText } = parsed.data;
  return nachAbschluss(
    id,
    await anfragen.ablehnen(id, vorstandId, { grund, begruendung, mailText: mailSenden ? mailText : null }),
    "Die Ablehnungsmail konnte nicht verschickt werden. Die Anfrage ist unverändert, bitte später erneut versuchen.",
  );
}

// Konto geprüft, Spende nicht da. Ein zweites Mal aktualisiert nur „zuletzt geprüft“.
export async function alsWartendMarkieren(id: string): Promise<void> {
  const { anfragen } = await alsVorstand();
  await anfragen.alsWartendMarkieren(id);
  aktualisieren(id);
}

// Bei Erfolg geht es weiter zur Detailansicht.
export async function beleganfrageErfassen(eingabe: unknown): Promise<AktionsFehler> {
  const { anfragen, vorstandId } = await alsVorstand();
  const parsed = beleganfrageErfassenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben." };

  const { direktAusstellen, tag_der_spende, ...d } = parsed.data;
  const ergebnis = await anfragen.erfassen({ ...d, tagDerSpende: tag_der_spende }, vorstandId, { direktAusstellen });
  if (!ergebnis.ok && ergebnis.grund === "nicht-gespeichert") {
    return { ok: false, fehler: "Die Beleganfrage konnte nicht gespeichert werden." };
  }

  aktualisieren(ergebnis.id);
  redirect(`/admin/spenden/${ergebnis.id}${ergebnis.ok ? "" : "?fehler=mail"}`);
}
