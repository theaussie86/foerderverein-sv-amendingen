/// <reference path="../pb_data/types.d.ts" />

// Mitglieder des Fördervereins, egal ob ihr Mitgliedsantrag online oder auf Papier kam (#49).
// Die Bestandsliste kommt einmalig per Import (scripts/mitglieder-import), danach pflegt der
// Vorstand die Mitglieder im internen Bereich. Löschen geht nicht: Ein Mitglied endet mit
// Datum und Grund (Austritt, Ausschluss, Tod), damit der Verlauf erhalten bleibt.
// Kontoinhaber leer heißt: Das Mitglied ist selbst Kontoinhaber.

const NUR_VORSTAND = '@request.auth.collectionName = "vorstand"';

migrate(
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    const mitglieder = new Collection({
      type: "base",
      name: "mitglieder",
      listRule: NUR_VORSTAND,
      viewRule: NUR_VORSTAND,
      createRule: NUR_VORSTAND,
      updateRule: NUR_VORSTAND,
      deleteRule: null,
      fields: [
        { type: "text", name: "mandatsreferenz", required: true, max: 35 },
        { type: "text", name: "vorname", required: true, max: 100 },
        { type: "text", name: "nachname", required: true, max: 100 },
        { type: "text", name: "strasse", max: 200 },
        { type: "text", name: "plz", pattern: "^\\d{5}$" },
        { type: "text", name: "ort", max: 100 },
        { type: "email", name: "email" },
        { type: "text", name: "kontoinhaber", max: 200 },
        { type: "text", name: "iban", required: true, max: 34 },
        { type: "text", name: "bic", max: 11 },
        { type: "text", name: "bank", max: 100 },
        { type: "date", name: "eintrittsdatum" },
        { type: "date", name: "mandat_datum" },
        { type: "date", name: "ende_datum" },
        { type: "select", name: "ende_grund", maxSelect: 1, values: ["austritt", "ausschluss", "tod"] },
        { type: "relation", name: "antrag", collectionId: antraege.id, maxSelect: 1 },
        { type: "text", name: "notiz", max: 5000 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_mitglieder_mandatsreferenz ON mitglieder (mandatsreferenz)",
        "CREATE UNIQUE INDEX idx_mitglieder_antrag ON mitglieder (antrag) WHERE antrag != ''",
      ],
    });
    app.save(mitglieder);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("mitglieder"));
  },
);
