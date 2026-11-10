import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Regeln mit Typinformation: fehlende awaits, Promises in Event-Handlern, ungeprüfte any-Werte.
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeCheckedOnly],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      // Daten unbekannter Form (JSON, Tokens, FormData, Query-Parameter) werden mit Zod geparst,
      // nicht per Cast behauptet. "as const" bleibt erlaubt.
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      // Kein any und kein "!": fehlende Werte werden geprüft statt weggeschwiegen.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    rules: {
      // Mit _ markierte Variablen sind bewusst ungenutzt (z. B. beim Weglassen von Feldern).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // PocketBase-Migrationen binden die Typen per Triple-Slash ein, so erzeugt PocketBase sie.
    files: ["pocketbase/pb_migrations/**"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Eigenes Remotion-Projekt mit eigenen Abhängigkeiten
    "video/**",
    // Lokal installierte Agent-Skills
    ".agents/**",
    ".claude/**",
  ]),
]);
