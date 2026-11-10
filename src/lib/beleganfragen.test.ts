import { describe, expect, test } from "bun:test";
import { spendenbelegMail } from "./beleganfragen";

describe("spendenbelegMail", () => {
  const mail = spendenbelegMail({ name: "Erika Muster", betrag: 50 });

  test("spricht neutral von der Spende, nicht nur von einer Überweisung", () => {
    expect(mail.text).toContain("Deine Spende ist bei uns eingegangen.");
    expect(mail.text).not.toContain("Deine Überweisung");
  });

  test("nennt Spender und Betrag", () => {
    expect(mail.text).toStartWith("Hallo Erika Muster,");
    expect(mail.subject).toBe("Dein Spendenbeleg über 50,00 €");
  });
});
