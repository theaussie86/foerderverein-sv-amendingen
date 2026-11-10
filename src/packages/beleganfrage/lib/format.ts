export function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// Derselbe Name im Mailanhang und beim Herunterladen. Die Belegnummer ist die ID der Beleganfrage.
export function belegDateiname({ id, tagDerSpende }: { id: string; tagDerSpende: string }): string {
  return `Spendenbeleg_${tagDerSpende}_${id}.pdf`;
}
