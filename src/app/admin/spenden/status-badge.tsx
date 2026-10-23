import { cn } from "@/lib/utils";
import { BELEG_STATUS_LABEL, type BelegStatus } from "@/lib/spendenbelege";

const FARBE: Record<BelegStatus, string> = {
  offen: "border-sva-gold/40 bg-sva-gold/10 text-sva-gold-light",
  ausgestellt: "border-sva-green-light/50 bg-sva-green/20 text-green-300",
  versendet: "border-sva-gray-600 bg-sva-gray-800 text-sva-gray-300",
};

export function BelegStatusBadge({ status, className }: { status: BelegStatus; className?: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", FARBE[status], className)}>
      {BELEG_STATUS_LABEL[status] ?? status}
    </span>
  );
}
