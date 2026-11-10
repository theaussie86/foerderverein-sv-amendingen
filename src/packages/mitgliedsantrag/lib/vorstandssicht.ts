import type PocketBase from "pocketbase";
import { ClientResponseError } from "pocketbase";
import { istDateifeld, type Antragszeile, type Mitgliedsantrag, type Status } from "../anzeige";

export type Suche = { suche: string; status?: Status; seite: number };

// Lesezugriff des Vorstands auf die Mitgliedsanträge. Läuft mit dem Token des
// angemeldeten Vorstandsmitglieds, damit die API-Regeln der Collection greifen.

const SUCHFELDER = ["vorname", "nachname", "email", "ort", "plz", "strasse", "mandatsreferenz", "iban", "kontoinhaber"];
const PRO_SEITE = 25;

// Jedes Suchwort muss in mindestens einem Feld vorkommen, damit "Max Muster" Vor- und Nachnamen findet.
export async function suchen(pb: PocketBase, { suche, status, seite }: Suche) {
  const teile: string[] = [];
  const params: Record<string, string> = {};
  suche
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .forEach((wort, i) => {
      // IBANs werden ohne Leerzeichen gespeichert, deshalb großgeschrieben mit vergleichen.
      params[`w${i}`] = wort;
      params[`W${i}`] = wort.toUpperCase();
      teile.push(`(${SUCHFELDER.map((f) => `${f} ~ {:${f === "iban" ? "W" : "w"}${i}}`).join(" || ")})`);
    });
  if (status) {
    params.status = status;
    teile.push("status = {:status}");
  }

  return pb.collection("mitgliedsantraege").getList<Antragszeile>(seite, PRO_SEITE, {
    filter: teile.length ? pb.filter(teile.join(" && "), params) : "",
    sort: "-unterschrieben_am",
    fields: "id,mandatsreferenz,status,vorname,nachname,ort,email,unterschrieben_am",
  });
}

export async function laden(pb: PocketBase, id: string): Promise<Mitgliedsantrag | null> {
  try {
    return await pb.collection("mitgliedsantraege").getOne<Mitgliedsantrag>(id);
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) return null;
    throw e;
  }
}

export type Datei =
  | { ok: true; inhalt: ReadableStream<Uint8Array>; contentType: string; dateiname: string }
  | { ok: false; grund: "nicht-gefunden" | "nicht-ladbar" };

// Die Dateien sind in PocketBase geschützt, und PocketBase ist nicht öffentlich erreichbar.
// Die Website holt sie deshalb mit dem Token des Vorstands und reicht sie durch.
export async function datei(pb: PocketBase, id: string, feld: string): Promise<Datei> {
  if (!istDateifeld(feld)) return { ok: false, grund: "nicht-gefunden" };
  const antrag = await laden(pb, id);
  const name = antrag?.[feld];
  if (!antrag || !name) return { ok: false, grund: "nicht-gefunden" };

  const token = await pb.files.getToken();
  const antwort = await fetch(pb.files.getURL(antrag, name, { token }), { cache: "no-store" });
  if (!antwort.ok || !antwort.body) {
    console.error("Datei konnte nicht geladen werden", feld, antwort.status);
    return { ok: false, grund: "nicht-ladbar" };
  }

  const endung = name.slice(name.lastIndexOf("."));
  return {
    ok: true,
    inhalt: antwort.body,
    contentType: antwort.headers.get("Content-Type") ?? "application/octet-stream",
    dateiname: `${feld === "unterschrift" ? "unterschrift" : feld.replace("_pdf", "")}-${antrag.mandatsreferenz}${endung}`,
  };
}
