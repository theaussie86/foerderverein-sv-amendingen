import { neuesDokument } from "@/lib/pdf";
import { formatIban } from "@/lib/schemas";
import { mandatstext, mitgliedsbeitrag, verein } from "@/lib/verein";
import { protokollSeite, unterschrift, type Kontext } from "./protokoll-pdf";

export async function erzeugeMandatPdf(k: Kontext): Promise<Uint8Array> {
  const d = k.antrag.daten;
  const { doc, font, bold, s } = await neuesDokument("SEPA-Lastschriftmandat");
  s.feld("Zahlungsempfänger", `${verein.name}, ${verein.strasse}, ${verein.plzOrt}`);
  s.feld("Gläubiger-ID", verein.glaeubigerId);
  s.feld("Mandatsreferenz", k.antrag.mandatsreferenz);
  s.feld("Zahlungsart", "Wiederkehrende Zahlung");
  s.feld("Verwendung", `Mitgliedsbeitrag ${d.vorname} ${d.nachname}, ${mitgliedsbeitrag} € pro Jahr`);
  s.abstand(8);
  s.text(mandatstext());
  s.abstand(4);
  s.text(
    `Der Jahresbeitrag wird jeweils zum ${verein.einzugstermin} eingezogen (fällt dieser Tag nicht auf einen Bankarbeitstag, am folgenden Bankarbeitstag).`,
  );
  s.abstand(10);
  s.feld("Kontoinhaber", d.kontoinhaber);
  s.feld("IBAN", formatIban(d.iban));
  s.abstand(4);
  await unterschrift(doc, s, k, `Unterschrift Kontoinhaber/in (${d.kontoinhaber})`);
  protokollSeite(doc, font, bold, k);
  return doc.save();
}
