import type { NextRequest } from "next/server";
import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { antragsverwaltung } from "@/packages/mitgliedsantrag/vorstand";

// Liefert Beitrittserklärung, Mandat oder Unterschrift an den angemeldeten Vorstand aus.
// Mit ?download=1 als Anhang, sonst zum Ansehen im Browser.
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/antraege/[id]/dateien/[feld]">) {
  const session = await angemeldeterVorstand();
  if (!session) return new Response("Nicht angemeldet.", { status: 401 });

  const { id, feld } = await ctx.params;
  const datei = await antragsverwaltung(session.pb).datei(id, feld);
  if (!datei.ok) {
    return datei.grund === "nicht-gefunden"
      ? new Response("Nicht gefunden.", { status: 404 })
      : new Response("Datei konnte nicht geladen werden.", { status: 502 });
  }

  const art = request.nextUrl.searchParams.has("download") ? "attachment" : "inline";
  return new Response(datei.inhalt, {
    headers: {
      "Content-Type": datei.contentType,
      "Content-Disposition": `${art}; filename="${datei.dateiname}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
