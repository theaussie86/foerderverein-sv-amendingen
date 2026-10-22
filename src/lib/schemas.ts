import { z } from "zod";

export const spendenSchema = z.object({
  amount: z.number().min(1, "Bitte einen Betrag von mindestens 1 € eingeben."),
  recurring: z.boolean(),
});

export type SpendenFormData = z.infer<typeof spendenSchema>;

export const mitgliedSchema = z.object({
  memberType: z.enum(["einzel", "familie", "firma"]),
  vorname: z.string().min(1, "Vorname ist erforderlich."),
  nachname: z.string().min(1, "Nachname ist erforderlich."),
  strasse: z.string().min(1, "Straße ist erforderlich."),
  plz: z
    .string()
    .regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben."),
  ort: z.string().min(1, "Ort ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  geburtsdatum: z.string().optional(),
  kontoinhaber: z.string().min(1, "Kontoinhaber ist erforderlich."),
  iban: z
    .string()
    .refine((v) => isValidIban(normalizeIban(v)), "Bitte eine gültige IBAN eingeben."),
  mandat: z.literal(true, {
    error: "Bitte erteilen Sie das SEPA-Lastschriftmandat.",
  }),
  datenschutz: z.literal(true, {
    error: "Bitte stimmen Sie der Datenschutzerklärung zu.",
  }),
  // Honeypot gegen Bots: bleibt für Menschen unsichtbar und leer.
  website: z.string().max(0).optional(),
});

export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, "$1 ").trim();
}

// Prüfsumme nach ISO 13616 (Modulo 97).
export function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const d of digits) rest = (rest * 10 + Number(d)) % 97;
  return rest === 1;
}

export type MitgliedFormData = z.infer<typeof mitgliedSchema>;

export const kontaktSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  betreff: z.string().optional(),
  nachricht: z.string().min(10, "Bitte mindestens 10 Zeichen eingeben."),
});

export type KontaktFormData = z.infer<typeof kontaktSchema>;
