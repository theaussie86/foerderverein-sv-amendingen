"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Cropper, { type Area } from "react-easy-crop";

// Seitenverhältnis der großen Kachel auf der Startseite (PocketBase-Thumb 800x600). Die Liste zeigt
// daraus die quadratische Mitte (Thumb 160x160).
const SEITENVERHAELTNIS = 4 / 3;
const MAX_BREITE = 1600;

const knopf = "rounded-md px-4 py-2 text-sm transition-colors";

// Zeigt den Ausschnitt `a` (Prozent des Bildes) in einem Rahmen, ohne das Bild neu zu rechnen.
function ausschnittStil(a: Area): CSSProperties {
  return {
    position: "absolute",
    maxWidth: "none",
    width: `${10000 / a.width}%`,
    height: `${10000 / a.height}%`,
    left: `${(-a.x * 100) / a.width}%`,
    top: `${(-a.y * 100) / a.height}%`,
  };
}

// Quadratische Mitte eines 4:3-Ausschnitts, wie PocketBase sie für die Liste schneidet.
function quadratAus(a: Area): Area {
  const breite = a.width / SEITENVERHAELTNIS;
  return { ...a, x: a.x + (a.width - breite) / 2, width: breite };
}

async function zuschneiden(datei: File, px: Area): Promise<File> {
  const bitmap = await createImageBitmap(datei, { imageOrientation: "from-image" });
  const breite = Math.min(MAX_BREITE, Math.round(px.width));
  const hoehe = Math.round(breite / SEITENVERHAELTNIS);
  const canvas = document.createElement("canvas");
  canvas.width = breite;
  canvas.height = hoehe;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, breite, hoehe);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, px.x, px.y, px.width, px.height, 0, 0, breite, hoehe);
  bitmap.close();
  const blob = await new Promise<Blob | null>((fertig) => canvas.toBlob(fertig, "image/jpeg", 0.88));
  if (!blob) throw new Error("Bild konnte nicht erzeugt werden");
  const name = datei.name.replace(/\.[^.]+$/, "") || "bild";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

function Vorschau({ src, ausschnitt, quadrat }: { src: string; ausschnitt: Area | null; quadrat?: boolean }) {
  const a = ausschnitt && (quadrat ? quadratAus(ausschnitt) : ausschnitt);
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-sva-gray-800 ${quadrat ? "aspect-square" : "aspect-[4/3]"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale Blob-URL */}
      <img
        src={src}
        alt=""
        style={a ? ausschnittStil(a) : undefined}
        className={a ? undefined : "absolute inset-0 h-full w-full object-cover"}
      />
    </div>
  );
}

function Beschriftete({ label, children, className }: { label: string; children: React.ReactNode; className: string }) {
  return (
    <figure className={className}>
      {children}
      <figcaption className="mt-1.5 text-xs text-sva-gray-400">{label}</figcaption>
    </figure>
  );
}

