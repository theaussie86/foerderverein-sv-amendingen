// Stammdaten des Vereins für Beitrittserklärung und SEPA-Mandat.
// TODO: Platzhalter durch echte Daten ersetzen (Gläubiger-ID, Anschrift, Beiträge).

export const verein = {
  name: "Förderverein SV Amendingen e.V.",
  strasse: "Musterstraße 1",
  plzOrt: "87700 Memmingen-Amendingen",
  glaeubigerId: "DE00ZZZ00000000000",
  // Termin des jährlichen Beitragseinzugs, dient zugleich als Vorabankündigung (Pre-Notification).
  einzugstermin: "15. März",
};

export const mitgliedschaften = {
  einzel: { label: "Einzelmitglied", beitrag: 20 },
  familie: { label: "Familienmitglied", beitrag: 30 },
  firma: { label: "Firmenmitglied", beitrag: 100 },
} as const;

export type Mitgliedschaft = keyof typeof mitgliedschaften;

export function mandatstext(): string {
  return (
    `Ich ermächtige den ${verein.name}, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. ` +
    `Zugleich weise ich mein Kreditinstitut an, die vom ${verein.name} auf mein Konto gezogenen Lastschriften einzulösen. ` +
    `Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. ` +
    `Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.`
  );
}
