import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { dorfmeisterschaft } from "@/lib/dorfmeisterschaft";
import { verein } from "@/lib/verein";

const beschreibung = `Save the Date: Die ${dorfmeisterschaft.titel} findet am ${dorfmeisterschaft.datumLang} auf dem ${dorfmeisterschaft.ort} statt. Für alle ab 6 Jahren.`;

export const metadata: Metadata = {
  title: "Dorfmeisterschaft 2027",
  description: beschreibung,
  openGraph: {
    title: `Save the Date: ${dorfmeisterschaft.titel}`,
    description: beschreibung,
    type: "website",
    locale: "de_DE",
  },
};

const downloadCls =
  "inline-flex items-center justify-center rounded-md border border-sva-gray-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-sva-gold hover:text-sva-gold";

export default function DorfmeisterschaftPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-sva-charcoal-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-sva-green-dark/50 via-sva-charcoal-dark to-sva-charcoal-dark" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="inline-block rounded-sm bg-sva-gold px-3 py-1 text-sm font-black tracking-[0.25em] text-sva-charcoal-dark uppercase">
            Save the Date
          </p>
          <h1 className="mt-6 text-[2rem] leading-[1.05] font-black text-white uppercase sm:text-5xl lg:text-6xl">
            Fußball-
            <br />
            Dorfmeister{"\u00AD"}schaft <span className="text-sva-gold">{dorfmeisterschaft.jahr}</span>
          </h1>
          <p className="mt-6 text-2xl font-black text-sva-gold sm:text-3xl">{dorfmeisterschaft.datumLang}</p>
          <p className="mt-3 text-lg text-sva-gray-200">
            {dorfmeisterschaft.ort} · {dorfmeisterschaft.strasse}, {dorfmeisterschaft.plzOrt}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`${dorfmeisterschaft.pfad}/kalender`}
              download="dorfmeisterschaft-2027.ics"
              className="inline-block w-full rounded-md bg-sva-gold px-8 py-4 text-center text-sm font-black tracking-wide text-sva-charcoal-dark uppercase shadow-lg shadow-sva-gold/10 transition-colors hover:bg-sva-gold-light sm:w-auto"
            >
              In den Kalender eintragen
            </a>
          </div>
        </div>
      </section>

      <section className="bg-sva-charcoal py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl leading-tight font-black tracking-tight text-balance text-white sm:text-4xl">
            Trommelt eure Mannschaft zusammen
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-sva-gray-200">
            <p>
              Familie, Nachbarn, Freunde, Stammtische: Mitmachen kann jeder von 6 Jahren bis unbegrenzt, ob Anfänger,
              Vereinsspieler oder altgedienter Hobbykicker. Talent und Regelkunde braucht es nicht. Fairplay, Spaß und
              viel Lachen stehen im Vordergrund.
            </p>
            <p className="font-bold text-white">
              Uhrzeit, Spielmodus und Anmeldung folgen. Merkt euch den Tag schon jetzt vor!
            </p>
          </div>

          <div className="mt-12 grid items-center gap-8 sm:grid-cols-[minmax(0,14rem)_1fr]">
            <a href="/dorfmeisterschaft/save-the-date.png" className="block">
              <Image
                src="/dorfmeisterschaft/save-the-date.png"
                alt={`Flyer: Save the Date, ${dorfmeisterschaft.titel}, ${dorfmeisterschaft.datumLang}`}
                width={1080}
                height={1350}
                className="w-full rounded-lg shadow-2xl ring-1 shadow-black/40 ring-sva-gray-700"
              />
            </a>
            <div>
              <h3 className="text-xl font-black text-white">Weitersagen</h3>
              <p className="mt-2 text-sva-gray-200">
                Schickt den Flyer in eure WhatsApp-Gruppen oder hängt ihn aus. Je mehr Mannschaften, desto besser.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/dorfmeisterschaft/save-the-date.png" download className={downloadCls}>
                  Bild für WhatsApp (PNG)
                </a>
                <a href="/dorfmeisterschaft/save-the-date-a5.pdf" download className={downloadCls}>
                  Flyer zum Drucken (PDF)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sva-green-dark py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:flex-row sm:text-left lg:px-8">
          <Image src="/sva-wappen.png" alt="" width={96} height={96} className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="text-2xl font-black text-white">Ausgerichtet vom Förderverein</h2>
            <p className="mt-3 leading-relaxed text-sva-gray-100">
              Die Dorfmeisterschaft richtet der {verein.name} aus. Der Erlös kommt der Fußballabteilung des SV
              Amendingen zugute.
            </p>
            <Link
              href="/mitglied-werden"
              className="mt-5 inline-block font-bold text-sva-gold underline-offset-4 hover:underline"
            >
              Mitglied werden und den SVA dauerhaft unterstützen →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
