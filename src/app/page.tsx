import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-sva-charcoal-dark">
        <div className="absolute inset-0 bg-gradient-to-b from-sva-charcoal-dark via-sva-charcoal to-sva-charcoal-dark opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-sva-gold">
              Förderverein SV Amendingen e.V.
            </p>
            <h1 className="text-4xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
              Gemeinsam stark für den Sport
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sva-gray-300 sm:text-xl">
              Wir unterstützen den SV Amendingen finanziell und ideell &mdash;
              damit Vereinsarbeit, Jugendförderung und sportliche Erfolge
              weiterhin möglich bleiben.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/spenden"
                className="rounded-md bg-sva-gold px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
              >
                Jetzt spenden
              </Link>
              <Link
                href="/mitglied-werden"
                className="rounded-md border-2 border-sva-green bg-sva-green/20 px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-sva-green hover:text-white"
              >
                Mitglied werden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-sva-charcoal py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">
              Unsere Mission
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 bg-sva-gold" />
            <p className="mt-6 text-lg leading-relaxed text-sva-gray-300">
              Der Förderverein SV Amendingen hat die Aufgabe, den SV Amendingen
              vor allem in finanzieller Hinsicht zu unterstützen. Vereinsarbeit
              benötigt neben ehrenamtlicher Mithilfe auch finanzielle Mittel.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Spenden",
                desc: "Mit Ihrer Spende ermöglichen Sie wichtige Anschaffungen, Platzpflege und Jugendarbeit beim SV Amendingen.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                ),
              },
              {
                title: "Mitgliedschaft",
                desc: "Werden Sie Teil unserer Gemeinschaft und unterstützen Sie den Verein durch Ihren Jahresbeitrag.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                ),
              },
              {
                title: "Sponsoring",
                desc: "Als Sponsor oder Partner unterstützen Sie den Verein und profitieren von der regionalen Sichtbarkeit.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0"
                  />
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sva-green/20">
                  <svg
                    className="h-7 w-7 text-sva-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold uppercase text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-sva-gray-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aktuelle Projekte */}
      <section className="bg-sva-charcoal-dark py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase text-white">
                Aktuelle Projekte
              </h2>
              <div className="mt-2 h-1 w-16 bg-sva-gold" />
              <p className="mt-4 text-sva-gray-300">
                Erfahren Sie, wofür Ihre Unterstützung eingesetzt wird.
              </p>
            </div>
            <Link
              href="/projekte"
              className="hidden text-sm font-semibold text-sva-gold hover:text-sva-gold-light sm:block"
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
                className="overflow-hidden rounded-lg border border-sva-gray-700 bg-sva-charcoal-light transition-colors hover:border-sva-green"
              >
                <div className="h-40 bg-sva-gray-700" />
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-sva-gray-300">
                    {project.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projekte"
              className="text-sm font-semibold text-sva-gold"
            >
              Alle Projekte &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-sva-green py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">
            Unterstützen Sie den SV Amendingen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-green-100">
            Jede Spende und jede Mitgliedschaft zählt. Helfen Sie uns, den Sport
            in Amendingen zu stärken.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/spenden"
              className="rounded-md bg-sva-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
            >
              Jetzt spenden
            </Link>
            <Link
              href="/mitglied-werden"
              className="rounded-md border-2 border-white/30 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Mitglied werden
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
