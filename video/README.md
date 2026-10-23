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
