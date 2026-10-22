import "server-only";
import { headers } from "next/headers";

export async function clientInfo(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unbekannt";
  return { ip, userAgent: h.get("user-agent") ?? "unbekannt" };
}

export function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

// Einfache Begrenzung pro IP im Speicher. Reicht für einen einzelnen Container.
const zugriffe = new Map<string, number[]>();

export function rateLimit(ip: string, max: number, fensterMs: number): boolean {
  const jetzt = Date.now();
  const liste = (zugriffe.get(ip) ?? []).filter((t) => jetzt - t < fensterMs);
  if (liste.length >= max) return false;
  liste.push(jetzt);
  zugriffe.set(ip, liste);
  return true;
}
