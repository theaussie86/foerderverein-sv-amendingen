import "server-only";
import PocketBase, { ClientResponseError } from "pocketbase";
import { z } from "zod";
import type { Antrag, Protokoll } from "@/lib/antrag";
import type { BelegArt } from "@/lib/verein";

// Die Website spricht PocketBase nur serverseitig und als eigener Superuser an.
// Ohne POCKETBASE_URL (lokale Entwicklung) wird nichts gespeichert.

let client: PocketBase | null = null;

// Antwort von PocketBase bei Validierungsfehlern: { data: { feld: { code, message } } }.
const feldfehler = z.object({ data: z.record(z.string(), z.object({ code: z.string() }).partial()) });

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
    const felder = e instanceof ClientResponseError ? feldfehler.safeParse(e.response).data?.data : undefined;
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
  const pb = await pocketbase();
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
  const pb = await pocketbase();
  if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
  await pb.collection("spendenbelege").update(id, {
    status,
    ausgestellt_von: vorstandId,
    ausgestellt_am: new Date().toISOString().replace("T", " "),
    ...(pdf ? { beleg_pdf: pdfDatei(pdf) } : {}),
  });
}
