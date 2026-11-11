// Stammdaten des Vereins für Beitrittserklärung und SEPA-Mandat.
// TODO: Platzhalter durch echte Daten ersetzen (Gläubiger-ID, Freistellungsbescheid).

export type Freistellungsbescheid = {
  finanzamt: string;
  steuernummer: string;
  datum: string;
  veranlagungszeitraum: string;
};

export type Steuerangaben = { zweck: string; bescheid: Freistellungsbescheid | null };

// Platzhalter, bis der Bescheid vorliegt. Als Funktion, damit der Typ nicht auf null verengt wird.
function keinBescheid(): Freistellungsbescheid | null {
  return null;
}

export const verein = {
  name: "Förderverein SV Amendingen / Fußball e.V.",
  strasse: "Grünenfurterstraße 36",
  plz: "87700",
  ort: "Memmingen",
  plzOrt: "87700 Memmingen",
  email: "foerderverein.sva@gmx.de",
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
  // Steuerangaben für den vereinfachten Spendenbeleg (§ 50 Abs. 4 EStDV). Die Angaben aus dem
  // Freistellungsbescheid fehlen noch (#55). Bis 300 € reicht dem Finanzamt meist der Kontoauszug,
  // deshalb geht der Beleg bis dahin ohne sie raus. Sobald der Bescheid vorliegt, hier eintragen.
  steuer: {
    zweck: "Förderung des Sports (§ 52 Abs. 2 Satz 1 Nr. 21 AO) durch Beschaffung von Mitteln für den SV Amendingen",
    bescheid: keinBescheid(),
  },
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

// Satz zur Steuerbegünstigung auf dem vereinfachten Spendenbeleg. Ohne Bescheid nur der Zweck.
export function steuerbeguenstigung(name: string, steuer: Steuerangaben): string {
  const b = steuer.bescheid;
  if (!b) return `Der ${name} verfolgt steuerbegünstigte Zwecke: ${steuer.zweck}.`;
  return (
    `Der ${name} ist wegen ${steuer.zweck} nach dem Freistellungsbescheid des Finanzamtes ${b.finanzamt}, ` +
    `StNr. ${b.steuernummer}, vom ${b.datum} für den letzten Veranlagungszeitraum ${b.veranlagungszeitraum} ` +
    `nach § 5 Abs. 1 Nr. 9 KStG von der Körperschaftsteuer und nach § 3 Nr. 6 GewStG von der Gewerbesteuer befreit.`
  );
}
