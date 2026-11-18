import "server-only";
import { env } from "@/lib/env";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Resend } from "resend";
import { verein } from "@/lib/verein";

type Mail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
};

function empfaenger(to: string): string[] {
  return to
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

// Lokale Entwicklung: Mailpit nimmt Mails über seine HTTP-API an und zeigt sie samt Anhang im Browser.
async function anMailpit(basis: string, absender: string, mail: Mail): Promise<void> {
  const antwort = await fetch(new URL("/api/v1/send", basis), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      From: { Email: absender, Name: verein.name },
      To: empfaenger(mail.to).map((Email) => ({ Email })),
      ReplyTo: [{ Email: mail.replyTo ?? verein.email }],
      Subject: mail.subject,
      Text: mail.text,
      Attachments: (mail.attachments ?? []).map((a) => ({
        Filename: a.filename,
        Content: a.content.toString("base64"),
      })),
    }),
  });
  if (!antwort.ok) throw new Error(`Mailpit: ${antwort.status} ${await antwort.text()}`);
  console.log(`[mail] an ${mail.to}: ${mail.subject} (in Mailpit)`);
}

// Ohne RESEND_API_KEY (lokale Entwicklung) gehen Mails an Mailpit, falls MAILPIT_URL gesetzt ist,
// sonst ins Log und Anhänge ins Temp-Verzeichnis.
export async function sendMail(mail: Mail): Promise<void> {
  const { RESEND_API_KEY, MAIL_FROM, MAILPIT_URL } = env();
  if (!RESEND_API_KEY && MAILPIT_URL) {
    await anMailpit(MAILPIT_URL, MAIL_FROM ?? "noreply@example.org", mail);
    return;
  }
  if (!RESEND_API_KEY) {
    console.log(`[mail] an ${mail.to}: ${mail.subject}\n${mail.text}`);
    for (const a of mail.attachments ?? []) {
      const pfad = join(tmpdir(), a.filename);
      await writeFile(pfad, a.content);
      console.log(`[mail] Anhang gespeichert: ${pfad}`);
    }
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  // MAIL_FROM enthält nur die Adresse, der Anzeigename kommt aus den Vereinsdaten.
  const { error } = await resend.emails.send({
    from: `"${verein.name}" <${MAIL_FROM}>`,
    to: empfaenger(mail.to),
    replyTo: mail.replyTo ?? verein.email,
    subject: mail.subject,
    text: mail.text,
    attachments: mail.attachments,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
