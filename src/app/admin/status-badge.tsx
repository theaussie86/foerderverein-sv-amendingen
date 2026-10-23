import { cn } from "@/lib/utils";
import { STATUS_LABEL, type Status } from "@/lib/antraege";

const FARBE: Record<Status, string> = {
  eingegangen: "border-sva-gold/40 bg-sva-gold/10 text-sva-gold-light",
  angenommen: "border-sva-green-light/50 bg-sva-green/20 text-green-300",
  abgelehnt: "border-red-500/40 bg-red-500/10 text-red-300",
  ausgetreten: "border-sva-gray-600 bg-sva-gray-800 text-sva-gray-300",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", FARBE[status], className)}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
