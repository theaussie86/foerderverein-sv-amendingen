import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
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
