"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { beleganfrageAusstellenSchema, type BeleganfrageAusstellenDaten } from "@/lib/schemas";
import { belegArt, euro, spendenGrenzeVereinfacht, type BelegArt } from "@/packages/beleganfrage/anzeige";
import { beleganfrageAusstellen } from "../actions";

const knopf = "rounded-md px-6 py-3 text-sm font-bold uppercase transition-colors disabled:opacity-50";

// Ausstellung mit dem eingegangenen Betrag. Die Art richtet sich nach ihm (Betragskorrektur).
export function AusstellenFormular({
  id,
  art,
  betrag,
  betragAngegeben,
  email,
}: {
  id: string;
  art: BelegArt;
  betrag: number;
  betragAngegeben: number;
  email: string;
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BeleganfrageAusstellenDaten>({
    resolver: zodResolver(beleganfrageAusstellenSchema),
    defaultValues: { eingegangen: betrag },
  });

  const eingegangen = useWatch({ control, name: "eingegangen" });
  const gueltig = Number.isFinite(eingegangen) && eingegangen > 0;
  const neueArt = gueltig ? belegArt(eingegangen) : art;
  const wirdZuwendungsbestaetigung = art === "vereinfacht" && neueArt === "zuwendungsbestaetigung";

  async function onSubmit(daten: BeleganfrageAusstellenDaten) {
    setFehler(null);
    const ergebnis = await beleganfrageAusstellen(id, daten);
    if (!ergebnis.ok) setFehler(ergebnis.fehler);
  }

  let beschriftung = "Als ausgestellt markieren";
  if (neueArt === "vereinfacht") beschriftung = email ? "Beleg ausstellen und senden" : "Beleg ausstellen";
  if (wirdZuwendungsbestaetigung) beschriftung = "Betrag korrigieren";

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-3">
      <div className="max-w-xs">
        <label htmlFor="eingegangen" className="block text-sm font-medium text-sva-gray-300">
          Eingegangener Betrag (€)
        </label>
        <input
          id="eingegangen"
          type="number"
          min="1"
          step="0.01"
          inputMode="decimal"
          {...register("eingegangen", { valueAsNumber: true })}
          className="mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:ring-1 focus:ring-sva-gold focus:outline-none"
        />
        {errors.eingegangen?.message && <p className="mt-1 text-xs text-red-400">{errors.eingegangen.message}</p>}
      </div>
      {gueltig && eingegangen !== betragAngegeben && (
        <p className="text-sm text-sva-gray-300">
          Betragskorrektur: angegeben waren {euro(betragAngegeben)}, der Beleg lautet über {euro(eingegangen)}.
          {neueArt === "vereinfacht" && email && " Die Mail an den Spender nennt beide Beträge."}
        </p>
      )}
      {wirdZuwendungsbestaetigung && (
        <p className="text-sm text-sva-gray-300">
          Über {spendenGrenzeVereinfacht} € wird daraus eine Zuwendungsbestätigung. Die Anfrage bleibt, wie sie ist, bis
          die Zuwendungsbestätigung ausgestellt und hier als ausgestellt markiert ist.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${knopf} bg-sva-gold text-sva-charcoal-dark hover:bg-sva-gold-light`}
      >
        {isSubmitting ? "Wird gespeichert …" : beschriftung}
      </button>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
