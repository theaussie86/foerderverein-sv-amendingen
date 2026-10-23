// Stammdaten des Vereins für Beitrittserklärung und SEPA-Mandat.
// TODO: Platzhalter durch echte Daten ersetzen (Gläubiger-ID, Anschrift).

export const verein = {
  name: "Förderverein SV Amendingen e.V.",
  strasse: "Musterstraße 1",
  plzOrt: "87700 Memmingen-Amendingen",
  glaeubigerId: "DE00ZZZ00000000000",
  // Termin des jährlichen Beitragseinzugs, dient zugleich als Vorabankündigung (Pre-Notification).
  einzugstermin: "15. März",
  bank: {
    // Kontoinhaber so, wie die Bank ihn führt (Umsatzdetails DKB, 07.07.2026).
    kontoinhaber: "Förderverein des SV Amendingen Fußball e.V.",
    iban: "DE31 7315 0000 0010 0585 19",
    bic: "BYLADEM1MLM",
    name: "Sparkasse Memmingen-Lindau-Mindelheim",
  },
  spendenVerwendungszweck: "Spende Förderverein SVA",
  // Angaben aus dem Freistellungsbescheid für den vereinfachten Spendenbeleg (§ 50 Abs. 4 EStDV).
  // TODO: aus dem aktuellen Bescheid übernehmen. Der Bescheid darf höchstens 5 Jahre alt sein.
  steuer: {
    zweck: "Förderung des Sports (§ 52 Abs. 2 Satz 1 Nr. 21 AO) durch Beschaffung von Mitteln für den SV Amendingen",
    finanzamt: "Memmingen-Mindelheim",
    steuernummer: "000/000/00000",
    bescheidDatum: "01.01.2025",
    veranlagungszeitraum: "2023",
  },
};

// Bis zu diesem Betrag genügt dem Finanzamt Kontoauszug plus Vereinsbeleg (§ 50 Abs. 4 EStDV).
export const spendenGrenzeVereinfacht = 300;

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
