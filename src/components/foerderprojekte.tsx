import "server-only";
import Image from "next/image";
import { connection } from "next/server";
import {
  jahrUndBetrag,
  oeffentlicheBildUrl,
  type Bildgroesse,
  type Foerderprojekt,
} from "@/packages/foerderprojekt/anzeige";
import { foerderprojekteFuerWebsite } from "@/packages/foerderprojekt/server";

// Abschnitt „Kleine Beiträge, die man sieht“ auf der Startseite: das erste Förderprojekt groß, die
// übrigen als kompakte Liste. Ohne Förderprojekt auf der Startseite fällt der Abschnitt weg.

// Leer ohne PocketBase oder wenn es nicht antwortet. Wird bei jedem Aufruf frisch gelesen: Beim
// Docker-Build gibt es kein PocketBase.
async function startseite(): Promise<Foerderprojekt[]> {
  await connection();
  try {
    return await foerderprojekteFuerWebsite().startseite();
  } catch (e) {
    console.error("Förderprojekte konnten nicht geladen werden", e instanceof Error ? e.message : e);
    return [];
  }
}

function Meta({ p, className = "" }: { p: Foerderprojekt; className?: string }) {
  const text = jahrUndBetrag(p);
  if (!text) return null;
  return <span className={`text-sm font-bold tracking-wide text-sva-gold uppercase ${className}`}>{text}</span>;
}

function Bild({ p, groesse, className }: { p: Foerderprojekt; groesse: Bildgroesse; className: string }) {
  return (
    <div className={`relative overflow-hidden bg-sva-gray-800 ${className}`}>
      <Image src={oeffentlicheBildUrl(p, groesse)} alt="" fill unoptimized className="object-cover" />
    </div>
  );
}

export async function Foerderprojekte({ h2Cls }: { h2Cls: string }) {
  const [erstes, ...rest] = await startseite();
  if (!erstes) return null;

  return (
    <section id="foerderprojekte" className="bg-sva-charcoal py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className={h2Cls}>Kleine Beiträge, die man sieht</h2>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-sva-gray-200">
          Keine großen Schlagzeilen, sondern Unterstützung im Hintergrund. Das haben wir zuletzt möglich gemacht:
        </p>
        <div className="mt-10 space-y-8">
          <article className="grid overflow-hidden rounded-xl bg-sva-charcoal-light ring-1 ring-sva-gray-700 md:grid-cols-2">
            <Bild p={erstes} groesse="kachel" className="aspect-[4/3] md:aspect-auto md:min-h-80" />
            <div className="flex flex-col justify-center p-8">
              <p className="text-xs font-bold tracking-widest text-sva-gray-300 uppercase">Zuletzt gefördert</p>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">{erstes.titel}</h3>
              <Meta p={erstes} className="mt-2 block" />
              <p className="mt-4 text-lg leading-relaxed whitespace-pre-line text-sva-gray-200">
                {erstes.beschreibung}
              </p>
            </div>
          </article>
          {rest.length > 0 && (
            <ul className="divide-y divide-sva-gray-700 border-y border-sva-gray-700">
              {rest.map((p) => (
                <li key={p.id} className="flex gap-5 py-5">
                  <Bild p={p} groesse="quadrat" className="h-20 w-20 shrink-0 rounded-md sm:h-24 sm:w-24" />
                  <div>
                    <h3 className="font-bold text-white">
                      {p.titel} <Meta p={p} className="ml-2 inline text-xs" />
                    </h3>
                    <p className="mt-1 leading-relaxed whitespace-pre-line text-sva-gray-300">{p.beschreibung}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
