import "server-only";
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
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mail] an ${mail.to}: ${mail.subject}\n${mail.text}`);
    for (const a of mail.attachments ?? []) {
      const pfad = join(tmpdir(), a.filename);
      await writeFile(pfad, a.content);
      console.log(`[mail] Anhang gespeichert: ${pfad}`);
    }
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  // MAIL_FROM enthält nur die Adresse, der Anzeigename kommt aus den Vereinsdaten.
  const { error } = await resend.emails.send({
    from: `"${verein.name}" <${process.env.MAIL_FROM}>`,
    to: mail.to.split(",").map((a) => a.trim()).filter(Boolean),
    subject: mail.subject,
    text: mail.text,
    attachments: mail.attachments,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
