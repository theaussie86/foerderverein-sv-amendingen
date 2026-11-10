import { z } from "zod";

export const beleganfrageSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich."),
  strasse: z.string().min(1, "Straße ist erforderlich."),
  plz: z.string().regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben."),
  ort: z.string().min(1, "Ort ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  betrag: z.number({ error: "Bitte den überwiesenen Betrag eingeben." }).min(1, "Bitte den überwiesenen Betrag eingeben."),
  datum: z.string().min(1, "Bitte das Datum der Überweisung angeben."),
  // Honeypot gegen Bots: bleibt für Menschen unsichtbar und leer. Ohne max(0), damit die
  // Action befüllte Felder erkennt und Bots eine scheinbare Erfolgsmeldung bekommen.
  website: z.string().optional(),
});

export type BeleganfrageFormData = z.infer<typeof beleganfrageSchema>;

export const mitgliedSchema = z.object({
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
  // boolean statt literal(true), damit das Formular mit false starten kann.
  mandat: z.boolean().refine((v) => v, "Bitte erteil das SEPA-Lastschriftmandat."),
  datenschutz: z.boolean().refine((v) => v, "Bitte stimm der Datenschutzerklärung zu."),
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
  betreff: z.string().max(200).optional(),
  nachricht: z.string().min(10, "Bitte mindestens 10 Zeichen eingeben.").max(5000, "Bitte höchstens 5000 Zeichen eingeben."),
  // Honeypot gegen Bots: bleibt für Menschen unsichtbar und leer. Ohne max(0), damit die
  // Action befüllte Felder erkennt und Bots eine scheinbare Erfolgsmeldung bekommen.
  website: z.string().optional(),
});

export type KontaktFormData = z.infer<typeof kontaktSchema>;

// Unterschrift auf /unterschreiben/[token]. Browser und Server Action prüfen mit demselben Schema.
export const UNTERSCHRIFT_PREFIX = "data:image/png;base64,";
export const unterschriftSchema = z.object({
  token: z.string().min(1),
  sitzungToken: z.string().min(1),
  unterschrift: z.string().startsWith(UNTERSCHRIFT_PREFIX, "Bitte unterschreib im Feld."),
  bestaetigt: z.literal(true, { error: "Bitte bestätige, dass du verbindlich unterschreibst." }),
});

export type UnterschriftEingabe = z.infer<typeof unterschriftSchema>;

// Anmeldung im internen Bereich per Einmal-Code. Zwei Schritte, unterschieden über "modus".
const loginEmail = z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben.");

export const loginSchema = z.discriminatedUnion("modus", [
  z.object({ modus: z.literal("code-anfordern"), email: loginEmail }),
  z.object({
    modus: z.literal("code-pruefen"),
    email: loginEmail,
    otpId: z.string().min(1),
    code: z
      .string()
      .transform((c) => c.replace(/\s/g, ""))
      .pipe(z.string().regex(/^\d{6}$/, "Der Code hat 6 Ziffern.")),
  }),
]);

export type LoginEingabe = z.infer<typeof loginSchema>;
