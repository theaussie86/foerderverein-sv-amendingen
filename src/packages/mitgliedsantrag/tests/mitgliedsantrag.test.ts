import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import { mitgliedsantraege, type Antragsdaten } from "../index";
import { fakeUmgebung } from "./fakes";

const daten: Antragsdaten = {
  vorname: "Jürgen",
  nachname: "Größer",
  strasse: "Hauptstraße 1",
  plz: "87719",
  ort: "Mindelheim",
  email: "juergen@example.org",
  geburtsdatum: "2010-05-17",
  kontoinhaber: "Jürgen Größer",
  iban: "de89 3704 0044 0532 0130 00",
};

const herkunft = { ip: "203.0.113.7", userAgent: "Testbrowser/1.0" };

// Die Fehlerfälle loggen absichtlich. Im Testlauf stört das nur.
beforeAll(() => {
  spyOn(console, "error").mockImplementation(() => {});
});

// Holt den Token aus dem Link der Bestätigungsmail.
function tokenAusMail(text: string | undefined): string {
  const treffer = /https:\/\/foerderverein\.test\/unterschreiben\/(\S+)/.exec(text ?? "");
  if (!treffer?.[1]) throw new Error(`Kein Unterschriftslink in der Mail:\n${text}`);
  return treffer[1];
}

describe("einreichen", () => {
  test("schickt einen Unterschriftslink an das Mitglied", async () => {
    const { umgebung, postausgang } = fakeUmgebung();
    const ergebnis = await mitgliedsantraege(umgebung).einreichen(daten, herkunft);

    expect(ergebnis).toEqual({ ok: true });
    expect(postausgang.gesendet).toHaveLength(1);
    const mail = postausgang.gesendet[0];
    expect(mail?.to).toBe("juergen@example.org");
    expect(mail?.subject).toBe("Bitte bestätigen: deine Beitrittserklärung zum Förderverein SV Amendingen");
    expect(mail?.text).toContain("Hallo Jürgen,");
    expect(mail?.text).toContain("Der Link ist 7 Tage gültig.");
    expect(mail?.attachments).toBeUndefined();
  });

  test("der Link trägt Mandatsreferenz, normalisierte IBAN und den Zeitpunkt der Einreichung", async () => {
    const { umgebung, postausgang } = fakeUmgebung();
    const antraege = mitgliedsantraege(umgebung);
    await antraege.einreichen(daten, herkunft);

    const geoeffnet = antraege.oeffnen(tokenAusMail(postausgang.gesendet[0]?.text), herkunft);
    expect(geoeffnet?.antrag).toEqual({
      id: "3f2a9c1b-7d4e-4a6b-9c8d-1e2f3a4b5c6d",
      mandatsreferenz: "FV-3F2A9C1B",
      daten: { ...daten, iban: "DE89370400440532013000" },
      eingereicht: { zeit: "2026-11-10T09:15:00.000Z", ip: "203.0.113.7" },
    });
  });

  test("der Link ist 7 Tage gültig", async () => {
    const { umgebung, postausgang, uhr } = fakeUmgebung();
    const antraege = mitgliedsantraege(umgebung);
    await antraege.einreichen(daten, herkunft);
    const token = tokenAusMail(postausgang.gesendet[0]?.text);

    uhr.vorstellen(7 * 24 * 60 * 60);
    expect(antraege.oeffnen(token, herkunft)).not.toBeNull();
    uhr.vorstellen(1);
    expect(antraege.oeffnen(token, herkunft)).toBeNull();
  });

  test("ein Link mit unvollständigen Antragsdaten gilt als ungültig", () => {
    const { umgebung, siegel } = fakeUmgebung();
    const token = siegel.versiegeln(
      {
        id: "a1",
        mandatsreferenz: "FV-A1",
        daten: {},
        eingereicht: { zeit: "2026-11-10T09:15:00.000Z", ip: "203.0.113.7" },
      },
      60,
    );
    expect(mitgliedsantraege(umgebung).oeffnen(token, herkunft)).toBeNull();
  });

  test("meldet einen Fehler, wenn die Bestätigungsmail nicht rausgeht", async () => {
    const { umgebung, postausgang } = fakeUmgebung();
    postausgang.fehlerAb = 0;
    expect(await mitgliedsantraege(umgebung).einreichen(daten, herkunft)).toEqual({
      ok: false,
      fehler: "Die E-Mail konnte nicht versendet werden. Bitte versuch es später erneut.",
    });
  });
});

const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const UNTERSCHRIFT = `data:image/png;base64,${PNG_BASE64}`;

