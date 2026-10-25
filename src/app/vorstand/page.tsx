import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vorstand",
  description: "Der Vorstand des Förderverein SV Amendingen e.V.",
};

const members = [
  { name: "Manuel Rothermel", role: "1. Vorstand" },
  { name: "Christian Geiger", role: "2. Vorstand" },
  { name: "Patrick Natterer", role: "Kassierer" },
  { name: "Kevin Schmid", role: "Schriftführer" },
  { name: "Stefan Aichmann", role: "Beisitzer" },
  { name: "Jenny Aichmann", role: "Beisitzerin" },
  { name: "Christoph Weissteiner", role: "Beisitzer" },
];

export default function VorstandPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Vorstand</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-300">
        Unser ehrenamtlicher Vorstand kümmert sich um die Belange des Fördervereins.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <div key={member.name} className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sva-green/20">
              <svg className="h-10 w-10 text-sva-green" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="mt-1 text-sm font-medium text-sva-gold">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
