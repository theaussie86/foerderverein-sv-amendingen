"use server";

import type { Antrag, Protokoll, Sitzung } from "@/lib/antrag";
import { sendMail } from "@/lib/mail";
import { erzeugeAntragPdf, pruefsumme } from "@/lib/pdf";
import { clientInfo } from "@/lib/request";
import { unseal } from "@/lib/token";
import { mitgliedschaften, verein } from "@/lib/verein";

const MAX_BILD_BYTES = 500_000;

export async function unterschreiben(
  token: string,
  sitzungToken: string,
  unterschriftDataUrl: string,
): Promise<{ ok: true } | { ok: false; fehler: string }> {
  const antrag = unseal<Antrag>(token);
  const sitzung = unseal<Sitzung>(sitzungToken);
  if (!antrag || !sitzung || sitzung.antragId !== antrag.id) {
    return { ok: false, fehler: "Der Link ist abgelaufen oder ungültig. Bitte stellen Sie den Antrag erneut." };
  }

  const prefix = "data:image/png;base64,";
  if (!unterschriftDataUrl.startsWith(prefix)) return { ok: false, fehler: "Bitte unterschreiben Sie im Feld." };
  const png = Buffer.from(unterschriftDataUrl.slice(prefix.length), "base64");
  if (png.length === 0 || png.length > MAX_BILD_BYTES) return { ok: false, fehler: "Die Unterschrift konnte nicht verarbeitet werden." };

  const { ip, userAgent } = await clientInfo();
  const protokoll: Protokoll = {
    eingereicht: antrag.eingereicht,
    geoeffnet: sitzung.geoeffnet,
    unterschrieben: { zeit: new Date().toISOString(), ip, userAgent },
  };

  const pdf = Buffer.from(await erzeugeAntragPdf(antrag, png, protokoll));
  const d = antrag.daten;
  const dateiname = `Beitrittserklaerung_${d.nachname}_${d.vorname}.pdf`.replace(/[^\w.-]/g, "_");
  const art = mitgliedschaften[d.memberType];

  try {
    await sendMail({
      to: process.env.ANTRAG_EMPFAENGER ?? "",
      subject: `Neuer Mitgliedsantrag: ${d.vorname} ${d.nachname} (${art.label})`,
      text:
        `Neuer unterschriebener Mitgliedsantrag über die Website.\n\n` +
        `Name: ${d.vorname} ${d.nachname}\nE-Mail: ${d.email}\nMitgliedschaft: ${art.label}, ${art.beitrag} €/Jahr\n` +
        `Mandatsreferenz: ${antrag.mandatsreferenz}\nAntrags-ID: ${antrag.id}\nPrüfsumme: ${pruefsumme(antrag, png)}\n\n` +
        `Das PDF mit Beitrittserklärung, SEPA-Mandat und Protokoll ist angehängt. ` +
        `Bitte das PDF als Mandatsnachweis aufbewahren (bis mindestens 14 Monate nach der letzten Lastschrift).`,
      attachments: [{ filename: dateiname, content: pdf }],
    });
    await sendMail({
      to: d.email,
      subject: "Willkommen im Förderverein SV Amendingen!",
      text:
        `Hallo ${d.vorname} ${d.nachname},\n\n` +
        `vielen Dank, Ihre Beitrittserklärung ist bei uns eingegangen. Im Anhang finden Sie Ihre unterschriebene ` +
        `Beitrittserklärung mit dem SEPA-Lastschriftmandat für Ihre Unterlagen.\n\n` +
        `Vorabinformation zum Lastschrifteinzug: Wir ziehen den Jahresbeitrag von ${art.beitrag} € jeweils zum ` +
        `${verein.einzugstermin} unter der Gläubiger-ID ${verein.glaeubigerId} und der Mandatsreferenz ` +
        `${antrag.mandatsreferenz} von Ihrem Konto ein.\n\n` +
        `Sportliche Grüße\n${verein.name}`,
      attachments: [{ filename: dateiname, content: pdf }],
    });
  } catch (e) {
    console.error("Versand des Antrags fehlgeschlagen", e);
    return { ok: false, fehler: "Der Antrag konnte nicht versendet werden. Bitte versuchen Sie es später erneut." };
  }
  return { ok: true };
}
