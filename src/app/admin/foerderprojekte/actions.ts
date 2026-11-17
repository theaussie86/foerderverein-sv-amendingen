"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Ordnungsergebnis, Speicherergebnis } from "@/packages/foerderprojekt/index";
import { foerderprojekteFuerVorstand } from "@/packages/foerderprojekt/server";
import { foerderprojektLoeschenSchema, foerderprojektSchema, foerderprojektStartseiteSchema } from "@/lib/schemas";
import { vorstandErforderlich } from "@/lib/vorstand-session";

export type Speicherfehler = { ok: false; fehler: string };

const MELDUNG: Record<Exclude<Speicherergebnis, { ok: true }>["grund"], string> = {
  "pflichtfeld-fehlt": "Titel und Beschreibung sind Pflicht.",
  "bild-fehlt": "Bitte ein Bild auswählen.",
  "bild-ungueltig": "Das Bild muss ein JPEG oder PNG mit höchstens 5 MB sein.",
  "startseite-voll": "Auf der Startseite sind schon alle 4 Plätze belegt.",
  "nicht-gefunden": "Das Förderprojekt gibt es nicht mehr.",
};

function neuLaden() {
  revalidatePath("/admin/foerderprojekte");
  revalidatePath("/");
}

// Legt ein Förderprojekt an (id leer) oder ändert es. Bei Erfolg geht es zurück zur Liste.
export async function foerderprojektSpeichern(eingabe: unknown): Promise<Speicherfehler> {
  await vorstandErforderlich();
  if (!(eingabe instanceof FormData)) return { ok: false, fehler: "Bitte prüf die Angaben." };
  const parsed = foerderprojektSchema.safeParse(Object.fromEntries(eingabe));
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben." };

  const { id, bild, ...daten } = parsed.data;
  const foerderprojekte = foerderprojekteFuerVorstand();
  let ergebnis: Speicherergebnis;
  try {
    ergebnis = id ? await foerderprojekte.aendern(id, daten, bild) : await foerderprojekte.anlegen(daten, bild);
  } catch (e) {
    console.error("Förderprojekt konnte nicht gespeichert werden", e instanceof Error ? e.message : e);
    return { ok: false, fehler: "Das Förderprojekt konnte nicht gespeichert werden." };
  }
  if (!ergebnis.ok) return { ok: false, fehler: MELDUNG[ergebnis.grund] };

  neuLaden();
  redirect("/admin/foerderprojekte?gespeichert=1");
}

export async function foerderprojektLoeschen(eingabe: unknown): Promise<Speicherfehler> {
  await vorstandErforderlich();
  const parsed = foerderprojektLoeschenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Unbekanntes Förderprojekt." };
  try {
    await foerderprojekteFuerVorstand().loeschen(parsed.data.id);
  } catch (e) {
    console.error("Förderprojekt konnte nicht gelöscht werden", e instanceof Error ? e.message : e);
    return { ok: false, fehler: "Das Förderprojekt konnte nicht gelöscht werden." };
  }
  neuLaden();
  redirect("/admin/foerderprojekte?geloescht=1");
}

// Pfeile ↑↓, „Auf die Startseite“ und „Von Startseite nehmen“. Ohne JavaScript nutzbar, Fehler kommen per URL.
export async function foerderprojektStartseite(eingabe: unknown): Promise<void> {
  await vorstandErforderlich();
  const parsed = foerderprojektStartseiteSchema.safeParse(eingabe);
  if (!parsed.success) redirect("/admin/foerderprojekte?fehler=unbekannt");
  let ergebnis: Ordnungsergebnis;
  try {
    ergebnis = await foerderprojekteFuerVorstand().startseiteAendern(parsed.data.id, parsed.data.aktion);
  } catch (e) {
    console.error("Startseite konnte nicht geändert werden", e instanceof Error ? e.message : e);
    redirect("/admin/foerderprojekte?fehler=speichern");
  }
  neuLaden();
  redirect(ergebnis.ok ? "/admin/foerderprojekte" : `/admin/foerderprojekte?fehler=${ergebnis.grund}`);
}
