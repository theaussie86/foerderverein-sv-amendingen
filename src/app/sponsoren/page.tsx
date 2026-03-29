import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsoren & Partner",
  description: "Unsere Sponsoren und Partner, die den Förderverein SV Amendingen unterstützen.",
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
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Sponsoren & Partner</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-300">
        Ohne unsere Sponsoren und Partner wäre vieles nicht möglich. Herzlichen Dank!
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor) => (
          <div key={sponsor.name} className="flex flex-col items-center rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-8 text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-sva-gray-700">
              <span className="text-xs text-sva-gray-400">Logo</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{sponsor.name}</h3>
            <span className="mt-1 text-sm text-sva-gold">{sponsor.tier}</span>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-lg bg-sva-green p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold uppercase text-white">Werden Sie Sponsor</h2>
        <p className="mx-auto mt-3 max-w-xl text-green-100">
          Sie möchten den SV Amendingen als Sponsor unterstützen? Wir informieren Sie gerne über unsere Sponsoring-Möglichkeiten.
        </p>
        <a href="mailto:foerderverein@sv-amendingen.de" className="mt-6 inline-block rounded-md bg-sva-gold px-8 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light">
          Kontakt aufnehmen
        </a>
      </div>
    </div>
  );
}
