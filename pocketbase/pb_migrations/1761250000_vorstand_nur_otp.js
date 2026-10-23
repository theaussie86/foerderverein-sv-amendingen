/// <reference path="../pb_data/types.d.ts" />

// Der Vorstand meldet sich nur noch mit Einmal-Code per E-Mail an. Das Passwortfeld
// bleibt als Systemfeld bestehen, wird aber für die Anmeldung nicht mehr akzeptiert.

migrate(
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.passwordAuth.enabled = false;
    app.save(vorstand);
  },
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.passwordAuth.enabled = true;
    app.save(vorstand);
  },
);
