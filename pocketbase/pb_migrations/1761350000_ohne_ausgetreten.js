/// <reference path="../pb_data/types.d.ts" />

// Status „ausgetreten“ am Mitgliedsantrag entfällt (#82). Ob jemand ausgetreten ist, steht am Mitglied
// (Ende der Mitgliedschaft). Ein Mitgliedsantrag, aus dem ein Mitglied entstanden ist, bleibt „angenommen“.
// Live gab es keine Mitgliedsanträge mit diesem Status, trotzdem werden etwaige Reste auf „angenommen“ gesetzt.

migrate(
  (app) => {
    app.db().newQuery("UPDATE mitgliedsantraege SET status = 'angenommen' WHERE status = 'ausgetreten'").execute();
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    antraege.fields.getByName("status").values = ["eingegangen", "angenommen", "abgelehnt"];
    app.save(antraege);
  },
  (app) => {
    const antraege = app.findCollectionByNameOrId("mitgliedsantraege");
    antraege.fields.getByName("status").values = ["eingegangen", "angenommen", "abgelehnt", "ausgetreten"];
    app.save(antraege);
  },
);
