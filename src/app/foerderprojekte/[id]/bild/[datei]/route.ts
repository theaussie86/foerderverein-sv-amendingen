import { z } from "zod";
import type { Bildgroesse } from "@/packages/foerderprojekt/anzeige";
import { foerderprojekteFuerWebsite } from "@/packages/foerderprojekt/server";

// Öffentliches Bild eines Förderprojekts auf der Startseite. Die Bilder sind in PocketBase nicht geschützt,
// diese Route ist die einzige Sperre: Das Paket liefert nur Förderprojekte, die auf der Startseite stehen,
// und nur mit dem aktuellen Dateinamen. Der Dateiname ändert sich mit jedem neuen Bild, darum darf der
// Browser die Antwort für immer behalten.
const groesseSchema = z
  .enum(["kachel", "quadrat"] as const satisfies readonly Bildgroesse[])
  .nullable()
  .transform((g) => g ?? "kachel");

const nichtGefunden = () => new Response("Nicht gefunden.", { status: 404 });

export async function GET(request: Request, ctx: RouteContext<"/foerderprojekte/[id]/bild/[datei]">) {
  const groesse = groesseSchema.safeParse(new URL(request.url).searchParams.get("groesse"));
  if (!groesse.success) return nichtGefunden();

  const { id, datei } = await ctx.params;
  try {
    const bild = await foerderprojekteFuerWebsite().oeffentlichesBild(id, datei, groesse.data);
    if (!bild) return nichtGefunden();
    return new Response(bild.inhalt, {
      headers: {
        "Content-Type": bild.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("Öffentliches Bild konnte nicht geladen werden", e instanceof Error ? e.message : e);
    return nichtGefunden();
  }
}
