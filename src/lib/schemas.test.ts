import { describe, expect, test } from "bun:test";
import {
  beleganfrageErfassenSchema,
  beleganfrageSchema,
  formatIban,
  isValidIban,
  kontaktSchema,
  loginSchema,
  mitgliedSchema,
  normalizeIban,
  unterschriftSchema,
} from "./schemas";

// Offizielle Beispiel-IBAN der Bundesbank, Prüfsumme gültig.
const GUELTIGE_IBAN = "DE89 3704 0044 0532 0130 00";

const mitglied = {
  vorname: "Erika",
  nachname: "Mustermann",
  strasse: "Hauptstraße 1",
  plz: "87719",
  ort: "Mindelheim",
  email: "erika@example.org",
  kontoinhaber: "Erika Mustermann",
  iban: GUELTIGE_IBAN,
  mandat: true,
  datenschutz: true,
};

describe("IBAN", () => {
  test("normalisiert Leerzeichen und Kleinschreibung", () => {
    expect(normalizeIban(" de89 3704 0044 0532 0130 00 ")).toBe("DE89370400440532013000");
  });

  test("formatiert in Vierergruppen", () => {
    expect(formatIban("de89370400440532013000")).toBe(GUELTIGE_IBAN);
  });

  test("erkennt gültige Prüfsumme", () => {
    expect(isValidIban(normalizeIban(GUELTIGE_IBAN))).toBe(true);
  });

  test("lehnt Zahlendreher ab", () => {
    expect(isValidIban("DE89370400440532013001")).toBe(false);
  });

  test("lehnt falsches Format ab", () => {
    expect(isValidIban("")).toBe(false);
    expect(isValidIban("DE89 3704")).toBe(false);
  });
});

describe("mitgliedSchema", () => {
  test("akzeptiert vollständigen Antrag", () => {
    expect(mitgliedSchema.safeParse(mitglied).success).toBe(true);
  });

  test("verlangt SEPA-Mandat und Datenschutz", () => {
    expect(mitgliedSchema.safeParse({ ...mitglied, mandat: false }).success).toBe(false);
    expect(mitgliedSchema.safeParse({ ...mitglied, datenschutz: false }).success).toBe(false);
  });

  test("verlangt 5-stellige PLZ", () => {
    expect(mitgliedSchema.safeParse({ ...mitglied, plz: "8771" }).success).toBe(false);
  });

  test("lehnt befüllten Honeypot ab", () => {
    expect(mitgliedSchema.safeParse({ ...mitglied, website: "spam" }).success).toBe(false);
  });
});

describe("beleganfrageSchema und kontaktSchema", () => {
  test("Honeypot bleibt erlaubt, damit die Action Bots erkennen kann", () => {
    const anfrage = {
      name: "A",
      strasse: "B",
      plz: "87719",
      ort: "C",
      email: "a@example.org",
      betrag: 50,
      tag_der_spende: "2026-11-01",
      website: "spam",
    };
    expect(beleganfrageSchema.safeParse(anfrage).success).toBe(true);
    const kontakt = { name: "A", email: "a@example.org", nachricht: "Mindestens zehn Zeichen", website: "spam" };
    expect(kontaktSchema.safeParse(kontakt).success).toBe(true);
  });

  test("Beleganfrage verlangt Betrag ab 1 Euro", () => {
    const anfrage = {
      name: "A",
      strasse: "B",
      plz: "87719",
      ort: "C",
      email: "a@example.org",
      betrag: 0,
      tag_der_spende: "2026-11-01",
    };
    expect(beleganfrageSchema.safeParse(anfrage).success).toBe(false);
  });
});

describe("beleganfrageErfassenSchema", () => {
  const erfasst = {
    name: "A",
    strasse: "B",
    plz: "87719",
    ort: "C",
    email: "",
    betrag: 50,
    tag_der_spende: "2026-11-01",
    notiz: "",
    direktFreigeben: false,
  };

  test("Vorstand darf ohne E-Mail-Adresse erfassen", () => {
    expect(beleganfrageErfassenSchema.safeParse(erfasst).success).toBe(true);
  });

  test("eine angegebene E-Mail-Adresse muss gültig sein", () => {
    expect(beleganfrageErfassenSchema.safeParse({ ...erfasst, email: "kaputt" }).success).toBe(false);
  });

  test("Tag der Spende ist Pflicht", () => {
    expect(beleganfrageErfassenSchema.safeParse({ ...erfasst, tag_der_spende: "" }).success).toBe(false);
  });

  test("Betrag ab 1 Euro", () => {
    expect(beleganfrageErfassenSchema.safeParse({ ...erfasst, betrag: 0 }).success).toBe(false);
  });
});

describe("unterschriftSchema", () => {
  const eingabe = { token: "t", sitzungToken: "s", unterschrift: "data:image/png;base64,AAAA", bestaetigt: true };

  test("akzeptiert bestätigte PNG-Unterschrift", () => {
    expect(unterschriftSchema.safeParse(eingabe).success).toBe(true);
  });

  test("verlangt die Bestätigung auch auf dem Server", () => {
    expect(unterschriftSchema.safeParse({ ...eingabe, bestaetigt: false }).success).toBe(false);
  });

  test("lehnt andere Bildformate ab", () => {
    expect(unterschriftSchema.safeParse({ ...eingabe, unterschrift: "data:image/jpeg;base64,AAAA" }).success).toBe(
      false,
    );
  });
});

describe("loginSchema", () => {
  test("Code anfordern verlangt gültige E-Mail", () => {
    expect(loginSchema.safeParse({ modus: "code-anfordern", email: " vorstand@example.org " }).success).toBe(true);
    expect(loginSchema.safeParse({ modus: "code-anfordern", email: "kein-mail" }).success).toBe(false);
  });

  test("Code prüfen entfernt Leerzeichen und verlangt 6 Ziffern", () => {
    const basis = { modus: "code-pruefen", email: "vorstand@example.org", otpId: "otp1" };
    const ok = loginSchema.safeParse({ ...basis, code: "123 456" });
    expect(ok.success && ok.data.modus === "code-pruefen" && ok.data.code).toBe("123456");
    expect(loginSchema.safeParse({ ...basis, code: "12345" }).success).toBe(false);
    expect(loginSchema.safeParse({ ...basis, code: "123456", otpId: "" }).success).toBe(false);
  });

  test("unbekannter Modus wird abgelehnt", () => {
    expect(loginSchema.safeParse({ modus: "admin", email: "vorstand@example.org" }).success).toBe(false);
  });
});
