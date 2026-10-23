// Stammdaten des Vereins für Beitrittserklärung und SEPA-Mandat.
// TODO: Platzhalter durch echte Daten ersetzen (Gläubiger-ID, Anschrift, Beiträge).

export const verein = {
  name: "Förderverein SV Amendingen e.V.",
  strasse: "Musterstraße 1",
  plzOrt: "87700 Memmingen-Amendingen",
  glaeubigerId: "DE00ZZZ00000000000",
  // Termin des jährlichen Beitragseinzugs, dient zugleich als Vorabankündigung (Pre-Notification).
  einzugstermin: "15. März",
  bank: {
    kontoinhaber: "Förderverein SV Amendingen e.V.",
    iban: "DE00 0000 0000 0000 0000 00",
    bic: "XXXXXXXXXXX",
    name: "Musterbank",
  },
  spendenVerwendungszweck: "Spende Förderverein SVA",
};

// Es gibt nur eine Mitgliedschaft mit festem Jahresbeitrag.
export const mitgliedsbeitrag = 20;

export function mandatstext(): string {
  return (
    `Ich ermächtige den ${verein.name}, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. ` +
    `Zugleich weise ich mein Kreditinstitut an, die vom ${verein.name} auf mein Konto gezogenen Lastschriften einzulösen. ` +
    `Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. ` +
    `Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.`
  );
}

// Mitgliederzähler auf der Startseite: Stand vor den Online-Anträgen plus alle
// online eingegangenen Anträge seit dem Stichtag. Bei Offline-Beitritten Basis neu setzen.
export const mitgliederbasis = { anzahl: 83, stichtag: "2026-10-23" };
export const mitgliederziel = 100;
