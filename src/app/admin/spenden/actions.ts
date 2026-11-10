"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mail";
import { erzeugeSpendenbelegPdf } from "@/lib/pdf";
import { beleganfrageAbschliessen, beleganfrageSpeichern, type PdfAnhang } from "@/lib/pocketbase";
import { anfrageLaden, spendenbelegMail, type Beleganfrage } from "@/lib/beleganfragen";
import { beleganfrageErfassenSchema } from "@/lib/schemas";
import { belegArt } from "@/lib/verein";
import { vorstandErforderlich } from "@/lib/vorstand-session";

// Alle Aktionen laden die Anfrage mit dem Vorstands-Token, damit nur sichtbare und
// noch offene Anfragen abgeschlossen werden. Doppelklicks laufen so ins Leere.
async function offeneAnfrage(id: string) {
  const { pb, vorstand } = await vorstandErforderlich();
  const beleg = await anfrageLaden(pb, id);
  return { vorstand, beleg: beleg?.status === "offen" ? beleg : null };
}

function aktualisieren(id: string) {
  revalidatePath("/admin/spenden");
  revalidatePath(`/admin/spenden/${id}`);
}

// Über 300 €: Der Vorsitz hat die Zuwendungsbestätigung außerhalb der Website ausgestellt.
async function ausstellen(beleg: Beleganfrage, vorstandId: string): Promise<void> {
  await beleganfrageAbschliessen(beleg.id, vorstandId, "ausgestellt");
}

// Bis 300 €: Der Vorstand hat den Geldeingang geprüft, erst jetzt gibt es den Spendenbeleg.
// Die Record-ID steht als Beleg-Nr. im PDF und im Dateinamen. Ohne E-Mail-Adresse geht keine
// Mail raus, der Beleg liegt dann nur zum Herunterladen in der Detailansicht.
async function freigeben(beleg: Beleganfrage, vorstandId: string): Promise<void> {
  const tag = beleg.tag_der_spende.slice(0, 10);
  const pdf: PdfAnhang = {
    filename: `Spendenbeleg_${tag}_${beleg.id}.pdf`,
    content: Buffer.from(
      await erzeugeSpendenbelegPdf({
        belegNr: beleg.id,
        name: beleg.name,
        strasse: beleg.strasse,
        plz: beleg.plz,
        ort: beleg.ort,
        betrag: beleg.betrag,
        datum: tag,
      }),
    ),
  };

  if (beleg.email) {
    try {
      await sendMail({ to: beleg.email, ...spendenbelegMail(beleg), attachments: [pdf] });
    } catch (e) {
      console.error("Spendenbeleg konnte nicht versendet werden", e);
      redirect(`/admin/spenden/${beleg.id}?fehler=mail`);
    }
  }

  await beleganfrageAbschliessen(beleg.id, vorstandId, "versendet", pdf);
}

export async function alsAusgestelltMarkieren(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg || beleg.art !== "zuwendungsbestaetigung") return;
  await ausstellen(beleg, vorstand.id);
  aktualisieren(id);
}

export async function belegFreigeben(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg || beleg.art !== "vereinfacht") return;
  await freigeben(beleg, vorstand.id);
  aktualisieren(id);
}

// Keine passende Spende auf dem Konto: Beleganfrage ablehnen, es geht nichts raus.
export async function anfrageAblehnen(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg) return;
  await beleganfrageAbschliessen(id, vorstand.id, "abgelehnt");
  aktualisieren(id);
}

export type ErfassenErgebnis = { ok: false; fehler: string };

// Der Vorstand erfasst eine Beleganfrage für einen Spender, der sich nicht über die Website
// gemeldet hat. Anders als auf der Website geht keine Mail an den Vorstand. Mit direktFreigeben
// hat der Vorstand den Geldeingang schon gesehen und die Anfrage wird sofort abgeschlossen.
// Bei Erfolg geht es weiter zur Detailansicht.
export async function beleganfrageErfassen(eingabe: unknown): Promise<ErfassenErgebnis> {
  const { pb, vorstand } = await vorstandErforderlich();
  const parsed = beleganfrageErfassenSchema.safeParse(eingabe);
  if (!parsed.success) return { ok: false, fehler: "Bitte prüf die Angaben." };

  const { direktFreigeben, tag_der_spende, ...d } = parsed.data;
  const art = belegArt(d.betrag);

  let id: string | null;
  try {
    id = await beleganfrageSpeichern({ ...d, art, tagDerSpende: tag_der_spende, erfasstVon: vorstand.id });
  } catch (e) {
    console.error("Beleganfrage konnte nicht erfasst werden", e);
    id = null;
  }
  if (!id) return { ok: false, fehler: "Die Beleganfrage konnte nicht gespeichert werden." };

  if (direktFreigeben) {
    const beleg = await anfrageLaden(pb, id);
    if (beleg) {
      if (art === "vereinfacht") await freigeben(beleg, vorstand.id);
      else await ausstellen(beleg, vorstand.id);
    }
  }

  aktualisieren(id);
  redirect(`/admin/spenden/${id}`);
}
