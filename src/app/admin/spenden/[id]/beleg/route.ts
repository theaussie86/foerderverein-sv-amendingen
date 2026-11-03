import type { NextRequest } from "next/server";
import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { belegLaden } from "@/lib/spendenbelege";

// Der verschickte Spendenbeleg ist in PocketBase geschützt, und PocketBase ist nicht öffentlich
// erreichbar. Die Website holt ihn mit dem Token des Vorstands und reicht ihn durch.
// Mit ?download=1 als Anhang, sonst zum Ansehen im Browser.
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/spenden/[id]/beleg">) {
  const session = await angemeldeterVorstand();
  if (!session) return new Response("Nicht angemeldet.", { status: 401 });

  const { id } = await ctx.params;
  const { pb } = session;
  const beleg = await belegLaden(pb, id);
  if (!beleg?.beleg_pdf) return new Response("Nicht gefunden.", { status: 404 });

  const token = await pb.files.getToken();
  const antwort = await fetch(pb.files.getURL(beleg, beleg.beleg_pdf, { token }), { cache: "no-store" });
  if (!antwort.ok || !antwort.body) {
    console.error("Spendenbeleg konnte nicht geladen werden", antwort.status);
    return new Response("Datei konnte nicht geladen werden.", { status: 502 });
  }

  // Derselbe Name wie im Mailanhang, ohne das Zufallskürzel, das PocketBase beim Speichern anhängt.
  const name = `Spendenbeleg_${beleg.ueberwiesen_am.slice(0, 10)}_${beleg.id}.pdf`;
  const art = request.nextUrl.searchParams.has("download") ? "attachment" : "inline";

  return new Response(antwort.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${art}; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
