import "server-only";
import PocketBase from "pocketbase";
import type { BelegArt } from "@/lib/verein";

// Die Website spricht PocketBase nur serverseitig und als eigener Superuser an.
// Ohne POCKETBASE_URL (lokale Entwicklung) wird nichts gespeichert.

let client: PocketBase | null = null;

// Superuser-Client, null ohne POCKETBASE_URL. Auch für Pakete (z. B. mitgliedsantrag/server.ts).
export async function superuserPocketbase(): Promise<PocketBase | null> {
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

export type PdfAnhang = { filename: string; content: Buffer };

function pdfDatei({ filename, content }: PdfAnhang): File {
  return new File([new Uint8Array(content)], filename, { type: "application/pdf" });
}

export type NeueBeleganfrage = {
  art: BelegArt;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  // Leer nur, wenn der Vorstand die Anfrage ohne E-Mail-Adresse erfasst.
  email: string;
  betrag: number;
  tagDerSpende: string;
  notiz?: string;
  // Vorstandsmitglied, das die Anfrage im internen Bereich erfasst hat. Fehlt bei Anfragen über die Website.
  erfasstVon?: string;
};

// Gibt die ID des neuen Eintrags zurück, null ohne PocketBase.
export async function beleganfrageSpeichern(b: NeueBeleganfrage): Promise<string | null> {
  const pb = await superuserPocketbase();
  if (!pb) return null;
  const { tagDerSpende, erfasstVon, ...rest } = b;
  // Jede Anfrage startet offen. Erst wenn der Vorstand den Geldeingang geprüft hat, geht ein Beleg raus.
  const record = await pb.collection("spendenbelege").create({
    ...rest,
    status: "offen",
    tag_der_spende: `${tagDerSpende} 00:00:00.000Z`,
    erfasst_von: erfasstVon ?? "",
  });
  return record.id;
}

// Der Vorstand darf Spendenbelege nur lesen. Das Abhaken läuft deshalb als Superuser,
// nachdem die Website die Vorstands-Session geprüft hat, und hält fest, wer es war.
// "versendet" legt den verschickten Beleg mit ab.
export async function beleganfrageAbschliessen(
  id: string,
  vorstandId: string,
  status: "ausgestellt" | "versendet" | "abgelehnt",
  pdf?: PdfAnhang,
): Promise<void> {
  const pb = await superuserPocketbase();
  if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
  await pb.collection("spendenbelege").update(id, {
    status,
    ausgestellt_von: vorstandId,
    ausgestellt_am: new Date().toISOString().replace("T", " "),
    ...(pdf ? { beleg_pdf: pdfDatei(pdf) } : {}),
  });
}
