import { neuesDokument } from "@/lib/pdf";
import { steuerbeguenstigung, verein } from "@/lib/verein";
import { euro, tagAnzeigen } from "./format";
import type { Beleganfrage } from "./typen";

// Beleg für den vereinfachten Zuwendungsnachweis bis 300 € (§ 50 Abs. 4 Satz 1 Nr. 2 Buchst. b EStDV).
// Er bestätigt keinen Geldeingang, den belegt der Kontoauszug des Spenders. Trotzdem geht er erst raus,
// wenn der Vorstand die Überweisung auf dem Vereinskonto gesehen hat (/admin/spenden).
// Die Belegnummer ist die ID der Beleganfrage.
export async function spendenbelegPdf(anfrage: Beleganfrage): Promise<Uint8Array> {
  const { doc, s } = await neuesDokument("Spendenbeleg");
  s.text("Beleg für den vereinfachten Zuwendungsnachweis nach § 50 Abs. 4 EStDV", { bold: true });
  s.abstand(10);
  s.feld("Beleg-Nr.", anfrage.id);
  s.feld("Spender/in", anfrage.name);
  s.feld("Anschrift", `${anfrage.strasse}, ${anfrage.plz} ${anfrage.ort}`);
  s.feld("Betrag", euro(anfrage.betrag));
  s.feld("Tag der Spende", tagAnzeigen(anfrage.tagDerSpende));
  s.feld("Empfänger", `${verein.bank.kontoinhaber}, IBAN ${verein.bank.iban}`);
  s.feld("Art der Zuwendung", "Geldzuwendung (Spende), kein Mitgliedsbeitrag");
  s.abstand(14);
  s.text(steuerbeguenstigung(verein.name, verein.steuer));
  s.abstand(6);
  s.text(`Die Zuwendung wird ausschließlich für diesen Zweck verwendet.`);
  s.abstand(14);
  s.linie();
  s.text(
    "Hinweis: Dieser Beleg gilt nur zusammen mit dem Kontoauszug oder der Buchungsbestätigung der Bank, aus dem " +
      "Name und Konto von Auftraggeber und Empfänger, Betrag und Buchungstag hervorgehen. Er ist keine " +
      "Zuwendungsbestätigung nach amtlichem Muster und wird maschinell erstellt, deshalb ohne Unterschrift.",
    { size: 9, grau: true },
  );
  return doc.save();
}
