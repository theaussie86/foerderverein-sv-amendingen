import { describe, expect, test } from "bun:test";
import { foerderprojekte } from "../index";
import { bild, daten, FakeAblage } from "./fakes";

function aufbau() {
  const ablage = new FakeAblage();
  return { ablage, f: foerderprojekte({ ablage }) };
}

describe("Startseite für Besucher", () => {
  test("leer, solange kein Förderprojekt angehakt ist", async () => {
    const { f } = aufbau();
    await f.anlegen(daten(), bild());
    expect(await f.startseite()).toEqual([]);
  });

  test("nur angehakte Förderprojekte, in der gepflegten Reihenfolge", async () => {
    const { ablage, f } = aufbau();
    for (const titel of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel, startseite: true }), bild());
    await f.anlegen(daten({ titel: "Nicht" }), bild());
    ablage.projekte = ablage.projekte.map((p) => (p.titel === "A" ? { ...p, reihenfolge: 9 } : p));
    expect((await f.startseite()).map((p) => p.titel)).toEqual(["B", "C", "D", "A"]);
  });

  test("höchstens 4, auch wenn die Daten mehr angehakt haben", async () => {
    const { ablage, f } = aufbau();
    for (const titel of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel, startseite: true }), bild());
    await f.anlegen(daten({ titel: "E" }), bild());
    ablage.projekte = ablage.projekte.map((p) => (p.titel === "E" ? { ...p, startseite: true, reihenfolge: 5 } : p));
    expect((await f.startseite()).map((p) => p.titel)).toEqual(["A", "B", "C", "D"]);
  });
});

describe("Öffentliches Bild", () => {
  test("liefert das Bild eines Förderprojekts auf der Startseite", async () => {
    const { f } = aufbau();
    await f.anlegen(daten({ startseite: true }), bild("x.jpg"));
    const b = await f.oeffentlichesBild("f1", "x.jpg", "kachel");
    expect(b && (await new Response(b.inhalt).text())).toBe("x.jpg:kachel");
  });

  test("null für ein Förderprojekt, das nicht auf der Startseite steht", async () => {
    const { f } = aufbau();
    await f.anlegen(daten(), bild("x.jpg"));
    expect(await f.oeffentlichesBild("f1", "x.jpg", "kachel")).toBeNull();
  });

  test("null für einen falschen oder alten Dateinamen", async () => {
    const { f } = aufbau();
    await f.anlegen(daten({ startseite: true }), bild("alt.jpg"));
    await f.aendern("f1", daten({ startseite: true }), bild("neu.jpg"));
    expect(await f.oeffentlichesBild("f1", "alt.jpg", "kachel")).toBeNull();
    expect(await f.oeffentlichesBild("f1", "", "kachel")).toBeNull();
    expect(await f.oeffentlichesBild("f1", "neu.jpg", "quadrat")).not.toBeNull();
  });

  test("null für ein unbekanntes Förderprojekt", async () => {
    const { f } = aufbau();
    expect(await f.oeffentlichesBild("gibt-es-nicht", "x.jpg", "kachel")).toBeNull();
  });

  test("null für ein Förderprojekt, das nur wegen der Grenze nicht angezeigt wird", async () => {
    const { ablage, f } = aufbau();
    for (const titel of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel, startseite: true }), bild());
    await f.anlegen(daten({ titel: "E" }), bild("e.jpg"));
    ablage.projekte = ablage.projekte.map((p) => (p.titel === "E" ? { ...p, startseite: true, reihenfolge: 5 } : p));
    expect(await f.oeffentlichesBild("f5", "e.jpg", "kachel")).toBeNull();
  });
});
