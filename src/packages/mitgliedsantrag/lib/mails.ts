import { mitgliedsbeitrag, verein } from "@/lib/verein";
import type { Antrag } from "./antrag";

// Texte unverändert aus den früheren Server Actions. "Vorabinformation" statt "Vorabankündigung" ist #38.

export type Anhang = { filename: string; content: Buffer };

export type Mail = {
  to: string;
  subject: string;
  text: string;
  attachments?: Anhang[];
};

export function bestaetigungslinkMail(antrag: Antrag, link: string, gueltigTage: number): Mail {
  const d = antrag.daten;
  return {
    to: d.email,
    subject: "Bitte bestätigen: deine Beitrittserklärung zum Förderverein SV Amendingen",
    text:
      `Hallo ${d.vorname},\n\n` +
      `vielen Dank für dein Interesse am ${verein.name}!\n\n` +
      `Bitte öffne den folgenden Link, prüf deine Angaben und unterschreib deine Beitrittserklärung ` +
      `mit dem SEPA-Lastschriftmandat:\n\n${link}\n\n` +
      `Der Link ist ${gueltigTage} Tage gültig. Falls du keinen Antrag gestellt hast, ignorier diese E-Mail einfach.\n\n` +
      `Sportliche Grüße\n${verein.name}`,
  };
}

export function vorstandMail(antrag: Antrag, empfaenger: string, pruefsumme: string, anhaenge: Anhang[]): Mail {
  const d = antrag.daten;
  return {
    to: empfaenger,
    subject: `Neuer Mitgliedsantrag: ${d.vorname} ${d.nachname}`,
    text:
      `Neuer unterschriebener Mitgliedsantrag über die Website.\n\n` +
      `Name: ${d.vorname} ${d.nachname}\nE-Mail: ${d.email}\nJahresbeitrag: ${mitgliedsbeitrag} €\n` +
      `Mandatsreferenz: ${antrag.mandatsreferenz}\nAntrags-ID: ${antrag.id}\nPrüfsumme: ${pruefsumme}\n\n` +
      `Beitrittserklärung und SEPA-Mandat (jeweils mit Protokoll) sind als PDF angehängt. ` +
      `Bitte das Mandat als Nachweis aufbewahren (bis mindestens 14 Monate nach der letzten Lastschrift).`,
    attachments: anhaenge,
  };
}

export function willkommenMail(antrag: Antrag, anhaenge: Anhang[]): Mail {
  const d = antrag.daten;
  return {
    to: d.email,
    subject: "Willkommen im Förderverein SV Amendingen!",
    text:
      `Hallo ${d.vorname},\n\n` +
      `vielen Dank, deine Beitrittserklärung ist bei uns eingegangen. Im Anhang findest du deine unterschriebene ` +
      `Beitrittserklärung und dein SEPA-Lastschriftmandat für deine Unterlagen.\n\n` +
      `Vorabinformation zum Lastschrifteinzug: Wir ziehen den Jahresbeitrag von ${mitgliedsbeitrag} € jeweils zum ` +
      `${verein.einzugstermin} unter der Gläubiger-ID ${verein.glaeubigerId} und der Mandatsreferenz ` +
      `${antrag.mandatsreferenz} von deinem Konto ein.\n\n` +
      `Sportliche Grüße\n${verein.name}`,
    attachments: anhaenge,
  };
}
