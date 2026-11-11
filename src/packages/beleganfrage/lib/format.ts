import type { Zahlungsweg } from "./typen";

// Tag der Spende als TT.MM.JJJJ. Der Tag ist ohne Uhrzeit gespeichert, deshalb in UTC.
export function tagAnzeigen(tag: string): string {
  return new Date(tag).toLocaleDateString("de-DE", { timeZone: "UTC" });
}

export function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// Derselbe Name im Mailanhang und beim Herunterladen. Die Belegnummer ist die ID der Beleganfrage.
export function belegDateiname({ id, tagDerSpende }: { id: string; tagDerSpende: string }): string {
  return `Spendenbeleg_${tagDerSpende}_${id}.pdf`;
}

export const ZAHLUNGSWEG_LABEL: Record<Zahlungsweg, string> = {
  ueberweisung: "Überweisung",
  paypal: "PayPal",
  bar: "Bar",
};

// Wo der Vorstand den Geldeingang prüft, als Ergänzung zu "Geldeingang … prüfen".
export const ZAHLUNGSWEG_PRUEFORT: Record<Zahlungsweg, string> = {
  ueberweisung: "auf dem Vereinskonto",
  paypal: "im PayPal-Konto des Fördervereins",
  bar: "in der Kasse",
};
