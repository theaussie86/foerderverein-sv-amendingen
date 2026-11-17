import type { NextRequest } from "next/server";
import { mitgliederExportSchema } from "@/lib/schemas";
import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { mitgliederFuerVorstand } from "@/packages/mitglied/server";

// CSV-Export der Mitgliederliste: dieselben Mitglieder wie bei Suche und Filter der Liste, über alle Seiten.
export async function GET(request: NextRequest) {
  const session = await angemeldeterVorstand();
  if (!session) return new Response("Nicht angemeldet.", { status: 401 });

  const sp = request.nextUrl.searchParams;
  const { q, filter, spalte } = mitgliederExportSchema.parse({
    q: sp.get("q") ?? undefined,
    filter: sp.get("filter") ?? undefined,
    spalte: sp.getAll("spalte"),
  });

  try {
    const { inhalt, dateiname } = await mitgliederFuerVorstand(session.pb).exportieren({ suche: q, filter }, spalte);
    return new Response(inhalt, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${dateiname}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("CSV-Export fehlgeschlagen", e instanceof Error ? e.message : e);
    return new Response("Mitglieder konnten nicht geladen werden.", { status: 502 });
  }
}
