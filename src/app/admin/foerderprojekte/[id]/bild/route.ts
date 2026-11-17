import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { foerderprojekteFuerVorstand } from "@/packages/foerderprojekt/server";

// Kleines quadratisches Vorschaubild für die Liste im internen Bereich. Die URL trägt den
// Dateinamen als ?v=, ein neues Bild hat also eine neue URL.
export async function GET(_request: Request, ctx: RouteContext<"/admin/foerderprojekte/[id]/bild">) {
  if (!(await angemeldeterVorstand())) return new Response("Nicht angemeldet.", { status: 401 });

  const { id } = await ctx.params;
  const bild = await foerderprojekteFuerVorstand().bild(id, "quadrat");
  if (!bild) return new Response("Nicht gefunden.", { status: 404 });

  return new Response(bild.inhalt, {
    headers: {
      "Content-Type": bild.contentType,
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
