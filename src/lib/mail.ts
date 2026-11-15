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

// Ohne RESEND_API_KEY (lokale Entwicklung) werden Mails ins Log und Anhänge ins Temp-Verzeichnis geschrieben.
export async function sendMail(mail: Mail): Promise<void> {
  const { RESEND_API_KEY, MAIL_FROM } = env();
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
    to: mail.to
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    replyTo: mail.replyTo ?? verein.email,
    subject: mail.subject,
    text: mail.text,
    attachments: mail.attachments,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
