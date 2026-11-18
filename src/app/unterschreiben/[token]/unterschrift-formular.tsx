"use client";

import { useEffect, useRef, useState } from "react";
import type SignaturePad from "signature_pad";
import { unterschriftSchema } from "@/lib/schemas";
import { unterschreiben } from "./actions";
import { ArtWahl, schriftzugAlsPng, startArt, TippFeld, ZeichenFeld, type Art } from "./unterschrift-felder";

type Status = "offen" | "sendet" | "fertig";

export function UnterschriftFormular({
  token,
  sitzungToken,
  kontoinhaber,
}: {
  token: string;
  sitzungToken: string;
  kontoinhaber: string;
}) {
  const [offen, setOffen] = useState(false);
  const [status, setStatus] = useState<Status>("offen");

  if (status === "fertig") {
    return (
      <div className="mt-6 rounded-lg border-2 border-sva-green bg-sva-green/10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Willkommen im Förderverein!</h2>
        <p className="mt-2 text-sva-gray-300">
          Deine Beitrittserklärung und das SEPA-Lastschriftmandat sind unterschrieben und bei uns eingegangen. Eine
          Kopie als PDF haben wir dir per E-Mail geschickt.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setOffen(true)}
          className="w-full rounded-md bg-sva-gold px-6 py-4 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light"
        >
          Jetzt unterschreiben
        </button>
        <p className="mt-3 text-center text-xs text-sva-gray-400">
          Du tippst deinen Namen oder unterschreibst mit Finger oder Maus.
        </p>
      </div>
      {offen && (
        <UnterschriftModal
          token={token}
          sitzungToken={sitzungToken}
          kontoinhaber={kontoinhaber}
          sendet={status === "sendet"}
          onStatus={setStatus}
          onSchliessen={() => setOffen(false)}
        />
      )}
    </>
  );
}

function UnterschriftModal({
  token,
  sitzungToken,
  kontoinhaber,
  sendet,
  onStatus,
  onSchliessen,
}: {
  token: string;
  sitzungToken: string;
  kontoinhaber: string;
  sendet: boolean;
  onStatus: (s: Status) => void;
  onSchliessen: () => void;
}) {
  const padRef = useRef<SignaturePad | null>(null);
  const [art, setArt] = useState<Art>(startArt);
  const [name, setName] = useState(kontoinhaber);
  const [zeichnungLeer, setZeichnungLeer] = useState(true);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const leer = art === "tippen" ? name.trim() === "" : zeichnungLeer;
  // Als Ref, damit ein neues Callback beim Re-Render den Effekt nicht neu startet.
  const schliessenRef = useRef(onSchliessen);
  useEffect(() => {
    schliessenRef.current = onSchliessen;
  });

  useEffect(() => {
    // Seite im Hintergrund nicht mitscrollen lassen.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function taste(e: KeyboardEvent) {
      if (e.key === "Escape") schliessenRef.current();
    }
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("keydown", taste);
      document.body.style.overflow = overflow;
    };
  }, []);

  function loeschen() {
    padRef.current?.clear();
    setZeichnungLeer(true);
  }

  async function bildErzeugen(): Promise<string | null> {
    if (art === "tippen") return name.trim() ? schriftzugAlsPng(name.trim()) : null;
    const pad = padRef.current;
    return pad && !pad.isEmpty() ? pad.toDataURL("image/png") : null;
  }

  async function absenden() {
    const unterschrift = await bildErzeugen();
    if (!unterschrift) return;
    const eingabe = unterschriftSchema.safeParse({
      token,
      sitzungToken,
      unterschrift,
      bestaetigt,
    });
    if (!eingabe.success) {
      setFehler(eingabe.error.issues[0]?.message ?? "Bitte prüf deine Unterschrift.");
      return;
    }
    onStatus("sendet");
    setFehler(null);
    const ergebnis = await unterschreiben(eingabe.data);
    if (ergebnis.ok) {
      onStatus("fertig");
    } else {
      setFehler(ergebnis.fehler);
      onStatus("offen");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unterschrift-titel"
    >
      <div className="flex h-full w-full flex-col overflow-y-auto bg-sva-charcoal-light p-4 sm:h-auto sm:max-h-full sm:max-w-3xl sm:rounded-lg sm:border sm:border-sva-gray-700 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="unterschrift-titel" className="text-lg font-semibold text-white sm:text-xl">
              Unterschrift
            </h2>
            <p className="mt-1 text-sm text-sva-gray-300">
              {art === "tippen"
                ? "Tipp deinen Namen ein, wir setzen ihn als Unterschrift."
                : "Unterschreib mit Finger oder Maus im weißen Feld."}
            </p>
            {art === "zeichnen" && (
              <p className="mt-1 text-xs text-sva-gold sm:hidden">
                Tipp: Halt dein Handy quer, dann hast du mehr Platz.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onSchliessen}
            aria-label="Schließen"
            className="rounded p-2 text-2xl leading-none text-sva-gray-300 hover:bg-sva-charcoal hover:text-white"
          >
            &times;
          </button>
        </div>

        <ArtWahl art={art} onArt={setArt} />

        {art === "tippen" ? (
          <TippFeld name={name} onName={setName} />
        ) : (
          <ZeichenFeld padRef={padRef} onLeer={setZeichnungLeer} onLoeschen={loeschen} />
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={bestaetigt}
            onChange={(e) => setBestaetigt(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sva-gray-600 bg-sva-charcoal text-sva-green focus:ring-sva-green"
          />
          <span className="text-sm text-sva-gray-300">
            Ich unterschreibe die Beitrittserklärung (als Mitglied bzw. erziehungsberechtigt) und das
            SEPA-Lastschriftmandat als Kontoinhaber/in {kontoinhaber} verbindlich.
          </span>
        </label>

        {fehler && <p className="mt-3 text-sm text-red-400">{fehler}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onSchliessen}
            className="rounded-md border border-sva-gray-600 px-5 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => void absenden()}
            disabled={leer || !bestaetigt || sendet}
            className="flex-1 rounded-md bg-sva-gold px-6 py-3 text-sm font-bold text-sva-charcoal-dark uppercase transition-colors hover:bg-sva-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendet ? "Wird gesendet …" : "Verbindlich unterschreiben"}
          </button>
        </div>
      </div>
    </div>
  );
}
