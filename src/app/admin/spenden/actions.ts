"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mail";
import { erzeugeSpendenbelegPdf } from "@/lib/pdf";
import { beleganfrageAbschliessen, type PdfAnhang } from "@/lib/pocketbase";
import { anfrageLaden, euro } from "@/lib/beleganfragen";
import { verein } from "@/lib/verein";
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
export async function alsAusgestelltMarkieren(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg || beleg.art !== "zuwendungsbestaetigung") return;
  await beleganfrageAbschliessen(id, vorstand.id, "ausgestellt");
  aktualisieren(id);
}

// Bis 300 €: Der Vorstand hat den Geldeingang geprüft, erst jetzt geht der Spendenbeleg an den Spender.
// Die Record-ID steht als Beleg-Nr. im PDF und im Dateinamen.
export async function belegFreigeben(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg || beleg.art !== "vereinfacht") return;

  const datum = beleg.ueberwiesen_am.slice(0, 10);
  const pdf: PdfAnhang = {
    filename: `Spendenbeleg_${datum}_${beleg.id}.pdf`,
    content: Buffer.from(
      await erzeugeSpendenbelegPdf({
        belegNr: beleg.id,
        name: beleg.name,
        strasse: beleg.strasse,
        plz: beleg.plz,
        ort: beleg.ort,
        betrag: beleg.betrag,
        datum,
      }),
    ),
  };

  try {
    await sendMail({
      to: beleg.email,
      subject: `Dein Spendenbeleg über ${euro(beleg.betrag)}`,
      text:
        `Hallo ${beleg.name},\n\n` +
        `vielen Dank für deine Spende an den ${verein.name}! Deine Überweisung ist bei uns eingegangen.\n\n` +
        `Im Anhang findest du den Spendenbeleg. Bis 300 € genügt dem Finanzamt dieser Beleg zusammen mit deinem ` +
        `Kontoauszug, auf dem die Überweisung an uns zu sehen ist. Heb bitte beides für deine Steuererklärung auf.\n\n` +
        `Viele Grüße\n${verein.name}`,
      attachments: [pdf],
    });
  } catch (e) {
    console.error("Spendenbeleg konnte nicht versendet werden", e);
    redirect(`/admin/spenden/${id}?fehler=mail`);
  }

  await beleganfrageAbschliessen(id, vorstand.id, "versendet", pdf);
  aktualisieren(id);
}

// Keine passende Überweisung auf dem Konto: Beleganfrage ablehnen, es geht nichts raus.
export async function anfrageAblehnen(id: string): Promise<void> {
  const { vorstand, beleg } = await offeneAnfrage(id);
  if (!beleg) return;
  await beleganfrageAbschliessen(id, vorstand.id, "abgelehnt");
  aktualisieren(id);
}
