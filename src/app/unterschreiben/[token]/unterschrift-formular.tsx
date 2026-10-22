"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { unterschreiben } from "./actions";

type Status = "offen" | "sendet" | "fertig";

export function UnterschriftFormular({ token, sitzungToken, kontoinhaber }: { token: string; sitzungToken: string; kontoinhaber: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [leer, setLeer] = useState(true);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [status, setStatus] = useState<Status>("offen");
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, { penColor: "#0b1f4d", backgroundColor: "rgba(255,255,255,0)" });
    pad.addEventListener("endStroke", () => setLeer(pad.isEmpty()));
    padRef.current = pad;

    // Canvas an Pixeldichte anpassen, sonst wird die Unterschrift auf dem Handy unscharf und versetzt.
    function anpassen() {
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      setLeer(true);
    }
    anpassen();
    window.addEventListener("resize", anpassen);
    return () => {
      window.removeEventListener("resize", anpassen);
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
    setStatus("sendet");
    setFehler(null);
    const ergebnis = await unterschreiben(token, sitzungToken, pad.toDataURL("image/png"));
    if (ergebnis.ok) {
      setStatus("fertig");
    } else {
      setFehler(ergebnis.fehler);
      setStatus("offen");
    }
  }

  if (status === "fertig") {
    return (
      <div className="mt-6 rounded-lg border-2 border-sva-green bg-sva-green/10 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Willkommen im Förderverein!</h2>
        <p className="mt-2 text-sva-gray-300">
          Ihre Beitrittserklärung ist unterschrieben und bei uns eingegangen. Eine Kopie als PDF haben wir Ihnen per E-Mail geschickt.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">Unterschrift</h2>
      <p className="mt-2 text-sm text-sva-gray-300">Unterschreiben Sie mit Finger oder Maus im weißen Feld.</p>

      <div className="relative mt-4">
        <canvas ref={canvasRef} className="h-48 w-full touch-none rounded-md bg-white" aria-label="Unterschriftsfeld" />
        <div className="pointer-events-none absolute bottom-10 left-6 right-6 border-b border-sva-gray-300" />
        <button type="button" onClick={loeschen} className="absolute right-3 top-3 rounded px-2 py-1 text-xs font-medium text-sva-gray-600 hover:bg-sva-gray-100">
          Löschen
        </button>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-sva-gray-600 bg-sva-charcoal text-sva-green focus:ring-sva-green" />
        <span className="text-sm text-sva-gray-300">
          Ich bin {kontoinhaber} (Kontoinhaber/in) bzw. bei Minderjährigen erziehungsberechtigt und unterschreibe die
          Beitrittserklärung und das SEPA-Lastschriftmandat verbindlich.
        </span>
      </label>

      {fehler && <p className="mt-4 text-sm text-red-400">{fehler}</p>}

      <button
        type="button"
        onClick={absenden}
        disabled={leer || !bestaetigt || status === "sendet"}
        className="mt-6 w-full rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sendet" ? "Wird gesendet …" : "Verbindlich unterschreiben"}
      </button>
    </section>
  );
}
