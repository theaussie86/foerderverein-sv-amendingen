"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Startseite" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/vorstand", label: "Vorstand" },
  { href: "/projekte", label: "Projekte" },
  { href: "/sponsoren", label: "Sponsoren" },
  { href: "/spenden", label: "Spenden" },
  { href: "/mitglied-werden", label: "Mitglied werden" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sva-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sva-blue text-sm font-bold text-white">
            FV
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight text-sva-blue">
              Förderverein
            </p>
            <p className="text-xs leading-tight text-sva-gray-600">
              SV Amendingen e.V.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-sva-gray-700 transition-colors hover:bg-sva-gray-100 hover:text-sva-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/spenden"
            className="rounded-lg bg-sva-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sva-blue-light"
          >
            Jetzt spenden
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-sva-gray-700 lg:hidden"
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

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-sva-gray-200 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-sva-gray-700 transition-colors hover:bg-sva-gray-100 hover:text-sva-blue"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/spenden"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg bg-sva-blue px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-sva-blue-light"
              >
                Jetzt spenden
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
