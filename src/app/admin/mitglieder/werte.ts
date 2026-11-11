import type { z } from "zod";
import type { mitgliedPflegeSchema } from "@/lib/schemas";
import { formatIban } from "@/lib/schemas";
import type { Mitgliedsdaten } from "@/packages/mitglied/anzeige";

// Formularwerte für das Mitgliedsformular, aus einem Mitglied oder leer.
export function formularwerte(m: Partial<Mitgliedsdaten> = {}): z.input<typeof mitgliedPflegeSchema> {
  return {
    mandatsreferenz: m.mandatsreferenz ?? "",
    vorname: m.vorname ?? "",
    nachname: m.nachname ?? "",
    strasse: m.strasse ?? "",
    plz: m.plz ?? "",
    ort: m.ort ?? "",
    email: m.email ?? "",
    kontoinhaber: m.kontoinhaber ?? "",
    iban: m.iban ? formatIban(m.iban) : "",
    bic: m.bic ?? "",
    bank: m.bank ?? "",
    eintrittsdatum: m.eintrittsdatum ?? "",
    mandatDatum: m.mandatDatum ?? "",
    endeDatum: m.endeDatum ?? "",
    endeGrund: m.endeGrund ?? "",
    antragId: m.antragId ?? "",
    notiz: m.notiz ?? "",
  };
}
