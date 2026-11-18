"use client";

import { Allura } from "next/font/google";
import { useEffect, useRef, type RefObject } from "react";
import SignaturePad from "signature_pad";

export type Art = "tippen" | "zeichnen";

const TINTE = "#0b1f4d";

const schreibschrift = Allura({ weight: "400", subsets: ["latin"], display: "block" });

// Tippen braucht eine Tastatur, Zeichnen geht am Handy mit dem Finger leichter.
export function startArt(): Art {
  return window.matchMedia("(pointer: fine)").matches ? "tippen" : "zeichnen";
}

export function ArtWahl({ art, onArt }: { art: Art; onArt: (a: Art) => void }) {
  const optionen: [Art, string][] = [
    ["tippen", "Namen tippen"],
    ["zeichnen", "Zeichnen"],
  ];
  return (
    <div
      role="group"
      aria-label="Art der Unterschrift"
      className="mt-4 inline-flex self-start rounded-md bg-sva-charcoal-dark p-1"
    >
      {optionen.map(([wert, text]) => (
        <button
          key={wert}
          type="button"
          aria-pressed={art === wert}
          onClick={() => onArt(wert)}
          className="rounded px-4 py-2 text-sm font-medium text-sva-gray-300 transition-colors hover:text-white aria-pressed:bg-sva-charcoal-light aria-pressed:text-white aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.4)]"
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function TippFeld({ name, onName }: { name: string; onName: (n: string) => void }) {
  return (
    <div className="@container relative mt-4 flex h-48 items-end rounded-md bg-white px-6 pb-8 sm:h-64">
      <label htmlFor="unterschrift-name" className="sr-only">
        Dein Name als Unterschrift
      </label>
      <input
        id="unterschrift-name"
        value={name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Dein Name"
        autoComplete="name"
        spellCheck={false}
        maxLength={60}
        // Lange Namen werden kleiner statt abgeschnitten (die Schrift ist im Mittel etwa 0,45 em breit).
        // Fokus zeigt die goldene Linie, der globale Fokusrahmen würde sie doppeln.
        style={{ fontSize: `min(4.5rem, ${Math.floor(200 / Math.max(name.length, 8))}cqw)`, outline: "none" }}
        className={`${schreibschrift.className} w-full border-0 border-b border-sva-gray-300 bg-transparent px-0 pb-1 text-center leading-none text-[#0b1f4d] caret-[#0b1f4d] placeholder:text-sva-gray-200 focus:border-sva-gold focus:ring-0`}
      />
    </div>
  );
}

export function ZeichenFeld({
  padRef,
  onLeer,
  onLoeschen,
}: {
  padRef: RefObject<SignaturePad | null>;
  onLeer: (leer: boolean) => void;
  onLoeschen: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Als Ref, damit ein neues Callback beim Re-Render das Unterschriftsfeld nicht neu aufbaut.
  const leerRef = useRef(onLeer);
  useEffect(() => {
    leerRef.current = onLeer;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, {
      penColor: TINTE,
      backgroundColor: "rgba(255,255,255,0)",
      minWidth: 1,
      maxWidth: 3,
    });
    pad.addEventListener("endStroke", () => leerRef.current(pad.isEmpty()));
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
      leerRef.current(pad.isEmpty());
    }
    anpassen();
    const beobachter = new ResizeObserver(anpassen);
    beobachter.observe(canvas);

    return () => {
      beobachter.disconnect();
      pad.off();
      padRef.current = null;
    };
  }, [padRef]);

  return (
    <div className="relative mt-4 min-h-40 flex-1 sm:flex-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none rounded-md bg-white sm:static sm:h-64"
        aria-label="Unterschriftsfeld"
      />
      <div className="pointer-events-none absolute right-6 bottom-8 left-6 border-b border-sva-gray-300" />
      <button
        type="button"
        onClick={onLoeschen}
        className="absolute top-3 right-3 rounded px-2 py-1 text-xs font-medium text-sva-gray-600 hover:bg-sva-gray-100"
      >
        Löschen
      </button>
    </div>
  );
}

// Rendert den getippten Namen in Schreibschrift als PNG, im selben Format wie die gezeichnete Unterschrift.
export async function schriftzugAlsPng(name: string): Promise<string> {
  const breite = 1200;
  const hoehe = 400;
  const rand = 60;
  const familie = schreibschrift.style.fontFamily;
  await document.fonts.load(`160px ${familie}`, name);

  const canvas = document.createElement("canvas");
  canvas.width = breite;
  canvas.height = hoehe;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar");

  let groesse = 220;
  ctx.font = `${groesse}px ${familie}`;
  const gemessen = ctx.measureText(name).width;
  if (gemessen > breite - 2 * rand) {
    groesse = Math.floor((groesse * (breite - 2 * rand)) / gemessen);
    ctx.font = `${groesse}px ${familie}`;
  }
  ctx.fillStyle = TINTE;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, breite / 2, hoehe * 0.75);
  return canvas.toDataURL("image/png");
}
