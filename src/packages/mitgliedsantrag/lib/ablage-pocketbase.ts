import PocketBase, { ClientResponseError } from "pocketbase";
import { z } from "zod";
import type { Anhang } from "./mails";
import type { Ablage, Speicherergebnis, UnterschriebenerAntrag } from "../index";

// Ablage in der PocketBase-Collection "mitgliedsantraege". Schreibt als Superuser, weil der Vorstand
// die Collection nur lesen darf. Die Feldnamen der Collection bleiben, wie sie sind (#38).

// Antwort von PocketBase bei Validierungsfehlern: { data: { feld: { code, message } } }.
const feldfehler = z.object({ data: z.record(z.string(), z.object({ code: z.string() }).partial()) });

function pdfDatei({ filename, content }: Anhang): File {
  return new File([new Uint8Array(content)], filename, { type: "application/pdf" });
}

// `superuser` liefert null, wenn PocketBase nicht konfiguriert ist.
export function pocketbaseAblage(superuser: () => Promise<PocketBase | null>): Ablage {
  return {
    async speichern(e: UnterschriebenerAntrag): Promise<Speicherergebnis> {
      const pb = await superuser();
      if (!pb) return "uebersprungen";

      const { antrag, protokoll } = e;
      const d = antrag.daten;
      try {
        await pb.collection("mitgliedsantraege").create({
          antrag_id: antrag.id,
          mandatsreferenz: antrag.mandatsreferenz,
          status: "eingegangen",
          vorname: d.vorname,
          nachname: d.nachname,
          strasse: d.strasse,
          plz: d.plz,
          ort: d.ort,
          email: d.email,
          geburtsdatum: d.geburtsdatum ? `${d.geburtsdatum} 00:00:00.000Z` : "",
          kontoinhaber: d.kontoinhaber,
          iban: d.iban,
          jahresbeitrag: e.mitgliedsbeitrag,
          eingereicht_am: protokoll.eingereicht.zeit,
          unterschrieben_am: protokoll.unterschrieben.zeit,
          protokoll,
          pruefsumme: e.pruefsumme,
          unterschrift: new File([new Uint8Array(e.unterschriftPng)], "unterschrift.png", { type: "image/png" }),
          beitritt_pdf: pdfDatei(e.beitrittPdf),
          mandat_pdf: pdfDatei(e.mandatPdf),
        });
        return "gespeichert";
      } catch (err) {
        // Derselbe Link wurde schon einmal unterschrieben. PocketBase meldet nicht immer jedes Unique-Feld.
        const felder = err instanceof ClientResponseError ? feldfehler.safeParse(err.response).data?.data : undefined;
        if (["antrag_id", "mandatsreferenz"].some((f) => felder?.[f]?.code === "validation_not_unique")) {
          return "bereits-vorhanden";
        }
        throw err;
      }
    },

    async zaehlenSeit(datum: Date): Promise<number | null> {
      const pb = await superuser();
      if (!pb) return null;
      const liste = await pb.collection("mitgliedsantraege").getList(1, 1, {
        filter: pb.filter('unterschrieben_am >= {:datum} && status != "abgelehnt" && status != "ausgetreten"', {
          datum: datum.toISOString().replace("T", " "),
        }),
        fields: "id",
      });
      return liste.totalItems;
    },
  };
}
