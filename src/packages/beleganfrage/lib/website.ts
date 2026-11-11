import { vorstandMail } from "./mails";
import { belegArt } from "./regeln";
import type { BelegArt, Postausgang, Schreibablage, Spenderangaben } from "./typen";

export type WebsiteUmgebung = {
  schreiben: Schreibablage;
  post: Postausgang;
  // Adresse(n) des Vorstands für neue Beleganfragen, mehrere mit Komma getrennt.
  vorstandPostfach: string;
  siteUrl: string;
};

export type StellenErgebnis = { ok: true; art: BelegArt } | { ok: false; grund: "nicht-angekommen" };

// Jede Anfrage wird nur gespeichert und dem Vorstand gemeldet. Den Beleg gibt es erst,
// wenn der Vorstand den Geldeingang geprüft hat (/admin/spenden).
// Sonst könnte jeder einen Beleg für eine Spende anfordern, die nie überwiesen wurde.
// Angekommen ist die Anfrage, wenn sie gespeichert oder dem Vorstand gemeldet wurde.
export function website(u: WebsiteUmgebung) {
  async function stellen(angaben: Spenderangaben): Promise<StellenErgebnis> {
    const art = belegArt(angaben.betrag);

    let id: string | null = null;
    try {
      id = await u.schreiben.speichern({ ...angaben, art, notiz: "", erfasstVon: null });
    } catch (e) {
      console.error("Anfrage Spendenbeleg nicht gespeichert", e);
    }

    try {
      const link = id ? `${u.siteUrl}/admin/spenden/${id}` : null;
      await u.post.senden({ to: u.vorstandPostfach, ...vorstandMail(angaben, art, link) });
    } catch (e) {
      console.error("Mail zur Spendenbeleg-Anfrage fehlgeschlagen", e);
      if (!id) return { ok: false, grund: "nicht-angekommen" };
    }
    return { ok: true, art };
  }

  return { stellen };
}
