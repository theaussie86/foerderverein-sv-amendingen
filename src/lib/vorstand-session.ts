import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PocketBase, { getTokenPayload, type RecordModel } from "pocketbase";

// Vorstands-Login für /admin. Das Cookie trägt den PocketBase-Token des Vorstandsmitglieds,
// damit Abfragen mit dessen Rechten laufen und die API-Regeln der Collections greifen.

export const SESSION_COOKIE = "vorstand_token";

export type Vorstand = RecordModel & { name: string; email: string; rolle?: string };

export function neuerClient(): PocketBase {
  const url = process.env.POCKETBASE_URL;
  if (!url) throw new Error("POCKETBASE_URL fehlt.");
  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  return pb;
}

export async function sessionSetzen(token: string): Promise<void> {
  const exp = Number(getTokenPayload(token).exp) || 0;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(exp * 1000),
  });
}

export async function sessionLoeschen(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

// Prüft den Token bei PocketBase, damit gelöschte Konten sofort keinen Zugang mehr haben.
export const angemeldeterVorstand = cache(async (): Promise<{ pb: PocketBase; vorstand: Vorstand } | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pb = neuerClient();
  pb.authStore.save(token, null);
  if (!pb.authStore.isValid) return null;
  try {
    const { record } = await pb.collection("vorstand").authRefresh<Vorstand>();
    return { pb, vorstand: record };
  } catch {
    return null;
  }
});

export async function vorstandErforderlich(): Promise<{ pb: PocketBase; vorstand: Vorstand }> {
  const session = await angemeldeterVorstand();
  if (!session) redirect("/admin/login");
  return session;
}
