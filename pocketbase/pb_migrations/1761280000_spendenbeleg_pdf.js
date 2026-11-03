/// <reference path="../pb_data/types.d.ts" />

// Der automatisch verschickte Spendenbeleg (bis 300 €) wird mit abgelegt, damit der
// Vorstand ihn im internen Bereich wiederfindet. Die Record-ID steht als Beleg-Nr.
// im PDF und im Dateinamen. Zuwendungsbestätigungen stellt der Vorsitz außerhalb aus,
// dort bleibt das Feld leer.

migrate(
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    if (!belege.fields.getByName("beleg_pdf")) {
      belege.fields.add(
        new FileField({
          name: "beleg_pdf",
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["application/pdf"],
          protected: true,
        }),
      );
    }
    app.save(belege);
  },
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    belege.fields.removeByName("beleg_pdf");
    app.save(belege);
  },
);
