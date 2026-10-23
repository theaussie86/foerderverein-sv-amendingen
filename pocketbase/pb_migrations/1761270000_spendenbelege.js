/// <reference path="../pb_data/types.d.ts" />

// Anfragen nach Spendenbelegen von der Website. Bis 300 € verschickt die Website
// den vereinfachten Beleg selbst (art "vereinfacht", status "versendet"). Darüber
// stellt der Vorsitz die Zuwendungsbestätigung aus (art "zuwendungsbestaetigung",
// status "offen" bis "ausgestellt"). Die Website schreibt als Superuser, der Vorstand liest.

const NUR_VORSTAND = '@request.auth.collectionName = "vorstand"';

migrate(
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    const belege = new Collection({
      type: "base",
      name: "spendenbelege",
      listRule: NUR_VORSTAND,
      viewRule: NUR_VORSTAND,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { type: "select", name: "art", required: true, maxSelect: 1, values: ["vereinfacht", "zuwendungsbestaetigung"] },
        { type: "select", name: "status", required: true, maxSelect: 1, values: ["versendet", "offen", "ausgestellt"] },
        { type: "text", name: "name", required: true, max: 200 },
        { type: "text", name: "strasse", required: true, max: 200 },
        { type: "text", name: "plz", required: true, pattern: "^\\d{5}$" },
        { type: "text", name: "ort", required: true, max: 100 },
        { type: "email", name: "email", required: true },
        { type: "number", name: "betrag", required: true, min: 0 },
        { type: "date", name: "ueberwiesen_am", required: true },
        { type: "relation", name: "ausgestellt_von", collectionId: vorstand.id, maxSelect: 1 },
        { type: "date", name: "ausgestellt_am" },
        { type: "text", name: "notiz", max: 5000 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE INDEX idx_spendenbelege_status ON spendenbelege (status)"],
    });
    app.save(belege);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("spendenbelege"));
  },
);
