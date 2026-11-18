import "server-only";
import { z } from "zod";

// Einziger Ort, der process.env liest (ESLint sperrt es überall sonst).
// Leere Werte aus .env gelten als nicht gesetzt. Gelesen wird bei jedem Aufruf,
// damit Tests Variablen setzen können und der Build ohne Secrets durchläuft.

const leerIstUngesetzt = (wert: unknown) => (wert === "" ? undefined : wert);
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(leerIstUngesetzt, schema.optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SITE_URL: z.preprocess(leerIstUngesetzt, z.url().default("http://localhost:3000")),
    // Die Länge prüft src/lib/token.ts erst beim Versiegeln, damit Seiten ohne Tokens auch ohne Schlüssel laufen.
    ANTRAG_SECRET: optional(z.string()),
    ANTRAG_EMPFAENGER: optional(z.string()),
    QUITTUNG_EMPFAENGER: optional(z.string()),
    KONTAKT_EMPFAENGER: optional(z.string()),
    RESEND_API_KEY: optional(z.string()),
    MAIL_FROM: optional(z.email()),
    // Nur lokal: Ohne RESEND_API_KEY gehen Mails an diese Mailpit-Instanz (z. B. http://localhost:8025).
    MAILPIT_URL: optional(z.url()),
    POCKETBASE_URL: optional(z.url()),
    POCKETBASE_EMAIL: optional(z.string()),
    POCKETBASE_PASSWORD: optional(z.string()),
  })
  .refine((e) => !e.RESEND_API_KEY || e.MAIL_FROM, {
    message: "MAIL_FROM fehlt, ist aber für den Versand über Resend nötig.",
    path: ["MAIL_FROM"],
  });

export type Env = z.infer<typeof envSchema>;

export function env(): Env {
  const ergebnis = envSchema.safeParse(process.env);
  if (!ergebnis.success) {
    const fehler = ergebnis.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Ungültige Umgebungsvariablen: ${fehler}`);
  }
  return ergebnis.data;
}
