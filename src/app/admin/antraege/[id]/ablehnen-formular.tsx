"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mitgliedsantragAblehnenSchema, type MitgliedsantragAblehnenDaten } from "@/lib/schemas";
import { mitgliedsantragAblehnen } from "./actions";

const feldCls =
  "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

// Ablehnung eines Mitgliedsantrags mit internem Grund. Sie ist endgültig, deshalb fragt das Formular vorher nach.
// daneben: weitere Entscheidung (Übernehmen), die neben dem Ablehnen-Knopf steht, solange das Formular zu ist.
export function AblehnenFormular({ id, email, daneben }: { id: string; email: string; daneben?: ReactNode }) {
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MitgliedsantragAblehnenDaten>({
    resolver: zodResolver(mitgliedsantragAblehnenSchema),
    defaultValues: { grund: "", mailSenden: true },
  });

  async function onSubmit(daten: MitgliedsantragAblehnenDaten) {
    setFehler(null);
    const frage = daten.mailSenden
      ? `Mitgliedsantrag endgültig ablehnen und Mail an ${email} senden?`
      : "Mitgliedsantrag endgültig ablehnen? Es geht keine Mail raus.";
    if (!window.confirm(frage)) return;
    const ergebnis = await mitgliedsantragAblehnen(id, daten);
    if (!ergebnis.ok) setFehler(ergebnis.fehler);
  }

  if (!offen) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {daneben}
        <button
          type="button"
          onClick={() => setOffen(true)}
          className="rounded-md border border-red-500/60 px-5 py-2.5 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10"
        >
          Ablehnen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      <p className="text-sm text-sva-gray-300">
        Die Ablehnung ist endgültig. Wer später doch beitreten will, stellt einen neuen Mitgliedsantrag.
      </p>
      <div>
        <label htmlFor="grund" className="block text-sm font-medium text-sva-gray-300">
          Grund (nur intern, steht nicht in der Mail)
        </label>
        <textarea id="grund" rows={3} {...register("grund")} className={feldCls} />
        {errors.grund?.message && <p className="mt-1 text-xs text-red-400">{errors.grund.message}</p>}
      </div>
      <label className="flex items-start gap-3 text-sva-gray-300">
        <input type="checkbox" {...register("mailSenden")} className="mt-1 accent-sva-gold" />
        <span>Mail an Antragsteller senden ({email})</span>
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-red-500/60 px-6 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          {isSubmitting ? "Wird gespeichert …" : "Endgültig ablehnen"}
        </button>
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="px-4 py-3 text-sm font-medium text-sva-gray-300 hover:text-white"
        >
          Abbrechen
        </button>
      </div>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
