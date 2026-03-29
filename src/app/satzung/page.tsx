import type { Metadata } from "next";

export const metadata: Metadata = { title: "Satzung", description: "Satzung des Förderverein SV Amendingen e.V." };

export default function SatzungPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Vereinssatzung</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-lg text-sva-gray-300">Die Satzung regelt die Grundlagen, Ziele und Organisation des Vereins.</p>

      <div className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sva-green/20">
            <svg className="h-6 w-6 text-sva-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Satzung als PDF</h2>
            <p className="mt-1 text-sm text-sva-gray-300">Die aktuelle Satzung steht hier zum Download bereit.</p>
            <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-md bg-sva-green px-5 py-2.5 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Satzung herunterladen (PDF)
            </button>
            <p className="mt-3 text-xs text-sva-gray-400">Die Satzungs-PDF wird in Kürze hochgeladen.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-8">
        <h2 className="text-lg font-semibold text-white">Auszug aus der Satzung</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-sva-gray-200">
          <div>
            <h3 className="font-semibold text-sva-gold">§ 1 Name und Sitz</h3>
            <p>Der Verein führt den Namen &bdquo;Förderverein SV Amendingen e.V.&ldquo; Er hat seinen Sitz in Memmingen/Amendingen.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sva-gold">§ 2 Zweck</h3>
            <p>Zweck des Vereins ist die ideelle und finanzielle Förderung des SV Amendingen, insbesondere der Jugendarbeit und der Sportanlagen.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sva-gold">§ 3 Gemeinnützigkeit</h3>
            <p>Der Verein verfolgt ausschließlich und unmittelbar gemeinnützige Zwecke im Sinne der Abgabenordnung.</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-sva-gray-400">Platzhalter-Auszug. Die vollständige Satzung wird als PDF bereitgestellt.</p>
      </div>
    </div>
  );
}
