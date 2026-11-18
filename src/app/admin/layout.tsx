import { angemeldeterVorstand } from "@/lib/vorstand-session";
import { beleganfragenFuerVorstand } from "@/packages/beleganfrage/server";
import { mitgliedsantraegeFuerVorstand } from "@/packages/mitgliedsantrag/server";
import type { ShellDaten } from "./_shell/navigation";
import { AdminShell } from "./_shell/admin-shell";

async function zahl(abfrage: () => Promise<number>): Promise<number> {
  try {
    return await abfrage();
  } catch (e) {
    console.error("Zahl für die Seitenleiste konnte nicht geladen werden", e instanceof Error ? e.message : e);
    return 0;
  }
}

// Eigene Shell für den internen Bereich. Ohne Anmeldung (Login, Bestätigen) nur eine schlichte Fläche.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await angemeldeterVorstand();
  if (!session) {
    return <div className="grid min-h-dvh place-items-center bg-sva-charcoal-dark px-4 py-12">{children}</div>;
  }

  const { pb, vorstand } = session;
  const [offeneBelege, neueAntraege] = await Promise.all([
    zahl(async () => (await beleganfragenFuerVorstand(pb).anzahlOffen()) ?? 0),
    zahl(
      async () =>
        (await mitgliedsantraegeFuerVorstand(pb).suchen({ suche: "", status: "eingegangen", seite: 1 })).totalItems,
    ),
  ]);
  const daten: ShellDaten = { name: vorstand.name, email: vorstand.email, offeneBelege, neueAntraege };

  return <AdminShell daten={daten}>{children}</AdminShell>;
}
