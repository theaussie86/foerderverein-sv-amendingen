import "server-only";
import type PocketBase from "pocketbase";
import { ClientResponseError, type RecordModel } from "pocketbase";
import type { Vorstand } from "@/lib/vorstand-session";

// Lesezugriff des Vorstands auf die Beleganfragen, mit dem Token
// des angemeldeten Vorstandsmitglieds.

export const ANFRAGE_STATUS = ["offen", "ausgestellt", "versendet", "abgelehnt"] as const;
export type AnfrageStatus = (typeof ANFRAGE_STATUS)[number];

export const ANFRAGE_STATUS_LABEL: Record<AnfrageStatus, string> = {
  offen: "Offen",
  ausgestellt: "Ausgestellt",
  versendet: "Beleg versendet",
  abgelehnt: "Abgelehnt",
};

export const BELEG_ART_LABEL = {
  vereinfacht: "Vereinfachter Beleg (bis 300 €)",
  zuwendungsbestaetigung: "Zuwendungsbestätigung",
} as const;

export type Beleganfrage = RecordModel & {
  art: keyof typeof BELEG_ART_LABEL;
  status: AnfrageStatus;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  betrag: number;
  ueberwiesen_am: string;
  ausgestellt_von: string;
  ausgestellt_am: string;
  notiz: string;
  beleg_pdf: string;
  created: string;
  expand?: { ausgestellt_von?: Vorstand };
};

export function istAnfrageStatus(wert: string | undefined): wert is AnfrageStatus {
  return ANFRAGE_STATUS.includes(wert as AnfrageStatus);
}

export const PRO_SEITE = 25;

export async function anfragenSuchen(
  pb: PocketBase,
  { suche, status, seite }: { suche: string; status?: AnfrageStatus; seite: number },
) {
  const teile: string[] = [];
  const params: Record<string, string> = {};
  suche
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .forEach((wort, i) => {
      params[`w${i}`] = wort;
      teile.push(`(${["name", "email", "ort", "strasse"].map((f) => `${f} ~ {:w${i}}`).join(" || ")})`);
    });
  if (status) {
    params.status = status;
    teile.push("status = {:status}");
  }

  return pb.collection("spendenbelege").getList<Beleganfrage>(seite, PRO_SEITE, {
    filter: teile.length ? pb.filter(teile.join(" && "), params) : "",
    sort: "-created",
    fields: "id,art,status,name,ort,email,betrag,ueberwiesen_am,created",
  });
}

export async function offeneAnfragen(pb: PocketBase): Promise<number | null> {
  try {
    const liste = await pb.collection("spendenbelege").getList(1, 1, { filter: 'status = "offen"', fields: "id" });
    return liste.totalItems;
  } catch {
    return null;
  }
}

export async function anfrageLaden(pb: PocketBase, id: string): Promise<Beleganfrage | null> {
  try {
    return await pb.collection("spendenbelege").getOne<Beleganfrage>(id, { expand: "ausgestellt_von" });
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) return null;
    throw e;
  }
}

export function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
