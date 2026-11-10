"use server";

import { redirect } from "next/navigation";
import { clientInfo, rateLimit } from "@/lib/request";
import { loginSchema } from "@/lib/schemas";
import { neuerClient, sessionLoeschen, sessionSetzen } from "@/lib/vorstand-session";

export type LoginZustand =
  | { schritt: "start"; email?: string; fehler?: string }
  | { schritt: "code"; email: string; otpId: string; fehler?: string };

const FENSTER_MS = 15 * 60 * 1000;

function feld(formData: FormData, name: string): string {
  const wert = formData.get(name);
  return typeof wert === "string" ? wert : "";
}

// Anmeldung nur per Einmal-Code: erst Code anfordern, dann Code prüfen.
export async function anmelden(_: LoginZustand, formData: FormData): Promise<LoginZustand> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fehler = parsed.error.issues[0]?.message ?? "Bitte die Eingaben prüfen.";
    const otpId = feld(formData, "otpId");
    // Im Code-Schritt bleiben, damit die otpId nicht verloren geht.
    return feld(formData, "modus") === "code-pruefen" && otpId
      ? { schritt: "code", email: feld(formData, "email"), otpId, fehler }
      : { schritt: "start", email: feld(formData, "email"), fehler };
  }

  const eingabe = parsed.data;
  const { ip } = await clientInfo();
  const pb = neuerClient();

  if (eingabe.modus === "code-pruefen") {
    const { email, otpId, code } = eingabe;
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

  const { email } = eingabe;
  if (!rateLimit(`login-otp:${ip}`, 3, FENSTER_MS)) {
    return { schritt: "start", email, fehler: "Zu viele Codes angefordert. Bitte in 15 Minuten erneut probieren." };
  }
  try {
    // PocketBase liefert auch für unbekannte Adressen eine otpId, verrät also nicht, wer Zugang hat.
    const { otpId } = await pb.collection("vorstand").requestOTP(email);
    return { schritt: "code", email, otpId };
  } catch (e) {
    console.error("Anmeldecode konnte nicht angefordert werden", e instanceof Error ? e.message : e);
    return {
      schritt: "start",
      email,
      fehler: "Der Code konnte nicht verschickt werden. Bitte später erneut probieren.",
    };
  }
}

export async function abmelden(): Promise<void> {
  await sessionLoeschen();
  redirect("/admin/login");
}
