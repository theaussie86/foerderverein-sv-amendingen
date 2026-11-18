import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { LoginFormular } from "./login-formular";

export const metadata: Metadata = {
  title: "Vorstand-Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await angemeldeterVorstand()) redirect("/admin");

  return (
    <div className="w-full max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element -- kleines Logo mit fester Größe */}
      <img src="/sva-wappen.png" alt="" width={56} height={56} className="mb-6 size-14" />
      <h1 className="text-2xl font-bold tracking-tight text-white">Vorstand-Login</h1>
      <p className="mt-4 text-sva-gray-300">Interner Bereich für den Vorstand des Fördervereins.</p>
      <LoginFormular />
    </div>
  );
}
