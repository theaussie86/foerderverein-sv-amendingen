import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-sva-blue">
        <div className="absolute inset-0 bg-gradient-to-br from-sva-blue-dark via-sva-blue to-sva-blue-light opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sva-gold">
              Förderverein SV Amendingen e.V.
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Gemeinsam stark für den Sport in Amendingen
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
              Wir unterstützen den SV Amendingen finanziell und ideell &mdash;
              damit Vereinsarbeit, Jugendförderung und sportliche Erfolge
              weiterhin möglich bleiben.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/spenden"
                className="rounded-lg bg-sva-gold px-8 py-3.5 text-center text-sm font-bold text-sva-blue-dark transition-colors hover:bg-yellow-400"
              >
                Jetzt spenden
              </Link>
              <Link
                href="/mitglied-werden"
                className="rounded-lg border-2 border-white/30 px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Mitglied werden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Warum wir */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
              Unsere Mission
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-sva-gray-600">
              Der Förderverein SV Amendingen hat die Aufgabe, den SV Amendingen
              vor allem in finanzieller Hinsicht zu unterstützen. Vereinsarbeit
              benötigt neben ehrenamtlicher Mithilfe auch finanzielle Mittel.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-sva-gray-200 bg-sva-gray-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sva-blue/10">
                <svg
                  className="h-7 w-7 text-sva-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-sva-gray-900">
                Spenden
              </h3>
              <p className="text-sm leading-relaxed text-sva-gray-600">
                Mit Ihrer Spende ermöglichen Sie wichtige Anschaffungen,
                Platzpflege und Jugendarbeit beim SV Amendingen.
              </p>
            </div>

            <div className="rounded-xl border border-sva-gray-200 bg-sva-gray-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sva-blue/10">
                <svg
                  className="h-7 w-7 text-sva-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-sva-gray-900">
                Mitgliedschaft
              </h3>
              <p className="text-sm leading-relaxed text-sva-gray-600">
                Werden Sie Teil unserer Gemeinschaft und unterstützen Sie den
                Verein durch Ihren Jahresbeitrag.
              </p>
            </div>

            <div className="rounded-xl border border-sva-gray-200 bg-sva-gray-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sva-blue/10">
                <svg
                  className="h-7 w-7 text-sva-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-sva-gray-900">
                Sponsoring
              </h3>
              <p className="text-sm leading-relaxed text-sva-gray-600">
                Als Sponsor oder Partner unterstützen Sie den Verein und
                profitieren von der regionalen Sichtbarkeit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aktuelle Projekte Teaser */}
      <section className="bg-sva-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-sva-gray-900">
                Aktuelle Projekte
              </h2>
              <p className="mt-2 text-sva-gray-600">
                Erfahren Sie, wofür Ihre Unterstützung eingesetzt wird.
              </p>
            </div>
            <Link
              href="/projekte"
              className="hidden text-sm font-semibold text-sva-blue hover:text-sva-blue-light sm:block"
            >
              Alle Projekte &rarr;
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "FC Bayern Jugendcamp",
                desc: "Vom 25.05. bis 29.05.2026 findet das erste FC Bayern Jugendcamp beim SVA statt - eine einzigartige Kooperation.",
              },
              {
                title: "Sportplatzpflege",
                desc: "Regelmäßige Instandhaltung und Verbesserung der Sportanlage für den Trainings- und Spielbetrieb.",
              },
              {
                title: "Jugendförderung",
                desc: "Unterstützung der Jugendabteilungen mit Trainingsausrüstung, Fahrtkostenzuschüssen und mehr.",
              },
            ].map((project) => (
              <div
                key={project.title}
                className="rounded-xl border border-sva-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 h-40 rounded-lg bg-sva-gray-200" />
                <h3 className="mb-2 text-lg font-semibold text-sva-gray-900">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-sva-gray-600">
                  {project.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projekte"
              className="text-sm font-semibold text-sva-blue"
            >
              Alle Projekte &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-sva-blue py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Unterstützen Sie den SV Amendingen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Jede Spende und jede Mitgliedschaft zählt. Helfen Sie uns, den Sport
            in Amendingen zu stärken.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/spenden"
              className="rounded-lg bg-sva-gold px-8 py-3.5 text-sm font-bold text-sva-blue-dark transition-colors hover:bg-yellow-400"
            >
              Jetzt spenden
            </Link>
            <Link
              href="/mitglied-werden"
              className="rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Mitglied werden
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
