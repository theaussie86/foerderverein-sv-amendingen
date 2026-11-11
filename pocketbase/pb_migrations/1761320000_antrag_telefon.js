/// <reference path="../pb_data/types.d.ts" />

// Telefon privat und Handy, freiwillig wie auf der Papiervorlage der Beitrittserklärung (#16).

migrate(
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    if (!antraege.fields.getByName("telefon")) antraege.fields.add(new TextField({ name: "telefon", max: 40 }));
    if (!antraege.fields.getByName("handy")) antraege.fields.add(new TextField({ name: "handy", max: 40 }));
    app.save(antraege);
  },
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    antraege.fields.removeByName("telefon");
    antraege.fields.removeByName("handy");
    app.save(antraege);
  },
);
