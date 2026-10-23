"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quittungSchema, type QuittungFormData } from "@/lib/schemas";
import { spendenGrenzeVereinfacht, verein } from "@/lib/verein";
import { quittungAnfordern } from "./actions";

const inputCls = "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

export function QuittungDialog({ betrag }: { betrag?: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [gesendet, setGesendet] = useState<"vereinfacht" | "zuwendungsbestaetigung" | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<QuittungFormData>({
    resolver: zodResolver(quittungSchema),
    defaultValues: { name: "", strasse: "", plz: "", ort: "", email: "", datum: "", website: "" },
  });

  function oeffnen() {
    if (betrag && betrag > 0) setValue("betrag", betrag);
    dialog.current?.showModal();
  }

  function schliessen() {
    dialog.current?.close();
    if (gesendet) {
      reset();
      setGesendet(null);
    }
  }

  async function onSubmit(data: QuittungFormData) {
    setFehler(null);
    const ergebnis = await quittungAnfordern(data);
    if (ergebnis.ok) setGesendet(ergebnis.art);
    else setFehler(ergebnis.fehler);
  }

  return (
    <>
      <button
        type="button"
        onClick={oeffnen}
        className="mt-6 rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light"
      >
        Jetzt Spendenquittung anfordern
      </button>

      <dialog
        ref={dialog}
        onClose={schliessen}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-0 text-white backdrop:bg-black/70"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Spendenquittung anfordern</h2>
            <button type="button" onClick={schliessen} aria-label="Schließen" className="text-2xl leading-none text-sva-gray-400 hover:text-white">&times;</button>
          </div>

          {gesendet ? (
            <>
              <p className="mt-4 text-sva-gray-300">
                {gesendet === "vereinfacht"
                  ? "Vielen Dank! Der Spendenbeleg ist unterwegs in dein Postfach. Heb ihn zusammen mit deinem Kontoauszug für die Steuererklärung auf."
                  : "Vielen Dank! Sobald deine Überweisung auf unserem Konto eingegangen ist, schicken wir dir die Zuwendungsbestätigung zu."}
              </p>
              <button type="button" onClick={schliessen} className="mt-6 w-full rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">
                Schließen
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <p className="text-sm text-sva-gray-300">
                Bis {spendenGrenzeVereinfacht} € schicken wir dir den Spendenbeleg sofort per E-Mail. Für höhere Beträge
                stellen wir die Zuwendungsbestätigung aus, sobald deine Überweisung auf unserem Konto eingegangen ist.
              </p>
              <p className="rounded-md border border-sva-gray-700 bg-sva-charcoal px-4 py-3 font-mono text-xs leading-relaxed text-sva-gray-200">
                {verein.bank.kontoinhaber}<br />
                IBAN {verein.bank.iban}<br />
                BIC {verein.bank.bic}, {verein.bank.name}
              </p>
              <div>
                <label htmlFor="q-name" className="block text-sm font-medium text-sva-gray-300">Vor- und Nachname *</label>
                <input id="q-name" type="text" autoComplete="name" {...register("name")} className={inputCls} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="q-strasse" className="block text-sm font-medium text-sva-gray-300">Straße & Hausnummer *</label>
                <input id="q-strasse" type="text" autoComplete="street-address" {...register("strasse")} className={inputCls} />
                {errors.strasse && <p className="mt-1 text-xs text-red-400">{errors.strasse.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="q-plz" className="block text-sm font-medium text-sva-gray-300">PLZ *</label>
                  <input id="q-plz" type="text" inputMode="numeric" maxLength={5} autoComplete="postal-code" {...register("plz")} className={inputCls} />
                  {errors.plz && <p className="mt-1 text-xs text-red-400">{errors.plz.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="q-ort" className="block text-sm font-medium text-sva-gray-300">Ort *</label>
                  <input id="q-ort" type="text" autoComplete="address-level2" {...register("ort")} className={inputCls} />
                  {errors.ort && <p className="mt-1 text-xs text-red-400">{errors.ort.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="q-email" className="block text-sm font-medium text-sva-gray-300">E-Mail *</label>
                <input id="q-email" type="email" autoComplete="email" {...register("email")} className={inputCls} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-betrag" className="block text-sm font-medium text-sva-gray-300">Überwiesener Betrag (€) *</label>
                  <input id="q-betrag" type="number" min="1" step="0.01" inputMode="decimal" {...register("betrag", { valueAsNumber: true })} className={inputCls} />
                  {errors.betrag && <p className="mt-1 text-xs text-red-400">{errors.betrag.message}</p>}
                </div>
                <div>
                  <label htmlFor="q-datum" className="block text-sm font-medium text-sva-gray-300">Überwiesen am *</label>
                  <input id="q-datum" type="date" {...register("datum")} className={inputCls} />
                  {errors.datum && <p className="mt-1 text-xs text-red-400">{errors.datum.message}</p>}
                </div>
              </div>
              {/* Honeypot gegen Bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="q-website">Website</label>
                <input id="q-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>
              <p className="text-xs text-sva-gray-400">
                Deine Angaben verwenden wir nur für die Zuwendungsbestätigung, siehe{" "}
                <a href="/datenschutz" className="text-sva-gold underline hover:text-sva-gold-light">Datenschutzerklärung</a>.
              </p>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light disabled:opacity-50">
                {isSubmitting ? "Wird gesendet …" : "Anfrage senden"}
              </button>
              {fehler && <p className="text-sm text-red-400">{fehler}</p>}
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
