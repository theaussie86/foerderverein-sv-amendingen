// Entry Point: Mitgliedsantrag vom ausgefüllten Formular bis zum gespeicherten, unterschriebenen Antrag.
// Die Umgebung (Ablage, Postausgang, Siegel, Uhr, IDs) wird hineingereicht. Die echte steht in server.ts.
import type { z } from "zod";
import { normalizeIban, UNTERSCHRIFT_PREFIX, type UnterschriftEingabe } from "@/lib/schemas";
import { mitgliedsbeitrag } from "@/lib/verein";
import {
  antragSchema,
  LINK_GUELTIG_TAGE,
  sitzungSchema,
  type Antrag,
  type Antragsdaten,
  type Protokoll,
  type Sitzung,
} from "./lib/antrag";
import { erzeugeBeitrittPdf } from "./lib/beitritt-pdf";
import { bestaetigungslinkMail, vorstandMail, willkommenMail, type Anhang, type Mail } from "./lib/mails";
import { erzeugeMandatPdf } from "./lib/mandat-pdf";
import { pruefsumme } from "./lib/pruefsumme";

export type { Anhang, Antrag, Antragsdaten, Mail, Protokoll };

export type Herkunft = { ip: string; userAgent: string };

export type UnterschriebenerAntrag = {
  antrag: Antrag;
  unterschriftPng: Uint8Array;
  beitrittPdf: Anhang;
  mandatPdf: Anhang;
  protokoll: Protokoll;
  pruefsumme: string;
  mitgliedsbeitrag: number;
};

// "bereits-vorhanden": derselbe Link wurde schon einmal unterschrieben. "uebersprungen": keine Ablage konfiguriert.
export type Speicherergebnis = "gespeichert" | "bereits-vorhanden" | "uebersprungen";

export type Ablage = {
  // Wirft, wenn die Ablage nicht erreichbar ist.
  speichern(eintrag: UnterschriebenerAntrag): Promise<Speicherergebnis>;
  // IDs der unterschriebenen Anträge seit `datum` ohne abgelehnte und ausgetretene. Null ohne Ablage.
  idsSeit(datum: Date): Promise<string[] | null>;
};

export type Siegel = {
  versiegeln(inhalt: unknown, gueltigSekunden: number): string;
  // Null bei abgelaufenem, manipuliertem oder nicht zum Schema passendem Token.
  entsiegeln<T>(token: string, schema: z.ZodType<T>): T | null;
};

export type Umgebung = {
  ablage: Ablage;
  postausgang: { senden(mail: Mail): Promise<void> };
  siegel: Siegel;
  jetzt(): Date;
  neueId(): string;
  // Basis-URL der Website für den Unterschriftslink.
  linkBasis: string;
  // Postfach des Vorstands für unterschriebene Anträge.
  antragEmpfaenger: string;
};

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

// Was die Unterschriftsseite zurückschickt. `unterschrift` ist eine PNG-Data-URL.
export type Unterschrift = Pick<UnterschriftEingabe, "token" | "sitzungToken" | "unterschrift">;

const SITZUNG_GUELTIG_SEKUNDEN = 24 * 60 * 60;
const MAX_BILD_BYTES = 500_000;

