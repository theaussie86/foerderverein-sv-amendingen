/// <reference path="../pb_data/types.d.ts" />

// Bild eines Förderprojekts wird optional. Ohne Bild zeigt die Website ein Standardbild aus Wappen
// und Titel.

migrate(
  (app) => {
    const foerderprojekte = app.findCollectionByNameOrId("foerderprojekte");
    foerderprojekte.fields.getByName("bild").required = false;
    app.save(foerderprojekte);
  },
  (app) => {
    const foerderprojekte = app.findCollectionByNameOrId("foerderprojekte");
    foerderprojekte.fields.getByName("bild").required = true;
    app.save(foerderprojekte);
  },
);
