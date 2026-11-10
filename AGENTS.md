<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues liegen in GitHub Issues von `theaussie86/foerderverein-sv-amendingen`, Zugriff per `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Die fünf Standard-Labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` und `docs/adr/` im Repo-Root. See `docs/agents/domain.md`.

## Checks

Vor jedem Commit `bun run check` ausführen und erst bei grünem Ergebnis committen. Der Befehl prüft Lint (ohne Warnungen), Typen und Tests. Die CI (`.github/workflows/ci.yml`) führt dasselbe auf jedem Push aus und baut zusätzlich mit `bun run build`.

- `bun run typecheck` erzeugt zuerst die Next-Routentypen (`next typegen`). Ein nacktes `tsc` scheitert ohne sie an `RouteContext`.
- Tests laufen mit `bun test` und liegen als `*.test.ts` neben dem Code. `test/setup.ts` neutralisiert `server-only` und setzt einen Test-`ANTRAG_SECRET`.
- Neue reine Logik in `src/lib/` bekommt einen Test. PocketBase, Resend und Server Actions sind nicht abgedeckt.

## Typen und Validierung

ESLint läuft mit Typinformation und erzwingt:

- Kein `any`, kein Non-Null-`!`, keine Casts mit `as` (nur `as const`). Ungeprüfte `any`-Werte (z. B. aus `JSON.parse`) dürfen nicht weiterfließen.
- Promises werden abgewartet. In JSX-Handlern `void` davor: `onSubmit={(e) => void handleSubmit(onSubmit)(e)}`.

Daten unbekannter Form werden mit Zod geparst, der Typ kommt per `z.infer` aus dem Schema. Das gilt für Formulareingaben, Server-Action-Argumente, `FormData`, Token-Inhalte (`unseal(token, schema)`) und Fehlerantworten fremder Dienste.

Jedes Formular prüft im Browser und in der Server Action mit demselben Schema aus `src/lib/schemas.ts`. Im Browser per react-hook-form mit `zodResolver`, wo das nicht passt (Admin-Login mit `useActionState`, Unterschrift) per `safeParse` vor dem Senden. Server Actions nehmen `eingabe: unknown` und rufen zuerst `safeParse`.
