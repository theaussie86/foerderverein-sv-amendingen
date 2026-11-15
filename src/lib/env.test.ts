import { afterEach, describe, expect, test } from "bun:test";
import { env } from "./env";

const vorher = { ...process.env };

afterEach(() => {
  for (const k of Object.keys(process.env)) if (!(k in vorher)) delete process.env[k];
  Object.assign(process.env, vorher);
});

describe("env", () => {
  test("leere Werte gelten als nicht gesetzt", () => {
    process.env.KONTAKT_EMPFAENGER = "";
    process.env.SITE_URL = "";
    expect(env().KONTAKT_EMPFAENGER).toBeUndefined();
    expect(env().SITE_URL).toBe("http://localhost:3000");
  });

  test("ungültige URL wird mit Variablennamen abgelehnt", () => {
    process.env.POCKETBASE_URL = "keine-url";
    expect(() => env()).toThrow("POCKETBASE_URL");
  });

  test("Resend ohne MAIL_FROM wird abgelehnt", () => {
    process.env.RESEND_API_KEY = "re_test";
    delete process.env.MAIL_FROM;
    expect(() => env()).toThrow("MAIL_FROM: MAIL_FROM fehlt");
  });

  test("NODE_ENV kennt nur development, production und test", () => {
    for (const wert of ["development", "production", "test"] as const) {
      Object.assign(process.env, { NODE_ENV: wert });
      expect(env().NODE_ENV).toBe(wert);
    }
    Object.assign(process.env, { NODE_ENV: "staging" });
    expect(() => env()).toThrow("NODE_ENV");
  });
});
