import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";

// Verschlüsselte, zeitlich begrenzte Tokens (AES-256-GCM). Damit tragen die Links
// in den Mails die Antragsdaten selbst, und der Server braucht keine Datenbank.

function key(): Buffer {
  const secret = process.env.ANTRAG_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ANTRAG_SECRET fehlt oder ist kürzer als 32 Zeichen.");
  }
  return createHash("sha256").update(secret).digest();
}

export function seal(payload: unknown, ttlSeconds: number): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = JSON.stringify({ p: payload, exp: Date.now() + ttlSeconds * 1000 });
  const enc = Buffer.concat([cipher.update(body, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

// Der Inhalt wird mit dem Schema geprüft. Tokens mit veralteter Form gelten als ungültig.
export function unseal<T>(token: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const body = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const umschlag = z.object({ p: schema, exp: z.number() }).safeParse(JSON.parse(body));
    if (!umschlag.success || Date.now() > umschlag.data.exp) return null;
    return umschlag.data.p;
  } catch {
    return null;
  }
}
