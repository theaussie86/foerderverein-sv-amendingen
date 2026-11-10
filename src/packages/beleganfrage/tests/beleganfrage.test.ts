import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import { belegArt } from "../anzeige";
import { vorstandsBeleganfragen, websiteBeleganfragen } from "../index";
import { Ablage, JETZT, Post } from "./fakes";

// Ausfälle sind gewollt, ihre Logs sollen die Testausgabe nicht fluten.
spyOn(console, "error").mockImplementation(() => {});

const SPENDE = {
  name: "Erika Muster",
  strasse: "Hauptstraße 1",
  plz: "87700",
  ort: "Memmingen",
  email: "erika@example.org",
  betrag: 50,
  tagDerSpende: "2026-11-01",
};

describe("belegArt", () => {
  test("bis einschließlich 300 € gibt es den vereinfachten Spendenbeleg", () => {
    expect(belegArt(50)).toBe("vereinfacht");
    expect(belegArt(300)).toBe("vereinfacht");
  });

  test("über 300 € gibt es eine Zuwendungsbestätigung", () => {
    expect(belegArt(300.01)).toBe("zuwendungsbestaetigung");
    expect(belegArt(500)).toBe("zuwendungsbestaetigung");
  });
});

describe("Beleganfrage über die Website stellen", () => {
  let ablage: Ablage;
  let post: Post;
  let website: ReturnType<typeof websiteBeleganfragen>;

  beforeEach(() => {
    ablage = new Ablage();
    post = new Post();
    website = websiteBeleganfragen({
      schreiben: ablage,
      post,
      vorstandPostfach: "vorstand@example.org",
      siteUrl: "https://sva.example",
    });
  });

  test("speichert eine offene Anfrage ohne Erfasser und nennt die Art des Belegs", async () => {
    expect(await website.stellen({ ...SPENDE, betrag: 500 })).toEqual({ ok: true, art: "zuwendungsbestaetigung" });
    const [anfrage] = ablage.eintraege.values();
    expect(anfrage).toMatchObject({
      ...SPENDE,
      betrag: 500,
      art: "zuwendungsbestaetigung",
      status: "offen",
      erfasstVon: null,
    });
  });

  test("meldet die Anfrage dem Vorstand mit Link, Antworten geht an den Spender", async () => {
    await website.stellen(SPENDE);
    expect(post.gesendet).toHaveLength(1);
    const [mail] = post.gesendet;
    expect(mail.to).toBe("vorstand@example.org");
    expect(mail.replyTo).toBe("erika@example.org");
    expect(mail.subject).toBe("Spendenbeleg angefordert: Erika Muster, 50,00\u00a0€");
    expect(mail.text).toContain("Tag der Spende: 1.11.2026");
    expect(mail.text).toContain("https://sva.example/admin/spenden/anfrage1");
  });

  test("bei einer Zuwendungsbestätigung bittet die Mail ums Ausstellen", async () => {
    await website.stellen({ ...SPENDE, betrag: 500 });
    expect(post.gesendet[0].subject).toStartWith("Zuwendungsbestätigung angefordert:");
    expect(post.gesendet[0].text).toContain("als ausgestellt markieren");
  });

  test("schlägt das Speichern fehl, geht die Mail trotzdem raus, nur ohne Link", async () => {
    ablage.speichernFehlschlagen = true;
    expect(await website.stellen(SPENDE)).toEqual({ ok: true, art: "vereinfacht" });
    expect(post.gesendet).toHaveLength(1);
    expect(post.gesendet[0].text).not.toContain("/admin/spenden/");
  });

  test("schlägt nur die Mail fehl, ist die Anfrage trotzdem gestellt", async () => {
    post.fehlschlagen = true;
    expect(await website.stellen(SPENDE)).toEqual({ ok: true, art: "vereinfacht" });
    expect(ablage.eintraege.size).toBe(1);
  });

  test("schlägt beides fehl, ist die Anfrage nicht angekommen", async () => {
    ablage.speichernFehlschlagen = true;
    post.fehlschlagen = true;
    expect(await website.stellen(SPENDE)).toEqual({ ok: false, grund: "nicht-angekommen" });
  });
});

