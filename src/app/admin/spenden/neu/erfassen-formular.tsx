"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { beleganfrageErfassenSchema, type BeleganfrageErfassenDaten } from "@/lib/schemas";
import { belegArt, spendenGrenzeVereinfacht } from "@/packages/beleganfrage/anzeige";
import { beleganfrageErfassen } from "../actions";

const inputCls =
  "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";
const labelCls = "block text-sm font-medium text-sva-gray-300";

function Fehler({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-red-400">{text}</p> : null;
}

export function ErfassenFormular() {
  const [fehler, setFehler] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BeleganfrageErfassenDaten>({
    resolver: zodResolver(beleganfrageErfassenSchema),
    defaultValues: {
      name: "",
      strasse: "",
      plz: "",
      ort: "",
      email: "",
      tag_der_spende: "",
      notiz: "",
      direktFreigeben: false,
    },
  });

  const [betrag, email, direktFreigeben] = useWatch({ control, name: ["betrag", "email", "direktFreigeben"] });
  const art = Number.isFinite(betrag) && betrag > 0 ? belegArt(betrag) : null;

  async function onSubmit(daten: BeleganfrageErfassenDaten) {
    setFehler(null);
    // Bei Erfolg leitet die Action zur Detailansicht weiter.
    const ergebnis = await beleganfrageErfassen(daten);
    setFehler(ergebnis.fehler);
  }

  let knopf = "Beleganfrage erfassen";
  if (direktFreigeben && art === "vereinfacht")
    knopf = email ? "Erfassen und Beleg senden" : "Erfassen und Beleg erzeugen";
  if (direktFreigeben && art === "zuwendungsbestaetigung") knopf = "Erfassen und als ausgestellt markieren";

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="mt-10 space-y-4 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6"
    >
      <div>
        <label htmlFor="e-name" className={labelCls}>
          Vor- und Nachname *
        </label>
        <input id="e-name" type="text" {...register("name")} className={inputCls} />
        <Fehler text={errors.name?.message} />
      </div>
      <div>
        <label htmlFor="e-strasse" className={labelCls}>
          Straße & Hausnummer *
        </label>
        <input id="e-strasse" type="text" {...register("strasse")} className={inputCls} />
        <Fehler text={errors.strasse?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="e-plz" className={labelCls}>
            PLZ *
          </label>
          <input id="e-plz" type="text" inputMode="numeric" maxLength={5} {...register("plz")} className={inputCls} />
          <Fehler text={errors.plz?.message} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="e-ort" className={labelCls}>
            Ort *
          </label>
          <input id="e-ort" type="text" {...register("ort")} className={inputCls} />
          <Fehler text={errors.ort?.message} />
        </div>
      </div>
      <div>
        <label htmlFor="e-email" className={labelCls}>
          E-Mail
        </label>
        <input id="e-email" type="email" {...register("email")} className={inputCls} />
        <p className="mt-1 text-xs text-sva-gray-400">
          Ohne E-Mail-Adresse geht keine Mail raus. Den Spendenbeleg gibt es dann zum Herunterladen.
        </p>
        <Fehler text={errors.email?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="e-betrag" className={labelCls}>
            Betrag (€) *
          </label>
          <input
            id="e-betrag"
            type="number"
            min="1"
            step="0.01"
            inputMode="decimal"
            {...register("betrag", { valueAsNumber: true })}
            className={inputCls}
          />
          <Fehler text={errors.betrag?.message} />
        </div>
        <div>
          <label htmlFor="e-tag" className={labelCls}>
            Tag der Spende *
          </label>
          <input id="e-tag" type="date" {...register("tag_der_spende")} className={inputCls} />
          <Fehler text={errors.tag_der_spende?.message} />
        </div>
      </div>
      {art && (
        <p className="text-sm text-sva-gray-300">
          {art === "vereinfacht"
            ? `Bis ${spendenGrenzeVereinfacht} €: Die Website erzeugt einen vereinfachten Spendenbeleg.`
            : `Über ${spendenGrenzeVereinfacht} €: Der Vorsitz stellt eine Zuwendungsbestätigung aus.`}
        </p>
      )}
      <div>
        <label htmlFor="e-notiz" className={labelCls}>
          Notiz
        </label>
        <textarea id="e-notiz" rows={3} {...register("notiz")} className={inputCls} />
        <Fehler text={errors.notiz?.message} />
      </div>
      <label className="flex items-start gap-3 rounded-md border border-sva-gray-700 p-4 text-sva-gray-300">
        <input type="checkbox" {...register("direktFreigeben")} className="mt-1 accent-sva-gold" />
        <span>
          <span className="font-medium text-white">Geldeingang schon geprüft, direkt freigeben</span>
          <br />
          <span className="text-sm">
            Nur ankreuzen, wenn die Spende auf dem Vereinskonto zu sehen ist. Sonst bleibt die Anfrage offen.
          </span>
        </span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light disabled:opacity-50"
      >
        {isSubmitting ? "Wird gespeichert …" : knopf}
      </button>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
