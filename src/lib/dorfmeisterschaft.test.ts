import { describe, expect, test } from "bun:test";
import { bannerSichtbar, kalenderEintrag } from "./dorfmeisterschaft";

describe("bannerSichtbar", () => {
  test("vor dem Turniertag sichtbar", () => {
    expect(bannerSichtbar(new Date("2026-11-23T12:00:00Z"))).toBe(true);
  });

  test("am Turniertag bis Mitternacht deutscher Zeit sichtbar", () => {
    expect(bannerSichtbar(new Date("2027-06-19T21:59:00Z"))).toBe(true);
  });

  test("ab Mitternacht nach dem Turniertag weg", () => {
    expect(bannerSichtbar(new Date("2027-06-19T22:00:00Z"))).toBe(false);
    expect(bannerSichtbar(new Date("2027-07-01T12:00:00Z"))).toBe(false);
  });
});

describe("kalenderEintrag", () => {
  // Entfaltet, damit die Prüfungen nicht an der Zeilenfaltung hängen.
  const ics = kalenderEintrag("https://example.org/dorfmeisterschaft").replaceAll("\r\n ", "");

  test("ganztägig am 19.06.2027, Ende exklusiv am Folgetag", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20270619\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20270620\r\n");
  });

  test("Titel, Ort mit maskierten Kommas und Link", () => {
    expect(ics).toContain("SUMMARY:Fußball-Dorfmeisterschaft 2027\r\n");
    expect(ics).toContain("LOCATION:Sportgelände SV Amendingen\\, Grünenfurterstraße 36\\, 87700 Memmingen\r\n");
    expect(ics).toContain("URL:https://example.org/dorfmeisterschaft\r\n");
  });

  test("lange Zeilen auf 75 Bytes gefaltet, ohne Inhalt zu verlieren", () => {
    const lang = kalenderEintrag("https://example.org/" + "ä".repeat(60));
    for (const zeile of lang.split("\r\n")) {
      expect(new TextEncoder().encode(zeile).length).toBeLessThanOrEqual(75);
    }
    expect(lang.replaceAll("\r\n ", "")).toContain("URL:https://example.org/" + "ä".repeat(60) + "\r\n");
  });

  test("gültiger Rahmen mit CRLF", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
    expect(ics).toMatch(/^UID:.+@foerderverein-sv-amendingen\.de\r$/m);
  });
});
