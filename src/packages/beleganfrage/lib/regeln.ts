import type { AnfrageStatus, BelegArt } from "./typen";

// Bis zu diesem Betrag genügt dem Finanzamt Kontoauszug oder PayPal-Buchungsbestätigung plus Vereinsbeleg (§ 50 Abs. 4 EStDV).
export const spendenGrenzeVereinfacht = 300;

// Welchen Beleg eine Beleganfrage bekommt, hängt nur vom Betrag ab.
export function belegArt(betrag: number): BelegArt {
  return betrag <= spendenGrenzeVereinfacht ? "vereinfacht" : "zuwendungsbestaetigung";
}

// Offene und wartende Beleganfragen lassen sich noch ausstellen, ablehnen oder als wartend markieren.
export function istBearbeitbar(status: AnfrageStatus): boolean {
  return status === "offen" || status === "wartend";
}
