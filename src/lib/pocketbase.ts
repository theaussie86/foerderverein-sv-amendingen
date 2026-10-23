import "server-only";
import PocketBase, { ClientResponseError } from "pocketbase";
import type { Antrag, Protokoll } from "@/lib/antrag";

// Die Website spricht PocketBase nur serverseitig und als eigener Superuser an.
// Ohne POCKETBASE_URL (lokale Entwicklung) wird nichts gespeichert.

let client: PocketBase | null = null;

async function pocketbase(): Promise<PocketBase | null> {
  const url = process.env.POCKETBASE_URL;
  if (!url) return null;
  if (!client) {
    client = new PocketBase(url);
    client.autoCancellation(false);
  }
  if (!client.authStore.isValid) {
    const email = process.env.POCKETBASE_EMAIL;
    const passwort = process.env.POCKETBASE_PASSWORD;
    if (!email || !passwort) throw new Error("POCKETBASE_EMAIL oder POCKETBASE_PASSWORD fehlt.");
    await client.collection("_superusers").authWithPassword(email, passwort);
  }
  return client;
}

export type Speicherergebnis = "gespeichert" | "bereits-vorhanden" | "uebersprungen";

export type PdfAnhang = { filename: string; content: Buffer };

function pdfDatei({ filename, content }: PdfAnhang): File {
  return new File([new Uint8Array(content)], filename, { type: "application/pdf" });
}

export async function antragSpeichern(
  antrag: Antrag,
  unterschriftPng: Buffer,
  beitritt: PdfAnhang,
  mandat: PdfAnhang,
  protokoll: Protokoll,
  pruefsumme: string,
  jahresbeitrag: number,
): Promise<Speicherergebnis> {
  const pb = await pocketbase();
  if (!pb) return "uebersprungen";

  const d = antrag.daten;
  try {
    await pb.collection("mitgliedsantraege").create({
      antrag_id: antrag.id,
      mandatsreferenz: antrag.mandatsreferenz,
      status: "eingegangen",
      vorname: d.vorname,
      nachname: d.nachname,
      strasse: d.strasse,
      plz: d.plz,
      ort: d.ort,
      email: d.email,
      geburtsdatum: d.geburtsdatum ? `${d.geburtsdatum} 00:00:00.000Z` : "",
      kontoinhaber: d.kontoinhaber,
      iban: d.iban,
      jahresbeitrag,
      eingereicht_am: protokoll.eingereicht.zeit,
      unterschrieben_am: protokoll.unterschrieben.zeit,
      protokoll,
      pruefsumme,
      unterschrift: new File([new Uint8Array(unterschriftPng)], "unterschrift.png", { type: "image/png" }),
      beitritt_pdf: pdfDatei(beitritt),
      mandat_pdf: pdfDatei(mandat),
    });
    return "gespeichert";
  } catch (e) {
    // Derselbe Link wurde schon einmal unterschrieben. PocketBase meldet nicht immer jedes Unique-Feld.
    const felder = e instanceof ClientResponseError ? e.response?.data : undefined;
    if (["antrag_id", "mandatsreferenz"].some((f) => felder?.[f]?.code === "validation_not_unique")) {
      return "bereits-vorhanden";
    }
    throw e;
  }
}

// Online eingegangene Anträge seit einem Datum, ohne abgelehnte und ausgetretene.
// Null, wenn PocketBase nicht konfiguriert oder nicht erreichbar ist.
export async function antraegeSeit(datum: Date): Promise<number | null> {
  try {
    const pb = await pocketbase();
    if (!pb) return null;
    const liste = await pb.collection("mitgliedsantraege").getList(1, 1, {
      filter: pb.filter('unterschrieben_am >= {:datum} && status != "abgelehnt" && status != "ausgetreten"', {
        datum: datum.toISOString().replace("T", " "),
      }),
      fields: "id",
    });
    return liste.totalItems;
  } catch (e) {
    console.error("Mitgliederzähler: PocketBase-Abfrage fehlgeschlagen", e);
    return null;
  }
}
