"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mitgliedSchema, type MitgliedFormData } from "@/lib/schemas";

type Step = 1 | 2 | 3;

const membershipTypes = [
  { id: "einzel" as const, label: "Einzelmitglied", price: "24 € / Jahr" },
  { id: "familie" as const, label: "Familienmitglied", price: "36 € / Jahr" },
  { id: "firma" as const, label: "Firmenmitglied", price: "100 € / Jahr" },
];

const inputCls = "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

export default function MitgliedWerdenPage() {
  const [step, setStep] = useState<Step>(1);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<MitgliedFormData>({
    resolver: zodResolver(mitgliedSchema),
    defaultValues: { memberType: "einzel", vorname: "", nachname: "", strasse: "", plz: "", ort: "", email: "", geburtsdatum: "", iban: "", datenschutz: undefined as unknown as true },
  });

  const memberType = watch("memberType");

  async function goToStep2() { if (await trigger("memberType")) setStep(2); }
  async function goToStep3() { if (await trigger(["vorname", "nachname", "strasse", "plz", "ort", "email"])) setStep(3); }

  function onSubmit(data: MitgliedFormData) {
    console.log("Beitrittserklärung:", data);
    alert("Vielen Dank! Die Formularübermittlung wird in Kürze aktiviert.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Mitglied werden</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-lg text-sva-gray-300">
        Werden Sie Teil des Fördervereins SV Amendingen und unterstützen Sie den Verein mit Ihrem Jahresbeitrag.
      </p>

      {/* Progress */}
      <div className="mt-10 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step >= s ? "bg-sva-green text-white" : "bg-sva-gray-700 text-sva-gray-400"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 sm:w-20 ${step > s ? "bg-sva-green" : "bg-sva-gray-700"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-white">Mitgliedschaftsart wählen</h2>
            <div className="mt-6 space-y-3">
              {membershipTypes.map((type) => (
                <label key={type.id} className={`flex cursor-pointer items-center justify-between rounded-md border-2 p-4 transition-colors ${memberType === type.id ? "border-sva-green bg-sva-green/10" : "border-sva-gray-600 hover:border-sva-gray-400"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value={type.id} {...register("memberType")} className="h-4 w-4 text-sva-green focus:ring-sva-green" />
                    <span className="font-medium text-white">{type.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-sva-gold">{type.price}</span>
                </label>
              ))}
            </div>
            <button type="button" onClick={goToStep2} className="mt-8 w-full rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">
              Weiter zu persönlichen Daten
            </button>
          </>
        )}

        {step === 2 && (
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
              <button type="button" onClick={() => setStep(1)} className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal">Zurück</button>
              <button type="button" onClick={goToStep3} className="flex-1 rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">Weiter zur Zahlung</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-white">Zahlungsart</h2>
            <p className="mt-2 text-sm text-sva-gray-300">Wählen Sie Ihre bevorzugte Zahlungsmethode.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-md border-2 border-sva-green bg-sva-green/10 p-5">
                <h3 className="font-semibold text-white">SEPA-Lastschrift</h3>
                <p className="mt-1 text-sm text-sva-gray-300">Bequem per Lastschrift &mdash; wir ziehen den Jahresbeitrag automatisch ein.</p>
                <div className="mt-4">
                  <label htmlFor="iban" className="block text-sm font-medium text-sva-gray-300">IBAN *</label>
                  <input id="iban" type="text" placeholder="DE00 0000 0000 0000 0000 00" {...register("iban")} className={`${inputCls} font-mono text-sm placeholder:text-sva-gray-600`} />
                  {errors.iban && <p className="mt-1 text-xs text-red-400">{errors.iban.message}</p>}
                </div>
                <p className="mt-3 text-xs text-sva-gray-400">Mit Absenden erteilen Sie ein SEPA-Lastschriftmandat zum Einzug des Jahresbeitrags.</p>
              </div>
              <div className="rounded-md border border-sva-gray-600 p-5 opacity-60">
                <h3 className="font-semibold text-white">PayPal</h3>
                <p className="mt-1 text-sm text-sva-gray-400">PayPal-Integration wird in Kürze freigeschaltet.</p>
              </div>
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
              <button type="button" onClick={() => setStep(2)} className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal">Zurück</button>
              <button type="submit" className="flex-1 rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light">Beitrittserklärung absenden</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
