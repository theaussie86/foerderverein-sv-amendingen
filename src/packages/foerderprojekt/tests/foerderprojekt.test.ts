import { describe, expect, test } from "bun:test";
import { BILD_MAX_BYTES, foerderprojekte } from "../index";
import { bild, daten, FakeAblage } from "./fakes";

function aufbau() {
  const ablage = new FakeAblage();
  return { ablage, f: foerderprojekte({ ablage }) };
}

async function titelAufStartseite(f: ReturnType<typeof aufbau>["f"]) {
  return (await f.liste()).startseite.map((p) => p.titel);
}

describe("Pflichtfelder", () => {
  test("speichert Titel und Beschreibung ohne überflüssige Leerzeichen", async () => {
    const { ablage, f } = aufbau();
    expect((await f.anlegen(daten({ titel: "  Fahrt   nach Augsburg ", beschreibung: " Toll. " }), bild())).ok).toBe(
      true,
    );
    expect(ablage.projekte[0]).toMatchObject({ titel: "Fahrt nach Augsburg", beschreibung: "Toll.", bild: "bild.jpg" });
  });

  test("ohne Titel oder Beschreibung wird nichts gespeichert", async () => {
    const { ablage, f } = aufbau();
    expect(await f.anlegen(daten({ titel: "  " }), bild())).toEqual({ ok: false, grund: "pflichtfeld-fehlt" });
    expect(await f.anlegen(daten({ beschreibung: "" }), bild())).toEqual({ ok: false, grund: "pflichtfeld-fehlt" });
    expect(ablage.projekte).toEqual([]);
  });

  test("ohne Bild angelegt, bleibt das Bild leer (Standardbild)", async () => {
    const { ablage, f } = aufbau();
    expect((await f.anlegen(daten(), null)).ok).toBe(true);
    expect(ablage.projekte[0]?.bild).toBe("");
  });

  test("entfernen führt zurück zum Standardbild", async () => {
    const { ablage, f } = aufbau();
    await f.anlegen(daten(), bild("alt.jpg"));
    expect((await f.aendern("f1", daten(), "entfernen")).ok).toBe(true);
    expect(ablage.projekte[0]?.bild).toBe("");
  });

  test("ohne Bild gibt es kein öffentliches Bild", async () => {
    const { f } = aufbau();
    await f.anlegen(daten({ startseite: true }), null);
    expect(await f.oeffentlichesBild("f1", "", "kachel")).toBeNull();
  });

  test("nur JPEG und PNG bis 5 MB", async () => {
    const { f } = aufbau();
    expect((await f.anlegen(daten(), bild("a.png", "image/png"))).ok).toBe(true);
    expect((await f.anlegen(daten(), bild("a.jpg", "image/jpeg", BILD_MAX_BYTES))).ok).toBe(true);
    for (const b of [
      bild("a.webp", "image/webp"),
      bild("a.svg", "image/svg+xml"),
      bild("a.jpg", "image/jpeg", BILD_MAX_BYTES + 1),
      bild("a.jpg", "image/jpeg", 0),
    ]) {
      expect(await f.anlegen(daten(), b)).toEqual({ ok: false, grund: "bild-ungueltig" });
    }
  });

  test("beim Ändern bleibt das Bild, wenn kein neues kommt", async () => {
    const { ablage, f } = aufbau();
    await f.anlegen(daten(), bild("alt.jpg"));
    expect(await f.aendern("f1", daten({ titel: "Neu" }), null)).toEqual({ ok: true, id: "f1" });
    expect(ablage.projekte[0]).toMatchObject({ titel: "Neu", bild: "alt.jpg" });
    await f.aendern("f1", daten(), bild("neu.png", "image/png"));
    expect(ablage.projekte[0]?.bild).toBe("neu.png");
  });

  test("beim Ändern gelten dieselben Pflichtfelder und Bildregeln", async () => {
    const { f } = aufbau();
    await f.anlegen(daten(), bild());
    expect(await f.aendern("f1", daten({ beschreibung: " " }), null)).toEqual({
      ok: false,
      grund: "pflichtfeld-fehlt",
    });
    expect(await f.aendern("f1", daten(), bild("a.svg", "image/svg+xml"))).toEqual({
      ok: false,
      grund: "bild-ungueltig",
    });
  });

  test("ein gelöschtes Förderprojekt lässt sich nicht ändern", async () => {
    const { f } = aufbau();
    expect(await f.aendern("gibt-es-nicht", daten(), null)).toEqual({ ok: false, grund: "nicht-gefunden" });
  });
});

