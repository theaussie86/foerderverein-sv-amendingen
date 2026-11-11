"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { mitgliedPflegeSchema, type MitgliedPflegeDaten } from "@/lib/schemas";
import { ENDE_GRUENDE, ENDE_GRUND_LABEL } from "@/packages/mitglied/anzeige";
import { mitgliedSpeichern } from "./actions";

type Eingabe = z.input<typeof mitgliedPflegeSchema>;

const inputCls =
  "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";
const labelCls = "block text-sm font-medium text-sva-gray-300";

function Fehler({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-red-400">{text}</p> : null;
}

function Gruppe({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
      <legend className="px-2 text-sm font-bold tracking-wide text-sva-gold uppercase">{titel}</legend>
      {children}
    </fieldset>
  );
}

// Anlegen (id leer) und Bearbeiten eines Mitglieds. Mit `antragId` stammt das Mitglied aus einem
// Online-Mitgliedsantrag, die Angaben sind dann vorbelegt.
export function MitgliedFormular({ id, werte }: { id: string; werte: Eingabe }) {
  const [fehler, setFehler] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Eingabe, unknown, MitgliedPflegeDaten>({
    resolver: zodResolver(mitgliedPflegeSchema),
    defaultValues: werte,
  });

  async function onSubmit(daten: MitgliedPflegeDaten) {
    setFehler(null);
    // Bei Erfolg leitet die Action zur Detailansicht weiter.
    const ergebnis = await mitgliedSpeichern(id, daten);
    setFehler(ergebnis.fehler);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-10 space-y-6">
      <input type="hidden" {...register("antragId")} />

      <Gruppe titel="Mitgliedschaft">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="m-ref" className={labelCls}>
              Mandatsreferenz *
            </label>
            <input id="m-ref" type="text" {...register("mandatsreferenz")} className={`${inputCls} font-mono`} />
            <Fehler text={errors.mandatsreferenz?.message} />
          </div>
          <div>
            <label htmlFor="m-eintritt" className={labelCls}>
              Eintrittsdatum
            </label>
            <input id="m-eintritt" type="date" {...register("eintrittsdatum")} className={inputCls} />
            <Fehler text={errors.eintrittsdatum?.message} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="m-ende" className={labelCls}>
              Ende der Mitgliedschaft
            </label>
            <input id="m-ende" type="date" {...register("endeDatum")} className={inputCls} />
            <p className="mt-1 text-xs text-sva-gray-400">Bei Austritt der 31.12. des Jahres.</p>
            <Fehler text={errors.endeDatum?.message} />
          </div>
          <div>
            <label htmlFor="m-grund" className={labelCls}>
              Grund
            </label>
            <select id="m-grund" {...register("endeGrund")} className={inputCls}>
              <option value="">-</option>
              {ENDE_GRUENDE.map((g) => (
                <option key={g} value={g}>
                  {ENDE_GRUND_LABEL[g]}
                </option>
              ))}
            </select>
            <Fehler text={errors.endeGrund?.message} />
          </div>
        </div>
      </Gruppe>

      <Gruppe titel="Person">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="m-vorname" className={labelCls}>
              Vorname *
            </label>
            <input id="m-vorname" type="text" {...register("vorname")} className={inputCls} />
            <Fehler text={errors.vorname?.message} />
          </div>
          <div>
            <label htmlFor="m-nachname" className={labelCls}>
              Nachname *
            </label>
            <input id="m-nachname" type="text" {...register("nachname")} className={inputCls} />
            <Fehler text={errors.nachname?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="m-strasse" className={labelCls}>
            Straße & Hausnummer
          </label>
          <input id="m-strasse" type="text" {...register("strasse")} className={inputCls} />
          <Fehler text={errors.strasse?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="m-plz" className={labelCls}>
              PLZ
            </label>
            <input id="m-plz" type="text" inputMode="numeric" maxLength={5} {...register("plz")} className={inputCls} />
            <Fehler text={errors.plz?.message} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="m-ort" className={labelCls}>
              Ort
            </label>
            <input id="m-ort" type="text" {...register("ort")} className={inputCls} />
            <Fehler text={errors.ort?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="m-email" className={labelCls}>
            E-Mail
          </label>
          <input id="m-email" type="email" {...register("email")} className={inputCls} />
          <Fehler text={errors.email?.message} />
        </div>
      </Gruppe>

      <Gruppe titel="Mandat und Konto">
        <div>
          <label htmlFor="m-inhaber" className={labelCls}>
            Kontoinhaber
          </label>
          <input id="m-inhaber" type="text" {...register("kontoinhaber")} className={inputCls} />
          <p className="mt-1 text-xs text-sva-gray-400">Leer lassen, wenn das Mitglied selbst Kontoinhaber ist.</p>
          <Fehler text={errors.kontoinhaber?.message} />
        </div>
        <div>
          <label htmlFor="m-iban" className={labelCls}>
            IBAN *
          </label>
          <input id="m-iban" type="text" {...register("iban")} className={`${inputCls} font-mono`} />
          <Fehler text={errors.iban?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="m-bic" className={labelCls}>
              BIC
            </label>
            <input id="m-bic" type="text" {...register("bic")} className={`${inputCls} font-mono`} />
            <Fehler text={errors.bic?.message} />
          </div>
          <div>
            <label htmlFor="m-bank" className={labelCls}>
              Bank
            </label>
            <input id="m-bank" type="text" {...register("bank")} className={inputCls} />
            <Fehler text={errors.bank?.message} />
          </div>
        </div>
        <div className="sm:w-1/2 sm:pr-2">
          <label htmlFor="m-mandat" className={labelCls}>
            Mandat unterschrieben am
          </label>
          <input id="m-mandat" type="date" {...register("mandatDatum")} className={inputCls} />
          <Fehler text={errors.mandatDatum?.message} />
        </div>
      </Gruppe>

      <Gruppe titel="Notiz">
        <label htmlFor="m-notiz" className="sr-only">
          Notiz
        </label>
        <textarea id="m-notiz" rows={3} {...register("notiz")} className={inputCls} />
        <Fehler text={errors.notiz?.message} />
      </Gruppe>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light disabled:opacity-50"
      >
        {isSubmitting ? "Wird gespeichert …" : id ? "Änderungen speichern" : "Mitglied anlegen"}
      </button>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
