import "server-only";
import type PocketBase from "pocketbase";
import { ClientResponseError, type RecordModel } from "pocketbase";
import type { Vorstand } from "@/lib/vorstand-session";

// Lesezugriff des Vorstands auf die Anfragen nach Spendenbelegen, mit dem Token
// des angemeldeten Vorstandsmitglieds.

export const BELEG_STATUS = ["offen", "ausgestellt", "versendet"] as const;
export type BelegStatus = (typeof BELEG_STATUS)[number];

export const BELEG_STATUS_LABEL: Record<BelegStatus, string> = {
  offen: "Offen",
  ausgestellt: "Ausgestellt",
  versendet: "Automatisch versendet",
};

export const BELEG_ART_LABEL = {
  vereinfacht: "Vereinfachter Beleg (bis 300 €)",
  zuwendungsbestaetigung: "Zuwendungsbestätigung",
} as const;

export type Spendenbeleg = RecordModel & {
  art: keyof typeof BELEG_ART_LABEL;
  status: BelegStatus;
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
  created: string;
  expand?: { ausgestellt_von?: Vorstand };
};

export function istBelegStatus(wert: string | undefined): wert is BelegStatus {
  return BELEG_STATUS.includes(wert as BelegStatus);
}

export const PRO_SEITE = 25;

export async function belegeSuchen(
  pb: PocketBase,
  { suche, status, seite }: { suche: string; status?: BelegStatus; seite: number },
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

  return pb.collection("spendenbelege").getList<Spendenbeleg>(seite, PRO_SEITE, {
    filter: teile.length ? pb.filter(teile.join(" && "), params) : "",
    sort: "-created",
    fields: "id,art,status,name,ort,email,betrag,ueberwiesen_am,created",
  });
}

export async function offeneBelege(pb: PocketBase): Promise<number | null> {
  try {
    const liste = await pb.collection("spendenbelege").getList(1, 1, { filter: 'status = "offen"', fields: "id" });
    return liste.totalItems;
  } catch {
    return null;
  }
}

export async function belegLaden(pb: PocketBase, id: string): Promise<Spendenbeleg | null> {
  try {
    return await pb.collection("spendenbelege").getOne<Spendenbeleg>(id, { expand: "ausgestellt_von" });
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) return null;
    throw e;
  }
}

export function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
