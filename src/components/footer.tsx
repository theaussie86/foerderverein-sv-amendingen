import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-sva-gray-800 bg-sva-charcoal-dark text-sva-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Verein */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sva-gold">
              Förderverein
            </h3>
            <p className="text-sm leading-relaxed text-sva-gray-300">
              Förderverein SV Amendingen e.V. Gemeinsam für den Sport in
              Amendingen. Wir unterstützen den SV Amendingen finanziell und
              ideell.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sva-gold">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ueber-uns" className="text-sva-gray-300 hover:text-white transition-colors">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/vorstand" className="text-sva-gray-300 hover:text-white transition-colors">
                  Vorstand
                </Link>
              </li>
            </ul>
          </div>

          {/* Mitmachen */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sva-gold">
              Mitmachen
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/spenden" className="text-sva-gray-300 hover:text-white transition-colors">
                  Spenden
                </Link>
              </li>
              <li>
                <Link href="/mitglied-werden" className="text-sva-gray-300 hover:text-white transition-colors">
                  Mitglied werden
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-sva-gray-300 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sva-gold">
              Rechtliches
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="text-sva-gray-300 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sva-gray-300 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-sva-gray-800 pt-6 text-center text-xs text-sva-gray-300">
          <p>
            &copy; {new Date().getFullYear()} Förderverein SV Amendingen e.V. Alle
            Rechte vorbehalten.
          </p>
          <p className="mt-2">
            Website erstellt von{" "}
            <a
              href="https://weissteiner-automation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sva-gold hover:text-white transition-colors"
            >
              Weissteiner Automation
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
