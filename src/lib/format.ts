// Datumsanzeige im Vorstandsbereich, deutsche Zeit. Leere Werte bleiben leer.

export function datumZeit(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
}

export function datum(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
}
