/// <reference path="../pb_data/types.d.ts" />

// Deutsche Mail "Anmeldung von einem neuen Ort" für den Vorstand. PocketBase verschickt sie
// bei jeder Anmeldung von einem unbekannten Gerät oder Netz. Der englische Standardtext
// empfiehlt ein neues Passwort, das gibt es hier nicht (Anmeldung nur per Einmal-Code).

migrate(
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.authAlert.emailTemplate.subject = "Neue Anmeldung im internen Bereich von {APP_NAME}";
    vorstand.authAlert.emailTemplate.body =
      "<p>Hallo {RECORD:name},</p>" +
      "<p>gerade hat sich jemand mit deinem Zugang von einem neuen Gerät oder Ort im internen Bereich von {APP_NAME} angemeldet:</p>" +
      "<p><em>{ALERT_INFO}</em></p>" +
      "<p>Warst du das, musst du nichts weiter tun.</p>" +
      "<p><strong>Warst du das nicht, sag bitte sofort dem Vorstand Bescheid, damit der Zugang gesperrt werden kann.</strong></p>" +
      "<p>Viele Grüße<br/>{APP_NAME}</p>";
    app.save(vorstand);
  },
  () => {
    // Kein Rückweg: die alten Texte waren die englischen PocketBase-Standards.
  },
);
