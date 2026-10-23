import type { NextRequest } from "next/server";
import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { antragLaden, istDateifeld } from "@/lib/antraege";

// Die Dateien sind in PocketBase geschützt, und PocketBase ist nicht öffentlich erreichbar.
// Die Website holt sie deshalb mit dem Token des Vorstands und reicht sie durch.
// Mit ?download=1 als Anhang, sonst zum Ansehen im Browser.
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/antraege/[id]/dateien/[feld]">) {
  const session = await angemeldeterVorstand();
  if (!session) return new Response("Nicht angemeldet.", { status: 401 });

  const { id, feld } = await ctx.params;
  if (!istDateifeld(feld)) return new Response("Nicht gefunden.", { status: 404 });

  const { pb } = session;
  const antrag = await antragLaden(pb, id);
  const datei = antrag?.[feld];
  if (!antrag || !datei) return new Response("Nicht gefunden.", { status: 404 });

  const token = await pb.files.getToken();
  const antwort = await fetch(pb.files.getURL(antrag, datei, { token }), { cache: "no-store" });
  if (!antwort.ok || !antwort.body) {
    console.error("Datei konnte nicht geladen werden", feld, antwort.status);
    return new Response("Datei konnte nicht geladen werden.", { status: 502 });
  }

  const endung = datei.slice(datei.lastIndexOf("."));
  const name = `${feld === "unterschrift" ? "unterschrift" : feld.replace("_pdf", "")}-${antrag.mandatsreferenz}${endung}`;
  const art = request.nextUrl.searchParams.has("download") ? "attachment" : "inline";

  return new Response(antwort.body, {
    headers: {
      "Content-Type": antwort.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": `${art}; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
