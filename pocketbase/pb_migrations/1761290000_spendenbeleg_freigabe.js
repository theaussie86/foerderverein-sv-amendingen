/// <reference path="../pb_data/types.d.ts" />

// Spendenbelege gehen nicht mehr automatisch raus. Jede Anfrage startet "offen", der
// Vorstand prüft den Geldeingang und gibt den Beleg frei ("versendet") oder schließt
// die Anfrage, wenn keine Überweisung da ist ("abgelehnt").

migrate(
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    const status = belege.fields.getByName("status");
    status.values = ["versendet", "offen", "ausgestellt", "abgelehnt"];
    app.save(belege);
  },
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    const status = belege.fields.getByName("status");
    status.values = ["versendet", "offen", "ausgestellt"];
    app.save(belege);
  },
);
