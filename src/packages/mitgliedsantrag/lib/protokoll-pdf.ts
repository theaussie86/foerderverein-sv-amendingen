import { pruefsumme } from "./pruefsumme";
import { formatZeit, type Kontext, type Vordruck } from "./vordruck";

// Letzte Seite von Beitrittserklärung und SEPA-Mandat: Ablauf der elektronischen Unterschrift.
export function protokollSeite(v: Vordruck, { antrag, unterschriftPng, protokoll }: Kontext) {
  const d = antrag.daten;
  v.neueSeite();
  v.text("Protokoll der elektronischen Unterschrift", { size: 16, bold: true });
  v.abstand(8);
  v.feld("Antrags-ID", antrag.id);
  v.feld("Unterzeichner/in", `${d.kontoinhaber} (${d.email})`);
  v.abstand(10);
  v.text("Ablauf", { size: 12, bold: true });
  v.abstand(4);
  v.feld("Antrag eingereicht", `${formatZeit(protokoll.eingereicht.zeit)}, IP ${protokoll.eingereicht.ip}`);
  v.feld("Bestätigungslink", `per E-Mail an ${d.email} versandt`);
  v.feld("Link geöffnet", `${formatZeit(protokoll.geoeffnet.zeit)}, IP ${protokoll.geoeffnet.ip}`);
  v.feld("Unterschrieben", `${formatZeit(protokoll.unterschrieben.zeit)}, IP ${protokoll.unterschrieben.ip}`);
  v.feld("Browser", protokoll.unterschrieben.userAgent);
  v.abstand(10);
  v.feld("Prüfsumme (SHA-256)", pruefsumme(antrag, unterschriftPng));
  v.abstand(14);
  v.text(
    "Die Unterschrift wurde auf der Website des Vereins nach Bestätigung der E-Mail-Adresse über einen persönlichen, " +
      "zeitlich begrenzten Link geleistet. Beitrittserklärung und SEPA-Lastschriftmandat wurden mit derselben Unterschrift " +
      "unterzeichnet. Die Prüfsumme bezieht sich auf die Antragsdaten und das Unterschriftsbild.",
    { size: 9, grau: true },
  );
}
