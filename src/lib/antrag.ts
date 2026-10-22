import type { MitgliedFormData } from "@/lib/schemas";

export type Antragsdaten = Omit<MitgliedFormData, "mandat" | "datenschutz" | "website">;

// Wird verschlüsselt im Unterschriftslink mitgeschickt.
export type Antrag = {
  id: string;
  mandatsreferenz: string;
  daten: Antragsdaten;
  eingereicht: { zeit: string; ip: string };
};

// Wird beim Öffnen der Unterschriftsseite erzeugt und mit der Unterschrift zurückgeschickt,
// damit das Protokoll belegt, wann und von wo der Link geöffnet wurde.
export type Sitzung = {
  antragId: string;
  geoeffnet: { zeit: string; ip: string };
};

export type Protokoll = {
  eingereicht: { zeit: string; ip: string };
  geoeffnet: { zeit: string; ip: string };
  unterschrieben: { zeit: string; ip: string; userAgent: string };
};

export const LINK_GUELTIG_TAGE = 7;
