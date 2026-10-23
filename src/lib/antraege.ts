import "server-only";
import type PocketBase from "pocketbase";
import { ClientResponseError, type RecordModel } from "pocketbase";
import type { Protokoll } from "@/lib/antrag";

// Lesezugriff des Vorstands auf die Mitgliedsanträge. Läuft mit dem Token des
// angemeldeten Vorstandsmitglieds, damit die API-Regeln der Collection greifen.

export const STATUS = ["eingegangen", "angenommen", "abgelehnt", "ausgetreten"] as const;
export type Status = (typeof STATUS)[number];

export const STATUS_LABEL: Record<Status, string> = {
  eingegangen: "Eingegangen",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
  ausgetreten: "Ausgetreten",
};

export type Mitgliedsantrag = RecordModel & {
  antrag_id: string;
  mandatsreferenz: string;
  status: Status;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  geburtsdatum: string;
  kontoinhaber: string;
  iban: string;
  jahresbeitrag: number;
  eingereicht_am: string;
  unterschrieben_am: string;
  protokoll: Protokoll;
  pruefsumme: string;
  unterschrift: string;
  beitritt_pdf: string;
  mandat_pdf: string;
  notiz: string;
  created: string;
  updated: string;
};

export type Antragszeile = Pick<
  Mitgliedsantrag,
  "id" | "mandatsreferenz" | "status" | "vorname" | "nachname" | "ort" | "email" | "unterschrieben_am"
>;

// Dateifelder, die über /admin/antraege/[id]/dateien/[feld] ausgeliefert werden.
export const DATEIEN = {
  beitritt_pdf: "Beitrittserklärung",
  mandat_pdf: "SEPA-Lastschriftmandat",
  unterschrift: "Unterschrift",
} as const;
export type Dateifeld = keyof typeof DATEIEN;

export function istDateifeld(feld: string): feld is Dateifeld {
  return Object.hasOwn(DATEIEN, feld);
}

export function istStatus(wert: string | undefined): wert is Status {
  return STATUS.includes(wert as Status);
}

const SUCHFELDER = ["vorname", "nachname", "email", "ort", "plz", "strasse", "mandatsreferenz", "iban", "kontoinhaber"];
export const PRO_SEITE = 25;

// Jedes Suchwort muss in mindestens einem Feld vorkommen, damit "Max Muster" Vor- und Nachnamen findet.
export async function antraegeSuchen(
  pb: PocketBase,
  { suche, status, seite }: { suche: string; status?: Status; seite: number },
) {
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

export async function antragLaden(pb: PocketBase, id: string): Promise<Mitgliedsantrag | null> {
  try {
    return await pb.collection("mitgliedsantraege").getOne<Mitgliedsantrag>(id);
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) return null;
    throw e;
  }
}

export function datumZeit(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
}

export function datum(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
}
