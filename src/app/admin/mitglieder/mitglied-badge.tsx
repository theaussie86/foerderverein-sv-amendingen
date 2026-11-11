import { cn } from "@/lib/utils";
import { ENDE_GRUND_LABEL, istAktiv, type Listeneintrag } from "@/packages/mitglied/anzeige";

// Aktiv, auch wenn ein Ende schon eingetragen ist (etwa Austritt zum 31.12.). Danach der Grund.
export function MitgliedBadge({
  m,
  heute,
  className,
}: {
  m: Pick<Listeneintrag, "endeDatum" | "endeGrund">;
  heute: string;
  className?: string;
}) {
  const aktiv = istAktiv(m, heute);
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        aktiv
          ? "border-sva-green-light/50 bg-sva-green/20 text-green-300"
          : "border-sva-gray-600 bg-sva-gray-800 text-sva-gray-300",
        className,
      )}
    >
      {aktiv
        ? m.endeDatum
          ? "Aktiv, Ende eingetragen"
          : "Aktiv"
        : m.endeGrund
          ? ENDE_GRUND_LABEL[m.endeGrund]
          : "Beendet"}
    </span>
  );
}

// Heute in deutscher Zeit als YYYY-MM-DD.
export function heute(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}
