import { z } from "zod";
import { ABLEHNUNGSGRUENDE } from "@/packages/beleganfrage/anzeige";
import { ENDE_GRUENDE } from "@/packages/mitglied/anzeige";

// Angaben zum Spender, gleich für Website und internen Bereich. Betrag und Tag der Spende
// heißen auf der Website "überwiesen", im internen Bereich neutral.
const spendeFelder = {
  name: z.string().min(1, "Name ist erforderlich."),
  strasse: z.string().min(1, "Straße ist erforderlich."),
  plz: z.string().regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben."),
  ort: z.string().min(1, "Ort ist erforderlich."),
};

export const beleganfrageSchema = z.object({
  ...spendeFelder,
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  betrag: z
    .number({ error: "Bitte den überwiesenen Betrag eingeben." })
    .min(1, "Bitte den überwiesenen Betrag eingeben."),
  tag_der_spende: z.string().min(1, "Bitte den Tag der Überweisung angeben."),
  // Honeypot gegen Bots: bleibt für Menschen unsichtbar und leer. Ohne max(0), damit die
  // Action befüllte Felder erkennt und Bots eine scheinbare Erfolgsmeldung bekommen.
  website: z.string().optional(),
});

export type BeleganfrageFormData = z.infer<typeof beleganfrageSchema>;

// Der Vorstand erfasst eine Beleganfrage im internen Bereich, etwa nach einer WhatsApp-Nachricht.
// Ohne E-Mail-Adresse gibt es den Spendenbeleg nur zum Herunterladen. Mit direktAusstellen hat der
// Vorstand den Geldeingang schon gesehen, die Anfrage wird sofort ausgestellt.
export const beleganfrageErfassenSchema = z.object({
  ...spendeFelder,
  betrag: z.number({ error: "Bitte den Betrag eingeben." }).min(1, "Bitte den Betrag eingeben."),
  tag_der_spende: z.string().min(1, "Bitte den Tag der Spende angeben."),
  email: z.union([z.literal(""), z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben.")]),
  notiz: z.string().max(5000, "Bitte höchstens 5000 Zeichen eingeben."),
  direktAusstellen: z.boolean(),
});

export type BeleganfrageErfassenDaten = z.infer<typeof beleganfrageErfassenSchema>;

// Ausstellung mit dem eingegangenen Betrag. Weicht er vom angegebenen ab, ist das eine Betragskorrektur.
export const beleganfrageAusstellenSchema = z.object({
  eingegangen: z
    .number({ error: "Bitte den eingegangenen Betrag eingeben." })
    .min(1, "Bitte den eingegangenen Betrag eingeben."),
});

export type BeleganfrageAusstellenDaten = z.infer<typeof beleganfrageAusstellenSchema>;

// Ablehnung einer Beleganfrage. Bei "Sonstiges" ist eine Begründung Pflicht. Die Ablehnungsmail
// geht nur raus, wenn der Vorstand sie ankreuzt, ihr Text ist dann Pflicht.
export const beleganfrageAblehnenSchema = z
  .object({
    grund: z.enum(ABLEHNUNGSGRUENDE, { error: "Bitte einen Ablehnungsgrund wählen." }),
    begruendung: z.string().trim().max(1000, "Bitte höchstens 1000 Zeichen eingeben."),
    mailSenden: z.boolean(),
    mailText: z.string().trim().max(5000, "Bitte höchstens 5000 Zeichen eingeben."),
  })
  .refine((d) => d.grund !== "sonstiges" || d.begruendung, {
    path: ["begruendung"],
    message: "Bitte die Ablehnung begründen.",
  })
  .refine((d) => !d.mailSenden || d.mailText, {
    path: ["mailText"],
    message: "Bitte den Text der Ablehnungsmail eingeben.",
  });

export type BeleganfrageAblehnenDaten = z.infer<typeof beleganfrageAblehnenSchema>;

export const mitgliedSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich."),
  nachname: z.string().min(1, "Nachname ist erforderlich."),
  strasse: z.string().min(1, "Straße ist erforderlich."),
  plz: z.string().regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben."),
  ort: z.string().min(1, "Ort ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  geburtsdatum: z.string().optional(),
  // Freiwillig wie auf der Papiervorlage (#16). Neu: Anträge aus alten Links haben die Felder nicht.
  telefon: z.string().max(40, "Höchstens 40 Zeichen.").optional(),
  handy: z.string().max(40, "Höchstens 40 Zeichen.").optional(),
  kontoinhaber: z.string().min(1, "Kontoinhaber ist erforderlich."),
  iban: z.string().refine((v) => isValidIban(normalizeIban(v)), "Bitte eine gültige IBAN eingeben."),
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
  return normalizeIban(iban)
    .replace(/(.{4})/g, "$1 ")
    .trim();
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

// Der Vorstand legt ein Mitglied im internen Bereich an oder pflegt es. Anders als beim
// Mitgliedsantrag dürfen Angaben fehlen, weil die Bestandsliste lückenhaft ist (#49).
const leerOder = <T extends z.ZodType<string>>(schema: T) => z.union([z.literal(""), schema]);
const tag = leerOder(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein Datum angeben."));

export const mitgliedPflegeSchema = z
  .object({
    // Zeichen, die eine SEPA-Mandatsreferenz enthalten darf.
    mandatsreferenz: z
      .string()
      .trim()
      .min(1, "Mandatsreferenz ist erforderlich.")
      .max(35, "Höchstens 35 Zeichen.")
      .regex(/^[A-Za-z0-9+?/:().,' -]+$/, "Nur Buchstaben ohne Umlaute, Ziffern und + ? / : ( ) . , ' -"),
    vorname: z.string().trim().min(1, "Vorname ist erforderlich.").max(100),
    nachname: z.string().trim().min(1, "Nachname ist erforderlich.").max(100),
    strasse: z.string().max(200),
    plz: leerOder(
      z
        .string()
        .trim()
        .regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben."),
    ),
    ort: z.string().max(100),
    email: leerOder(z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben.")),
    kontoinhaber: z.string().max(200),
    iban: z.string().refine((v) => isValidIban(normalizeIban(v)), "Bitte eine gültige IBAN eingeben."),
    bic: leerOder(
      z
        .string()
        .transform((v) => v.replace(/\s+/g, "").toUpperCase())
        .pipe(z.string().regex(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/, "Eine BIC hat 8 oder 11 Zeichen.")),
    ),
    bank: z.string().max(100),
    eintrittsdatum: tag,
    mandatDatum: tag,
    endeDatum: tag,
    endeGrund: z.enum(["", ...ENDE_GRUENDE]),
    antragId: z.string().max(15),
    notiz: z.string().max(5000, "Bitte höchstens 5000 Zeichen eingeben."),
  })
  .refine((d) => !d.endeDatum || d.endeGrund, {
    path: ["endeGrund"],
    message: "Bitte den Grund für das Ende angeben.",
  })
  .refine((d) => d.endeDatum || !d.endeGrund, {
    path: ["endeDatum"],
    message: "Bitte das Datum des Endes angeben.",
  });

export type MitgliedPflegeDaten = z.infer<typeof mitgliedPflegeSchema>;

export const kontaktSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  betreff: z.string().max(200).optional(),
  nachricht: z
    .string()
    .min(10, "Bitte mindestens 10 Zeichen eingeben.")
    .max(5000, "Bitte höchstens 5000 Zeichen eingeben."),
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
