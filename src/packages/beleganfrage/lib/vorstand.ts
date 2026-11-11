import { belegDateiname } from "./format";
import { ablehnungsmailBetreff, spendenbelegMail } from "./mails";
import { belegArt, istBearbeitbar } from "./regeln";
import { spendenbelegPdf } from "./spendenbeleg-pdf";
import type {
  Ablehnung,
  Beleganfrage,
  Leseablage,
  Postausgang,
  Schreibablage,
  Spenderangaben,
  Suche,
  Trefferliste,
} from "./typen";

export type VorstandsUmgebung = {
  lesen: Leseablage;
  schreiben: Schreibablage;
  post: Postausgang;
  jetzt: () => Date;
};

export type AbschlussErgebnis = { ok: true } | { ok: false; grund: "abgeschlossen" | "mail" };

export type ErfassenErgebnis =
  | { ok: true; id: string }
  | { ok: false; grund: "nicht-gespeichert" }
  // Gespeichert, aber direktAusstellen scheiterte am Versand des Spendenbelegs. Die Anfrage ist weiter offen.
  | { ok: false; grund: "mail"; id: string };

export type BelegPdf =
  | { ok: true; dateiname: string; inhalt: ReadableStream<Uint8Array> }
  | { ok: false; grund: "nicht-gefunden" | "fehler" };

