# Kurzfassung v2 (14 Szenen, ElevenLabs-Sprecher)

```bash
npm install
npm run v2:all       # out/untertitel-kurzfassung.de.vtt, out/foerderverein-kurzfassung-v2.mp4, out/poster-kurzfassung.jpg
npm run studio       # Vorschau, Komposition „KurzfassungV2“ (Prop subtitles=true zeigt Untertitel nur in der Vorschau)
```

Läuft der Next-Dev-Server auf Port 3000: `npm run v2:render -- --port=3123`.

- `src/v2/timeline.json`: zentrale Zeitachse. Szenengrenzen (Frames, 30 fps), Beats für Einblendungen (Sekunden), Untertitel. Nach Änderungen `npm run v2:all`.
- `src/v2/scenes.tsx`: die 14 Szenen. `src/v2/ui.tsx`: Bausteine (Shot, Tag, Wappen).
- `public/v2/sprecher.mp3`: Sprecherspur, unverändert. `public/v2/scenes/*.webp`: Storyboard-Panels, bereinigt und 3x hochskaliert.
- `assets-source/storyboard/` (nicht im Repo): Seiten-PNGs aus dem Storyboard-PDF als `seite-01.png` bis `seite-04.png` (z. B. `pdfimages -png`). Panels neu erzeugen (Pillow + numpy):
  `python scripts/prep-v2.py assets-source/storyboard public/v2/scenes`

---

# Video Sales Letter (Remotion)

Vektor-Animationsvideo für die Startseite, gebaut nach `docs/handoff-video.md`.

## Ablauf

```bash
npm install
npm run tts          # Sprecherspur + src/timing.json + out/untertitel.de.vtt
npm run studio       # Vorschau im Browser
npm run render:mp4   # out/foerderverein.mp4
npm run render:webm  # out/foerderverein.webm
npm run poster       # out/poster.jpg
```

Läuft der Next-Dev-Server auf Port 3000, beim Rendern `--port=3123` anhängen.

## Was wo steht

- `src/script.json`: Sprechertext pro Szene (`text` = Untertitel, `tts` = Aussprache), Projekte mit Jahr und Betrag. Änderungen hier, danach `npm run tts` und neu rendern.
- `src/timing.json`: wird von `npm run tts` erzeugt. Szenen und Untertitel richten sich danach.
- `src/scenes/`: die sechs Szenen aus dem Skript.
- `public/audio/voice.wav`: Sprecherspur. Aktuell macOS-Stimme „Anna“ als Platzhalter.

## Andere Stimme

Echte Aufnahme oder bessere TTS: pro Satz eine Datei erzeugen und in `scripts/tts.mjs` statt `say` einbinden. So bleiben Timing und Untertitel automatisch synchron.
