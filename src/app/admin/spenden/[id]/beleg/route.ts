import type { NextRequest } from "next/server";
import { beleganfragenFuerVorstand } from "@/packages/beleganfrage/server";
import { angemeldeterVorstand } from "@/lib/vorstand-session";

// Reicht den abgelegten Spendenbeleg durch. Mit ?download=1 als Anhang, sonst zum Ansehen im Browser.
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/spenden/[id]/beleg">) {
  const session = await angemeldeterVorstand();
  if (!session) return new Response("Nicht angemeldet.", { status: 401 });

  const { id } = await ctx.params;
  const beleg = await beleganfragenFuerVorstand(session.pb).belegPdf(id);
  if (!beleg.ok) {
    return beleg.grund === "nicht-gefunden"
      ? new Response("Nicht gefunden.", { status: 404 })
      : new Response("Datei konnte nicht geladen werden.", { status: 502 });
  }

  const art = request.nextUrl.searchParams.has("download") ? "attachment" : "inline";
  return new Response(beleg.inhalt, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${art}; filename="${beleg.dateiname}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
