/// <reference path="../pb_data/types.d.ts" />

// Förderprojekte für die Startseite (#85). Collection-Regeln null: Nur der Server liest und schreibt
// als Superuser, nachdem er den angemeldeten Vorstand geprüft hat. Das Bild ist nicht geschützt,
// weil die Startseite es über eine eigene Route ausliefert. PocketBase selbst ist nicht öffentlich.
// Nur JPEG und PNG: kein SVG (Skript-Risiko), kein WebP (Thumbs würden größere PNGs).
// Jahr und Betrag 0 heißt: nicht angegeben.

migrate(
  (app) => {
    const foerderprojekte = new Collection({
      type: "base",
      name: "foerderprojekte",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { type: "text", name: "titel", required: true, max: 200 },
        { type: "text", name: "beschreibung", required: true, max: 1000 },
        {
          type: "file",
          name: "bild",
          required: true,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png"],
          thumbs: ["800x600", "160x160"],
          protected: false,
        },
        { type: "number", name: "jahr", onlyInt: true, min: 0, max: 2100 },
        { type: "number", name: "betrag", onlyInt: true, min: 0, max: 10000000 },
        { type: "bool", name: "startseite" },
        { type: "number", name: "reihenfolge", onlyInt: true, min: 0 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
    });
    app.save(foerderprojekte);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("foerderprojekte"));
  },
);
