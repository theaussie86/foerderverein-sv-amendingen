import { normalizeIban } from "@/lib/schemas";
import type { Mitgliedsdaten } from "./typen";

// Bestandsmitglieder haben reine Zahlen als Mandatsreferenz, Online-Anträge "FV-…".
// Vorschlag ist die nächste Zahl nach der höchsten vergebenen, nie eine frei gewordene.
export function naechsteMandatsreferenz(vergeben: string[]): string {
  const zahlen = vergeben.filter((r) => /^\d+$/.test(r)).map(Number);
  return String(Math.max(0, ...zahlen) + 1);
}

// Einheitliche Schreibweise vor dem Speichern.
export function normalisieren(d: Mitgliedsdaten): Mitgliedsdaten {
  const t = (s: string) => s.trim().replace(/\s+/g, " ");
  return {
    ...d,
    mandatsreferenz: d.mandatsreferenz.trim(),
    vorname: t(d.vorname),
    nachname: t(d.nachname),
    strasse: t(d.strasse),
    plz: d.plz.trim(),
    ort: t(d.ort),
    email: d.email.trim().toLowerCase(),
    kontoinhaber: t(d.kontoinhaber),
    iban: normalizeIban(d.iban),
    bic: d.bic.replace(/\s+/g, "").toUpperCase(),
    bank: t(d.bank),
    endeGrund: d.endeDatum ? d.endeGrund : "",
    notiz: d.notiz.trim(),
  };
}
