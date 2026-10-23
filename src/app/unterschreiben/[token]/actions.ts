"use server";

import type { Antrag, Protokoll, Sitzung } from "@/lib/antrag";
import { sendMail } from "@/lib/mail";
import { erzeugeBeitrittPdf, erzeugeMandatPdf, pruefsumme } from "@/lib/pdf";
import { clientInfo } from "@/lib/request";
import { unseal } from "@/lib/token";
import { mitgliedsbeitrag, verein } from "@/lib/verein";

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

  const d = antrag.daten;
  const kontext = { antrag, unterschriftPng: png, protokoll };
  const name = `${d.nachname}_${d.vorname}`.replace(/[^\w-]/g, "_");
  const anhaenge = [
    { filename: `Beitrittserklaerung_${name}.pdf`, content: Buffer.from(await erzeugeBeitrittPdf(kontext)) },
    { filename: `SEPA-Lastschriftmandat_${name}.pdf`, content: Buffer.from(await erzeugeMandatPdf(kontext)) },
  ];

  try {
    await sendMail({
      to: process.env.ANTRAG_EMPFAENGER ?? "",
      subject: `Neuer Mitgliedsantrag: ${d.vorname} ${d.nachname}`,
      text:
        `Neuer unterschriebener Mitgliedsantrag über die Website.\n\n` +
        `Name: ${d.vorname} ${d.nachname}\nE-Mail: ${d.email}\nJahresbeitrag: ${mitgliedsbeitrag} €\n` +
        `Mandatsreferenz: ${antrag.mandatsreferenz}\nAntrags-ID: ${antrag.id}\nPrüfsumme: ${pruefsumme(antrag, png)}\n\n` +
        `Beitrittserklärung und SEPA-Mandat (jeweils mit Protokoll) sind als PDF angehängt. ` +
        `Bitte das Mandat als Nachweis aufbewahren (bis mindestens 14 Monate nach der letzten Lastschrift).`,
      attachments: anhaenge,
    });
    await sendMail({
      to: d.email,
      subject: "Willkommen im Förderverein SV Amendingen!",
      text:
        `Hallo ${d.vorname} ${d.nachname},\n\n` +
        `vielen Dank, Ihre Beitrittserklärung ist bei uns eingegangen. Im Anhang finden Sie Ihre unterschriebene ` +
        `Beitrittserklärung und Ihr SEPA-Lastschriftmandat für Ihre Unterlagen.\n\n` +
        `Vorabinformation zum Lastschrifteinzug: Wir ziehen den Jahresbeitrag von ${mitgliedsbeitrag} € jeweils zum ` +
        `${verein.einzugstermin} unter der Gläubiger-ID ${verein.glaeubigerId} und der Mandatsreferenz ` +
        `${antrag.mandatsreferenz} von Ihrem Konto ein.\n\n` +
        `Sportliche Grüße\n${verein.name}`,
      attachments: anhaenge,
    });
  } catch (e) {
    console.error("Versand des Antrags fehlgeschlagen", e);
    return { ok: false, fehler: "Der Antrag konnte nicht versendet werden. Bitte versuchen Sie es später erneut." };
  }
  return { ok: true };
}
