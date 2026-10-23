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

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
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
