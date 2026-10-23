"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/vorstand", label: "Vorstand" },
  { href: "/spenden", label: "Spenden" },
];

const mitgliedLink = { href: "/mitglied-werden", label: "Mitglied werden" };

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const aktiv = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar with logo, auf dem Handy mit Menü-Button */}
      <div className="bg-sva-charcoal-dark border-b border-sva-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:justify-center lg:px-8 lg:py-4">
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <img src="/sva-wappen.png" alt="Wappen SV Amendingen" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12" />
            <div className="lg:text-center">
              <p className="text-base font-black uppercase tracking-wider text-white sm:text-2xl">
                Förderverein SV Amendingen
              </p>
              <p className="text-xs uppercase tracking-widest text-sva-gold">
                Gemeinsam für den Sport
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="shrink-0 rounded-md p-2.5 text-white/90 hover:bg-sva-charcoal-light lg:hidden"
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden border-b border-sva-green-dark bg-sva-green lg:block" aria-label="Hauptnavigation">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-8 py-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktiv(item.href)}
              className="rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white/90 transition-colors hover:bg-sva-green-dark hover:text-white aria-[current=page]:bg-sva-green-dark aria-[current=page]:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={mitgliedLink.href}
            aria-current={aktiv(mitgliedLink.href)}
            className="ml-3 rounded-full bg-sva-gold px-5 py-2 text-sm font-black uppercase tracking-wide text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
          >
            {mitgliedLink.label}
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav id="mobile-navigation" className="border-b border-sva-green-dark bg-sva-green-dark lg:hidden" aria-label="Hauptnavigation">
          <div className="mx-auto max-w-7xl px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv(item.href)}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-white/90 transition-colors hover:bg-sva-green hover:text-white aria-[current=page]:bg-sva-green aria-[current=page]:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Link
                href={mitgliedLink.href}
                aria-current={aktiv(mitgliedLink.href)}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md bg-sva-gold px-4 py-3 text-center text-sm font-black uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
              >
                {mitgliedLink.label}
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
