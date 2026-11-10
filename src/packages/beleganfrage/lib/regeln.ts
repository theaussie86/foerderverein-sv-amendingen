import type { BelegArt } from "./typen";

// Bis zu diesem Betrag genügt dem Finanzamt Kontoauszug plus Vereinsbeleg (§ 50 Abs. 4 EStDV).
export const spendenGrenzeVereinfacht = 300;

// Welchen Beleg eine Beleganfrage bekommt, hängt nur vom Betrag ab.
export function belegArt(betrag: number): BelegArt {
  return betrag <= spendenGrenzeVereinfacht ? "vereinfacht" : "zuwendungsbestaetigung";
}
