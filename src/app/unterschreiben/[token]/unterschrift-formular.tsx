"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { unterschreiben } from "./actions";

type Status = "offen" | "sendet" | "fertig";

export function UnterschriftFormular({ token, sitzungToken, kontoinhaber }: { token: string; sitzungToken: string; kontoinhaber: string }) {
  const [offen, setOffen] = useState(false);
  const [status, setStatus] = useState<Status>("offen");

  if (status === "fertig") {
    return (
      <div className="mt-6 rounded-lg border-2 border-sva-green bg-sva-green/10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Willkommen im Förderverein!</h2>
        <p className="mt-2 text-sva-gray-300">
          Ihre Beitrittserklärung und das SEPA-Lastschriftmandat sind unterschrieben und bei uns eingegangen. Eine Kopie
          als PDF haben wir Ihnen per E-Mail geschickt.
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
          className="w-full rounded-md bg-sva-gold px-6 py-4 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
        >
          Jetzt unterschreiben
        </button>
        <p className="mt-3 text-center text-xs text-sva-gray-400">Sie unterschreiben in einem eigenen Fenster mit Finger oder Maus.</p>
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [leer, setLeer] = useState(true);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  // Als Ref, damit ein neues Callback beim Re-Render das Unterschriftsfeld nicht neu aufbaut.
  const schliessenRef = useRef(onSchliessen);
  useEffect(() => {
    schliessenRef.current = onSchliessen;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, { penColor: "#0b1f4d", backgroundColor: "rgba(255,255,255,0)", minWidth: 1, maxWidth: 3 });
    pad.addEventListener("endStroke", () => setLeer(pad.isEmpty()));
    padRef.current = pad;

    // Canvas an Größe und Pixeldichte anpassen. Beim Drehen des Handys wird die Unterschrift
    // proportional mitskaliert statt gelöscht.
    let alteBreite = 0;
    function anpassen() {
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const breite = canvas.offsetWidth;
      const daten = pad.toData();
      canvas.width = breite * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (daten.length && alteBreite) {
        const f = breite / alteBreite;
        pad.fromData(daten.map((g) => ({ ...g, points: g.points.map((p) => ({ ...p, x: p.x * f, y: p.y * f })) })));
      }
      alteBreite = breite;
      setLeer(pad.isEmpty());
    }
    anpassen();
    const beobachter = new ResizeObserver(anpassen);
    beobachter.observe(canvas);

    // Seite im Hintergrund nicht mitscrollen lassen.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function taste(e: KeyboardEvent) {
      if (e.key === "Escape") schliessenRef.current();
    }
    window.addEventListener("keydown", taste);

    return () => {
      beobachter.disconnect();
      window.removeEventListener("keydown", taste);
      document.body.style.overflow = overflow;
      pad.off();
    };
  }, []);

  function loeschen() {
    padRef.current?.clear();
    setLeer(true);
  }

  async function absenden() {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return;
    onStatus("sendet");
    setFehler(null);
    const ergebnis = await unterschreiben(token, sitzungToken, pad.toDataURL("image/png"));
    if (ergebnis.ok) {
      onStatus("fertig");
    } else {
      setFehler(ergebnis.fehler);
      onStatus("offen");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="unterschrift-titel">
      <div className="flex h-full w-full flex-col overflow-y-auto bg-sva-charcoal-light p-4 sm:h-auto sm:max-h-full sm:max-w-3xl sm:rounded-lg sm:border sm:border-sva-gray-700 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="unterschrift-titel" className="text-lg font-semibold text-white sm:text-xl">Unterschrift</h2>
            <p className="mt-1 text-sm text-sva-gray-300">Unterschreiben Sie mit Finger oder Maus im weißen Feld.</p>
            <p className="mt-1 text-xs text-sva-gold sm:hidden">Tipp: Halten Sie Ihr Handy quer, dann haben Sie mehr Platz.</p>
          </div>
          <button type="button" onClick={onSchliessen} aria-label="Schließen" className="rounded p-2 text-2xl leading-none text-sva-gray-300 hover:bg-sva-charcoal hover:text-white">
            &times;
          </button>
        </div>

        <div className="relative mt-4 min-h-40 flex-1 sm:flex-none">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none rounded-md bg-white sm:static sm:h-64" aria-label="Unterschriftsfeld" />
          <div className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-sva-gray-300" />
          <button type="button" onClick={loeschen} className="absolute right-3 top-3 rounded px-2 py-1 text-xs font-medium text-sva-gray-600 hover:bg-sva-gray-100">
            Löschen
          </button>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-sva-gray-600 bg-sva-charcoal text-sva-green focus:ring-sva-green" />
          <span className="text-sm text-sva-gray-300">
            Ich unterschreibe die Beitrittserklärung (als Mitglied bzw. erziehungsberechtigt) und das SEPA-Lastschriftmandat
            als Kontoinhaber/in {kontoinhaber} verbindlich.
          </span>
        </label>

        {fehler && <p className="mt-3 text-sm text-red-400">{fehler}</p>}

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onSchliessen} className="rounded-md border border-sva-gray-600 px-5 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal">
            Abbrechen
          </button>
          <button
            type="button"
            onClick={absenden}
            disabled={leer || !bestaetigt || sendet}
            className="flex-1 rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendet ? "Wird gesendet …" : "Verbindlich unterschreiben"}
          </button>
        </div>
      </div>
    </div>
  );
}
