"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { abmelden } from "../actions";
import { Icon } from "./icons";

export function AbmeldenKnopf({ className, nurIcon = false }: { className?: string; nurIcon?: boolean }) {
  return (
    <form action={abmelden}>
      <button type="submit" className={className} aria-label={nurIcon ? "Abmelden" : undefined}>
        <Icon name="abmelden" className="size-5 shrink-0" />
        {!nurIcon && <span>Abmelden</span>}
      </button>
    </form>
  );
}

export function WebseiteLink({ className, nurIcon = false }: { className?: string; nurIcon?: boolean }) {
  return (
    <Link href="/" className={className} aria-label={nurIcon ? "Zur Webseite" : undefined}>
      <Icon name="webseite" className="size-5 shrink-0" />
      {!nurIcon && <span>Zur Webseite</span>}
    </Link>
  );
}

export function Wappen({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- kleines Logo mit fester Größe
  return <img src="/sva-wappen.png" alt="" width={40} height={40} className={className ?? "size-9"} />;
}

// Schublade fürs Handy. Schließt sich beim Seitenwechsel und mit Escape.
export function useSchublade() {
  const [offen, setOffen] = useState(false);
  const pfad = usePathname();
  const [letzterPfad, setLetzterPfad] = useState(pfad);
  if (pfad !== letzterPfad) {
    setLetzterPfad(pfad);
    setOffen(false);
  }
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(false);
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [offen]);
  return { offen, setOffen };
}
