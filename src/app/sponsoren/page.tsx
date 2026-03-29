import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsoren & Partner",
  description:
    "Unsere Sponsoren und Partner, die den Förderverein SV Amendingen unterstützen.",
};

const sponsors = [
  { name: "BattleKart Leutkirch", tier: "Partner" },
  { name: "Sponsor 2", tier: "Hauptsponsor" },
  { name: "Sponsor 3", tier: "Partner" },
  { name: "Sponsor 4", tier: "Partner" },
  { name: "Sponsor 5", tier: "Unterstützer" },
  { name: "Sponsor 6", tier: "Unterstützer" },
];

export default function SponsorenPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Sponsoren & Partner
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-600">
        Ohne unsere Sponsoren und Partner wäre vieles nicht möglich. Herzlichen
        Dank für die Unterstützung!
      </p>

      <div className="mt-12">
        <h2 className="mb-6 text-xl font-semibold text-sva-gray-900">
          Unsere Unterstützer
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex flex-col items-center rounded-xl border border-sva-gray-200 bg-white p-8 text-center"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-sva-gray-100">
                <span className="text-xs text-sva-gray-400">Logo</span>
              </div>
              <h3 className="text-lg font-semibold text-sva-gray-900">
                {sponsor.name}
              </h3>
              <span className="mt-1 text-sm text-sva-blue">{sponsor.tier}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-xl bg-sva-blue p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-white">
          Werden Sie Sponsor oder Partner
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-blue-100">
          Sie möchten den SV Amendingen als Sponsor unterstützen? Wir freuen
          uns über Ihre Kontaktaufnahme und informieren Sie gerne über unsere
          Sponsoring-Möglichkeiten.
        </p>
        <a
          href="mailto:foerderverein@sv-amendingen.de"
          className="mt-6 inline-block rounded-lg bg-sva-gold px-8 py-3 text-sm font-bold text-sva-blue-dark transition-colors hover:bg-yellow-400"
        >
          Kontakt aufnehmen
        </a>
      </div>
    </div>
  );
}
