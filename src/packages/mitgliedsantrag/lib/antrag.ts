import { z } from "zod";
import { mitgliedSchema } from "@/lib/schemas";

// Die Reihenfolge der Felder bestimmt die Prüfsumme (JSON über das Antragsobjekt). Nicht umsortieren.
export const antragsdatenSchema = mitgliedSchema.omit({ mandat: true, datenschutz: true, website: true });
export type Antragsdaten = z.infer<typeof antragsdatenSchema>;

const zeitUndIp = z.object({ zeit: z.string(), ip: z.string() });

// Wird verschlüsselt im Unterschriftslink mitgeschickt.
export const antragSchema = z.object({
  id: z.string(),
  mandatsreferenz: z.string(),
  daten: antragsdatenSchema,
  eingereicht: zeitUndIp,
});
export type Antrag = z.infer<typeof antragSchema>;

// Wird beim Öffnen der Unterschriftsseite erzeugt und mit der Unterschrift zurückgeschickt,
// damit das Protokoll belegt, wann und von wo der Link geöffnet wurde.
export const sitzungSchema = z.object({
  antragId: z.string(),
  geoeffnet: zeitUndIp,
});
export type Sitzung = z.infer<typeof sitzungSchema>;

export type Protokoll = {
  eingereicht: { zeit: string; ip: string };
  geoeffnet: { zeit: string; ip: string };
  unterschrieben: { zeit: string; ip: string; userAgent: string };
};

export const LINK_GUELTIG_TAGE = 7;
