// Stammdaten des Vereins für Beitrittserklärung und SEPA-Mandat.
// TODO: Angaben aus dem Freistellungsbescheid fehlen noch.

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
  // Offizieller Name laut Satzung (#50).
  name: "Förderverein des SV Amendingen/Fußball e.V.",
  strasse: "Grünenfurterstraße 36",
  plz: "87700",
  ort: "Memmingen",
  plzOrt: "87700 Memmingen",
  email: "foerderverein.sva@gmx.de",
  // Fußzeile von Beitrittserklärung und SEPA-Mandat, wie auf der Papiervorlage (#16), ohne Privatanschriften.
  vorsitz: "Manuel Rothermel",
  stellvertretung: "Christian Geiger",
  registergericht: "Amtsgericht Memmingen",
  registernummer: "VR 1428",
  // Laut Beitrittserklärung.
  glaeubigerId: "DE03ZZZ00000843718",
  satzungUrl: "/satzung.pdf",
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
  // PayPal ist ein offizieller Zahlungsweg (GLOSSARY.md).
  paypalMe: "https://paypal.me/foerdervereinsva",
  // Link aus dem QR-Code, den PayPal für das Vereinskonto erzeugt. Öffnet die PayPal-App, ohne Betrag.
  paypalQr: "https://www.paypal.com/qrcodes/managed/779ac0bb-12a5-4564-9439-353386d64264?utm_source=payandgetpaid",
  // Steuerangaben für den vereinfachten Spendenbeleg (§ 50 Abs. 4 EStDV). Die Angaben aus dem
  // Freistellungsbescheid fehlen noch (#55). Bis 300 € reicht dem Finanzamt meist der Kontoauszug,
  // deshalb geht der Beleg bis dahin ohne sie raus. Sobald der Bescheid vorliegt, hier eintragen.
  steuer: {
    zweck: "Förderung des Sports (§ 52 Abs. 2 Satz 1 Nr. 21 AO) durch Beschaffung von Mitteln für den SV Amendingen",
    bescheid: keinBescheid(),
  },
};

// Prüfziffer der SEPA-Gläubiger-ID nach ISO 7064 (mod 97). Die Geschäftsbereichskennung
// (Stellen 5-7) zählt nicht mit. Fängt Tippfehler ab, nicht ob die ID dem Verein gehört.
export function glaeubigerIdGueltig(id: string): boolean {
  const kompakt = id.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{3}[A-Z0-9]+$/.test(kompakt)) return false;
  const umgestellt = kompakt.slice(7) + kompakt.slice(0, 4);
  const ziffern = [...umgestellt].map((z) => (/[A-Z]/.test(z) ? String(z.charCodeAt(0) - 55) : z)).join("");
  let rest = 0;
  for (const z of ziffern) rest = (rest * 10 + Number(z)) % 97;
  return rest === 1;
}

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

// paypal.me-Link, mit Betrag vorausgefüllt, wenn einer gewählt ist.
export function paypalLink(betrag?: number): string {
  if (!betrag || !(betrag > 0)) return verein.paypalMe;
  return `${verein.paypalMe}/${Number.isInteger(betrag) ? betrag : betrag.toFixed(2)}EUR`;
}

// Ziel für den Mitgliederzähler auf der Startseite (src/lib/mitglieder.ts).
export const mitgliederziel = 150;

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
