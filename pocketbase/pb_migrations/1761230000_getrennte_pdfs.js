/// <reference path="../pb_data/types.d.ts" />

// Beitrittserklärung und SEPA-Mandat als getrennte PDFs. Die erste Fassung von
// 1761220000_init_schema.js hatte nur ein Feld "pdf". Läuft auch auf Instanzen,
// die das Schema schon mit beiden Feldern angelegt haben.

migrate(
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");

    const alt = antraege.fields.getByName("pdf");
    if (alt) alt.name = "beitritt_pdf";

    if (!antraege.fields.getByName("mandat_pdf")) {
      antraege.fields.add(
        new FileField({
          name: "mandat_pdf",
          required: true,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["application/pdf"],
          protected: true,
        }),
      );
    }
    app.save(antraege);
  },
  () => {
    // Kein Rückweg: die Init-Migration legt inzwischen direkt beide Felder an.
  },
);
