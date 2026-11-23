// Stammdaten der nächsten Dorfmeisterschaft. Bisher nur Save the Date: Uhrzeit, Modus und Anmeldung folgen.

export const dorfmeisterschaft = {
  titel: "Fußball-Dorfmeisterschaft 2027",
  // Turniertag als Kalenderdatum (Ortszeit Amendingen).
  jahr: 2027,
  monat: 6,
  tag: 19,
  datumLang: "Samstag, 19. Juni 2027",
  datumKurz: "Sa, 19.06.2027",
  ort: "Sportgelände SV Amendingen",
  strasse: "Grünenfurterstraße 36",
  plzOrt: "87700 Memmingen",
  pfad: "/dorfmeisterschaft",
} as const;

// Das Banner auf der Startseite läuft bis einschließlich Turniertag und verschwindet am Tag danach.
// Verglichen wird das Kalenderdatum in Europe/Berlin, damit das Banner nicht um Mitternacht UTC kippt.
export function bannerSichtbar(jetzt: Date): boolean {
  const heute = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
  return heute <= isoDatum(dorfmeisterschaft.jahr, dorfmeisterschaft.monat, dorfmeisterschaft.tag);
}

function isoDatum(jahr: number, monat: number, tag: number): string {
  return `${jahr}-${String(monat).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;
}

function icsDatum(jahr: number, monat: number, tag: number): string {
  return isoDatum(jahr, monat, tag).replaceAll("-", "");
}

// Ganztägiger Kalendereintrag (RFC 5545). Ganztägig, weil die Uhrzeit noch nicht feststeht.
export function kalenderEintrag(url: string): string {
  const { jahr, monat, tag } = dorfmeisterschaft;
  const folgetag = new Date(Date.UTC(jahr, monat - 1, tag + 1));
  const ort = `${dorfmeisterschaft.ort}\\, ${dorfmeisterschaft.strasse}\\, ${dorfmeisterschaft.plzOrt}`;
  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Förderverein SV Amendingen//Dorfmeisterschaft//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:dorfmeisterschaft-${icsDatum(jahr, monat, tag)}@foerderverein-sv-amendingen.de`,
    `DTSTAMP:${icsDatum(jahr, monat, tag)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDatum(jahr, monat, tag)}`,
    `DTEND;VALUE=DATE:${icsDatum(folgetag.getUTCFullYear(), folgetag.getUTCMonth() + 1, folgetag.getUTCDate())}`,
    `SUMMARY:${dorfmeisterschaft.titel}`,
    `LOCATION:${ort}`,
    `DESCRIPTION:Save the Date! Uhrzeit und Anmeldung folgen: ${url}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return zeilen.map(falten).join("\r\n") + "\r\n";
}

// RFC 5545: Zeilen höchstens 75 Bytes, Fortsetzung beginnt mit einem Leerzeichen. Umlaute nicht zerteilen.
function falten(zeile: string): string {
  const teile: string[] = [];
  let aktuell = "";
  let bytes = 0;
  for (const zeichen of zeile) {
    const laenge = new TextEncoder().encode(zeichen).length;
    const grenze = teile.length === 0 ? 75 : 74;
    if (bytes + laenge > grenze) {
      teile.push(aktuell);
      aktuell = "";
      bytes = 0;
    }
    aktuell += zeichen;
    bytes += laenge;
  }
  teile.push(aktuell);
  return teile.join("\r\n ");
}