describe("Startseite", () => {
  test("höchstens 4 Förderprojekte", async () => {
    const { ablage, f } = aufbau();
    for (const t of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel: t, startseite: true }), bild());
    expect((await f.liste()).voll).toBe(true);
    expect(await f.anlegen(daten({ titel: "E", startseite: true }), bild())).toEqual({
      ok: false,
      grund: "startseite-voll",
    });
    expect(ablage.projekte).toHaveLength(4);
    expect((await f.anlegen(daten({ titel: "E" }), bild())).ok).toBe(true);
    expect(await f.aendern("f5", daten({ titel: "E", startseite: true }), null)).toEqual({
      ok: false,
      grund: "startseite-voll",
    });
  });

  test("ein Förderprojekt auf der Startseite lässt sich bei 4 belegten Plätzen weiter ändern", async () => {
    const { f } = aufbau();
    for (const t of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel: t, startseite: true }), bild());
    expect((await f.aendern("f2", daten({ titel: "B2", startseite: true }), null)).ok).toBe(true);
    expect(await titelAufStartseite(f)).toEqual(["A", "B2", "C", "D"]);
  });

  test("neu angehakte Förderprojekte hängen hinten an", async () => {
    const { f } = aufbau();
    await f.anlegen(daten({ titel: "A", startseite: true }), bild());
    await f.anlegen(daten({ titel: "B" }), bild());
    await f.anlegen(daten({ titel: "C", startseite: true }), bild());
    await f.aendern("f2", daten({ titel: "B", startseite: true }), null);
    expect(await titelAufStartseite(f)).toEqual(["A", "C", "B"]);
  });

  test("abgehakt und wieder angehakt landet hinten", async () => {
    const { f } = aufbau();
    for (const t of ["A", "B", "C"]) await f.anlegen(daten({ titel: t, startseite: true }), bild());
    await f.aendern("f1", daten({ titel: "A" }), null);
    expect(await titelAufStartseite(f)).toEqual(["B", "C"]);
    await f.aendern("f1", daten({ titel: "A", startseite: true }), null);
    expect(await titelAufStartseite(f)).toEqual(["B", "C", "A"]);
  });

  test("Ändern ohne Umschalten behält den Platz", async () => {
    const { f } = aufbau();
    for (const t of ["A", "B", "C"]) await f.anlegen(daten({ titel: t, startseite: true }), bild());
    await f.aendern("f1", daten({ titel: "A2", startseite: true }), null);
    expect(await titelAufStartseite(f)).toEqual(["A2", "B", "C"]);
  });

  test("nach dem Löschen ist wieder ein Platz frei", async () => {
    const { f } = aufbau();
    for (const t of ["A", "B", "C", "D"]) await f.anlegen(daten({ titel: t, startseite: true }), bild());
    await f.loeschen("f2");
    expect(await titelAufStartseite(f)).toEqual(["A", "C", "D"]);
    expect((await f.liste()).voll).toBe(false);
    expect((await f.anlegen(daten({ titel: "E", startseite: true }), bild())).ok).toBe(true);
    expect(await titelAufStartseite(f)).toEqual(["A", "C", "D", "E"]);
  });

  test("die übrigen Förderprojekte stehen darunter, neueste zuerst", async () => {
    const { f } = aufbau();
    await f.anlegen(daten({ titel: "Alt" }), bild());
    await f.anlegen(daten({ titel: "Oben", startseite: true }), bild());
    await f.anlegen(daten({ titel: "Neu" }), bild());
    const liste = await f.liste();
    expect(liste.weitere.map((p) => p.titel)).toEqual(["Neu", "Alt"]);
    expect(liste.voll).toBe(false);
  });
});

describe("Bild", () => {
  test("liefert die gewünschte Verkleinerung", async () => {
    const { f } = aufbau();
    await f.anlegen(daten(), bild("x.jpg"));
    const b = await f.bild("f1", "quadrat");
    expect(b && (await new Response(b.inhalt).text())).toBe("x.jpg:quadrat");
  });

  test("null für ein unbekanntes Förderprojekt", async () => {
    const { f } = aufbau();
    expect(await f.bild("gibt-es-nicht", "kachel")).toBeNull();
  });
});
