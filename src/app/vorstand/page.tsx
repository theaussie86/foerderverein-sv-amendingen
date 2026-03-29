import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vorstand",
  description: "Der Vorstand des Förderverein SV Amendingen e.V.",
};

const members = [
  {
    name: "Max Mustermann",
    role: "1. Vorstand",
    description: "Leitet den Förderverein und koordiniert alle Aktivitäten.",
  },
  {
    name: "Erika Musterfrau",
    role: "2. Vorstand",
    description: "Stellvertretende Vorsitzende und Ansprechpartnerin für Sponsoren.",
  },
  {
    name: "Thomas Beispiel",
    role: "Kassier",
    description: "Verantwortlich für die Finanzen und Buchhaltung des Vereins.",
  },
  {
    name: "Anna Schmidt",
    role: "Schriftführerin",
    description: "Zuständig für Protokolle, Korrespondenz und Vereinskommunikation.",
  },
];

export default function VorstandPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Vorstand
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-600">
        Unser ehrenamtlicher Vorstand kümmert sich um die Belange des
        Fördervereins.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <div
            key={member.name}
            className="rounded-xl border border-sva-gray-200 bg-white p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sva-blue/10">
              <svg
                className="h-10 w-10 text-sva-blue/40"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-sva-gray-900">
              {member.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-sva-blue">
              {member.role}
            </p>
            <p className="mt-3 text-sm text-sva-gray-600">
              {member.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-sva-gray-200 bg-sva-gray-50 p-8">
        <p className="text-sm text-sva-gray-600">
          <strong>Hinweis:</strong> Die hier gezeigten Namen sind Platzhalter.
          Die tatsächlichen Vorstandsmitglieder werden in Kürze ergänzt.
        </p>
      </div>
    </div>
  );
}
