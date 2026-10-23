import type { Metadata } from "next";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { abmelden } from "./actions";

export const metadata: Metadata = {
  title: "Interner Bereich",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { vorstand } = await vorstandErforderlich();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Interner Bereich</h1>
          <div className="mt-2 h-1 w-16 bg-sva-gold" />
          <p className="mt-4 text-sva-gray-300">Angemeldet als {vorstand.name || vorstand.email}.</p>
        </div>
        <form action={abmelden}>
          <button type="submit" className="rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal-light">
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
