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
  iban: z
    .string()
    .regex(
      /^DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/,
      "Bitte eine gültige deutsche IBAN eingeben."
    )
    .optional()
    .or(z.literal("")),
  datenschutz: z.literal(true, {
    error: "Bitte stimmen Sie der Datenschutzerklärung zu.",
  }),
});

export type MitgliedFormData = z.infer<typeof mitgliedSchema>;

export const kontaktSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  betreff: z.string().optional(),
  nachricht: z.string().min(10, "Bitte mindestens 10 Zeichen eingeben."),
});

export type KontaktFormData = z.infer<typeof kontaktSchema>;
