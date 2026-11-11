// Datumsanzeige im Vorstandsbereich, deutsche Zeit. Leere Werte bleiben leer.

export function datumZeit(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
}

export function datum(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
}

// Wie lange etwas schon so ist, grob und relativ, etwa „seit 3 Wochen“. Gezählt in ganzen Tagen.
export function seitWann(iso: string, jetzt: Date): string {
  const tage = Math.floor((jetzt.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (tage < 1) return "seit heute";
  if (tage === 1) return "seit gestern";
  if (tage < 14) return `seit ${tage} Tagen`;
  if (tage < 56) return `seit ${Math.floor(tage / 7)} Wochen`;
  if (tage < 730) return `seit ${Math.max(2, Math.floor(tage / 30.4))} Monaten`;
  return `seit ${Math.floor(tage / 365)} Jahren`;
}
