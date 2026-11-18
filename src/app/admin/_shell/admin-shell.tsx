"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";
import { BEREICHE, SCHNELLAKTIONEN, aktiverBereich, type ShellDaten } from "./navigation";
import { AbmeldenKnopf, Wappen, WebseiteLink, useSchublade } from "./teile";

// Dunkle Seitenleiste. Offene Vorgänge stehen oben als Ziffern wie auf der Anzeigetafel am Platz.
function Tafel({ zahl, label, href }: { zahl: number; label: string; href: string }) {
  const leer = zahl === 0;
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 rounded-lg bg-black/55 px-3 pt-2.5 pb-2 ring-1 ring-white/[0.07] transition-colors hover:bg-black/75 hover:ring-sva-gold/40"
    >
      <span
        className={cn(
          "font-mono text-[1.75rem] leading-none font-semibold tracking-[0.06em] tabular-nums",
          leer ? "text-sva-gray-600" : "text-sva-gold [text-shadow:0_0_14px_rgb(212_160_23/0.35)]",
        )}
      >
        {String(Math.min(zahl, 99)).padStart(2, "0")}
      </span>
      <span className="text-xs leading-tight text-sva-gray-300 group-hover:text-white">{label}</span>
    </Link>
  );
}

function Inhalt({ daten }: { daten: ShellDaten }) {
  const aktiv = aktiverBereich(usePathname());
  return (
    <div className="flex h-full flex-col gap-7 px-4 py-5">
      <Link href="/admin" className="flex items-center gap-3 px-1">
        <Wappen />
        <span className="leading-tight">
          <span className="block text-sm font-bold text-white">Förderverein</span>
          <span className="block text-xs text-sva-gray-400">Interner Bereich</span>
        </span>
      </Link>

      <section aria-labelledby="zu-erledigen">
        <h2 id="zu-erledigen" className="mb-2 px-1 text-xs font-medium text-sva-gray-400">
          Zu erledigen
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Tafel zahl={daten.offeneBelege} label="Belege offen" href="/admin/spenden?status=offen" />
          <Tafel zahl={daten.neueAntraege} label="Anträge neu" href="/admin?status=eingegangen" />
        </div>
      </section>

      <nav aria-label="Bereiche">
        <ul className="flex flex-col gap-0.5">
          {BEREICHE.map((b) => (
            <li key={b.key}>
              <Link
                href={b.href}
                aria-current={b.key === aktiv ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  b.key === aktiv
                    ? "bg-white/[0.08] font-semibold text-white"
                    : "text-sva-gray-300 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <Icon name={b.icon} className={cn("size-5", b.key === aktiv ? "text-sva-gold" : "text-sva-gray-400")} />
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="schnell">
        <h2 id="schnell" className="mb-1 px-1 text-xs font-medium text-sva-gray-400">
          Schnell anlegen
        </h2>
        <ul className="flex flex-col">
          {SCHNELLAKTIONEN.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sva-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Icon name="plus" className="size-4 text-sva-gray-400" />
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/[0.07] pt-4">
        <p className="truncate px-2.5 text-sm font-medium text-white">{daten.name || daten.email}</p>
        {daten.name && <p className="mb-2 truncate px-2.5 text-xs text-sva-gray-400">{daten.email}</p>}
        <WebseiteLink className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sva-gray-300 hover:bg-white/[0.04] hover:text-white" />
        <AbmeldenKnopf className="flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sva-gray-300 hover:bg-white/[0.04] hover:text-white" />
      </div>
    </div>
  );
}

export function AdminShell({ daten, children }: { daten: ShellDaten; children: React.ReactNode }) {
  const { offen, setOffen } = useSchublade();
  const offeneSumme = daten.offeneBelege + daten.neueAntraege;
  return (
    <div className="min-h-dvh bg-sva-charcoal lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-r border-white/[0.06] bg-sva-charcoal-dark lg:block">
        <Inhalt daten={daten} />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-sva-charcoal-dark px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Wappen className="size-8" />
          <span className="text-sm font-bold text-white">Interner Bereich</span>
        </Link>
        <button
          type="button"
          onClick={() => setOffen(true)}
          aria-expanded={offen}
          aria-controls="admin-schublade"
          className="relative rounded-md p-2 text-white hover:bg-white/10"
        >
          <Icon name="menue" className="size-6" />
          <span className="sr-only">Menü öffnen</span>
          {offeneSumme > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-sva-gold" aria-hidden="true" />
          )}
        </button>
      </div>

      {offen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          id="admin-schublade"
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
        >
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOffen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative h-full w-72 max-w-[85vw] overflow-y-auto bg-sva-charcoal-dark shadow-[8px_0_32px_rgb(0_0_0/0.5)]">
            <button
              type="button"
              onClick={() => setOffen(false)}
              className="absolute top-4 right-3 rounded-md p-2 text-sva-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Icon name="schliessen" className="size-5" />
              <span className="sr-only">Menü schließen</span>
            </button>
            <Inhalt daten={daten} />
          </div>
        </div>
      )}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
