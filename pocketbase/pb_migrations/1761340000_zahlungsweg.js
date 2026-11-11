/// <reference path="../pb_data/types.d.ts" />

// Zahlungsweg der Spende an der Beleganfrage: Überweisung, PayPal oder bar. Sagt dem Vorstand,
// wo er den Geldeingang prüft. Bisherige Anfragen kamen alle per Überweisung.

migrate(
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    if (!belege.fields.getByName("zahlungsweg")) {
      belege.fields.add(
        new SelectField({
          name: "zahlungsweg",
          values: ["ueberweisung", "paypal", "bar"],
          maxSelect: 1,
          required: true,
        }),
      );
      app.save(belege);
    }
    app
      .db()
      .newQuery("UPDATE spendenbelege SET zahlungsweg = 'ueberweisung' WHERE zahlungsweg = '' OR zahlungsweg IS NULL")
      .execute();
  },
  (app) => {
    const belege = app.findCollectionByNameOrId("spendenbelege");
    belege.fields.removeByName("zahlungsweg");
    app.save(belege);
  },
);
