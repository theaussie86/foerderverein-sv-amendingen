"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

export type Dokument = { feld: string; label: string; href: string; bild: boolean };

// Zeigt PDFs (Mitgliedsantrag, Spendenbeleg) direkt auf der Seite, mit Reitern zum Umschalten.
// Der Browser rendert das PDF selbst; ältere iPhones zeigen im Rahmen nur die erste Seite, dafür gibt es den Knopf zum Öffnen in neuem Tab.
export function DokumentAnsicht({ dokumente }: { dokumente: Dokument[] }) {
  const [aktivFeld, setAktivFeld] = useState(dokumente[0]?.feld);
  const aktiv = dokumente.find((d) => d.feld === aktivFeld) ?? dokumente[0];
  if (!aktiv) {
    return <p className="text-sm text-sva-gray-400">Zu diesem Antrag gibt es keine Dokumente.</p>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-sva-gray-700 bg-sva-charcoal-dark">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sva-gray-700 px-2 py-2">
        <div role="tablist" aria-label="Dokumente" className="flex flex-wrap gap-1">
          {dokumente.map((d) => (
            <button
              key={d.feld}
              type="button"
              role="tab"
              id={`reiter-${d.feld}`}
              aria-selected={d.feld === aktiv.feld}
              aria-controls="dokument-flaeche"
              onClick={() => setAktivFeld(d.feld)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                d.feld === aktiv.feld
                  ? "bg-white/[0.08] font-semibold text-white"
                  : "text-sva-gray-300 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <a
            href={aktiv.href}
            target="_blank"
            rel="noopener"
            title="In neuem Tab öffnen"
            className="rounded-md p-1.5 text-sva-gray-300 hover:bg-white/[0.06] hover:text-sva-gold"
          >
            <Icon name="webseite" className="size-5" />
            <span className="sr-only">{aktiv.label} in neuem Tab öffnen</span>
          </a>
          <a
            href={`${aktiv.href}?download=1`}
            title="Herunterladen"
            className="rounded-md p-1.5 text-sva-gray-300 hover:bg-white/[0.06] hover:text-sva-gold"
          >
            <Icon name="herunterladen" className="size-5" />
            <span className="sr-only">{aktiv.label} herunterladen</span>
          </a>
        </div>
      </div>

      <div
        id="dokument-flaeche"
        role="tabpanel"
        aria-labelledby={`reiter-${aktiv.feld}`}
        className="min-h-0 flex-1 bg-sva-gray-700"
      >
        {aktiv.bild ? (
          <div className="grid h-full place-items-center bg-white p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- geschützte Datei aus der eigenen Route */}
            <img src={aktiv.href} alt={aktiv.label} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <iframe
            key={aktiv.href}
            src={`${aktiv.href}#navpanes=0&view=FitH`}
            title={aktiv.label}
            className="block h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
