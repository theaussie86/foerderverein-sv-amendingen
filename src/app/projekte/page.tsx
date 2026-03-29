import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projekte",
  description:
    "Aktuelle und vergangene Projekte des Förderverein SV Amendingen e.V.",
};

const projects = [
  {
    title: "FC Bayern Jugendcamp 2026",
    status: "Aktuell",
    description:
      "Vom 25.05. bis 29.05.2026 findet das erste FC Bayern Jugendcamp beim SVA statt. Als erster und einziger Verein in der Region hat der SV Amendingen eine Kooperation mit dem deutschen Rekordmeister geschlossen. Ein einzigartiges Erlebnis für unsere Jugendspieler.",
  },
  {
    title: "Sportplatzpflege & Instandhaltung",
    status: "Laufend",
    description:
      "Regelmäßige Pflege und Verbesserung der Sportanlage in Amendingen. Dazu gehören Rasenpflege, Markierungen, Tornetze und die Instandhaltung der Umkleidekabinen.",
  },
  {
    title: "Jugendförderung",
    status: "Laufend",
    description:
      "Unterstützung aller Jugendabteilungen mit Trainingsausrüstung, Fahrtkostenzuschüssen zu Auswärtsspielen und Trainingsmaterialien. Damit jedes Kind unabhängig vom Geldbeutel Fußball spielen kann.",
  },
  {
    title: "Trainingsausrüstung Saison 2025/26",
    status: "Abgeschlossen",
    description:
      "Neue Trainingsausrüstung und Trikots für die Jugendmannschaften des SV Amendingen. Finanziert durch Spenden und Mitgliedsbeiträge des Fördervereins.",
  },
];

export default function ProjektePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Unsere Projekte
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-600">
        Erfahren Sie, wofür Ihre Spenden und Beiträge eingesetzt werden.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.title}
            className="rounded-xl border border-sva-gray-200 bg-white overflow-hidden"
          >
            <div className="h-48 bg-sva-gray-200" />
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    project.status === "Aktuell"
                      ? "bg-green-100 text-green-700"
                      : project.status === "Laufend"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-sva-gray-100 text-sva-gray-600"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-sva-gray-900">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-sva-gray-600">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
