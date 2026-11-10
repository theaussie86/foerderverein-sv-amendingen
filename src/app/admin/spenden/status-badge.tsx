import { cn } from "@/lib/utils";
import { ANFRAGE_STATUS_LABEL, type AnfrageStatus } from "@/packages/beleganfrage/anzeige";

const FARBE: Record<AnfrageStatus, string> = {
  offen: "border-sva-gold/40 bg-sva-gold/10 text-sva-gold-light",
  ausgestellt: "border-sva-green-light/50 bg-sva-green/20 text-green-300",
  versendet: "border-sva-green-light/50 bg-sva-green/20 text-green-300",
  abgelehnt: "border-sva-gray-600 bg-sva-gray-800 text-sva-gray-300",
};

export function AnfrageStatusBadge({ status, className }: { status: AnfrageStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        FARBE[status],
        className,
      )}
    >
      {ANFRAGE_STATUS_LABEL[status] ?? status}
    </span>
  );
}
