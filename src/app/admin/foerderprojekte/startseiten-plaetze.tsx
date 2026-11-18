import Image from "next/image";
import Link from "next/link";
import {
  jahrUndBetrag,
  STARTSEITE_PLAETZE,
  type Foerderprojekt,
  type Liste,
  type Startseitenaktion,
} from "@/packages/foerderprojekt/anzeige";
import { FoerderprojektPlatzhalter } from "@/components/foerderprojekt-platzhalter";
import { foerderprojektStartseite } from "./actions";
import { FoerderprojektFormular } from "./foerderprojekt-formular";

// null ohne eigenes Bild: Dann steht das Standardbild da.
const bildUrl = (p: Foerderprojekt) =>
  p.bild ? `/admin/foerderprojekte/${p.id}/bild?v=${encodeURIComponent(p.bild)}` : null;

const pfeil =
  "rounded border border-sva-gray-600 px-2.5 py-1 text-sva-gray-300 transition-colors hover:bg-sva-gray-700 disabled:opacity-30 disabled:hover:bg-transparent";

// Ein Knopf ist ein eigenes Formular, damit es ohne JavaScript geht.
function Knopf(props: {
  id: string;
  aktion: Startseitenaktion;
  label?: string;
  disabled?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={foerderprojektStartseite.bind(null, { id: props.id, aktion: props.aktion })}>
      <button type="submit" aria-label={props.label} disabled={props.disabled} className={props.className}>
        {props.children}
      </button>
    </form>
  );
}

// Variante B aus #78: oben die Plätze der Startseite mit Pfeilen, darunter die übrigen.
// Das Formular zum Bearbeiten klappt an Ort und Stelle auf (?bearbeiten=id).
export function StartseitenPlaetze({ liste, bearbeiten }: { liste: Liste; bearbeiten: string | undefined }) {
  const oben = liste.startseite;

  function zeile(p: Foerderprojekt, platz?: number) {
    const unterzeile = jahrUndBetrag(p);
    const offen = bearbeiten === p.id;
    const bild = bildUrl(p);
    return (
      <li key={p.id} className="bg-sva-charcoal-light">
        <div className="flex flex-wrap items-center gap-4 p-4">
          {platz !== undefined && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sva-gold font-black text-sva-charcoal-dark">
              {platz + 1}
            </span>
          )}
          {bild ? (
            <Image
              src={bild}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 shrink-0 rounded-md bg-sva-gray-800 object-cover"
            />
          ) : (
            <FoerderprojektPlatzhalter titel={p.titel} className="h-16 w-16 shrink-0 rounded-md" />
          )}
          <Link
            href={offen ? "/admin/foerderprojekte" : `/admin/foerderprojekte?bearbeiten=${p.id}`}
            className="min-w-0 flex-1"
          >
            <span className="block truncate font-semibold text-white hover:underline">{p.titel}</span>
            <span className="text-sm text-sva-gray-400">{unterzeile || "ohne Jahr und Betrag"}</span>
          </Link>
          {platz !== undefined ? (
            <div className="flex items-center gap-1">
              <Knopf id={p.id} aktion="hoch" label="Nach oben" disabled={platz === 0} className={pfeil}>
                ↑
              </Knopf>
              <Knopf
                id={p.id}
                aktion="runter"
                label="Nach unten"
                disabled={platz === oben.length - 1}
                className={pfeil}
              >
                ↓
              </Knopf>
              <Knopf id={p.id} aktion="entfernen" className="ml-3 text-sm text-sva-gray-400 hover:text-white">
                Von Startseite nehmen
              </Knopf>
            </div>
          ) : (
            <Knopf
              id={p.id}
              aktion="aufnehmen"
              disabled={liste.voll}
              className="rounded-md border border-sva-gold px-3 py-1.5 text-sm font-semibold text-sva-gold transition-colors hover:bg-sva-gold hover:text-sva-charcoal-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sva-gold"
            >
              Auf die Startseite
            </Knopf>
          )}
        </div>
        {offen && (
          <div className="border-t border-sva-gray-700 p-4">
            <FoerderprojektFormular projekt={p} bildUrl={bild} startseiteGesperrt={liste.voll && !p.startseite} />
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-sm font-bold tracking-widest text-sva-gold uppercase">
          Auf der Startseite ({oben.length} von {STARTSEITE_PLAETZE} Plätzen)
        </h2>
        <ul className="mt-3 divide-y divide-sva-gray-700 overflow-hidden rounded-lg border border-sva-gray-700">
          {oben.map((p, i) => zeile(p, i))}
          {Array.from({ length: Math.max(0, STARTSEITE_PLAETZE - oben.length) }, (_, k) => (
            <li key={`frei-${k}`} className="p-4 text-sm text-sva-gray-400 italic">
              Platz {oben.length + k + 1} frei
            </li>
          ))}
        </ul>
        {oben.length === 0 && (
          <p className="mt-2 text-sm text-sva-gray-400">
            Kein Förderprojekt ausgewählt: Der Abschnitt fehlt auf der Startseite.
          </p>
        )}
      </section>
      <section>
        <h2 className="text-sm font-bold tracking-widest text-sva-gray-400 uppercase">Weitere Förderprojekte</h2>
        {liste.weitere.length === 0 ? (
          <p className="mt-3 text-sm text-sva-gray-400">Keine weiteren Förderprojekte.</p>
        ) : (
          <ul className="mt-3 divide-y divide-sva-gray-700 overflow-hidden rounded-lg border border-sva-gray-700">
            {liste.weitere.map((p) => zeile(p))}
          </ul>
        )}
      </section>
    </div>
  );
}