export function mitgliedsantraege(u: Umgebung) {
  return {
    // Legt den Mitgliedsantrag an und schickt den Unterschriftslink. Gespeichert wird noch nichts:
    // Der Link trägt den Antrag versiegelt in sich. Honeypot und Rate-Limit sind Sache des Aufrufers.
    async einreichen(daten: Antragsdaten, herkunft: Herkunft): Promise<Ergebnis> {
      const id = u.neueId();
      const antrag: Antrag = {
        id,
        mandatsreferenz: `FV-${id.slice(0, 8).toUpperCase()}`,
        daten: { ...daten, iban: normalizeIban(daten.iban) },
        eingereicht: { zeit: u.jetzt().toISOString(), ip: herkunft.ip },
      };
      try {
        const link = `${u.linkBasis}/unterschreiben/${u.siegel.versiegeln(antrag, LINK_GUELTIG_TAGE * 24 * 60 * 60)}`;
        await u.postausgang.senden(bestaetigungslinkMail(antrag, link, LINK_GUELTIG_TAGE));
      } catch (e) {
        console.error("Bestätigungsmail fehlgeschlagen", e);
        return { ok: false, fehler: "Die E-Mail konnte nicht versendet werden. Bitte versuch es später erneut." };
      }
      return { ok: true };
    },

    // Öffnet den Unterschriftslink. Die Sitzung belegt im Protokoll, wann und von wo er geöffnet wurde,
    // und muss beim Unterschreiben mitgeschickt werden. Null, wenn der Link abgelaufen oder ungültig ist.
    oeffnen(token: string, herkunft: Herkunft): { antrag: Antrag; sitzungToken: string } | null {
      const antrag = u.siegel.entsiegeln(token, antragSchema);
      if (!antrag) return null;
      const sitzung: Sitzung = { antragId: antrag.id, geoeffnet: { zeit: u.jetzt().toISOString(), ip: herkunft.ip } };
      return { antrag, sitzungToken: u.siegel.versiegeln(sitzung, SITZUNG_GUELTIG_SEKUNDEN) };
    },

    // Prüft Link und Sitzung, erzeugt Beitrittserklärung und SEPA-Mandat mit Protokoll und Prüfsumme,
    // speichert und verschickt beides an Vorstand und Mitglied. Ist derselbe Link schon unterschrieben,
    // ist das ein Erfolg ohne weitere Mails. Fällt die Ablage aus, gehen die Mails trotzdem raus.
    async unterschreiben(eingabe: Unterschrift, herkunft: Herkunft): Promise<Ergebnis> {
      const antrag = u.siegel.entsiegeln(eingabe.token, antragSchema);
      const sitzung = u.siegel.entsiegeln(eingabe.sitzungToken, sitzungSchema);
      if (!antrag || !sitzung || sitzung.antragId !== antrag.id) {
        return { ok: false, fehler: "Der Link ist abgelaufen oder ungültig. Bitte stell den Antrag erneut." };
      }

      const png = Buffer.from(eingabe.unterschrift.slice(UNTERSCHRIFT_PREFIX.length), "base64");
      if (png.length === 0 || png.length > MAX_BILD_BYTES)
        return { ok: false, fehler: "Die Unterschrift konnte nicht verarbeitet werden." };

      const protokoll: Protokoll = {
        eingereicht: antrag.eingereicht,
        geoeffnet: sitzung.geoeffnet,
        unterschrieben: { zeit: u.jetzt().toISOString(), ip: herkunft.ip, userAgent: herkunft.userAgent },
      };

      const d = antrag.daten;
      const kontext = { antrag, unterschriftPng: png, protokoll };
      // Dateinamen behalten "Beitrittserklaerung", auch wenn das Glossar "Mitgliedsantrag" sagt (#38).
      const name = `${d.nachname}_${d.vorname}`.replace(/[^\w-]/g, "_");
      const beitrittPdf = {
        filename: `Beitrittserklaerung_${name}.pdf`,
        content: Buffer.from(await erzeugeBeitrittPdf(kontext)),
      };
      const mandatPdf = {
        filename: `SEPA-Lastschriftmandat_${name}.pdf`,
        content: Buffer.from(await erzeugeMandatPdf(kontext)),
      };
      const anhaenge = [beitrittPdf, mandatPdf];
      const summe = pruefsumme(antrag, png);

      try {
        const ergebnis = await u.ablage.speichern({
          antrag,
          unterschriftPng: png,
          beitrittPdf,
          mandatPdf,
          protokoll,
          pruefsumme: summe,
          mitgliedsbeitrag,
        });
        if (ergebnis === "bereits-vorhanden") return { ok: true };
      } catch (e) {
        console.error(`Speichern des Antrags ${antrag.id} in der Ablage fehlgeschlagen`, e);
      }

      try {
        await u.postausgang.senden(vorstandMail(antrag, u.antragEmpfaenger, summe, anhaenge));
        await u.postausgang.senden(willkommenMail(antrag, anhaenge));
      } catch (e) {
        console.error("Versand des Antrags fehlgeschlagen", e);
        return { ok: false, fehler: "Der Antrag konnte nicht versendet werden. Bitte versuch es später erneut." };
      }
      return { ok: true };
    },

    // Unterschriebene Mitgliedsanträge seit `datum`, ohne abgelehnte und ausgetretene und ohne die
    // Anträge in `ohne` (schon als Mitglied erfasst). Null, wenn die Ablage fehlt oder nicht erreichbar ist.
    async anzahlSeit(datum: Date, ohne: readonly string[] = []): Promise<number | null> {
      try {
        const ids = await u.ablage.idsSeit(datum);
        return ids && ids.filter((id) => !ohne.includes(id)).length;
      } catch (e) {
        console.error("Mitgliederzähler: Abfrage der Ablage fehlgeschlagen", e);
        return null;
      }
    },
  };
}
