"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Mobile Leiste mit dem Mitglied-Button, sobald der Hero verlassen ist.
// Blendet sich vor dem Seitenende aus, wo der Abschluss-Button ohnehin sichtbar ist.
export function MitgliedLeiste({ beitrag }: { beitrag: number }) {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const pruefen = () => {
      const nachUnten = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setSichtbar(window.scrollY > 700 && nachUnten > 1400);
    };
    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    window.addEventListener("resize", pruefen);
    return () => {
      window.removeEventListener("scroll", pruefen);
      window.removeEventListener("resize", pruefen);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-sva-gray-700 bg-sva-charcoal-dark/95 px-4 py-3 backdrop-blur transition-transform duration-300 ease-out lg:hidden ${
        sichtbar ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!sichtbar}
    >
      <Link
        href="/mitglied-werden"
        tabIndex={sichtbar ? 0 : -1}
        className="block rounded-md bg-sva-gold px-6 py-3.5 text-center text-sm font-black uppercase tracking-wide text-sva-charcoal-dark"
      >
        Mitglied werden · {beitrag} € im Jahr
      </Link>
    </div>
  );
}