describe("Beleganfragen im internen Bereich", () => {
  let ablage: Ablage;
  let post: Post;
  let vorstand: ReturnType<typeof vorstandsBeleganfragen>;

  beforeEach(() => {
    ablage = new Ablage();
    post = new Post();
    vorstand = vorstandsBeleganfragen({ lesen: ablage, schreiben: ablage, post, jetzt: () => JETZT });
  });

  const angaben = { ...SPENDE, notiz: "per WhatsApp" };

  async function offen(betrag = 50, email = SPENDE.email): Promise<string> {
    const ergebnis = await vorstand.erfassen({ ...angaben, betrag, email }, "v2", { direktFreigeben: false });
    if (!ergebnis.ok) throw new Error("nicht erfasst");
    return ergebnis.id;
  }

  describe("erfassen", () => {
    test("speichert eine offene Anfrage mit Erfasser und meldet nichts an den Vorstand", async () => {
      const ergebnis = await vorstand.erfassen(angaben, "v1", { direktFreigeben: false });
      expect(ergebnis).toEqual({ ok: true, id: "anfrage1" });
      expect(await vorstand.laden("anfrage1")).toMatchObject({
        ...angaben,
        art: "vereinfacht",
        status: "offen",
        erfasstVon: "Manu Rothermel",
        abschluss: null,
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("meldet, wenn nichts gespeichert wurde", async () => {
      ablage.speichernFehlschlagen = true;
      expect(await vorstand.erfassen(angaben, "v1", { direktFreigeben: false })).toEqual({
        ok: false,
        grund: "nicht-gespeichert",
      });
    });

    test("direkt freigegeben bis 300 €: Spendenbeleg geht sofort raus", async () => {
      await vorstand.erfassen(angaben, "v1", { direktFreigeben: true });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("versendet");
      expect(post.gesendet.map((m) => m.to)).toEqual([SPENDE.email]);
    });

    test("direkt freigegeben über 300 €: als ausgestellt markiert, ohne Mail", async () => {
      await vorstand.erfassen({ ...angaben, betrag: 500 }, "v1", { direktFreigeben: true });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("ausgestellt");
      expect(post.gesendet).toHaveLength(0);
    });

    test("direkt freigegeben, aber die Mail scheitert: gespeichert, weiter offen, Fehler mail", async () => {
      post.fehlschlagen = true;
      expect(await vorstand.erfassen(angaben, "v1", { direktFreigeben: true })).toEqual({
        ok: false,
        grund: "mail",
        id: "anfrage1",
      });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("offen");
    });
  });

  describe("freigeben", () => {
    test("erzeugt ein lesbares PDF, auch mit Umlauten", async () => {
      const ergebnis = await vorstand.erfassen(
        { ...angaben, name: "Jürgen Größer", strasse: "Hauptstraße 1", ort: "Mindelheim" },
        "v1",
        { direktFreigeben: true },
      );
      expect(ergebnis.ok).toBe(true);
      const [anhang] = post.gesendet[0].attachments ?? [];
      expect((await PDFDocument.load(anhang.inhalt)).getPageCount()).toBeGreaterThanOrEqual(1);
    });

    test("schickt den Spendenbeleg als PDF an den Spender und schließt die Anfrage ab", async () => {
      const id = await offen();
      expect(await vorstand.freigeben(id, "v1")).toEqual({ ok: true });

      expect(post.gesendet).toHaveLength(1);
      const [mail] = post.gesendet;
      expect(mail.to).toBe(SPENDE.email);
      const [anhang] = mail.attachments ?? [];
      expect(anhang.dateiname).toBe(`Spendenbeleg_2026-11-01_${id}.pdf`);
      const pdf = await PDFDocument.load(anhang.inhalt);
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
      expect(pdf.getTitle()).toBe("Spendenbeleg");

      expect(await vorstand.laden(id)).toMatchObject({
        status: "versendet",
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
        hatBeleg: true,
      });
    });

    test("die Mail an den Spender spricht neutral von der Spende", async () => {
      await vorstand.freigeben(await offen(), "v1");
      const [mail] = post.gesendet;
      expect(mail.subject).toBe("Dein Spendenbeleg über 50,00 €");
      expect(mail.text).toStartWith("Hallo Erika Muster,");
      expect(mail.text).toContain("Deine Spende ist bei uns eingegangen.");
      expect(mail.text).not.toContain("Deine Überweisung");
    });

    test("ohne E-Mail-Adresse geht keine Mail raus, der Beleg wird trotzdem abgelegt", async () => {
      const id = await offen(50, "");
      expect(await vorstand.freigeben(id, "v1")).toEqual({ ok: true });
      expect(post.gesendet).toHaveLength(0);
      expect(await vorstand.laden(id)).toMatchObject({ status: "versendet", hatBeleg: true });
    });

    test("scheitert die Mail, bleibt die Anfrage offen", async () => {
      const id = await offen();
      post.fehlschlagen = true;
      expect(await vorstand.freigeben(id, "v1")).toEqual({ ok: false, grund: "mail" });
      expect(await vorstand.laden(id)).toMatchObject({ status: "offen", hatBeleg: false });
    });

    test("nicht bei einer Zuwendungsbestätigung", async () => {
      const id = await offen(500);
      expect(await vorstand.freigeben(id, "v1")).toEqual({ ok: false, grund: "falsche-art" });
      expect((await vorstand.laden(id))?.status).toBe("offen");
      expect(post.gesendet).toHaveLength(0);
    });

    test("ein zweiter Klick läuft ins Leere", async () => {
      const id = await offen();
      await vorstand.freigeben(id, "v1");
      expect(await vorstand.freigeben(id, "v2")).toEqual({ ok: false, grund: "nicht-offen" });
      expect(post.gesendet).toHaveLength(1);
      expect((await vorstand.laden(id))?.abschluss?.von).toBe("Manu Rothermel");
    });

    test("unbekannte Anfrage", async () => {
      expect(await vorstand.freigeben("gibtsnicht", "v1")).toEqual({ ok: false, grund: "nicht-offen" });
    });
  });

  describe("als ausgestellt markieren", () => {
    test("schließt eine Zuwendungsbestätigung ab, ohne Mail und ohne PDF", async () => {
      const id = await offen(500);
      expect(await vorstand.alsAusgestelltMarkieren(id, "v1")).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({
        status: "ausgestellt",
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
        hatBeleg: false,
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("nicht beim vereinfachten Spendenbeleg", async () => {
      const id = await offen(50);
      expect(await vorstand.alsAusgestelltMarkieren(id, "v1")).toEqual({ ok: false, grund: "falsche-art" });
      expect((await vorstand.laden(id))?.status).toBe("offen");
    });

    test("nur offene Anfragen", async () => {
      const id = await offen(500);
      await vorstand.ablehnen(id, "v1");
      expect(await vorstand.alsAusgestelltMarkieren(id, "v1")).toEqual({ ok: false, grund: "nicht-offen" });
      expect((await vorstand.laden(id))?.status).toBe("abgelehnt");
    });
  });

  describe("ablehnen", () => {
    test("geht bei beiden Arten und verschickt nichts", async () => {
      const klein = await offen(50);
      const gross = await offen(500);
      expect(await vorstand.ablehnen(klein, "v1")).toEqual({ ok: true });
      expect(await vorstand.ablehnen(gross, "v1")).toEqual({ ok: true });
      expect((await vorstand.laden(klein))?.status).toBe("abgelehnt");
      expect(await vorstand.laden(gross)).toMatchObject({
        status: "abgelehnt",
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("nur offene Anfragen", async () => {
      const id = await offen();
      await vorstand.freigeben(id, "v1");
      expect(await vorstand.ablehnen(id, "v1")).toEqual({ ok: false, grund: "nicht-offen" });
      expect((await vorstand.laden(id))?.status).toBe("versendet");
    });
  });

  describe("anzahlOffen", () => {
    test("zählt nur offene Anfragen", async () => {
      await offen();
      await vorstand.ablehnen(await offen(), "v1");
      expect(await vorstand.anzahlOffen()).toBe(1);
    });

    test("null, wenn die Ablage nicht antwortet", async () => {
      ablage.lesenFehlschlagen = true;
      expect(await vorstand.anzahlOffen()).toBeNull();
    });
  });

  describe("belegPdf", () => {
    test("liefert den abgelegten Spendenbeleg unter demselben Namen wie im Mailanhang", async () => {
      const id = await offen();
      await vorstand.freigeben(id, "v1");
      const beleg = await vorstand.belegPdf(id);
      if (!beleg.ok) throw new Error(beleg.grund);
      expect(beleg.dateiname).toBe(`Spendenbeleg_2026-11-01_${id}.pdf`);
      const pdf = await PDFDocument.load(await new Response(beleg.inhalt).arrayBuffer());
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
    });

    test("ohne abgelegten Beleg nicht gefunden", async () => {
      expect(await vorstand.belegPdf(await offen(500))).toEqual({ ok: false, grund: "nicht-gefunden" });
      expect(await vorstand.belegPdf("gibtsnicht")).toEqual({ ok: false, grund: "nicht-gefunden" });
    });

    test("Fehler, wenn die Datei nicht geladen werden kann", async () => {
      const id = await offen();
      await vorstand.freigeben(id, "v1");
      ablage.dateiFehlschlagen = true;
      expect(await vorstand.belegPdf(id)).toEqual({ ok: false, grund: "fehler" });
    });
  });
});
