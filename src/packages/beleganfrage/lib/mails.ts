import { verein } from "@/lib/verein";
import { euro, tagAnzeigen, ZAHLUNGSWEG_LABEL, ZAHLUNGSWEG_PRUEFORT } from "./format";
import { spendenGrenzeVereinfacht } from "./regeln";
import type { Ablehnungsgrund, BelegArt, Spenderangaben } from "./typen";

// Meldung an den Vorstand, wenn ein Spender über die Website eine Beleganfrage stellt.
// Der Link zur Anfrage fehlt, wenn sie nicht gespeichert werden konnte.
export function vorstandMail(d: Spenderangaben, art: BelegArt, link: string | null) {
  const vereinfacht = art === "vereinfacht";
  return {
    replyTo: d.email,
    subject: `${vereinfacht ? "Spendenbeleg" : "Zuwendungsbestätigung"} angefordert: ${d.name}, ${euro(d.betrag)}`,
    text:
      `Über die Website wurde ${vereinfacht ? "ein Spendenbeleg" : "eine Zuwendungsbestätigung"} angefordert.\n\n` +
      `Name: ${d.name}\nAnschrift: ${d.strasse}, ${d.plz} ${d.ort}\nE-Mail: ${d.email}\n` +
      `Betrag: ${euro(d.betrag)}\nTag der Spende: ${tagAnzeigen(d.tagDerSpende)}\nZahlungsweg: ${ZAHLUNGSWEG_LABEL[d.zahlungsweg]}\n\n` +
      `Bitte zuerst den Geldeingang ${ZAHLUNGSWEG_PRUEFORT[d.zahlungsweg]} prüfen. ` +
      (vereinfacht
        ? `Ist die Spende eingegangen, im internen Bereich bestätigen. Dann geht der Spendenbeleg automatisch an den Spender.`
        : `Ist die Spende eingegangen, die Zuwendungsbestätigung ausstellen und im internen Bereich als ausgestellt markieren.`) +
      `\n\n` +
      (link ? `${link}\n\n` : "") +
      `Mit "Antworten" geht die Mail direkt an den Spender.`,
  };
}

// Mail an den Spender bei der Ausstellung eines vereinfachten Spendenbelegs. Neutral formuliert,
// weil die Spende auch bar übergeben worden sein kann. Nach einer Betragskorrektur nennt sie beide Beträge.
export function spendenbelegMail({
  name,
  betrag,
  betragAngegeben,
}: {
  name: string;
  betrag: number;
  betragAngegeben: number;
}) {
  const korrektur =
    betrag === betragAngegeben
      ? ""
      : `Auf unserem Konto sind ${euro(betrag)} eingegangen, angegeben hattest du ${euro(betragAngegeben)}. ` +
        `Der Spendenbeleg lautet deshalb über ${euro(betrag)}.\n\n`;
  return {
    subject: `Dein Spendenbeleg über ${euro(betrag)}`,
    text:
      `Hallo ${name},\n\n` +
      `vielen Dank für deine Spende an den ${verein.name}! Deine Spende ist bei uns eingegangen.\n\n` +
      korrektur +
      `Im Anhang findest du den Spendenbeleg. Bis ${spendenGrenzeVereinfacht} € genügt dem Finanzamt dieser Beleg zusammen mit deinem ` +
      `Kontoauszug oder deiner PayPal-Buchungsbestätigung über die Zahlung an uns. Heb bitte beides für deine Steuererklärung auf.\n\n` +
      `Viele Grüße\n${verein.name}`,
  };
}

type Angefragt = { name: string; betrag: number; tagDerSpende: string };

export function ablehnungsmailBetreff({ betrag }: { betrag: number }): string {
  return `Deine Beleganfrage über ${euro(betrag)}`;
}

// Vorlagen für die Ablehnungsmail, je Ablehnungsgrund. Der Vorstand kann den Text vor dem
// Versand anpassen. "Antworten" geht an die Adresse des Vereins.
export function ablehnungsmailVorlagen({ name, betrag, tagDerSpende }: Angefragt): Record<Ablehnungsgrund, string> {
  const anfrage = `deine Beleganfrage über ${euro(betrag)} vom ${tagAnzeigen(tagDerSpende)}`;
  const gruss = `\n\nBei Fragen antworte einfach auf diese Mail.\n\nViele Grüße\n${verein.name}`;
  return {
    "nicht-eingegangen":
      `Hallo ${name},\n\n` +
      `danke für ${anfrage}. Leider haben wir keine passende Spende gefunden. ` +
      `Deshalb können wir dir dafür keinen Spendenbeleg ausstellen.\n\n` +
      `Hast du die Spende von einem anderen Konto, unter einem anderen Namen oder an einem anderen Tag gespendet? ` +
      `Dann schreib uns kurz, wir schauen gern noch einmal nach.` +
      gruss,
    doppelt:
      `Hallo ${name},\n\n` +
      `${anfrage.charAt(0).toUpperCase()}${anfrage.slice(1)} liegt uns doppelt vor. ` +
      `Wir bearbeiten nur eine davon, du bekommst für die Spende also einen Spendenbeleg und nicht zwei.` +
      gruss,
    "keine-spende":
      `Hallo ${name},\n\n` +
      `danke für ${anfrage}. Leider können wir dafür keinen Spendenbeleg ausstellen. ` +
      `Eine Zahlung mit Gegenleistung, etwa für Werbung, oder ein Mitgliedsbeitrag ist keine Spende, ` +
      `für die wir einen Spendenbeleg ausstellen dürfen.` +
      gruss,
    sonstiges:
      `Hallo ${name},\n\n` +
      `danke für ${anfrage}. Leider können wir dir dafür keinen Spendenbeleg ausstellen.` +
      gruss,
  };
}
