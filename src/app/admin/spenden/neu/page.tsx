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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link href="/admin/spenden" className="text-sm font-medium text-sva-gold hover:text-sva-gold-light">
        ← Alle Spendenbelege
      </Link>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">Beleganfrage erfassen</h1>
      <p className="mt-4 text-sva-gray-300">
        Für Spender, die sich nicht über die Website melden, etwa per WhatsApp. Ist die Spende noch nicht eingegangen,
        nur erfassen und später ausstellen.
      </p>
      <ErfassenFormular />
    </div>
  );
}
