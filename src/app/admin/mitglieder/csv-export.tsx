"use client";

import { useState } from "react";
import { CSV_GRUPPEN, CSV_SPALTEN, type CsvSpalte, type Filter } from "@/packages/mitglied/anzeige";

// Knopf „CSV exportieren“ mit Ausklappfeld. Exportiert, was die Liste gerade zeigt. Die Auswahl der
// Spalten wird nicht gespeichert, Vorname und Nachname sind immer dabei.
export function CsvExport({ q, filter }: { q: string; filter?: Filter }) {
  const [offen, setOffen] = useState(false);
  const [auswahl, setAuswahl] = useState<readonly CsvSpalte[]>(CSV_SPALTEN);

  function umschalten(feld: CsvSpalte, an: boolean) {
    setAuswahl((alt) => (an ? [...alt, feld] : alt.filter((f) => f !== feld)));
  }

  const knopfCls =
    "rounded-md border border-sva-gray-600 px-3 py-1.5 text-xs font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal";

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={offen}
        aria-controls="csv-export"
        onClick={() => setOffen((o) => !o)}
        className="rounded-md border border-sva-gold px-6 py-3 text-sm font-bold text-sva-gold transition-colors hover:bg-sva-charcoal-light"
      >
        CSV exportieren
      </button>
      {offen && (
        <form
          id="csv-export"
          action="/admin/mitglieder/export"
          method="get"
          className="absolute right-0 z-10 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-4 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-5 shadow-xl"
        >
          {q && <input type="hidden" name="q" value={q} />}
          {filter && <input type="hidden" name="filter" value={filter} />}
          {CSV_GRUPPEN.map((gruppe) => (
            <fieldset key={gruppe.titel}>
              <legend className="text-xs font-semibold tracking-wide text-sva-gray-400 uppercase">
                {gruppe.titel}
              </legend>
              <div className="mt-1.5 space-y-1">
                {gruppe.spalten.map((s) => {
                  const immer = "immer" in s && s.immer;
                  return (
                    <label key={s.feld} className="flex items-center gap-2 text-sm text-sva-gray-300">
                      <input
                        type="checkbox"
                        name="spalte"
                        value={s.feld}
                        checked={immer || auswahl.includes(s.feld)}
                        disabled={immer}
                        onChange={(e) => umschalten(s.feld, e.target.checked)}
                        className="accent-sva-gold"
                      />
                      {s.titel}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap items-center gap-2 border-t border-sva-gray-700 pt-4">
            <button type="button" onClick={() => setAuswahl(CSV_SPALTEN)} className={knopfCls}>
              Alle
            </button>
            <button type="button" onClick={() => setAuswahl([])} className={knopfCls}>
              Keine
            </button>
            <button
              type="submit"
              className="ml-auto rounded-md bg-sva-gold px-4 py-2 text-sm font-bold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
            >
              Herunterladen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
