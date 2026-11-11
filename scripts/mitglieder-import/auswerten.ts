// Auswertung von Manus Stammdaten.xlsx für den einmaligen Import der Bestandsmitglieder (#49).
// Eingabe ist die JSON-Ausgabe von stammdaten-lesen.py, Ausgabe die Mitglieder für die Collection
// "mitglieder" und Hinweise auf Lücken, die der Vorstand von Hand klären muss.
import { z } from "zod";
import { isValidIban, normalizeIban } from "@/lib/schemas";
import { normalisieren, type Mitgliedsdaten } from "@/packages/mitglied/index";

const zeile = <T extends z.ZodRawShape>(felder: T) => z.object(felder);
const s = z.string();

export const stammdatenSchema = z.object({
  mitglieder: z.array(
    zeile({
      nr: s,
      mref: s,
      nachname: s,
      vorname: s,
      strasse: s,
      hausnummer: s,
      plz: s,
      ort: s,
      iban: s,
      bic: s,
      bank: s,
      email: s,
    }),
  ),
  emails: z.array(zeile({ nachname: s, vorname: s, email: s })),
  // Verlauf aus dem Blatt "Mandatsreferenznr.": Datum, "Nachname, Vorname", Mandatsreferenz, Art.
  ereignisse: z.array(zeile({ datum: s, name: s, mref: s, art: s })),
});

export type Stammdaten = z.infer<typeof stammdatenSchema>;

// Online-Mitgliedsantrag, gegen den abgeglichen wird.
export type Antrag = { id: string; nachname: string; iban: string; mandatsreferenz: string };

export type Auswertung = { mitglieder: Mitgliedsdaten[]; hinweise: string[] };

const schluessel = (nachname: string, vorname: string) =>
  `${nachname.trim().toLowerCase()}|${vorname.trim().toLowerCase().replace(/\s+/g, " ")}`;

// "Muster, Max" aus dem Verlauf.
function nameAusVerlauf(name: string): string {
  const [nachname = "", vorname = ""] = name.split(",");
  return schluessel(nachname, vorname);
}

export function auswerten(daten: Stammdaten, antraege: Antrag[]): Auswertung {
  const hinweise: string[] = [];

  const emails = new Map<string, string>();
  for (const e of daten.emails) if (e.email) emails.set(schluessel(e.nachname, e.vorname), e.email);

  // Letztes Ereignis je Mandatsreferenz. Die Referenzen werden wiederverwendet: Nach einer
  // Kündigung bekommt ein neues Mitglied dieselbe Nummer. Deshalb muss der Name passen.
  const letztes = new Map<string, Stammdaten["ereignisse"][number]>();
  for (const e of daten.ereignisse) letztes.set(e.mref, e);

  const antragZu = new Map(antraege.map((a) => [`${normalizeIban(a.iban)}|${a.nachname.trim().toLowerCase()}`, a]));

  const mitglieder = daten.mitglieder.map((m) => {
    const nr = `Nr. ${m.nr}`;
    const name = schluessel(m.nachname, m.vorname);
    const iban = normalizeIban(m.iban);

    const ereignis = letztes.get(m.mref);
    const passt = ereignis && nameAusVerlauf(ereignis.name) === name;
    const eintrittsdatum = passt && ereignis.art === "Beitritt" ? ereignis.datum : "";
    if (passt && ereignis.art !== "Beitritt")
      hinweise.push(`${nr}: letzter Eintrag im Verlauf ist „${ereignis.art}“, steht aber in der Mitgliederliste.`);

    if (!isValidIban(iban)) hinweise.push(`${nr}: IBAN ungültig (Prüfsumme oder Länge).`);
    if (!m.strasse || !m.hausnummer || !m.plz) hinweise.push(`${nr}: Anschrift unvollständig.`);
    if (m.hausnummer.includes("/"))
      hinweise.push(`${nr}: Hausnummer „${m.hausnummer}“ prüfen (stand als Bruch in Excel).`);
    if (m.plz && !/^\d{4,5}$/.test(m.plz)) hinweise.push(`${nr}: PLZ ungültig.`);

    const antrag = antragZu.get(`${iban}|${m.nachname.trim().toLowerCase()}`);
    if (antrag && antrag.mandatsreferenz !== m.mref)
      hinweise.push(
        `${nr}: Online-Antrag mit Mandatsreferenz ${antrag.mandatsreferenz}, in Excel ${m.mref}. Übernommen: ${m.mref}.`,
      );

    return normalisieren({
      mandatsreferenz: m.mref,
      vorname: m.vorname,
      nachname: m.nachname,
      strasse: `${m.strasse} ${m.hausnummer}`,
      // Excel speichert PLZ als Zahl und verliert führende Nullen.
      plz: /^\d{4,5}$/.test(m.plz) ? m.plz.padStart(5, "0") : "",
      ort: m.ort,
      email: m.email || emails.get(name) || "",
      kontoinhaber: "",
      iban,
      bic: m.bic,
      bank: m.bank,
      eintrittsdatum,
      mandatDatum: "",
      endeDatum: "",
      endeGrund: "",
      antragId: antrag?.id ?? "",
      notiz: "",
    });
  });

  const refs = new Set<string>();
  for (const m of mitglieder) {
    if (refs.has(m.mandatsreferenz)) hinweise.push(`Mandatsreferenz ${m.mandatsreferenz} ist doppelt vergeben.`);
    refs.add(m.mandatsreferenz);
  }

  return { mitglieder, hinweise };
}
