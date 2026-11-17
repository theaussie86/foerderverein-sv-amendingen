// Entry Point: Aufnahme und Ablehnung eines Mitgliedsantrags durch den Vorstand.
// Ablage und Postausgang werden hineingereicht, die echten baut server.ts.
import { ablehnbar, uebernehmbar, type Status } from "./anzeige";
import { ablehnungsMail, type Mail } from "./lib/mails";

export type Antragsstand = {
  status: Status;
  vorname: string;
  email: string;
  // Aus dem Mitgliedsantrag ist schon ein Mitglied entstanden.
  mitgliedVerknuepft: boolean;
};

export type Entscheidungsablage = {
  // Null, wenn es den Mitgliedsantrag nicht gibt.
  stand(id: string): Promise<Antragsstand | null>;
  annehmen(id: string): Promise<void>;
  ablehnen(id: string, grund: string): Promise<void>;
};

export type Entscheidungsumgebung = {
  ablage: Entscheidungsablage;
  postausgang: { senden(mail: Mail): Promise<void> };
};

export type Ablehnung = { grund: string; mailSenden: boolean };

export type Ablehnungsergebnis =
  { ok: true } | { ok: false; grund: "nicht-gefunden" | "nicht-ablehnbar" | "grund-fehlt" | "mail" };

export function entscheidungen(u: Entscheidungsumgebung) {
  async function annehmbar(id: string): Promise<boolean> {
    const stand = await u.ablage.stand(id);
    return !!stand && uebernehmbar(stand.status);
  }

  return {
    // Ein abgelehnter Mitgliedsantrag lässt sich nicht mehr übernehmen.
    annehmbar,

    // Aufnahme: Der Mitgliedsantrag wird „angenommen“, sobald aus ihm ein Mitglied entstanden ist.
    // Wirft bei einem abgelehnten oder unbekannten Mitgliedsantrag.
    async annehmen(id: string): Promise<void> {
      if (!(await annehmbar(id))) throw new Error(`Mitgliedsantrag ${id} kann nicht angenommen werden.`);
      await u.ablage.annehmen(id);
    },

    // Ablehnung ist endgültig. Der Grund bleibt intern und steht nicht in der Mail.
    // Scheitert die Mail, bleibt der Mitgliedsantrag unverändert.
    async ablehnen(id: string, { grund, mailSenden }: Ablehnung): Promise<Ablehnungsergebnis> {
      const begruendung = grund.trim();
      if (!begruendung) return { ok: false, grund: "grund-fehlt" };
      const stand = await u.ablage.stand(id);
      if (!stand) return { ok: false, grund: "nicht-gefunden" };
      if (!ablehnbar(stand.status, stand.mitgliedVerknuepft)) return { ok: false, grund: "nicht-ablehnbar" };

      if (mailSenden) {
        try {
          await u.postausgang.senden(ablehnungsMail(stand.vorname, stand.email));
        } catch (e) {
          console.error(`Ablehnungsmail zum Mitgliedsantrag ${id} fehlgeschlagen`, e);
          return { ok: false, grund: "mail" };
        }
      }
      await u.ablage.ablehnen(id, begruendung);
      return { ok: true };
    },
  };
}
