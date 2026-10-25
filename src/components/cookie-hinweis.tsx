"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";

// Die Seite setzt nur technisch notwendige Cookies, deshalb gibt es nichts
// einzuwilligen. Der Banner informiert einmalig, die Bestätigung liegt im
// localStorage. Kommen später Analyse- oder Marketing-Dienste dazu, braucht es
// eine echte Einwilligung (Vorlage: wa-website, _components/cookie-consent).

const STORAGE_KEY = "sva_cookie_hinweis";
const AENDERUNG = "sva-cookie-hinweis";

let dialogOffen = false;

function benachrichtigen() {
  window.dispatchEvent(new Event(AENDERUNG));
}

function abonnieren(callback: () => void) {
  window.addEventListener(AENDERUNG, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AENDERUNG, callback);
    window.removeEventListener("storage", callback);
  };
}

function hinweisBestaetigt() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function bestaetigen() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    // Ohne localStorage erscheint der Banner beim nächsten Besuch erneut.
  }
  dialogOffen = false;
  benachrichtigen();
}

function dialogOeffnen() {
  dialogOffen = true;
  benachrichtigen();
}

function dialogSchliessen() {
  dialogOffen = false;
  benachrichtigen();
}

const COOKIES = [
  {
    name: "vorstand_token",
    zweck: "Hält die Anmeldung im Vorstandsbereich (/admin). Wird nur nach dem Login gesetzt.",
    dauer: "Bis zum Logout, längstens bis die Sitzung abläuft",
    art: "Cookie",
  },
  {
    name: STORAGE_KEY,
    zweck: "Merkt sich, dass Sie diesen Hinweis gelesen haben.",
    dauer: "Bis Sie Ihre Browserdaten löschen",
    art: "localStorage",
  },
];

function CookieDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={dialogSchliessen}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      aria-labelledby="cookie-dialog-titel"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-sva-gray-800 bg-sva-charcoal-dark p-0 text-sva-gray-200 backdrop:bg-black/70"
    >
      <div className="p-6 sm:p-8">
        <h2 id="cookie-dialog-titel" className="text-xl font-black uppercase text-white">
          Cookie-Einstellungen
        </h2>
        <div className="mt-2 h-1 w-12 bg-sva-gold" />
        <p className="mt-5 text-sm leading-relaxed">
          Wir verwenden keine Analyse-, Tracking- oder Marketing-Dienste. Gespeichert wird nur,
          was für den Betrieb der Seite technisch notwendig ist. Eine Einwilligung ist dafür
          nicht nötig.
        </p>

        <div className="mt-6 rounded-lg border border-sva-gray-800 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-white">Technisch notwendig</span>
            <span className="rounded border border-sva-gold/40 px-2 py-0.5 text-xs text-sva-gold">
              Immer aktiv
            </span>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {COOKIES.map((c) => (
              <li key={c.name} className="rounded-md bg-sva-charcoal p-3">
                <div className="font-mono text-xs text-sva-gold">
                  {c.name} <span className="text-sva-gray-400">({c.art})</span>
                </div>
                <p className="mt-1">{c.zweck}</p>
                <p className="mt-1 text-xs text-sva-gray-400">Speicherdauer: {c.dauer}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/datenschutz"
            onClick={() => ref.current?.close()}
            className="text-sm text-sva-gray-300 underline underline-offset-4 hover:text-white"
          >
            Datenschutzerklärung
          </Link>
          <button
            type="button"
            onClick={bestaetigen}
            className="rounded-lg bg-sva-gold px-5 py-2.5 text-sm font-semibold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
          >
            Verstanden
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function CookieHinweis() {
  const bestaetigt = useSyncExternalStore(abonnieren, hinweisBestaetigt, () => true);
  const offen = useSyncExternalStore(abonnieren, () => dialogOffen, () => false);

  if (offen) return <CookieDialog />;
  if (bestaetigt) return null;

  return (
    <div
      role="region"
      aria-label="Cookie-Hinweis"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sva-gray-800 bg-sva-charcoal-dark/95 px-4 py-4 shadow-[0_-12px_32px_-18px_rgba(0,0,0,0.8)] backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:px-2">
        <p className="text-sm leading-relaxed text-sva-gray-200">
          Diese Website verwendet nur technisch notwendige Cookies. Kein Tracking, keine Werbung.{" "}
          <button
            type="button"
            onClick={dialogOeffnen}
            className="text-sva-gold underline underline-offset-4 hover:text-white"
          >
            Details
          </button>
        </p>
        <button
          type="button"
          onClick={bestaetigen}
          className="shrink-0 rounded-lg bg-sva-gold px-5 py-2.5 text-sm font-semibold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}

export function CookieEinstellungenButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={dialogOeffnen} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
