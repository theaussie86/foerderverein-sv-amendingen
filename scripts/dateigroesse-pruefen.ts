// Pre-commit-Check: Code-Dateien über ~5.000 Tokens sind für Agenten schwer zu lesen und zu bearbeiten.
// Tokens werden grob als Bytes / 4 geschätzt. Prüft nur die übergebenen (gestagten) Dateien,
// Altlasten fallen also erst auf, wenn jemand sie anfasst.
// Aufruf: bun scripts/dateigroesse-pruefen.ts <datei>...

export const MAX_TOKENS = 5000;
const BYTES_PRO_TOKEN = 4;

const GEPRUEFT = /\.(ts|tsx|js|jsx|mjs|cjs|css|py)$/;
// Erzeugt oder aus fremder Quelle, bearbeitet niemand von Hand.
const AUSGENOMMEN = [/(^|\/)pocketbase\/pb_migrations\//, /(^|\/)pocketbase\/pb_data\//, /(^|\/)video\//, /\.d\.ts$/];

export function wirdGeprueft(pfad: string): boolean {
  return GEPRUEFT.test(pfad) && !AUSGENOMMEN.some((r) => r.test(pfad));
}

export function geschaetzteTokens(bytes: number): number {
  return Math.ceil(bytes / BYTES_PRO_TOKEN);
}

const ANLEITUNG = `Teile jede Datei auf, bevor du committest. Ziel: jede Datei deutlich unter ${MAX_TOKENS} Tokens.

- Seiten und Layouts (src/app/**/page.tsx): Die Seite holt Daten und setzt Komponenten zusammen.
  Abschnitte der Seite in eigene Komponenten-Dateien daneben auslagern (z. B. hero.tsx, faq.tsx).
- Fachlogik gehört in ein Paket unter src/packages/ (vorher src/packages/README.md lesen),
  reine Hilfsfunktionen nach src/lib/ mit Test.
- Formulare: Felder-Gruppen und Dialoge in eigene Client-Komponenten.
- Tests: nach dem geprüften Verhalten aufteilen, eine Datei pro Bereich
  (z. B. beleganfrage.anfragen.test.ts, beleganfrage.bestaetigen.test.ts). Gemeinsame Fixtures in tests/.

Danach \`bun run check\` ausführen und erneut committen.`;

if (import.meta.main) {
  const zuGross: string[] = [];
  for (const pfad of process.argv.slice(2)) {
    if (!wirdGeprueft(pfad)) continue;
    const datei = Bun.file(pfad);
    if (!(await datei.exists())) continue;
    const tokens = geschaetzteTokens(datei.size);
    if (tokens > MAX_TOKENS) zuGross.push(`  ${pfad}: ~${tokens} Tokens`);
  }
  if (zuGross.length > 0) {
    console.error(
      `Diese Dateien haben mehr als ${MAX_TOKENS} Tokens (Bytes / 4):\n\n${zuGross.join("\n")}\n\n${ANLEITUNG}`,
    );
    process.exit(1);
  }
}
