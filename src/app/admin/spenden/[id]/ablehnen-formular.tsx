"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { beleganfrageAblehnenSchema, type BeleganfrageAblehnenDaten } from "@/lib/schemas";
import {
  ABLEHNUNGSGRUENDE,
  ABLEHNUNGSGRUND_LABEL,
  ablehnungsmailVoreingestellt,
  istAblehnungsgrund,
  type Ablehnungsgrund,
} from "@/packages/beleganfrage/anzeige";
import { beleganfrageAblehnen } from "../actions";

const feldCls =
  "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

function Fehler({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-red-400">{text}</p> : null;
}

// Ablehnung mit Ablehnungsgrund. Die Ablehnungsmail gibt es nur mit E-Mail-Adresse. Ein anderer
// Grund setzt die Vorlage und die Voreinstellung der Mail neu.
export function AblehnenFormular({
  id,
  email,
  vorlagen,
}: {
  id: string;
  email: string;
  vorlagen: Record<Ablehnungsgrund, string>;
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BeleganfrageAblehnenDaten>({
    resolver: zodResolver(beleganfrageAblehnenSchema),
    defaultValues: { begruendung: "", mailSenden: false, mailText: "" },
  });

  const [grund, mailSenden] = useWatch({ control, name: ["grund", "mailSenden"] });

  function grundGewaehlt(wert: string) {
    if (!istAblehnungsgrund(wert)) return;
    setValue("mailSenden", !!email && ablehnungsmailVoreingestellt(wert));
    setValue("mailText", vorlagen[wert]);
  }

  async function onSubmit(daten: BeleganfrageAblehnenDaten) {
    setFehler(null);
    const ergebnis = await beleganfrageAblehnen(id, daten);
    if (!ergebnis.ok) setFehler(ergebnis.fehler);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-sva-gray-300">Ablehnungsgrund</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {ABLEHNUNGSGRUENDE.map((g) => (
            <label
              key={g}
              className="flex items-center gap-3 rounded-md border border-sva-gray-700 px-4 py-2.5 text-white has-[:checked]:border-sva-gold"
            >
              <input
                type="radio"
                value={g}
                {...register("grund", {
                  onChange: (e: { target: { value: string } }) => grundGewaehlt(e.target.value),
                })}
                className="accent-sva-gold"
              />
              {ABLEHNUNGSGRUND_LABEL[g]}
            </label>
          ))}
        </div>
        <Fehler text={errors.grund?.message} />
      </fieldset>

      {grund === "sonstiges" && (
        <div>
          <label htmlFor="begruendung" className="block text-sm font-medium text-sva-gray-300">
            Begründung (nur intern)
          </label>
          <textarea id="begruendung" rows={2} {...register("begruendung")} className={feldCls} />
          <Fehler text={errors.begruendung?.message} />
        </div>
      )}

      {grund && email && (
        <label className="flex items-start gap-3 text-sva-gray-300">
          <input type="checkbox" {...register("mailSenden")} className="mt-1 accent-sva-gold" />
          <span>Ablehnungsmail an {email} schicken</span>
        </label>
      )}
      {grund && email && mailSenden && (
        <div>
          <label htmlFor="mailText" className="block text-sm font-medium text-sva-gray-300">
            Text der Ablehnungsmail
          </label>
          <textarea id="mailText" rows={10} {...register("mailText")} className={feldCls} />
          <Fehler text={errors.mailText?.message} />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border border-red-500/60 px-6 py-3 text-sm font-bold text-red-300 uppercase transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        {isSubmitting ? "Wird gespeichert …" : mailSenden && email ? "Ablehnen und Mail senden" : "Ablehnen"}
      </button>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