// Reicht ein, öffnet den Link eine Stunde später und gibt alles zurück, was zum Unterschreiben nötig ist.
async function eingereichtUndGeoeffnet() {
  const f = fakeUmgebung();
  const antraege = mitgliedsantraege(f.umgebung);
  await antraege.einreichen(daten, { ip: "203.0.113.7", userAgent: "Formular/1.0" });
  const token = tokenAusMail(f.postausgang.gesendet[0]?.text);
  f.uhr.vorstellen(60 * 60);
  const geoeffnet = antraege.oeffnen(token, { ip: "198.51.100.2", userAgent: "Link/1.0" });
  if (!geoeffnet) throw new Error("Link ließ sich nicht öffnen");
  f.uhr.vorstellen(5 * 60);
  f.postausgang.gesendet = [];
  return { ...f, antraege, token, sitzungToken: geoeffnet.sitzungToken };
}

describe("unterschreiben", () => {
  test("speichert den Antrag mit Protokoll, Prüfsumme und beiden PDFs", async () => {
    const { antraege, token, sitzungToken, ablage } = await eingereichtUndGeoeffnet();
    expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual({
      ok: true,
    });

    expect(ablage.gespeichert).toHaveLength(1);
    const e = ablage.gespeichert[0];
    expect(e?.antrag.mandatsreferenz).toBe("FV-3F2A9C1B");
    expect(e?.protokoll).toEqual({
      eingereicht: { zeit: "2026-11-10T09:15:00.000Z", ip: "203.0.113.7" },
      geoeffnet: { zeit: "2026-11-10T10:15:00.000Z", ip: "198.51.100.2" },
      unterschrieben: { zeit: "2026-11-10T10:20:00.000Z", ip: "203.0.113.7", userAgent: "Testbrowser/1.0" },
    });
    expect(e?.pruefsumme).toMatch(/^[0-9a-f]{64}$/);
    expect(e?.mitgliedsbeitrag).toBe(20);
    expect(Buffer.from(e?.unterschriftPng ?? []).toString("base64")).toBe(PNG_BASE64);
    expect(e?.beitrittPdf.filename).toBe("Beitrittserklaerung_Gr__er_J_rgen.pdf");
    expect(e?.mandatPdf.filename).toBe("SEPA-Lastschriftmandat_Gr__er_J_rgen.pdf");
  });

  test("beide PDFs sind lesbar und haben je eine Protokollseite", async () => {
    const { antraege, token, sitzungToken, ablage } = await eingereichtUndGeoeffnet();
    await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft);
    const e = ablage.gespeichert[0];
    for (const pdf of [e?.beitrittPdf, e?.mandatPdf]) {
      const doc = await PDFDocument.load(pdf?.content ?? new Uint8Array());
      expect(doc.getPageCount()).toBe(2);
    }
  });

  test("schickt dem Vorstand und dem Mitglied je eine Mail mit beiden PDFs", async () => {
    const { antraege, token, sitzungToken, ablage, postausgang } = await eingereichtUndGeoeffnet();
    await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft);
    const pruefsumme = ablage.gespeichert[0]?.pruefsumme ?? "";

    const [vorstand, mitglied] = postausgang.gesendet;
    expect(postausgang.gesendet).toHaveLength(2);
    expect(vorstand?.to).toBe("vorstand@foerderverein.test");
    expect(vorstand?.subject).toBe("Neuer Mitgliedsantrag: Jürgen Größer");
    expect(vorstand?.text).toContain(`Prüfsumme: ${pruefsumme}`);
    expect(vorstand?.text).toContain("Mandatsreferenz: FV-3F2A9C1B");
    expect(mitglied?.to).toBe("juergen@example.org");
    expect(mitglied?.subject).toBe("Willkommen im Förderverein SV Amendingen!");
    expect(mitglied?.text).toContain("jeweils zum 15. März unter der Gläubiger-ID DE03ZZZ00000843718");
    expect(mitglied?.text).toContain("Mandatsreferenz FV-3F2A9C1B");
    for (const mail of [vorstand, mitglied]) {
      expect(mail?.attachments?.map((a) => a.filename)).toEqual([
        "Beitrittserklaerung_Gr__er_J_rgen.pdf",
        "SEPA-Lastschriftmandat_Gr__er_J_rgen.pdf",
      ]);
    }
  });

  test("derselbe Link ein zweites Mal: Erfolg ohne weitere Mails", async () => {
    const { antraege, token, sitzungToken, ablage, postausgang } = await eingereichtUndGeoeffnet();
    ablage.verhalten = "bereits-vorhanden";
    expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual({
      ok: true,
    });
    expect(postausgang.gesendet).toHaveLength(0);
  });

  for (const verhalten of ["wirft", "uebersprungen"] as const) {
    test(`Ablage ${verhalten}: Mails gehen trotzdem raus`, async () => {
      const { antraege, token, sitzungToken, ablage, postausgang } = await eingereichtUndGeoeffnet();
      ablage.verhalten = verhalten;
      expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual({
        ok: true,
      });
      expect(postausgang.gesendet).toHaveLength(2);
      expect(postausgang.gesendet[0]?.attachments).toHaveLength(2);
    });
  }

  for (const fehlerAb of [0, 1]) {
    test(`Mail ${fehlerAb + 1} schlägt fehl: Fehler`, async () => {
      const { antraege, token, sitzungToken, postausgang } = await eingereichtUndGeoeffnet();
      postausgang.fehlerAb = fehlerAb;
      expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual({
        ok: false,
        fehler: "Der Antrag konnte nicht versendet werden. Bitte versuch es später erneut.",
      });
    });
  }

  const LINK_UNGUELTIG = { ok: false, fehler: "Der Link ist abgelaufen oder ungültig. Bitte stell den Antrag erneut." };

  test("abgelaufene Sitzung (über 24 Stunden): Link ungültig, nichts gespeichert", async () => {
    const { antraege, token, sitzungToken, uhr, ablage, postausgang } = await eingereichtUndGeoeffnet();
    uhr.vorstellen(24 * 60 * 60 - 5 * 60);
    uhr.vorstellen(1);
    expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual(
      LINK_UNGUELTIG,
    );
    expect(ablage.gespeichert).toHaveLength(0);
    expect(postausgang.gesendet).toHaveLength(0);
  });

  test("Sitzung noch knapp gültig: Unterschrift klappt", async () => {
    const { antraege, token, sitzungToken, uhr } = await eingereichtUndGeoeffnet();
    uhr.vorstellen(24 * 60 * 60 - 5 * 60);
    expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft)).toEqual({
      ok: true,
    });
  });

  test("abgelaufener Link: ungültig", async () => {
    const { antraege, token, sitzungToken, uhr } = await eingereichtUndGeoeffnet();
    // Link nach 7 Tagen abgelaufen, Sitzung erst kurz davor geöffnet.
    uhr.vorstellen(7 * 24 * 60 * 60 - 65 * 60 - 60);
    const neu = antraege.oeffnen(token, herkunft);
    uhr.vorstellen(120);
    expect(
      await antraege.unterschreiben(
        { token, sitzungToken: neu?.sitzungToken ?? sitzungToken, unterschrift: UNTERSCHRIFT },
        herkunft,
      ),
    ).toEqual(LINK_UNGUELTIG);
  });

  test("Sitzung eines anderen Antrags: ungültig", async () => {
    const { antraege, token, postausgang } = await eingereichtUndGeoeffnet();
    await antraege.einreichen({ ...daten, vorname: "Erika" }, herkunft);
    const fremd = antraege.oeffnen(tokenAusMail(postausgang.gesendet[0]?.text), herkunft);
    expect(
      await antraege.unterschreiben(
        { token, sitzungToken: fremd?.sitzungToken ?? "", unterschrift: UNTERSCHRIFT },
        herkunft,
      ),
    ).toEqual(LINK_UNGUELTIG);
  });

  test("Sitzungstoken anstelle des Antragstokens: ungültig", async () => {
    const { antraege, sitzungToken } = await eingereichtUndGeoeffnet();
    expect(
      await antraege.unterschreiben({ token: sitzungToken, sitzungToken, unterschrift: UNTERSCHRIFT }, herkunft),
    ).toEqual(LINK_UNGUELTIG);
  });

  const BILD_FEHLER = { ok: false, fehler: "Die Unterschrift konnte nicht verarbeitet werden." };

  test("leere Unterschrift: Fehler", async () => {
    const { antraege, token, sitzungToken } = await eingereichtUndGeoeffnet();
    expect(
      await antraege.unterschreiben({ token, sitzungToken, unterschrift: "data:image/png;base64," }, herkunft),
    ).toEqual(BILD_FEHLER);
  });

  test("Unterschrift über 500 000 Bytes: Fehler, genau 500 000 geht durch die Größenprüfung", async () => {
    const { antraege, token, sitzungToken, ablage } = await eingereichtUndGeoeffnet();
    const zuGross = `data:image/png;base64,${Buffer.alloc(500_001).toString("base64")}`;
    expect(await antraege.unterschreiben({ token, sitzungToken, unterschrift: zuGross }, herkunft)).toEqual(
      BILD_FEHLER,
    );
    expect(ablage.gespeichert).toHaveLength(0);
  });
});

describe("anzahlSeit", () => {
  const datum = new Date("2026-10-23T00:00:00Z");

  test("gibt die Zahl der Ablage zurück", async () => {
    const { umgebung, ablage } = fakeUmgebung();
    ablage.anzahl = 4;
    expect(await mitgliedsantraege(umgebung).anzahlSeit(datum)).toBe(4);
    expect(ablage.zaehlAufrufe).toEqual([datum]);
  });

  test("null ohne Ablage oder bei Fehler", async () => {
    const { umgebung, ablage } = fakeUmgebung();
    ablage.anzahl = null;
    expect(await mitgliedsantraege(umgebung).anzahlSeit(datum)).toBeNull();
    ablage.anzahl = "wirft";
    expect(await mitgliedsantraege(umgebung).anzahlSeit(datum)).toBeNull();
  });
});
