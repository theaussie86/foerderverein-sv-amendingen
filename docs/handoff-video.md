# Hand-off: Video Sales Letter für die Startseite

Stand: 23.10.2026. Grundlage: `docs/konzept-salesletter.md` (Teil 1) und die umgesetzte Startseite `src/app/page.tsx` (PR #6). Dieses Dokument ersetzt das Video-Skript im Konzept, weil sich die Inhalte seitdem geändert haben (Fokus Jugend, echte Projekte, Mitgliederzähler, Du-Form).

## Ziel

Ein ca. 90 Sekunden langes Vektor-Animationsvideo ganz oben auf der Startseite. Einziges Ziel: Besucher werden Mitglied im Förderverein (20 € im Jahr). Das Video verstärkt die Seite, ersetzt sie nicht. Die Seite muss ohne Video vollständig funktionieren.

Zielgruppen in dieser Reihenfolge:
1. Eltern von Jugendspielern
2. Ehemalige, Fans, Zuschauer
3. Amendinger ohne Fußballbezug

## Kernbotschaft

> Für 20 € im Jahr stehst du hinter jedem Kind auf unserem Platz.

- 20 € im Jahr = 1,67 € im Monat.
- Der Förderverein zahlt die kleinen Dinge in der Jugend, für die sich kein Sponsor findet.
- Der Hebel ist die Zahl der Mitglieder, nicht die Höhe des Beitrags.

Nicht erwähnen: die Sponsoren im Seniorenbereich (bewusst weggelassen).

## Tonalität

- Du-Form, lokal, warm, bodenständig. Kein Marketing-Sprech.
- Echte Stimme aus dem Verein schlägt Profi-Sprecher.
- Satzbau kurz, gesprochen, zum Mitlesen geeignet.

## Skript (ca. 90 s)

| # | Zeit | Bild (Animation) | Sprechertext |
|---|------|------------------|--------------|
| 1 | 0-8 s | Samstagmorgen, Sportplatz Amendingen. Kinder laufen aufs Feld, ein Ball rollt ins Bild. | „Jeden Samstag stehen in Amendingen Kinder auf dem Platz. Mit Ball, mit Trikot, mit Trainer. Das ist nicht selbstverständlich." |
| 2 | 8-22 s | Trainer im Regen, Eltern im Auto, Helfer mit Rasenmäher und Kreidewagen. Dann Preisschilder an Bällen, Trainingsanzügen, einem Bus. | „Trainer stehen bei jedem Wetter am Platz. Eltern fahren, Helfer mähen und kreiden. Aber Ehrenamt kauft keine Bälle. Und in der Jugend sind es oft kleine Beträge, für die sich niemand findet." |
| 3 | 22-35 s | SVA-Wappen, daneben baut sich der Schriftzug „Förderverein" auf. Geld fließt sichtbar zum Platz, nicht weg. | „Genau dafür gibt es den Förderverein SV Amendingen. Ein eigener, gemeinnütziger Verein mit einer Aufgabe: den SVA unterstützen. Jeder Euro bleibt in Amendingen." |
| 4 | 35-55 s | Vier Szenen nacheinander: Bus fährt nach Augsburg, Kinder in gleichen Trainingsanzügen, Ballnetz und Hütchen, FC-Bayern-Camp. | „Zuletzt haben wir die Fahrt nach Augsburg für die ganze Jugend bezuschusst. Trainingsanzüge. Bälle, Hütchen, Leibchen. Und besondere Projekte wie das Jugendcamp mit dem FC Bayern." |
| 5 | 55-75 s | Eine Figur wird zu vielen. Zahlen zählen hoch: 1 Mitglied = 20 € (ein Spielball), 25 = 500 € (Trainingsmaterial für ein Team), 100 = 2.000 € (Zuschuss für die nächste Jugendfahrt). | „Mitglied werden kostet 20 € im Jahr. Allein ist das wenig. Aber mit hundert anderen ist es der Zuschuss für die nächste Jugendfahrt. Niemand muss viel geben, wenn viele mitmachen." |
| 6 | 75-90 s | Mitgliederzähler zählt hoch auf die aktuelle Zahl, darunter Handy mit Formular, Haken, Wappen. Endkarte mit „Mitglied werden · 20 € im Jahr". | „Wir sind schon über 80. Unser Ziel sind hundert. Mitglied werden dauert zwei Minuten, komplett online. Werde einer davon. Für die Kinder auf unserem Platz." |

Zahlen in Szene 5 und 6 vor Produktion bestätigen (siehe Offene Punkte). „Über 80" bewusst unscharf, damit das Video nicht veraltet, wenn der Zähler auf der Seite steigt.

## Visueller Stil

- Flache Vektorgrafik, klare Formen, keine Skizzen- oder Kritzel-Optik, keine Körnung.
- Vereinsfarben aus `src/app/globals.css`:
  - Grün `#2d6a2e`, hell `#3a8a3b`, dunkel `#1e4d1f`
  - Gold `#d4a017`, hell `#e6b422`
  - Anthrazit `#2a2a2a`, dunkel `#1a1a1a`, Weiß
- Schrift: Geist (wie die Seite), Headlines fett.
- Wappen: `public/sva-wappen.png` (512 px, transparent). Für die Animation besser als Vektor nachbauen oder SVG beim Verein anfragen.
- Figuren ohne erkennbare Gesichter, damit keine Bildrechte an Kindern nötig sind.

## Ton und Untertitel

- Untertitel fest eingebrannt **und** als WebVTT-Datei, weil die meisten ohne Ton schauen.
- Dezente Musik, unter der Stimme deutlich leiser.
- Kein Autoplay mit Ton.

## Technische Lieferung

- Format: 16:9, 1920×1080, MP4 (H.264) plus WebM. Ziel unter 15 MB.
- Optional zusätzlich 9:16 (1080×1920) für WhatsApp-Status und Instagram.
- Posterbild (JPG/WebP, 1920×1080): Endkarte oder Szene 1 mit Play-Button-Fläche.
- Untertitel: `untertitel.de.vtt`.
- Ablage: `public/video/` (oder externes Hosting, falls die Dateien zu groß werden).
- Empfohlenes Werkzeug: Remotion (React), damit Farben, Schrift und Zahlen direkt aus dem Projekt kommen und das Video später mit neuen Zahlen neu gerendert werden kann.

## Einbau auf der Seite

- Ort: Hero in `src/app/page.tsx`, Abschnitt `{/* 1. Hero */}`.
- Vorschlag Layout:
  - Desktop: Video rechts statt des Zählers, Zähler wandert unter das Video oder unter den Button.
  - Mobil: Headline, dann Video, dann Button und Zähler.
- Verhalten:
  - Nativer `<video>` mit `controls`, `preload="none"`, `poster`, `playsInline`, `<track kind="captions" srclang="de" default>`.
  - Kein Autoplay. Auf dem Poster: „90 Sekunden: Was der Förderverein macht".
  - Button „Jetzt Mitglied werden · 20 € im Jahr" bleibt immer sichtbar unter bzw. neben dem Video, nicht erst nach dem Abspielen.
  - `prefers-reduced-motion` respektieren (nichts automatisch bewegen).
- Ohne Video-Dateien bleibt der Hero wie jetzt.

## Offene Punkte

- [ ] Rechenbeispiele bestätigen: 25 Mitglieder = Trainingsmaterial für ein Team, 100 Mitglieder = Zuschuss für die Jugendfahrt.
- [ ] Projekte: Jahr und Betrag für Augsburg-Fahrt, Trainingsanzüge, Trainingsmaterial, FC-Bayern-Camp.
- [ ] Wer spricht? Vorstand, Jugendleiter oder Trainer.
- [ ] Wappen als SVG.
- [ ] Musik: lizenzfreier Titel auswählen.
- [ ] Freigabe des Skripts durch den Vorstand.
- [ ] Wer produziert: selbst mit Remotion oder externe Agentur.
