import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { entscheidungen } from "../entscheidung";
import { fakeEntscheidungsumgebung } from "./fakes";

// Die Fehlerfälle loggen absichtlich. Im Testlauf stört das nur.
beforeAll(() => {
  spyOn(console, "error").mockImplementation(() => {});
});

function aufbau() {
  const f = fakeEntscheidungsumgebung();
  return { ...f, e: entscheidungen(f.umgebung) };
}

describe("ablehnen", () => {
  test("setzt den Mitgliedsantrag auf abgelehnt und hält den Grund intern fest", async () => {
    const { ablage, e } = aufbau();
    expect(await e.ablehnen("a1", { grund: "  Doppelantrag ", mailSenden: false })).toEqual({ ok: true });
    expect(ablage.staende.get("a1")?.status).toBe("abgelehnt");
    expect(ablage.gruende.get("a1")).toBe("Doppelantrag");
  });

  test("schickt mit Häkchen eine Mail ohne den Grund", async () => {
    const { postausgang, e } = aufbau();
    await e.ablehnen("a1", { grund: "Wohnt nicht in der Region", mailSenden: true });
    expect(postausgang.gesendet).toHaveLength(1);
    const mail = postausgang.gesendet[0];
    expect(mail?.to).toBe("juergen@example.org");
    expect(mail?.text).toContain("Hallo Jürgen");
    expect(mail?.text).toContain("nicht annehmen");
    expect(mail?.text).toContain("Lastschriftmandat");
    expect(mail?.text).not.toContain("Region");
  });

  test("ohne Häkchen geht keine Mail raus", async () => {
    const { postausgang, e } = aufbau();
    await e.ablehnen("a1", { grund: "Spam", mailSenden: false });
    expect(postausgang.gesendet).toEqual([]);
  });

  test("der Grund ist Pflicht", async () => {
    const { ablage, e } = aufbau();
    expect(await e.ablehnen("a1", { grund: "   ", mailSenden: false })).toEqual({ ok: false, grund: "grund-fehlt" });
    expect(ablage.staende.get("a1")?.status).toBe("eingegangen");
  });

  test("nur bei Status eingegangen", async () => {
    for (const status of ["angenommen", "abgelehnt"] as const) {
      const { ablage, postausgang, e } = aufbau();
      ablage.staende.set("a1", { status, vorname: "J", email: "j@example.org", mitgliedVerknuepft: false });
      expect(await e.ablehnen("a1", { grund: "Spam", mailSenden: true })).toEqual({
        ok: false,
        grund: "nicht-ablehnbar",
      });
      expect(ablage.staende.get("a1")?.status).toBe(status);
      expect(postausgang.gesendet).toEqual([]);
    }
  });

  test("nicht, wenn schon ein Mitglied daraus entstanden ist", async () => {
    const { ablage, e } = aufbau();
    ablage.staende.set("a1", { status: "eingegangen", vorname: "J", email: "j@example.org", mitgliedVerknuepft: true });
    expect(await e.ablehnen("a1", { grund: "Spam", mailSenden: false })).toEqual({
      ok: false,
      grund: "nicht-ablehnbar",
    });
    expect(ablage.staende.get("a1")?.status).toBe("eingegangen");
  });

  test("unbekannter Mitgliedsantrag", async () => {
    const { e } = aufbau();
    expect(await e.ablehnen("fehlt", { grund: "Spam", mailSenden: false })).toEqual({
      ok: false,
      grund: "nicht-gefunden",
    });
  });

  test("scheitert die Mail, bleibt der Mitgliedsantrag eingegangen", async () => {
    const { ablage, postausgang, e } = aufbau();
    postausgang.fehlerAb = 0;
    expect(await e.ablehnen("a1", { grund: "Spam", mailSenden: true })).toEqual({ ok: false, grund: "mail" });
    expect(ablage.staende.get("a1")?.status).toBe("eingegangen");
  });
});

describe("annehmen", () => {
  test("setzt einen eingegangenen Mitgliedsantrag auf angenommen", async () => {
    const { ablage, e } = aufbau();
    expect(await e.annehmbar("a1")).toBe(true);
    await e.annehmen("a1");
    expect(ablage.staende.get("a1")?.status).toBe("angenommen");
  });

  test("ein abgelehnter Mitgliedsantrag lässt sich nicht übernehmen", async () => {
    const { ablage, e } = aufbau();
    await e.ablehnen("a1", { grund: "Spam", mailSenden: false });
    expect(await e.annehmbar("a1")).toBe(false);
    const fehler = await e.annehmen("a1").then(
      () => null,
      (x: unknown) => x,
    );
    expect(fehler).toBeInstanceOf(Error);
    expect(ablage.staende.get("a1")?.status).toBe("abgelehnt");
  });

  test("ein unbekannter Mitgliedsantrag ist nicht annehmbar", async () => {
    const { e } = aufbau();
    expect(await e.annehmbar("fehlt")).toBe(false);
  });
});
