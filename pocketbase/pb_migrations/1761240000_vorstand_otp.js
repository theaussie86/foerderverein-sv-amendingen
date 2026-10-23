/// <reference path="../pb_data/types.d.ts" />

// Vorstand kann sich zusätzlich zum Passwort mit einem Einmal-Code per E-Mail anmelden.
// Voraussetzung: SMTP ist in den PocketBase-Einstellungen eingerichtet.

migrate(
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.otp.enabled = true;
    vorstand.otp.duration = 600;
    vorstand.otp.length = 6;
    vorstand.otp.emailTemplate.subject = "Dein Anmeldecode für den Förderverein";
    vorstand.otp.emailTemplate.body =
      "<p>Hallo,</p>" +
      "<p>dein Anmeldecode für den internen Bereich des Fördervereins SV Amendingen lautet:</p>" +
      "<p><strong style=\"font-size: 20px; letter-spacing: 4px;\">{OTP}</strong></p>" +
      "<p>Der Code ist 10 Minuten gültig. Falls du dich nicht anmelden wolltest, kannst du diese E-Mail ignorieren.</p>" +
      "<p>Förderverein SV Amendingen e.V.</p>";
    app.save(vorstand);
  },
  (app) => {
    const vorstand = app.findCollectionByNameOrId("vorstand");
    vorstand.otp.enabled = false;
    app.save(vorstand);
  },
);
