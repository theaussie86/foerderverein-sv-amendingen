"use server";

import { redirect } from "next/navigation";
import { clientInfo, rateLimit } from "@/lib/request";
import { neuerClient, sessionLoeschen, sessionSetzen } from "@/lib/vorstand-session";

export type LoginZustand =
  | { schritt: "start"; email?: string; fehler?: string }
  | { schritt: "code"; email: string; otpId: string; fehler?: string };

const FENSTER_MS = 15 * 60 * 1000;

// Anmeldung nur per Einmal-Code: erst Code anfordern, dann Code prüfen.
export async function anmelden(_: LoginZustand, formData: FormData): Promise<LoginZustand> {
  const modus = String(formData.get("modus") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const { ip } = await clientInfo();
  const pb = neuerClient();

  if (modus === "code-pruefen") {
    const otpId = String(formData.get("otpId") ?? "");
    const code = String(formData.get("code") ?? "").replace(/\s/g, "");
    if (!rateLimit(`login-code:${ip}`, 10, FENSTER_MS)) {
      return { schritt: "code", email, otpId, fehler: "Zu viele Versuche. Bitte in 15 Minuten erneut probieren." };
    }
    try {
      await pb.collection("vorstand").authWithOTP(otpId, code);
      await sessionSetzen(pb.authStore.token);
    } catch {
      return { schritt: "code", email, otpId, fehler: "Der Code ist falsch oder abgelaufen." };
    }
    redirect("/admin");
  }

  if (!email) return { schritt: "start", fehler: "Bitte deine E-Mail-Adresse eingeben." };

  if (modus === "code-anfordern") {
    if (!rateLimit(`login-otp:${ip}`, 3, FENSTER_MS)) {
      return { schritt: "start", email, fehler: "Zu viele Codes angefordert. Bitte in 15 Minuten erneut probieren." };
    }
    try {
      // PocketBase liefert auch für unbekannte Adressen eine otpId, verrät also nicht, wer Zugang hat.
      const { otpId } = await pb.collection("vorstand").requestOTP(email);
      return { schritt: "code", email, otpId };
    } catch (e) {
      console.error("Anmeldecode konnte nicht angefordert werden", e instanceof Error ? e.message : e);
      return { schritt: "start", email, fehler: "Der Code konnte nicht verschickt werden. Bitte später erneut probieren." };
    }
  }

  return { schritt: "start", email };
}

export async function abmelden(): Promise<void> {
  await sessionLoeschen();
  redirect("/admin/login");
}
