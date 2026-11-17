/// <reference path="../pb_data/types.d.ts" />

// Interner Grund der Ablehnung eines Mitgliedsantrags (#83). Steht nicht in der Mail an den Antragsteller.

migrate(
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    if (!antraege.fields.getByName("ablehnungsgrund")) {
      antraege.fields.add(new TextField({ name: "ablehnungsgrund", max: 1000 }));
    }
    app.save(antraege);
  },
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    antraege.fields.removeByName("ablehnungsgrund");
    app.save(antraege);
  },
);
