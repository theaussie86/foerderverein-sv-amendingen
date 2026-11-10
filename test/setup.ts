import { mock } from "bun:test";

// "server-only" wirft außerhalb des React-Server-Kontexts. In Tests ist das gewollt egal.
void mock.module("server-only", () => ({}));

// Fester Testschlüssel für src/lib/token.ts, damit kein echter Schlüssel nötig ist.
process.env.ANTRAG_SECRET ??= "test-schluessel-mindestens-32-zeichen-lang";
