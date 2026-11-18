# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Öffentlichkeit:** Eltern, Spieler, Unterstützer der Fußballabteilung des SV Amendingen. Sie lesen über den Förderverein, werden Mitglied (Online-Antrag mit SEPA-Mandat) oder spenden.
- **Vorstand:** 5-6 ehrenamtliche Amtsträger. Arbeiten im internen Bereich (`/admin`) meist am Laptop, gelegentlich am Handy, ein paar Mal im Monat: Mitgliedsanträge prüfen, Geldeingang für Spendenbelege bestätigen, Mitglieder pflegen, Förderprojekte für die Startseite pflegen.

## Product Purpose

Website des Fördervereins: Mitglieder gewinnen, Spenden annehmen und dem Vorstand die Verwaltung von Mitgliedsanträgen und Spendenbelegen abnehmen. Erfolg im internen Bereich heißt: offene Vorgänge sind sofort sichtbar und in wenigen Klicks erledigt, ohne Papier und ohne PocketBase-Panel.

## Operating Context

- Interner Bereich nur für den Vorstand, Login per Einmal-Code.
- Bereiche: Mitgliedsanträge, Mitglieder (inkl. CSV-Export), Spendenbelege (offene Beleganfragen, Erfassen, Ausstellen), Förderprojekte (Startseiten-Plätze, Bild-Upload).
- Fachbegriffe laut `GLOSSARY.md`.

## Capabilities and Constraints

- Next.js 16, Tailwind 4, PocketBase als Backend, Bun-Laufzeit.
- Der interne Bereich ist nicht indexiert und braucht keine Wiedererkennung der öffentlichen Webseite; er soll sich wie ein Werkzeug anfühlen.

## Brand Commitments

- Vereinsfarben Grün/Gold des SV Amendingen und das Wappen (`public/sva-wappen.png`) bleiben, auch im internen Bereich als Akzent.
- Deutsch, Begriffe laut Glossar.

## Evidence on Hand

- Echte Vereinsdaten nur in der Live-PocketBase. Lokal und in Vorschauen keine echten Personen- oder Bankdaten zeigen.

## Product Principles

- Offene Arbeit zuerst: was der Vorstand erledigen muss, steht vorne.
- Ehrenamt-tauglich: selten genutzt, also selbsterklärend statt dicht.
- Datenschutz: personenbezogene Daten nur dort zeigen, wo sie für den Vorgang nötig sind.
