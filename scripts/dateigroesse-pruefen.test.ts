import { describe, expect, test } from "bun:test";
import { geschaetzteTokens, MAX_TOKENS, wirdGeprueft } from "./dateigroesse-pruefen";

describe("Dateigröße", () => {
  test("prüft Code, aber keine Migrationen, Medien oder Typdeklarationen", () => {
    expect(wirdGeprueft("src/app/page.tsx")).toBe(true);
    expect(wirdGeprueft("/abs/pfad/src/lib/token.ts")).toBe(true);
    expect(wirdGeprueft("pocketbase/pb_migrations/1700_init.js")).toBe(false);
    expect(wirdGeprueft("video/src/Szene.tsx")).toBe(false);
    expect(wirdGeprueft("public/video/film.mp4")).toBe(false);
    expect(wirdGeprueft("bun.lock")).toBe(false);
    expect(wirdGeprueft("next-env.d.ts")).toBe(false);
  });

  test("schätzt Tokens als Bytes / 4", () => {
    expect(geschaetzteTokens(MAX_TOKENS * 4)).toBe(MAX_TOKENS);
    expect(geschaetzteTokens(MAX_TOKENS * 4 + 1)).toBeGreaterThan(MAX_TOKENS);
  });
});
