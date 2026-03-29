import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Erfahren Sie mehr über den Förderverein SV Amendingen e.V., unsere Geschichte und unsere Mission.",
};

export default function UeberUnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">
        Über den Förderverein
      </h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <div className="mt-8 space-y-6 leading-relaxed text-sva-gray-200">
        <p>
          Der <strong className="text-white">Förderverein SV Amendingen e.V.</strong> wurde gegründet,
          um den SV Amendingen in seiner sportlichen und gesellschaftlichen
          Arbeit zu unterstützen. Als eigenständiger Verein sammeln wir
          finanzielle Mittel durch Mitgliedsbeiträge, Spenden und
          Sponsoring-Partnerschaften.
        </p>
        <p>
          Vereinsarbeit lebt von ehrenamtlichem Engagement &mdash; aber sie
          benötigt auch finanzielle Mittel. Ob Jugendförderung,
          Sportplatzpflege, neue Trainingsausrüstung oder besondere Projekte wie
          das FC Bayern Jugendcamp: Der Förderverein stellt sicher, dass der SV
          Amendingen die nötigen Ressourcen hat.
        </p>

        <h2 className="pt-4 text-2xl font-bold text-white">
          Unsere Ziele
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sva-gray-200">
          <li>Finanzielle Unterstützung des SV Amendingen in allen Abteilungen</li>
          <li>Förderung der Jugendarbeit und des Breitensports</li>
          <li>Unterstützung bei der Instandhaltung und Verbesserung der Sportanlagen</li>
          <li>Organisation und Mitfinanzierung besonderer Vereinsprojekte</li>
          <li>Stärkung des Gemeinschaftsgefühls in Amendingen</li>
        </ul>

        <h2 className="pt-4 text-2xl font-bold text-white">
          Der SV Amendingen
        </h2>
        <p>
          Der SV Amendingen blickt auf eine lange Fußballtradition seit 1946
          zurück. Mit zahlreichen Jugend- und Erwachsenenmannschaften ist der
          Verein ein fester Bestandteil des sportlichen Lebens in Amendingen und
          Umgebung. Als erster und einziger Verein in der Region konnte der SVA
          eine Kooperation mit dem FC Bayern München eingehen.
        </p>
      </div>
    </div>
  );
}
