import { describe, expect, test } from "bun:test";
import { foerderprojekte } from "../index";
import { bild, daten, FakeAblage } from "./fakes";

// Vier Förderprojekte A-D auf der Startseite, E und F darunter.
async function aufbau(oben = ["A", "B", "C", "D"], unten = ["E", "F"]) {
  const ablage = new FakeAblage();
  const f = foerderprojekte({ ablage });
  for (const titel of oben) await f.anlegen(daten({ titel, startseite: true }), bild());
  for (const titel of unten) await f.anlegen(daten({ titel }), bild());
  const id = (titel: string) => ablage.projekte.find((p) => p.titel === titel)?.id ?? "fehlt";
  const startseite = async () => (await f.liste()).startseite.map((p) => p.titel);
  return { ablage, f, id, startseite };
}

describe("Pfeile", () => {
  test("hoch tauscht mit dem Vorgänger", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("C"), "hoch")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "C", "B", "D"]);
  });

  test("runter tauscht mit dem Nachfolger", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("B"), "runter")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "C", "B", "D"]);
  });

  test("hoch auf Platz 1 und runter auf dem letzten Platz ändern nichts", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("A"), "hoch")).toEqual({ ok: true });
    expect(await f.startseiteAendern(id("D"), "runter")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "B", "C", "D"]);
  });

  test("auch mit Lücken in der Reihenfolge", async () => {
    const { ablage, f, id, startseite } = await aufbau(["A", "B", "C"]);
    const platz: Record<string, number> = { A: 2, B: 5, C: 9 };
    ablage.projekte = ablage.projekte.map((p) => ({ ...p, reihenfolge: platz[p.titel] ?? 0 }));
    await f.startseiteAendern(id("C"), "hoch");
    expect(await startseite()).toEqual(["A", "C", "B"]);
  });

  test("Pfeile an einem Förderprojekt unter der Startseite ändern nichts", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("E"), "hoch")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "B", "C", "D"]);
    expect((await f.liste()).weitere.map((p) => p.titel)).toEqual(["F", "E"]);
  });

  test("die Startseite für Besucher folgt der neuen Reihenfolge", async () => {
    const { f, id } = await aufbau();
    await f.startseiteAendern(id("D"), "hoch");
    expect((await f.startseite()).map((p) => p.titel)).toEqual(["A", "B", "D", "C"]);
  });
});

describe("Von Startseite nehmen", () => {
  test("die übrigen rücken nach", async () => {
    const { ablage, f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("B"), "entfernen")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "C", "D"]);
    expect(ablage.projekte.filter((p) => p.startseite).map((p) => [p.titel, p.reihenfolge])).toEqual([
      ["A", 1],
      ["C", 2],
      ["D", 3],
    ]);
    expect(ablage.projekte.find((p) => p.titel === "B")).toMatchObject({ startseite: false, reihenfolge: 0 });
  });

  test("Titel, Bild und Angaben bleiben", async () => {
    const { ablage, f, id } = await aufbau();
    const vorher = ablage.projekte.filter((p) => p.titel === "B");
    await f.startseiteAendern(id("B"), "entfernen");
    expect(ablage.projekte.filter((p) => p.titel === "B")).toEqual(
      vorher.map((p) => ({ ...p, startseite: false, reihenfolge: 0 })),
    );
  });
});

describe("Auf die Startseite", () => {
  test("hängt hinten an", async () => {
    const { f, id, startseite } = await aufbau(["A", "B"]);
    expect(await f.startseiteAendern(id("F"), "aufnehmen")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "B", "F"]);
  });

  test("nicht bei 4 belegten Plätzen", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("E"), "aufnehmen")).toEqual({ ok: false, grund: "startseite-voll" });
    expect(await startseite()).toEqual(["A", "B", "C", "D"]);
  });

  test("der vierte Platz geht noch, danach ist voll", async () => {
    const { f, id, startseite } = await aufbau(["A", "B", "C"]);
    expect(await f.startseiteAendern(id("E"), "aufnehmen")).toEqual({ ok: true });
    expect((await f.liste()).voll).toBe(true);
    expect(await f.startseiteAendern(id("F"), "aufnehmen")).toEqual({ ok: false, grund: "startseite-voll" });
    expect(await startseite()).toEqual(["A", "B", "C", "E"]);
  });

  test("nach Von-Startseite-nehmen ist wieder ein Platz frei", async () => {
    const { f, id, startseite } = await aufbau();
    await f.startseiteAendern(id("A"), "entfernen");
    expect(await f.startseiteAendern(id("E"), "aufnehmen")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["B", "C", "D", "E"]);
  });

  test("schon auf der Startseite: Platz bleibt", async () => {
    const { f, id, startseite } = await aufbau();
    expect(await f.startseiteAendern(id("B"), "aufnehmen")).toEqual({ ok: true });
    expect(await startseite()).toEqual(["A", "B", "C", "D"]);
  });
});

test("unbekanntes Förderprojekt", async () => {
  const { f } = await aufbau();
  for (const aktion of ["hoch", "runter", "aufnehmen", "entfernen"] as const) {
    expect(await f.startseiteAendern("gibtsnicht", aktion)).toEqual({ ok: false, grund: "nicht-gefunden" });
  }
});
