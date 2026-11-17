"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { foerderprojektSchema } from "@/lib/schemas";
import type { Foerderprojekt } from "@/packages/foerderprojekt/anzeige";
import { foerderprojektLoeschen, foerderprojektSpeichern } from "./actions";

const inputCls =
  "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";
const labelCls = "block text-sm font-medium text-sva-gray-300";

type Feldfehler = Partial<Record<"titel" | "beschreibung" | "jahr" | "betrag" | "bild", string>>;

function Fehler({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-red-400">{text}</p> : null;
}

// Anlegen (ohne projekt) und Bearbeiten eines Förderprojekts. Geprüft wird vor dem Senden mit
// demselben Schema wie in der Server Action. Der Haken für die Startseite ist gesperrt, wenn alle
// Plätze belegt sind und das Förderprojekt nicht schon dort steht.
export function FoerderprojektFormular({
  projekt,
  bildUrl,
  startseiteGesperrt,
}: {
  projekt: Foerderprojekt | null;
  bildUrl: string | null;
  startseiteGesperrt: boolean;
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [feldfehler, setFeldfehler] = useState<Feldfehler>({});
  const [vorschau, setVorschau] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();
  const p = projekt;

  useEffect(
    () => () => {
      if (vorschau) URL.revokeObjectURL(vorschau);
    },
    [vorschau],
  );

  function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFehler(null);
    const daten = new FormData(e.currentTarget);
    const parsed = foerderprojektSchema.safeParse(Object.fromEntries(daten));
    if (!parsed.success) {
      const f: Feldfehler = {};
      for (const issue of parsed.error.issues) {
        const feld = issue.path[0];
        if (
          (feld === "titel" || feld === "beschreibung" || feld === "jahr" || feld === "betrag" || feld === "bild") &&
          !f[feld]
        )
          f[feld] = issue.message;
      }
      setFeldfehler(f);
      return;
    }
    setFeldfehler({});
    // Bei Erfolg leitet die Action zur Liste weiter.
    starten(async () => setFehler((await foerderprojektSpeichern(daten)).fehler));
  }

  function loeschen() {
    if (!p || !window.confirm(`„${p.titel}“ wirklich löschen?`)) return;
    starten(async () => setFehler((await foerderprojektLoeschen({ id: p.id })).fehler));
  }

  const bild = vorschau ?? bildUrl;

  return (
    <form
      onSubmit={absenden}
      noValidate
      className="space-y-5 rounded-lg border border-sva-gold/40 bg-sva-charcoal-light p-6"
    >
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div>
        <label htmlFor="f-titel" className={labelCls}>
          Titel *
        </label>
        <input id="f-titel" name="titel" defaultValue={p?.titel} maxLength={200} className={inputCls} />
        <Fehler text={feldfehler.titel} />
      </div>
      <div>
        <label htmlFor="f-beschreibung" className={labelCls}>
          Beschreibung *
        </label>
        <textarea
          id="f-beschreibung"
          name="beschreibung"
          rows={4}
          maxLength={1000}
          defaultValue={p?.beschreibung}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-sva-gray-400">Zwei, drei Sätze reichen. Beträge gehören ins Feld Betrag.</p>
        <Fehler text={feldfehler.beschreibung} />
      </div>
      <div>
        <label htmlFor="f-bild" className={labelCls}>
          Bild *
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-4">
          {bild && (
            <Image
              src={bild}
              alt=""
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 shrink-0 rounded-md bg-sva-gray-800 object-cover"
            />
          )}
          <input
            id="f-bild"
            name="bild"
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => {
              const datei = e.target.files?.[0];
              setVorschau(datei ? URL.createObjectURL(datei) : null);
            }}
            className="text-sm text-sva-gray-300 file:mr-4 file:rounded-md file:border file:border-sva-gray-600 file:bg-transparent file:px-4 file:py-2 file:text-sva-gray-200"
          />
        </div>
        <p className="mt-1 text-xs text-sva-gray-400">
          JPEG oder PNG, höchstens 5 MB. Querformat sieht am besten aus.
          {p && " Ohne neue Auswahl bleibt das bisherige Bild."}
        </p>
        <Fehler text={feldfehler.bild} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-jahr" className={labelCls}>
            Jahr
          </label>
          <input
            id="f-jahr"
            name="jahr"
            inputMode="numeric"
            defaultValue={p?.jahr ?? ""}
            placeholder="2026"
            className={inputCls}
          />
          <Fehler text={feldfehler.jahr} />
        </div>
        <div>
          <label htmlFor="f-betrag" className={labelCls}>
            Betrag in €
          </label>
          <input
            id="f-betrag"
            name="betrag"
            inputMode="numeric"
            defaultValue={p?.betrag ?? ""}
            placeholder="1000"
            className={inputCls}
          />
          <Fehler text={feldfehler.betrag} />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sva-gray-200">
          <input
            type="checkbox"
            name="startseite"
            defaultChecked={p?.startseite ?? false}
            disabled={startseiteGesperrt}
            className="h-4 w-4 accent-sva-gold"
          />
          Auf der Startseite zeigen
        </label>
        {startseiteGesperrt && (
          <p className="mt-1 text-xs text-sva-gray-400">
            Alle 4 Plätze sind belegt. Nimm erst ein anderes Förderprojekt von der Startseite.
          </p>
        )}
      </div>
      {fehler && (
        <p role="alert" className="text-sm text-red-400">
          {fehler}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={laeuft}
          className="rounded-md bg-sva-gold px-6 py-2.5 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light disabled:opacity-60"
        >
          {laeuft ? "Speichert …" : "Speichern"}
        </button>
        <Link
          href="/admin/foerderprojekte"
          className="rounded-md border border-sva-gray-600 px-6 py-2.5 text-sm text-sva-gray-300 transition-colors hover:bg-sva-charcoal"
        >
          Abbrechen
        </Link>
        {p && (
          <button
            type="button"
            onClick={loeschen}
            disabled={laeuft}
            className="ml-auto text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
