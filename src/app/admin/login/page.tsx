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
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black uppercase text-white">Vorstand-Login</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-sva-gray-300">Interner Bereich für den Vorstand des Fördervereins.</p>
      <LoginFormular />
    </div>
  );
}
