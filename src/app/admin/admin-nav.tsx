import Link from "next/link";
import type PocketBase from "pocketbase";
import { offeneBelege } from "@/lib/spendenbelege";
import { cn } from "@/lib/utils";

// Umschalter zwischen den Übersichten im internen Bereich. Zeigt offene Zuwendungsbestätigungen als Zahl.
export async function AdminNav({ pb, aktiv }: { pb: PocketBase; aktiv: "antraege" | "spenden" }) {
  const offen = await offeneBelege(pb);
  const eintraege = [
    { key: "antraege", href: "/admin", label: "Mitgliedsanträge", zahl: null },
    { key: "spenden", href: "/admin/spenden", label: "Spendenbelege", zahl: offen },
  ] as const;

  return (
    <nav aria-label="Bereiche" className="mb-10 flex gap-6 border-b border-sva-gray-700">
      {eintraege.map((e) => (
        <Link
          key={e.key}
          href={e.href}
          aria-current={e.key === aktiv ? "page" : undefined}
          className={cn(
            "-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold uppercase tracking-wide transition-colors",
            e.key === aktiv ? "border-sva-gold text-white" : "border-transparent text-sva-gray-400 hover:text-white",
          )}
        >
          {e.label}
          {!!e.zahl && (
            <span className="rounded-full bg-sva-gold px-2 py-0.5 text-xs font-bold text-sva-charcoal-dark" aria-label={`${e.zahl} offen`}>
              {e.zahl}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
