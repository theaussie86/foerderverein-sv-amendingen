import type PocketBase from "pocketbase";
import { ClientResponseError, type RecordModel } from "pocketbase";
import type {
  Ablehnungsgrund,
  AnfrageStatus,
  BelegArt,
  Zahlungsweg,
  Beleganfrage,
  Datei,
  Leseablage,
  Listeneintrag,
  Schreibablage,
  Suche,
} from "./typen";

// Einzige Stelle, die die Collection "spendenbelege" kennt. Hier werden die PocketBase-Namen
// in die Begriffe des Glossars übersetzt (Umbenennen in der Datenbank ist #67).

type Vorstandsrecord = RecordModel & { name: string; email: string };

type Spendenbeleg = RecordModel & {
  art: BelegArt;
  status: AnfrageStatus;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  betrag: number;
  betrag_angegeben: number;
  tag_der_spende: string;
  wartet_seit: string;
  zuletzt_geprueft: string;
  ablehnungsgrund: Ablehnungsgrund | "";
  ablehnung_begruendung: string;
  // Leer nur bei Einträgen, die vor der Migration entstanden und nicht nachgezogen wurden.
  zahlungsweg: Zahlungsweg | "";
  ausgestellt_von: string;
  ausgestellt_am: string;
  notiz: string;
  beleg_pdf: string;
  erfasst_von: string;
  created: string;
  expand?: { ausgestellt_von?: Vorstandsrecord; erfasst_von?: Vorstandsrecord };
};

const PRO_SEITE = 25;

const tag = (wert: string) => wert.slice(0, 10);

const pbDatum = (d: Date) => d.toISOString().replace("T", " ");

function listeneintrag(r: Spendenbeleg): Listeneintrag {
  return {
    id: r.id,
    art: r.art,
    status: r.status,
    name: r.name,
    ort: r.ort,
    email: r.email,
    betrag: r.betrag,
    // Vor der Betragskorrektur gespeicherte Datensätze hat die Migration befüllt, sicher ist sicher.
    betragAngegeben: r.betrag_angegeben || r.betrag,
    tagDerSpende: tag(r.tag_der_spende),
    zahlungsweg: r.zahlungsweg || "ueberweisung",
    angefragtAm: r.created,
    wartend: r.wartet_seit ? { seit: r.wartet_seit, zuletztGeprueft: r.zuletzt_geprueft || r.wartet_seit } : null,
  };
}

function beleganfrage(r: Spendenbeleg): Beleganfrage {
  const erfasser = r.expand?.erfasst_von;
  return {
    ...listeneintrag(r),
    strasse: r.strasse,
    plz: r.plz,
    notiz: r.notiz,
    erfasstVon: r.erfasst_von ? erfasser?.name || erfasser?.email || "Vorstand" : null,
    ablehnung: r.ablehnungsgrund ? { grund: r.ablehnungsgrund, begruendung: r.ablehnung_begruendung } : null,
    abschluss: r.ausgestellt_am ? { am: r.ausgestellt_am, von: r.expand?.ausgestellt_von?.name || null } : null,
    hatBeleg: !!r.beleg_pdf,
  };
}

function pdfDatei({ dateiname, inhalt }: Datei): File {
  return new File([new Uint8Array(inhalt)], dateiname, { type: "application/pdf" });
}

async function ohne404<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ClientResponseError && e.status === 404) return null;
    throw e;
  }
}