export function vorstand(u: VorstandsUmgebung) {
  // Lädt mit den Rechten des Vorstands, damit nur sichtbare und nicht abgeschlossene Anfragen
  // bearbeitet werden. Doppelklicks laufen so ins Leere.
  async function bearbeitbar(id: string): Promise<Beleganfrage | null> {
    const anfrage = await u.lesen.laden(id);
    return anfrage && istBearbeitbar(anfrage.status) ? anfrage : null;
  }

  // Bis 300 €: Der Vorstand hat den Geldeingang geprüft, erst jetzt gibt es den Spendenbeleg.
  // Ohne E-Mail-Adresse geht keine Mail raus, der Beleg liegt dann nur zum Herunterladen bereit.
  // Scheitert die Mail, bleibt die Anfrage unverändert.
  async function belegVersenden(anfrage: Beleganfrage, vorstandId: string): Promise<AbschlussErgebnis> {
    const beleg = { dateiname: belegDateiname(anfrage), inhalt: await spendenbelegPdf(anfrage) };
    if (anfrage.email) {
      try {
        await u.post.senden({ to: anfrage.email, ...spendenbelegMail(anfrage), attachments: [beleg] });
      } catch (e) {
        console.error("Spendenbeleg konnte nicht versendet werden", e);
        return { ok: false, grund: "mail" };
      }
    }
    await u.schreiben.abschliessen(anfrage.id, {
      status: "ausgestellt",
      vorstandId,
      am: u.jetzt(),
      betrag: anfrage.betrag,
      art: anfrage.art,
      beleg,
    });
    return { ok: true };
  }

  // Über 300 €: Der Vertretungsvorstand hat die Zuwendungsbestätigung außerhalb der Website ausgestellt.
  async function vonHandAusgestellt(anfrage: Beleganfrage, vorstandId: string): Promise<AbschlussErgebnis> {
    await u.schreiben.abschliessen(anfrage.id, {
      status: "ausgestellt",
      vorstandId,
      am: u.jetzt(),
      betrag: anfrage.betrag,
      art: anfrage.art,
    });
    return { ok: true };
  }

  // Die Art richtet sich nach dem eingegangenen Betrag. Wird erst durch die Betragskorrektur eine
  // Zuwendungsbestätigung daraus, ist sie noch nicht ausgestellt: nur korrigieren, Status bleibt.
  async function ausstellen(
    anfrage: Beleganfrage,
    vorstandId: string,
    eingegangen = anfrage.betrag,
  ): Promise<AbschlussErgebnis> {
    const korrigiert = { ...anfrage, betrag: eingegangen, art: belegArt(eingegangen) };
    if (korrigiert.art === "vereinfacht") return belegVersenden(korrigiert, vorstandId);
    if (anfrage.art === "zuwendungsbestaetigung") return vonHandAusgestellt(korrigiert, vorstandId);
    await u.schreiben.betragKorrigieren(anfrage.id, { betrag: korrigiert.betrag, art: korrigiert.art });
    return { ok: true };
  }

  return {
    // Ausstellung: Bis 300 € erzeugt die Website den Spendenbeleg und schickt ihn, darüber
    // hält sie fest, dass die Zuwendungsbestätigung von Hand ausgestellt wurde. Mit eingegangen
    // gilt ein anderer Betrag als der angegebene (Betragskorrektur).
    async ausstellen(id: string, vorstandId: string, eingegangen?: number): Promise<AbschlussErgebnis> {
      const anfrage = await bearbeitbar(id);
      if (!anfrage) return { ok: false, grund: "abgeschlossen" };
      return ausstellen(anfrage, vorstandId, eingegangen);
    },

    // Konto geprüft, Spende noch nicht da. Wartend endet nur mit Ausstellung oder Ablehnung.
    async alsWartendMarkieren(id: string): Promise<AbschlussErgebnis> {
      const anfrage = await bearbeitbar(id);
      if (!anfrage) return { ok: false, grund: "abgeschlossen" };
      const jetzt = u.jetzt();
      const seit = anfrage.status === "wartend" && anfrage.wartend ? new Date(anfrage.wartend.seit) : jetzt;
      await u.schreiben.wartendMarkieren(id, { seit, zuletztGeprueft: jetzt });
      return { ok: true };
    },

    // Abschluss ohne Spendenbeleg, mit Ablehnungsgrund. Mit mailText bekommt der Spender eine
    // Ablehnungsmail, sofern er eine E-Mail-Adresse hat. Scheitert sie, bleibt alles, wie es war.
    async ablehnen(
      id: string,
      vorstandId: string,
      { mailText, grund, begruendung }: Ablehnung & { mailText: string | null },
    ): Promise<AbschlussErgebnis> {
      const anfrage = await bearbeitbar(id);
      if (!anfrage) return { ok: false, grund: "abgeschlossen" };
      if (mailText && anfrage.email) {
        try {
          await u.post.senden({ to: anfrage.email, subject: ablehnungsmailBetreff(anfrage), text: mailText });
        } catch (e) {
          console.error("Ablehnungsmail konnte nicht versendet werden", e);
          return { ok: false, grund: "mail" };
        }
      }
      // Eine Begründung gibt es nur bei Sonstiges, Reste aus dem Formular fallen weg.
      const ablehnung = { grund, begruendung: grund === "sonstiges" ? begruendung : "" };
      await u.schreiben.abschliessen(id, { status: "abgelehnt", vorstandId, am: u.jetzt(), ablehnung });
      return { ok: true };
    },

    // Der Vorstand erfasst eine Beleganfrage für einen Spender, der sich nicht über die Website
    // gemeldet hat. Anders als auf der Website geht keine Mail an den Vorstand. Mit direktAusstellen
    // hat der Vorstand den Geldeingang schon gesehen und die Anfrage wird sofort ausgestellt.
    async erfassen(
      angaben: Spenderangaben & { notiz: string },
      vorstandId: string,
      { direktAusstellen }: { direktAusstellen: boolean },
    ): Promise<ErfassenErgebnis> {
      const art = belegArt(angaben.betrag);
      let id: string | null = null;
      try {
        id = await u.schreiben.speichern({ ...angaben, art, erfasstVon: vorstandId });
      } catch (e) {
        console.error("Beleganfrage konnte nicht erfasst werden", e);
      }
      if (!id) return { ok: false, grund: "nicht-gespeichert" };

      if (direktAusstellen) {
        const anfrage = await bearbeitbar(id);
        if (anfrage) {
          const ergebnis = await ausstellen(anfrage, vorstandId);
          if (!ergebnis.ok) return { ok: false, grund: "mail", id };
        }
      }
      return { ok: true, id };
    },

    laden: (id: string): Promise<Beleganfrage | null> => u.lesen.laden(id),

    suchen: (suche: Suche): Promise<Trefferliste> => u.lesen.suchen(suche),

    // Null, wenn die Ablage nicht antwortet. Die Zahl ist nur ein Hinweis in der Navigation.
    async anzahlOffen(): Promise<number | null> {
      try {
        return await u.lesen.anzahlOffen();
      } catch {
        return null;
      }
    },

    // Der abgelegte Spendenbeleg, unter demselben Namen wie im Mailanhang.
    async belegPdf(id: string): Promise<BelegPdf> {
      const anfrage = await u.lesen.laden(id);
      if (!anfrage?.hatBeleg) return { ok: false, grund: "nicht-gefunden" };
      try {
        const inhalt = await u.lesen.belegDatei(id);
        if (!inhalt) return { ok: false, grund: "nicht-gefunden" };
        return { ok: true, dateiname: belegDateiname(anfrage), inhalt };
      } catch (e) {
        console.error("Spendenbeleg konnte nicht geladen werden", e);
        return { ok: false, grund: "fehler" };
      }
    },
  };
}
