/// <reference path="../pb_data/types.d.ts" />

// Deutsche Bestätigungsmail für den Vorstand. Der Link zeigt auf die Website
// (/admin/bestaetigen), weil PocketBase selbst nicht öffentlich erreichbar ist.
// Setzt dafür auch Name und URL der Anwendung, die in {APP_NAME} und {APP_URL} landen.

migrate(
  (app) => {
    const settings = app.settings();
    settings.meta.appName = "Förderverein SV Amendingen";
    settings.meta.appURL = "https://foerderverein-sv-amendingen.de";
    app.save(settings);

    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.verificationTemplate.subject = "Bestätige deine E-Mail-Adresse für {APP_NAME}";
    vorstand.verificationTemplate.body =
      "<p>Hallo {RECORD:name},</p>" +
      "<p>für dich wurde ein Zugang zum internen Bereich von {APP_NAME} angelegt.</p>" +
      "<p>Bitte bestätige mit einem Klick auf den Button, dass diese E-Mail-Adresse dir gehört.</p>" +
      '<p><a class="btn" href="{APP_URL}/admin/bestaetigen?token={TOKEN}" target="_blank" rel="noopener">E-Mail-Adresse bestätigen</a></p>' +
      "<p><i>Falls du damit nichts zu tun hast, kannst du diese E-Mail einfach ignorieren.</i></p>" +
      "<p>Viele Grüße<br/>{APP_NAME}</p>";
    app.save(vorstand);
  },
  () => {
    // Kein Rückweg: die alten Texte waren die englischen PocketBase-Standards.
  },
);
