/// <reference path="../pb_data/types.d.ts" />

// Grundschema: Vorstands-Logins und unterschriebene Mitgliedsanträge.
// Die Website schreibt als Superuser. Der Vorstand darf Anträge nur lesen,
// damit Unterschrift, PDF und Protokoll als Mandatsnachweis unverändert bleiben.

const NUR_VORSTAND = '@request.auth.collectionName = "vorstand"';

migrate(
  (app) => {
    const vorstand = new Collection({
      type: "auth",
      name: "vorstand",
      listRule: "id = @request.auth.id",
      viewRule: "id = @request.auth.id",
      createRule: null,
      updateRule: "id = @request.auth.id",
      deleteRule: null,
    });
    vorstand.fields.add(new TextField({ name: "name", required: true, max: 100 }));
    vorstand.fields.add(
      new SelectField({ name: "rolle", maxSelect: 1, values: ["vorsitz", "kasse", "schriftfuehrung", "beisitz"] }),
    );
    app.save(vorstand);

    const antraege = new Collection({
      type: "base",
      name: "mitgliedsantraege",
      listRule: NUR_VORSTAND,
      viewRule: NUR_VORSTAND,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { type: "text", name: "antrag_id", required: true, max: 36 },
        { type: "text", name: "mandatsreferenz", required: true, max: 20 },
        { type: "select", name: "status", required: true, maxSelect: 1, values: ["eingegangen", "angenommen", "abgelehnt", "ausgetreten"] },
        { type: "text", name: "vorname", required: true, max: 100 },
        { type: "text", name: "nachname", required: true, max: 100 },
        { type: "text", name: "strasse", required: true, max: 200 },
        { type: "text", name: "plz", required: true, pattern: "^\\d{5}$" },
        { type: "text", name: "ort", required: true, max: 100 },
        { type: "email", name: "email", required: true },
        { type: "date", name: "geburtsdatum" },
        { type: "text", name: "kontoinhaber", required: true, max: 200 },
        { type: "text", name: "iban", required: true, max: 34 },
        { type: "number", name: "jahresbeitrag", required: true, min: 0 },
        { type: "date", name: "eingereicht_am", required: true },
        { type: "date", name: "unterschrieben_am", required: true },
        // Zeit, IP und User-Agent von Einreichen, Öffnen und Unterschreiben.
        { type: "json", name: "protokoll", required: true, maxSize: 10000 },
        { type: "text", name: "pruefsumme", required: true, max: 64 },
        { type: "file", name: "unterschrift", required: true, maxSelect: 1, maxSize: 500000, mimeTypes: ["image/png"], protected: true },
        { type: "file", name: "beitritt_pdf", required: true, maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf"], protected: true },
        { type: "file", name: "mandat_pdf", required: true, maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf"], protected: true },
        { type: "text", name: "notiz", max: 5000 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_mitgliedsantraege_antrag_id ON mitgliedsantraege (antrag_id)",
        "CREATE UNIQUE INDEX idx_mitgliedsantraege_mandatsreferenz ON mitgliedsantraege (mandatsreferenz)",
      ],
    });
    app.save(antraege);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("mitgliedsantraege"));
    app.delete(app.findCollectionByNameOrId("vorstand"));
  },
);