// Mit dem Client des angemeldeten Vorstands, damit dessen Token und die API-Regeln greifen.
export function leseablage(pb: PocketBase): Leseablage {
  const spendenbelege = () => pb.collection("spendenbelege");

  return {
    async laden(id) {
      const r = await ohne404(spendenbelege().getOne<Spendenbeleg>(id, { expand: "ausgestellt_von,erfasst_von" }));
      return r && beleganfrage(r);
    },

    async suchen({ suche, status, seite }: Suche) {
      const teile: string[] = [];
      const params: Record<string, string> = {};
      suche
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .forEach((wort, i) => {
          params[`w${i}`] = wort;
          teile.push(`(${["name", "email", "ort", "strasse"].map((f) => `${f} ~ {:w${i}}`).join(" || ")})`);
        });
      if (status) {
        params.status = status;
        teile.push("status = {:status}");
      }
      const liste = await spendenbelege().getList<Spendenbeleg>(seite, PRO_SEITE, {
        filter: teile.length ? pb.filter(teile.join(" && "), params) : "",
        sort: "-created",
        fields:
          "id,art,status,name,ort,email,betrag,betrag_angegeben,tag_der_spende,zahlungsweg,created,wartet_seit,zuletzt_geprueft",
      });
      return { eintraege: liste.items.map(listeneintrag), anzahl: liste.totalItems, seiten: liste.totalPages };
    },

    async anzahlOffen() {
      const liste = await spendenbelege().getList(1, 1, { filter: 'status = "offen"', fields: "id" });
      return liste.totalItems;
    },

    // Der Spendenbeleg ist in PocketBase geschützt und PocketBase ist nicht öffentlich erreichbar.
    // Die Website holt ihn mit dem Token des Vorstands und reicht ihn durch.
    async belegDatei(id) {
      const r = await ohne404(spendenbelege().getOne<Spendenbeleg>(id));
      if (!r?.beleg_pdf) return null;
      const token = await pb.files.getToken();
      const antwort = await fetch(pb.files.getURL(r, r.beleg_pdf, { token }), { cache: "no-store" });
      if (!antwort.ok || !antwort.body) throw new Error(`PocketBase antwortet mit ${antwort.status}`);
      return antwort.body;
    },
  };
}

// Als Superuser. Null-Client heißt: PocketBase ist nicht konfiguriert (lokale Entwicklung).
export function schreibablage(superuser: () => Promise<PocketBase | null>): Schreibablage {
  return {
    // Jede Anfrage startet offen. Erst wenn der Vorstand den Geldeingang geprüft hat, geht ein Beleg raus.
    async speichern({ tagDerSpende, erfasstVon, ...rest }) {
      const pb = await superuser();
      if (!pb) return null;
      const record = await pb.collection("spendenbelege").create({
        ...rest,
        betrag_angegeben: rest.betrag,
        status: "offen",
        tag_der_spende: `${tagDerSpende} 00:00:00.000Z`,
        erfasst_von: erfasstVon ?? "",
      });
      return record.id;
    },

    // Hält fest, wer abgeschlossen hat. Die Ausstellung schreibt den maßgeblichen Betrag samt Art
    // und legt beim vereinfachten Spendenbeleg das PDF ab, die Ablehnung ihren Grund.
    async abschliessen(id, abschluss) {
      const pb = await superuser();
      if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
      const gemeinsam = {
        status: abschluss.status,
        ausgestellt_von: abschluss.vorstandId,
        ausgestellt_am: pbDatum(abschluss.am),
      };
      await pb.collection("spendenbelege").update(
        id,
        abschluss.status === "ausgestellt"
          ? {
              ...gemeinsam,
              betrag: abschluss.betrag,
              art: abschluss.art,
              ...(abschluss.beleg ? { beleg_pdf: pdfDatei(abschluss.beleg) } : {}),
            }
          : {
              ...gemeinsam,
              ablehnungsgrund: abschluss.ablehnung.grund,
              ablehnung_begruendung: abschluss.ablehnung.begruendung,
            },
      );
    },

    async betragKorrigieren(id, { betrag, art }) {
      const pb = await superuser();
      if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
      await pb.collection("spendenbelege").update(id, { betrag, art });
    },

    async wartendMarkieren(id, { seit, zuletztGeprueft }) {
      const pb = await superuser();
      if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
      await pb.collection("spendenbelege").update(id, {
        status: "wartend",
        wartet_seit: pbDatum(seit),
        zuletzt_geprueft: pbDatum(zuletztGeprueft),
      });
    },
  };
}
