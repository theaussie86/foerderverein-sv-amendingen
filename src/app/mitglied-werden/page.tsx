"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mitgliedSchema, type MitgliedFormData } from "@/lib/schemas";
import { mandatstext, mitgliedsbeitrag, verein } from "@/lib/verein";
import { antragEinreichen } from "./actions";

type Step = 1 | 2;

const inputCls = "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

export default function MitgliedWerdenPage() {
  const [step, setStep] = useState<Step>(1);
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const { register, handleSubmit, trigger, getValues, setValue, formState: { errors, isSubmitting } } = useForm<MitgliedFormData>({
    resolver: zodResolver(mitgliedSchema),
    defaultValues: { vorname: "", nachname: "", strasse: "", plz: "", ort: "", email: "", geburtsdatum: "", kontoinhaber: "", iban: "", website: "", mandat: undefined as unknown as true, datenschutz: undefined as unknown as true },
  });

  async function goToStep2() {
    if (!(await trigger(["vorname", "nachname", "strasse", "plz", "ort", "email"]))) return;
    if (!getValues("kontoinhaber")) setValue("kontoinhaber", `${getValues("vorname")} ${getValues("nachname")}`);
    setStep(2);
  }

  async function onSubmit(data: MitgliedFormData) {
    setFehler(null);
    const ergebnis = await antragEinreichen(data);
    if (ergebnis.ok) setGesendet(true);
    else setFehler(ergebnis.fehler);
  }

  if (gesendet) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Fast geschafft!</h1>
        <div className="mt-2 h-1 w-16 bg-sva-gold" />
        <div className="mt-10 rounded-lg border-2 border-sva-green bg-sva-green/10 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">Bitte schau in dein E-Mail-Postfach</h2>
          <p className="mt-2 text-sva-gray-300">
            Wir haben dir einen Link an <strong className="text-white">{getValues("email")}</strong> geschickt. Darüber
            unterschreibst du deine Beitrittserklärung mit Finger oder Maus. Erst danach ist der Antrag gültig.
          </p>
          <p className="mt-4 text-sm text-sva-gray-400">Keine E-Mail erhalten? Schau bitte auch im Spam-Ordner nach.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Mitglied werden</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-lg text-sva-gray-300">
        Werde Teil des Fördervereins SV Amendingen und unterstütze den Verein mit deinem Jahresbeitrag.
      </p>

      <div className="mt-8 flex items-center justify-between rounded-lg border-2 border-sva-green bg-sva-green/10 p-4 sm:p-6">
        <span className="font-semibold text-white">Mitgliedschaft</span>
        <span className="text-lg font-bold text-sva-gold">{mitgliedsbeitrag} € / Jahr</span>
      </div>

      {/* Progress */}
      <div className="mt-10 flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step >= s ? "bg-sva-green text-white" : "bg-sva-gray-700 text-sva-gray-400"}`}>{s}</div>
            {s < 2 && <div className={`h-0.5 w-12 sm:w-20 ${step > s ? "bg-sva-green" : "bg-sva-gray-700"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-white">Persönliche Daten</h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="vorname" className="block text-sm font-medium text-sva-gray-300">Vorname *</label>
                  <input id="vorname" type="text" {...register("vorname")} className={inputCls} />
                  {errors.vorname && <p className="mt-1 text-xs text-red-400">{errors.vorname.message}</p>}
                </div>
                <div>
                  <label htmlFor="nachname" className="block text-sm font-medium text-sva-gray-300">Nachname *</label>
                  <input id="nachname" type="text" {...register("nachname")} className={inputCls} />
                  {errors.nachname && <p className="mt-1 text-xs text-red-400">{errors.nachname.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="strasse" className="block text-sm font-medium text-sva-gray-300">Straße & Hausnummer *</label>
                <input id="strasse" type="text" {...register("strasse")} className={inputCls} />
                {errors.strasse && <p className="mt-1 text-xs text-red-400">{errors.strasse.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="plz" className="block text-sm font-medium text-sva-gray-300">PLZ *</label>
                  <input id="plz" type="text" inputMode="numeric" maxLength={5} {...register("plz")} className={inputCls} />
                  {errors.plz && <p className="mt-1 text-xs text-red-400">{errors.plz.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ort" className="block text-sm font-medium text-sva-gray-300">Ort *</label>
                  <input id="ort" type="text" {...register("ort")} className={inputCls} />
                  {errors.ort && <p className="mt-1 text-xs text-red-400">{errors.ort.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sva-gray-300">E-Mail *</label>
                  <input id="email" type="email" {...register("email")} className={inputCls} />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="geburtsdatum" className="block text-sm font-medium text-sva-gray-300">Geburtsdatum</label>
                  <input id="geburtsdatum" type="date" {...register("geburtsdatum")} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={goToStep2} className="flex-1 rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">Weiter zum Lastschriftmandat</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-white">SEPA-Lastschriftmandat</h2>
            <p className="mt-2 text-sm text-sva-gray-300">Der Jahresbeitrag wird bequem per Lastschrift jeweils zum {verein.einzugstermin} eingezogen.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="kontoinhaber" className="block text-sm font-medium text-sva-gray-300">Kontoinhaber/in *</label>
                <input id="kontoinhaber" type="text" {...register("kontoinhaber")} className={inputCls} />
                {errors.kontoinhaber && <p className="mt-1 text-xs text-red-400">{errors.kontoinhaber.message}</p>}
              </div>
              <div>
                <label htmlFor="iban" className="block text-sm font-medium text-sva-gray-300">IBAN *</label>
                <input id="iban" type="text" autoComplete="off" placeholder="DE00 0000 0000 0000 0000 00" {...register("iban")} className={`${inputCls} font-mono text-sm placeholder:text-sva-gray-600`} />
                {errors.iban && <p className="mt-1 text-xs text-red-400">{errors.iban.message}</p>}
              </div>
              <div className="rounded-md border border-sva-gray-600 bg-sva-charcoal p-4 text-xs leading-relaxed text-sva-gray-300">
                <p>Zahlungsempfänger: {verein.name}, Gläubiger-ID {verein.glaeubigerId}. Die Mandatsreferenz bekommst du mit der Bestätigung.</p>
                <p className="mt-2">{mandatstext()}</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" {...register("mandat")} className="mt-0.5 h-4 w-4 rounded border-sva-gray-600 bg-sva-charcoal text-sva-green focus:ring-sva-green" />
                <span className="text-sm text-sva-gray-300">Ich erteile das SEPA-Lastschriftmandat für den Jahresbeitrag. *</span>
              </label>
              {errors.mandat && <p className="ml-7 text-xs text-red-400">{errors.mandat.message}</p>}
            </div>
            {/* Honeypot gegen Bots */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>
            <div className="mt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" {...register("datenschutz")} className="mt-0.5 h-4 w-4 rounded border-sva-gray-600 bg-sva-charcoal text-sva-green focus:ring-sva-green" />
                <span className="text-sm text-sva-gray-300">
                  Ich stimme der Verarbeitung meiner Daten gemäß der <a href="/datenschutz" className="text-sva-gold underline hover:text-sva-gold-light">Datenschutzerklärung</a> zu und akzeptiere die Vereinssatzung. *
                </span>
              </label>
              {errors.datenschutz && <p className="mt-1 ml-7 text-xs text-red-400">{errors.datenschutz.message}</p>}
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal">Zurück</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light disabled:opacity-50">{isSubmitting ? "Wird gesendet …" : "Weiter zur Unterschrift"}</button>
            </div>
            {fehler && <p className="mt-4 text-sm text-red-400">{fehler}</p>}
            <p className="mt-4 text-xs text-sva-gray-400">Im nächsten Schritt bekommst du eine E-Mail mit einem Link, über den du deinen Antrag unterschreibst.</p>
          </>
        )}
      </form>
    </div>
  );
}
