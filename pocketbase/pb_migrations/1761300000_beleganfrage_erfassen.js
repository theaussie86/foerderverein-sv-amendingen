/// <reference path="../pb_data/types.d.ts" />

// Der Vorstand erfasst Beleganfragen auch selbst im internen Bereich, etwa wenn sich ein
// Spender per WhatsApp meldet. Dann fehlt oft die E-Mail-Adresse, und es soll erkennbar
// sein, wer die Anfrage erfasst hat (leer = über die Website). Das Datum heißt jetzt wie
// im Glossar "Tag der Spende", weil eine Spende nicht nur per Überweisung kommt.
// Das Umbenennen behält die Feld-ID, die Werte bleiben erhalten.

migrate(
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    const belege = app.findCollectionByNameOrId("spendenbelege");
    belege.fields.getByName("ueberwiesen_am").name = "tag_der_spende";
    belege.fields.getByName("email").required = false;
    if (!belege.fields.getByName("erfasst_von")) {
      belege.fields.add(new RelationField({ name: "erfasst_von", collectionId: vorstand.id, maxSelect: 1 }));
    }
    app.save(belege);
  },
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    belege.fields.getByName("tag_der_spende").name = "ueberwiesen_am";
    belege.fields.getByName("email").required = true;
    belege.fields.removeByName("erfasst_von");
    app.save(belege);
  },
);
