"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/vorstand", label: "Vorstand" },
  { href: "/projekte", label: "Projekte" },
  { href: "/satzung", label: "Satzung" },
  { href: "/sponsoren", label: "Sponsoren" },
  { href: "/spenden", label: "Spenden" },
  { href: "/mitglied-werden", label: "Mitglied werden" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar with logo */}
      <div className="bg-sva-charcoal-dark border-b border-sva-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-sva-green text-lg font-black text-sva-gold">
              FV
            </div>
            <div className="text-center">
              <p className="text-xl font-black uppercase tracking-wider text-white sm:text-2xl">
                Förderverein SV Amendingen
              </p>
              <p className="text-xs uppercase tracking-widest text-sva-gold">
                Gemeinsam für den Sport
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Green navigation bar */}
      <nav className="bg-sva-green border-b border-sva-green-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden items-center justify-center gap-0 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white/90 transition-colors hover:bg-sva-green-light hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center justify-between py-2 lg:hidden">
            <span className="text-sm font-semibold uppercase text-white/90">
              Menü
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-white/90 hover:bg-sva-green-light"
              aria-label="Menü öffnen"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
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

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-sva-green-dark bg-sva-green-dark lg:hidden">
            <div className="mx-auto max-w-7xl px-4 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-white/90 transition-colors hover:bg-sva-green hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 pb-1">
                <Link
                  href="/spenden"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md bg-sva-gold px-4 py-2.5 text-center text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
                >
                  Jetzt spenden
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