// Dateiauswahl mit Zuschnitt: Nach der Auswahl öffnet sich ein Dialog, in dem der Vorstand den
// 4:3-Ausschnitt für die Startseite festlegt. Ins Formular geht nur das zugeschnittene JPEG.
export function BildAuswahl({ bildUrl, bearbeiten }: { bildUrl: string | null; bearbeiten: boolean }) {
  const eingabe = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [original, setOriginal] = useState<{ datei: File; url: string } | null>(null);
  const [ergebnis, setErgebnis] = useState<{ datei: File; url: string } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [prozent, setProzent] = useState<Area | null>(null);
  const [pixel, setPixel] = useState<Area | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => () => void (original && URL.revokeObjectURL(original.url)), [original]);
  useEffect(() => () => void (ergebnis && URL.revokeObjectURL(ergebnis.url)), [ergebnis]);

  // Die Eingabe hält immer das zugeschnittene Bild oder nichts.
  function eingabeSetzen(datei: File | null) {
    if (!eingabe.current) return;
    const dt = new DataTransfer();
    if (datei) dt.items.add(datei);
    eingabe.current.files = dt.files;
  }

  function gewaehlt(datei: File | undefined) {
    eingabeSetzen(ergebnis?.datei ?? null);
    if (!datei) return;
    if (!datei.type.startsWith("image/")) {
      setFehler("Bitte ein Foto auswählen (JPEG oder PNG).");
      return;
    }
    setFehler(null);
    setOriginal({ datei, url: URL.createObjectURL(datei) });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    dialog.current?.showModal();
  }

  async function uebernehmen() {
    if (!original || !pixel) return;
    setLaeuft(true);
    try {
      const datei = await zuschneiden(original.datei, pixel);
      eingabeSetzen(datei);
      setErgebnis({ datei, url: URL.createObjectURL(datei) });
      dialog.current?.close();
    } catch {
      setFehler("Das Bild ließ sich nicht zuschneiden. Bitte ein anderes Foto versuchen.");
      dialog.current?.close();
    } finally {
      setLaeuft(false);
    }
  }

  const anzeige = ergebnis?.url ?? bildUrl;

  return (
    <div className="mt-1">
      {anzeige && (
        <div className="mb-3 flex items-end gap-4">
          <Beschriftete label="Startseite" className="w-40">
            <Vorschau src={anzeige} ausschnitt={null} />
          </Beschriftete>
          <Beschriftete label="Liste" className="w-20">
            <Vorschau src={anzeige} ausschnitt={null} quadrat />
          </Beschriftete>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={eingabe}
          id="f-bild"
          name="bild"
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => gewaehlt(e.target.files?.[0])}
          className="peer sr-only"
        />
        <label
          htmlFor="f-bild"
          className={`${knopf} cursor-pointer border border-sva-gray-600 text-sva-gray-200 peer-focus-visible:ring-2 peer-focus-visible:ring-sva-gold hover:bg-sva-charcoal`}
        >
          {anzeige ? "Anderes Bild auswählen" : "Bild auswählen"}
        </label>
        {original && ergebnis && (
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className={`${knopf} text-sva-gold hover:text-sva-gold-light`}
          >
            Zuschnitt ändern
          </button>
        )}
        {ergebnis && <span className="text-sm text-sva-gray-400">{ergebnis.datei.name}</span>}
      </div>
      <p className="mt-2 text-xs text-sva-gray-400">
        JPEG oder PNG. Nach der Auswahl legst du den Ausschnitt fest.
        {bearbeiten && " Ohne neue Auswahl bleibt das bisherige Bild."}
      </p>
      {fehler && <p className="mt-1 text-xs text-red-400">{fehler}</p>}

      <dialog
        ref={dialog}
        aria-labelledby="zuschnitt-titel"
        className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-0 text-white backdrop:bg-black/70 focus-visible:outline-none"
      >
        {original && (
          <div className="p-5 sm:p-6">
            <h2 id="zuschnitt-titel" className="text-lg font-semibold">
              Ausschnitt festlegen
            </h2>
            <p className="mt-1 text-sm text-sva-gray-300">
              Bild ziehen zum Verschieben, mit dem Regler vergrößern. Die Vorschau zeigt, wie es auf der Startseite
              aussieht.
            </p>
            <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_13rem]">
              <div>
                <div className="relative h-[min(55dvh,26rem)] overflow-hidden rounded-md bg-black">
                  <Cropper
                    image={original.url}
                    crop={crop}
                    zoom={zoom}
                    maxZoom={4}
                    aspect={SEITENVERHAELTNIS}
                    objectFit="cover"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(a, px) => {
                      setProzent(a);
                      setPixel(px);
                    }}
                  />
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm text-sva-gray-300">
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-sva-gold"
                  />
                </label>
              </div>
              <div className="flex gap-4 md:flex-col">
                <Beschriftete label="Startseite, große Kachel" className="w-40 md:w-full">
                  <Vorschau src={original.url} ausschnitt={prozent} />
                </Beschriftete>
                <Beschriftete label="Startseite, Liste" className="w-20 md:w-24">
                  <Vorschau src={original.url} ausschnitt={prozent} quadrat />
                </Beschriftete>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className={`${knopf} border border-sva-gray-600 text-sva-gray-300 hover:bg-sva-charcoal`}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void uebernehmen()}
                disabled={laeuft || !pixel}
                className={`${knopf} bg-sva-gold font-bold text-sva-charcoal-dark hover:bg-sva-gold-light disabled:opacity-60`}
              >
                {laeuft ? "Schneidet zu …" : "Ausschnitt übernehmen"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
