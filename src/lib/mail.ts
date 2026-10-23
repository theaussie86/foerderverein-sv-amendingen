import "server-only";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { verein } from "@/lib/verein";

type Mail = {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
};

// Ohne SMTP_HOST (lokale Entwicklung) werden Mails ins Log und Anhänge ins Temp-Verzeichnis geschrieben.
export async function sendMail(mail: Mail): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log(`[mail] an ${mail.to}: ${mail.subject}\n${mail.text}`);
    for (const a of mail.attachments ?? []) {
      const pfad = join(tmpdir(), a.filename);
      await writeFile(pfad, a.content);
      console.log(`[mail] Anhang gespeichert: ${pfad}`);
    }
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  // MAIL_FROM enthält nur die Adresse, der Anzeigename kommt aus den Vereinsdaten.
  await transport.sendMail({ from: { name: verein.name, address: process.env.MAIL_FROM ?? "" }, ...mail });
}
