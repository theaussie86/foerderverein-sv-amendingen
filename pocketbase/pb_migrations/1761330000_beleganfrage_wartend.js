/// <reference path="../pb_data/types.d.ts" />

// Beleganfragen nach Glossar (#22): Statuswerte offen, wartend, ausgestellt, abgelehnt.
// "versendet" (ausgestellter vereinfachter Spendenbeleg) wird zu "ausgestellt", die Art steht in "art".
// Neu: wartet_seit und zuletzt_geprueft für wartende Anfragen, Ablehnungsgrund mit Begründung
// (alte Ablehnungen haben keinen) und betrag_angegeben für die Betragskorrektur. "betrag" ist der
// maßgebliche Betrag, bestehende Datensätze bekommen betrag_angegeben = betrag.

const GRUENDE = ["nicht-eingegangen", "doppelt", "keine-spende", "sonstiges"];

migrate(
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    // Erst alle Werte zulassen, dann umschreiben, dann "versendet" entfernen.
    belege.fields.getByName("status").values = ["offen", "wartend", "ausgestellt", "abgelehnt", "versendet"];
    if (!belege.fields.getByName("betrag_angegeben")) {
      belege.fields.add(new NumberField({ name: "betrag_angegeben", min: 0 }));
    }
    if (!belege.fields.getByName("wartet_seit")) belege.fields.add(new DateField({ name: "wartet_seit" }));
    if (!belege.fields.getByName("zuletzt_geprueft")) belege.fields.add(new DateField({ name: "zuletzt_geprueft" }));
    if (!belege.fields.getByName("ablehnungsgrund")) {
      belege.fields.add(new SelectField({ name: "ablehnungsgrund", maxSelect: 1, values: GRUENDE }));
    }
    if (!belege.fields.getByName("ablehnung_begruendung")) {
      belege.fields.add(new TextField({ name: "ablehnung_begruendung", max: 1000 }));
    }
    app.save(belege);

    app.db().newQuery("UPDATE spendenbelege SET status = 'ausgestellt' WHERE status = 'versendet'").execute();
    app
      .db()
      .newQuery("UPDATE spendenbelege SET betrag_angegeben = betrag WHERE betrag_angegeben IS NULL OR betrag_angegeben = 0")
      .execute();

    const danach = app.findCollectionByNameOrId("spendenbelege");
    danach.fields.getByName("status").values = ["offen", "wartend", "ausgestellt", "abgelehnt"];
    app.save(danach);
  },
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    belege.fields.getByName("status").values = ["offen", "wartend", "ausgestellt", "abgelehnt", "versendet"];
    app.save(belege);

    app
      .db()
      .newQuery("UPDATE spendenbelege SET status = 'versendet' WHERE status = 'ausgestellt' AND art = 'vereinfacht'")
      .execute();
    app.db().newQuery("UPDATE spendenbelege SET status = 'offen' WHERE status = 'wartend'").execute();

    const danach = app.findCollectionByNameOrId("spendenbelege");
    danach.fields.getByName("status").values = ["versendet", "offen", "ausgestellt", "abgelehnt"];
    for (const name of ["betrag_angegeben", "wartet_seit", "zuletzt_geprueft", "ablehnungsgrund", "ablehnung_begruendung"]) {
      danach.fields.removeByName(name);
    }
    app.save(danach);
  },
);
