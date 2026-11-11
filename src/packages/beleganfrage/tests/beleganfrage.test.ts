import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import { belegArt } from "../anzeige";
import { ablehnungsmailVorlagen, vorstandsBeleganfragen, websiteBeleganfragen } from "../index";
import { Ablage, JETZT, Post } from "./fakes";

const SPAETER = new Date("2026-11-24T10:00:00.000Z");

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
  zahlungsweg: "ueberweisung" as const,
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

  test("die Mail nennt den Zahlungsweg und sagt, wo der Vorstand prüft", async () => {
    await website.stellen(SPENDE);
    expect(post.gesendet[0].text).toContain("Zahlungsweg: Überweisung");
    expect(post.gesendet[0].text).toContain("Geldeingang auf dem Vereinskonto prüfen");
  });

  test("bei PayPal prüft der Vorstand im PayPal-Konto", async () => {
    await website.stellen({ ...SPENDE, zahlungsweg: "paypal" });
    const [anfrage] = ablage.eintraege.values();
    expect(anfrage.zahlungsweg).toBe("paypal");
    expect(post.gesendet[0].text).toContain("Zahlungsweg: PayPal");
    expect(post.gesendet[0].text).toContain("Geldeingang im PayPal-Konto des Fördervereins prüfen");
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
  let jetzt: Date;

  beforeEach(() => {
    ablage = new Ablage();
    post = new Post();
    jetzt = JETZT;
    vorstand = vorstandsBeleganfragen({ lesen: ablage, schreiben: ablage, post, jetzt: () => jetzt });
  });

  const angaben = { ...SPENDE, notiz: "per WhatsApp" };

  const OHNE_MAIL = { grund: "nicht-eingegangen", begruendung: "", mailText: null } as const;

  async function offen(betrag = 50, email = SPENDE.email): Promise<string> {
    const ergebnis = await vorstand.erfassen({ ...angaben, betrag, email }, "v2", { direktAusstellen: false });
    if (!ergebnis.ok) throw new Error("nicht erfasst");
    return ergebnis.id;
  }

  describe("erfassen", () => {
    test("speichert eine offene Anfrage mit Erfasser und meldet nichts an den Vorstand", async () => {
      const ergebnis = await vorstand.erfassen(angaben, "v1", { direktAusstellen: false });
      expect(ergebnis).toEqual({ ok: true, id: "anfrage1" });
      expect(await vorstand.laden("anfrage1")).toMatchObject({
        ...angaben,
        art: "vereinfacht",
        status: "offen",
        betragAngegeben: angaben.betrag,
        erfasstVon: "Manu Rothermel",
        abschluss: null,
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("meldet, wenn nichts gespeichert wurde", async () => {
      ablage.speichernFehlschlagen = true;
      expect(await vorstand.erfassen(angaben, "v1", { direktAusstellen: false })).toEqual({
        ok: false,
        grund: "nicht-gespeichert",
      });
    });

    test("direkt ausgestellt bis 300 €: Spendenbeleg geht sofort raus", async () => {
      await vorstand.erfassen(angaben, "v1", { direktAusstellen: true });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("ausgestellt");
      expect(post.gesendet.map((m) => m.to)).toEqual([SPENDE.email]);
    });

    test("direkt ausgestellt über 300 €: als ausgestellt markiert, ohne Mail", async () => {
      await vorstand.erfassen({ ...angaben, betrag: 500 }, "v1", { direktAusstellen: true });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("ausgestellt");
      expect(post.gesendet).toHaveLength(0);
    });

    test("direkt ausgestellt, aber die Mail scheitert: gespeichert, weiter offen, Fehler mail", async () => {
      post.fehlschlagen = true;
      expect(await vorstand.erfassen(angaben, "v1", { direktAusstellen: true })).toEqual({
        ok: false,
        grund: "mail",
        id: "anfrage1",
      });
      expect((await vorstand.laden("anfrage1"))?.status).toBe("offen");
    });
  });

  describe("ausstellen: vereinfachter Spendenbeleg", () => {
    test("erzeugt ein lesbares PDF, auch mit Umlauten", async () => {
      const ergebnis = await vorstand.erfassen(
        { ...angaben, name: "Jürgen Größer", strasse: "Hauptstraße 1", ort: "Mindelheim" },
        "v1",
        { direktAusstellen: true },
      );
      expect(ergebnis.ok).toBe(true);
      const [anhang] = post.gesendet[0].attachments ?? [];
      expect((await PDFDocument.load(anhang.inhalt)).getPageCount()).toBeGreaterThanOrEqual(1);
    });

    test("schickt den Spendenbeleg als PDF an den Spender und schließt die Anfrage ab", async () => {
      const id = await offen();
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });

      expect(post.gesendet).toHaveLength(1);
      const [mail] = post.gesendet;
      expect(mail.to).toBe(SPENDE.email);
      const [anhang] = mail.attachments ?? [];
      expect(anhang.dateiname).toBe(`Spendenbeleg_2026-11-01_${id}.pdf`);
      const pdf = await PDFDocument.load(anhang.inhalt);
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
      expect(pdf.getTitle()).toBe("Spendenbeleg");

      expect(await vorstand.laden(id)).toMatchObject({
        status: "ausgestellt",
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
        hatBeleg: true,
      });
    });

    test("die Mail an den Spender spricht neutral von der Spende", async () => {
      await vorstand.ausstellen(await offen(), "v1");
      const [mail] = post.gesendet;
      expect(mail.subject).toBe("Dein Spendenbeleg über 50,00 €");
      expect(mail.text).toStartWith("Hallo Erika Muster,");
      expect(mail.text).toContain("Deine Spende ist bei uns eingegangen.");
      expect(mail.text).not.toContain("Deine Überweisung");
      expect(mail.text).not.toContain("angegeben");
      expect(mail.text).toContain("Kontoauszug oder deiner PayPal-Buchungsbestätigung");
    });

    test("ohne E-Mail-Adresse geht keine Mail raus, der Beleg wird trotzdem abgelegt", async () => {
      const id = await offen(50, "");
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });
      expect(post.gesendet).toHaveLength(0);
      expect(await vorstand.laden(id)).toMatchObject({ status: "ausgestellt", hatBeleg: true });
    });

    test("scheitert die Mail, bleibt die Anfrage offen", async () => {
      const id = await offen();
      post.fehlschlagen = true;
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: false, grund: "mail" });
      expect(await vorstand.laden(id)).toMatchObject({ status: "offen", hatBeleg: false });
    });

    test("auch aus Wartend", async () => {
      const id = await offen();
      await vorstand.alsWartendMarkieren(id);
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({ status: "ausgestellt", hatBeleg: true });
      expect(post.gesendet).toHaveLength(1);
    });

    test("scheitert die Mail, bleibt eine wartende Anfrage wartend", async () => {
      const id = await offen();
      await vorstand.alsWartendMarkieren(id);
      post.fehlschlagen = true;
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: false, grund: "mail" });
      expect(await vorstand.laden(id)).toMatchObject({ status: "wartend", hatBeleg: false });
    });

    test("ein zweiter Klick läuft ins Leere", async () => {
      const id = await offen();
      await vorstand.ausstellen(id, "v1");
      expect(await vorstand.ausstellen(id, "v2")).toEqual({ ok: false, grund: "abgeschlossen" });
      expect(post.gesendet).toHaveLength(1);
      expect((await vorstand.laden(id))?.abschluss?.von).toBe("Manu Rothermel");
    });

    test("unbekannte Anfrage", async () => {
      expect(await vorstand.ausstellen("gibtsnicht", "v1")).toEqual({ ok: false, grund: "abgeschlossen" });
    });
  });

  describe("ausstellen: Zuwendungsbestätigung", () => {
    test("schließt eine Zuwendungsbestätigung ab, ohne Mail und ohne PDF", async () => {
      const id = await offen(500);
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({
        status: "ausgestellt",
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
        hatBeleg: false,
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("auch aus Wartend", async () => {
      const id = await offen(500);
      await vorstand.alsWartendMarkieren(id);
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });
      expect((await vorstand.laden(id))?.status).toBe("ausgestellt");
    });

    test("nur offene oder wartende Anfragen", async () => {
      const id = await offen(500);
      await vorstand.ablehnen(id, "v1", OHNE_MAIL);
      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: false, grund: "abgeschlossen" });
      expect((await vorstand.laden(id))?.status).toBe("abgelehnt");
    });
  });

  describe("ablehnen", () => {
    test("geht bei beiden Arten, hält den Ablehnungsgrund fest und verschickt ohne Mailtext nichts", async () => {
      const klein = await offen(50);
      const gross = await offen(500);
      expect(await vorstand.ablehnen(klein, "v1", OHNE_MAIL)).toEqual({ ok: true });
      expect(await vorstand.ablehnen(gross, "v1", { grund: "sonstiges", begruendung: "Spam", mailText: null })).toEqual(
        { ok: true },
      );
      expect(await vorstand.laden(klein)).toMatchObject({
        status: "abgelehnt",
        ablehnung: { grund: "nicht-eingegangen", begruendung: "" },
      });
      expect(await vorstand.laden(gross)).toMatchObject({
        status: "abgelehnt",
        ablehnung: { grund: "sonstiges", begruendung: "Spam" },
        abschluss: { am: JETZT.toISOString(), von: "Manu Rothermel" },
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("eine Begründung zählt nur bei Sonstiges", async () => {
      const id = await offen();
      await vorstand.ablehnen(id, "v1", { ...OHNE_MAIL, grund: "doppelt", begruendung: "übrig" });
      expect((await vorstand.laden(id))?.ablehnung).toEqual({ grund: "doppelt", begruendung: "" });
    });

    test("auch aus Wartend", async () => {
      const id = await offen();
      await vorstand.alsWartendMarkieren(id);
      expect(await vorstand.ablehnen(id, "v1", OHNE_MAIL)).toEqual({ ok: true });
      expect((await vorstand.laden(id))?.status).toBe("abgelehnt");
    });

    test("schickt die Ablehnungsmail mit dem angepassten Text an den Spender", async () => {
      const id = await offen();
      const mailText = "Hallo Erika,\n\nleider nichts gefunden.";
      expect(await vorstand.ablehnen(id, "v1", { grund: "doppelt", begruendung: "", mailText })).toEqual({ ok: true });
      expect(post.gesendet).toEqual([
        { to: SPENDE.email, subject: "Deine Beleganfrage über 50,00\u00a0€", text: mailText },
      ]);
      expect((await vorstand.laden(id))?.ablehnung).toEqual({ grund: "doppelt", begruendung: "" });
    });

    test("scheitert die Ablehnungsmail, bleibt die Anfrage unverändert", async () => {
      const id = await offen();
      await vorstand.alsWartendMarkieren(id);
      post.fehlschlagen = true;
      expect(await vorstand.ablehnen(id, "v1", { ...OHNE_MAIL, mailText: "Hallo" })).toEqual({
        ok: false,
        grund: "mail",
      });
      expect(await vorstand.laden(id)).toMatchObject({ status: "wartend", ablehnung: null, abschluss: null });
    });

    test("ohne E-Mail-Adresse geht keine Ablehnungsmail raus", async () => {
      const id = await offen(50, "");
      expect(await vorstand.ablehnen(id, "v1", { ...OHNE_MAIL, mailText: "Hallo" })).toEqual({ ok: true });
      expect(post.gesendet).toHaveLength(0);
    });

    test("nur offene oder wartende Anfragen", async () => {
      const id = await offen();
      await vorstand.ausstellen(id, "v1");
      expect(await vorstand.ablehnen(id, "v1", OHNE_MAIL)).toEqual({ ok: false, grund: "abgeschlossen" });
      expect((await vorstand.laden(id))?.status).toBe("ausgestellt");
    });

    test("für jeden Ablehnungsgrund gibt es eine Vorlage für die Ablehnungsmail", async () => {
      const anfrage = await vorstand.laden(await offen());
      if (!anfrage) throw new Error("nicht geladen");
      const vorlagen = ablehnungsmailVorlagen(anfrage);
      expect(Object.keys(vorlagen).sort()).toEqual(["doppelt", "keine-spende", "nicht-eingegangen", "sonstiges"]);
      for (const text of Object.values(vorlagen)) {
        expect(text).toStartWith("Hallo Erika Muster,");
        expect(text).toContain("50,00\u00a0€");
      }
      expect(vorlagen["nicht-eingegangen"]).toContain("keine passende Spende");
    });
  });

  describe("Betragskorrektur", () => {
    test("weniger eingegangen als angegeben: vereinfachter Spendenbeleg über den eingegangenen Betrag", async () => {
      const id = await offen(400);
      expect(await vorstand.ausstellen(id, "v1", 250)).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({
        status: "ausgestellt",
        art: "vereinfacht",
        betrag: 250,
        betragAngegeben: 400,
        hatBeleg: true,
      });
      const [mail] = post.gesendet;
      expect(mail.subject).toBe("Dein Spendenbeleg über 250,00\u00a0€");
      expect(mail.text).toContain(
        "Auf unserem Konto sind 250,00\u00a0€ eingegangen, angegeben hattest du 400,00\u00a0€. Der Spendenbeleg lautet deshalb über 250,00\u00a0€.",
      );
    });

    test("scheitert die Mail, bleibt auch der Betrag unverändert", async () => {
      const id = await offen(400);
      post.fehlschlagen = true;
      expect(await vorstand.ausstellen(id, "v1", 250)).toEqual({ ok: false, grund: "mail" });
      expect(await vorstand.laden(id)).toMatchObject({ status: "offen", art: "zuwendungsbestaetigung", betrag: 400 });
    });

    test("mehr eingegangen, über 300 €: wird zur Zuwendungsbestätigung und bleibt wartend", async () => {
      const id = await offen(250);
      await vorstand.alsWartendMarkieren(id);
      expect(await vorstand.ausstellen(id, "v1", 400)).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({
        status: "wartend",
        art: "zuwendungsbestaetigung",
        betrag: 400,
        betragAngegeben: 250,
        abschluss: null,
        hatBeleg: false,
      });
      expect(post.gesendet).toHaveLength(0);

      expect(await vorstand.ausstellen(id, "v1")).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({ status: "ausgestellt", betrag: 400 });
    });

    test("bei der Zuwendungsbestätigung zählt der eingegangene Betrag", async () => {
      const id = await offen(500);
      expect(await vorstand.ausstellen(id, "v1", 450)).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({ status: "ausgestellt", betrag: 450, betragAngegeben: 500 });
    });
  });

  describe("als wartend markieren", () => {
    test("hält fest, seit wann die Anfrage wartet und wann zuletzt geprüft wurde", async () => {
      const id = await offen();
      expect(await vorstand.alsWartendMarkieren(id)).toEqual({ ok: true });
      expect(await vorstand.laden(id)).toMatchObject({
        status: "wartend",
        wartend: { seit: JETZT.toISOString(), zuletztGeprueft: JETZT.toISOString() },
        abschluss: null,
      });
      expect(post.gesendet).toHaveLength(0);
    });

    test("erneutes Markieren ändert nur zuletzt geprüft", async () => {
      const id = await offen();
      await vorstand.alsWartendMarkieren(id);
      jetzt = SPAETER;
      expect(await vorstand.alsWartendMarkieren(id)).toEqual({ ok: true });
      expect((await vorstand.laden(id))?.wartend).toEqual({
        seit: JETZT.toISOString(),
        zuletztGeprueft: SPAETER.toISOString(),
      });
    });

    test("nicht bei abgeschlossenen Anfragen", async () => {
      const id = await offen();
      await vorstand.ablehnen(id, "v1", OHNE_MAIL);
      expect(await vorstand.alsWartendMarkieren(id)).toEqual({ ok: false, grund: "abgeschlossen" });
      expect((await vorstand.laden(id))?.status).toBe("abgelehnt");
    });

    test("zählt nicht als offen", async () => {
      await offen();
      await vorstand.alsWartendMarkieren(await offen());
      expect(await vorstand.anzahlOffen()).toBe(1);
    });
  });

  describe("anzahlOffen", () => {
    test("zählt nur offene Anfragen", async () => {
      await offen();
      await vorstand.ablehnen(await offen(), "v1", OHNE_MAIL);
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
      await vorstand.ausstellen(id, "v1");
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
      await vorstand.ausstellen(id, "v1");
      ablage.dateiFehlschlagen = true;
      expect(await vorstand.belegPdf(id)).toEqual({ ok: false, grund: "fehler" });
    });
  });
});
