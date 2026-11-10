import { verein } from "@/lib/verein";
import { euro } from "./format";
import { spendenGrenzeVereinfacht } from "./regeln";
import type { BelegArt, Spenderangaben } from "./typen";

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
      `Betrag: ${euro(d.betrag)}\nTag der Spende: ${new Date(d.tagDerSpende).toLocaleDateString("de-DE", { timeZone: "UTC" })}\n\n` +
      `Bitte zuerst den Geldeingang auf dem Vereinskonto prüfen. ` +
      (vereinfacht
        ? `Ist die Spende eingegangen, im internen Bereich bestätigen. Dann geht der Spendenbeleg automatisch an den Spender.`
        : `Ist die Spende eingegangen, die Zuwendungsbestätigung ausstellen und im internen Bereich als ausgestellt markieren.`) +
      `\n\n` +
      (link ? `${link}\n\n` : "") +
      `Mit "Antworten" geht die Mail direkt an den Spender.`,
  };
}

// Mail an den Spender, wenn der Vorstand den Spendenbeleg freigibt. Neutral formuliert,
// weil die Spende auch bar übergeben worden sein kann.
export function spendenbelegMail({ name, betrag }: { name: string; betrag: number }) {
  return {
    subject: `Dein Spendenbeleg über ${euro(betrag)}`,
    text:
      `Hallo ${name},\n\n` +
      `vielen Dank für deine Spende an den ${verein.name}! Deine Spende ist bei uns eingegangen.\n\n` +
      `Im Anhang findest du den Spendenbeleg. Bis ${spendenGrenzeVereinfacht} € genügt dem Finanzamt dieser Beleg zusammen mit deinem ` +
      `Kontoauszug, auf dem die Überweisung an uns zu sehen ist. Heb bitte beides für deine Steuererklärung auf.\n\n` +
      `Viele Grüße\n${verein.name}`,
  };
}
