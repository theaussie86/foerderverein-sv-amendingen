import type { Metadata } from "next";
import Link from "next/link";
import { neuerClient } from "@/lib/vorstand-session";

export const metadata: Metadata = {
  title: "E-Mail bestätigen",
  robots: { index: false, follow: false },
};

// Ziel des Links aus der Verification-Mail von PocketBase. PocketBase selbst ist
// nicht öffentlich erreichbar, deshalb reicht die Seite den Token serverseitig weiter.
export default async function BestaetigenPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  let bestaetigt = false;
  if (token) {
    try {
      await neuerClient().collection("vorstand").confirmVerification(token);
      bestaetigt = true;
    } catch (e) {
      console.error("E-Mail-Bestätigung fehlgeschlagen", e instanceof Error ? e.message : e);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element -- kleines Logo mit fester Größe */}
      <img src="/sva-wappen.png" alt="" width={56} height={56} className="mb-6 size-14" />
      <h1 className="text-2xl font-bold tracking-tight text-white">E-Mail bestätigen</h1>
      <p className="mt-4 text-sva-gray-300">
        {bestaetigt
          ? "Danke, deine E-Mail-Adresse ist bestätigt."
          : "Der Link ist ungültig oder abgelaufen. Bitte wende dich an den Vorstand."}
      </p>
      <Link
        href="/admin/login"
        className="mt-8 inline-block text-sm font-medium text-sva-gold hover:text-sva-gold-light"
      >
        Zum Vorstand-Login
      </Link>
    </div>
  );
}
