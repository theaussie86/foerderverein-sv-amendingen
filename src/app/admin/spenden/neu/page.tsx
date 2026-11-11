import type { Metadata } from "next";
import Link from "next/link";
import { vorstandErforderlich } from "@/lib/vorstand-session";
import { ErfassenFormular } from "./erfassen-formular";

export const metadata: Metadata = {
  title: "Beleganfrage erfassen",
  robots: { index: false, follow: false },
};

export default async function BeleganfrageErfassenPage() {
  await vorstandErforderlich();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/admin/spenden" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Spendenbelege
      </Link>
      <h1 className="mt-6 text-3xl font-black text-white uppercase sm:text-4xl">Beleganfrage erfassen</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-sva-gray-300">
        Für Spender, die sich nicht über die Website melden, etwa per WhatsApp. Ist die Spende noch nicht auf dem
        Vereinskonto, nur erfassen und später ausstellen.
      </p>
      <ErfassenFormular />
    </div>
  );
}
