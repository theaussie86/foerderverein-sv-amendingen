# Research: Bilder von Förderprojekten öffentlich ausliefern

Issue: #77 (Teil von Map #74). Stand: 15.11.2026.

Frage: Wie kommt das Bild eines Förderprojekts öffentlich auf die Startseite, obwohl PocketBase nicht öffentlich erreichbar ist? Geprüft: öffentliche Regeln und geschützte Dateien in PocketBase, Proxy über eine Next-Route, Caching, `next/image` in dieser Next-Version, Thumbnails von PocketBase, Upload-Grenzen.

## Stand im Projekt

- PocketBase-Server **0.40.5** (Image `ghcr.io/muchobien/pocketbase:0.40.5`, laut Betriebsnotizen), JS-SDK `pocketbase@0.28.2` (`bun.lock`).
- Next.js **16.4.5** (`node_modules/next/package.json`), `output: "standalone"`, Laufzeit Bun 1.4.4 (`Dockerfile`). Keine `images`-Konfiguration in `next.config.ts`, kein `src/proxy.ts`.
- `next/image` wird bisher nirgends benutzt. Die Kacheln in `src/app/page.tsx` haben heute gar keine Bilder.
- Die Website spricht PocketBase serverseitig als Superuser an (`src/lib/pocketbase.ts`). Alle bisherigen Dateifelder sind `protected: true` und werden mit Datei-Token durchgereicht (`src/packages/mitgliedsantrag/lib/vorstandssicht.ts`, `src/app/admin/antraege/[id]/dateien/[feld]/route.ts`, dort `Cache-Control: private, no-store`).

## Quellen

| Kürzel | Quelle |
|---|---|
| **PB-Files** | [PocketBase-Doku „Files upload and handling“](https://pocketbase.io/docs/files-handling/) |
| **PB-Rules** | [PocketBase-Doku „API rules and filters“](https://pocketbase.io/docs/api-rules-and-filters/) |
| **PB-file.go** | Quellcode [`apis/file.go` @ v0.40.5](https://github.com/pocketbase/pocketbase/blob/v0.40.5/apis/file.go) |
| **PB-fs.go** | Quellcode [`tools/filesystem/filesystem.go` @ v0.40.5](https://github.com/pocketbase/pocketbase/blob/v0.40.5/tools/filesystem/filesystem.go) |
| **PB-field** | Quellcode [`core/field_file.go` @ v0.40.5](https://github.com/pocketbase/pocketbase/blob/v0.40.5/core/field_file.go) und [`core/validators/file.go` @ v0.40.5](https://github.com/pocketbase/pocketbase/blob/v0.40.5/core/validators/file.go) |
| **PB-body** | Quellcode [`apis/middlewares_body_limit.go` @ v0.40.5](https://github.com/pocketbase/pocketbase/blob/v0.40.5/apis/middlewares_body_limit.go) |
| **N-Image** | Next 16.4.5, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` ([online](https://nextjs.org/docs/app/api-reference/components/image)) |
| **N-Opt** | Next 16.4.5, Quellcode `node_modules/next/dist/server/image-optimizer.js` |
| **N-Route** | Next 16.4.5, `.../01-getting-started/15-route-handlers.md`, Abschnitt „Caching“ ([online](https://nextjs.org/docs/app/getting-started/route-handlers)) |
| **N-Self** | Next 16.4.5, `.../02-guides/self-hosting.md`, Abschnitt „Image Optimization“ ([online](https://nextjs.org/docs/app/guides/self-hosting)) |
| **N-SA** | Next 16.4.5, `.../05-config/01-next-config-js/serverActions.md`, `bodySizeLimit` ([online](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)) |
| **N-V16** | Next 16.4.5, `.../02-guides/upgrading/version-16.md` |

## Fakten

### PocketBase

1. **Datei-URL**: `/api/files/COLLECTION/RECORD_ID/FILENAME`. Jeder gespeicherte Dateiname bekommt ein zufälliges Suffix (meist 10 Zeichen). Ein neues Bild hat also immer eine neue URL. (PB-Files)
2. **Geschützte Dateien** (`protected: true`) brauchen einen Datei-Token (gültig ca. 2 Minuten) und erfüllen nur, wer die **View-Regel** der Collection erfüllt. Ist die View-Regel ein leerer String, darf jeder die Datei laden, auch ohne Token. (PB-Files; im Code: PB-file.go, Prüfung `CanAccessRecord(..., ViewRule)` nur im Zweig `if fileField.Protected`)
3. **Nicht geschützte Dateien werden ohne jede Regelprüfung ausgeliefert.** Die View-Regel greift laut Code nur bei `Protected`. Wer Record-ID und Dateinamen kennt, bekommt die Datei, auch wenn der Datensatz selbst gesperrt ist. (PB-file.go)
4. **Regeln**: `null` (gesperrt) heißt nur Superuser, das ist der Standard. Leerer String heißt jeder, auch Gäste. (PB-Rules)
5. **Thumbnails**: `?thumb=WxH` an der Datei-URL. Formate `WxH` (mittig zuschneiden), `WxHt`/`WxHb` (oben/unten), `WxHf` (einpassen ohne Zuschnitt), `0xH`/`Wx0` (Seitenverhältnis erhalten). (PB-Files, PB-field)
   - Erlaubt sind nur `100x100` und die im Feld unter `thumbs` eingetragenen Größen. Unbekannte Größen oder Nicht-Bilder liefern stillschweigend das Original. (PB-file.go: `defaultThumbSizes = ["100x100"]`, `ExistInSlice(thumbSize, fileField.Thumbs)`; PB-Files: „The original file would be returned, if the requested thumb size is not found or the file is not an image!“)
   - Thumbs gibt es für JPEG, PNG, GIF (erstes Bild) und WebP. JPEG bleibt JPEG, **WebP wird als PNG gespeichert**, also oft größer als das Original. (PB-Files; PB-fs.go, `default: // fallback to PNG (this includes webp!)`)
   - Thumbs entstehen beim ersten Abruf und werden dann gespeichert. Gleichzeitige Erzeugungen sind begrenzt (`PB_THUMBS_MAX_WORKERS`, Standard CPU-Anzahl + 2, `PB_THUMBS_MAX_WAIT` 60 s). (PB-file.go)
6. **Antwort-Header** beim Ausliefern: `Cache-Control: max-age=2592000, stale-while-revalidate=86400` (30 Tage), `Content-Security-Policy: default-src 'none'; ... sandbox`, `Content-Disposition: inline` für Bildtypen, `Content-Type` aus dem echten Inhalt. (PB-fs.go, `Serve`)
7. **Upload-Grenzen**: `maxSize` pro Datei, Standard 5 MB (`DefaultFileFieldMaxSize = 5 << 20`). Die Body-Grenze der Anfrage richtet sich nach `maxSize * maxSelect`, allgemeiner Standard 32 MB. `mimeTypes` prüft den **echten Inhalt** (Bibliothek `gabriel-vasile/mimetype`), nicht die Dateiendung. (PB-field, PB-body, PB-Files: „max allowed file size up to ~5MB“)

### Next.js 16.4.5

8. **Route Handler** werden standardmäßig nicht gecacht. (N-Route) Für Browser und vorgeschaltete Caches zählt also allein der `Cache-Control`-Header, den die Route setzt.
9. **`next/image` mit interner URL** (`src="/..."`): Der Optimierer ruft die Route intern über `handleRequest` mit einem nachgebauten Request auf, ohne Netzwerk und ohne Header-Weitergabe. Er übernimmt `Content-Type`, `Cache-Control` und `ETag` der Antwort. (N-Opt, `fetchInternalImage`) Interne Pfade mit Query-String brauchen seit Next 16 einen passenden Eintrag in `images.localPatterns` (mit `search`), sonst 400. (N-Image `localPatterns`, N-V16 „Local Images with Query Strings“)
10. **`next/image` mit externer URL** (`remotePatterns`): Next 16 blockiert Hosts, die auf private IPs auflösen, standardmäßig (`dangerouslyAllowLocalIP: false`, „Only enable once you understand the SSRF risk“). Der Docker-interne PocketBase-Host `foerderverein-pocketbase:8090` löst auf eine private IP auf. Außerdem leitet der Optimierer keine Header weiter, Token also nur per Query-String. (N-Image `src`, `dangerouslyAllowLocalIP`; N-Opt `fetchExternalImage`)
11. **Cache des Optimierers**: Lebensdauer ist das Maximum aus `minimumCacheTTL` (Standard 4 Stunden) und dem `Cache-Control` der Quelle. Es gibt keine Invalidierung, man muss die `src` ändern. Ablage auf Platte unter `<distDir>/cache/images`, Standard bis 50 % des freien Platzes (`maximumDiskCacheSize`). Quellbilder bis 50 MB (`maximumResponseBody`, für kleine Server „such as 5 MB“ empfohlen). (N-Image)
12. **Selbst gehostete Optimierung** braucht `sharp`. Es ist optionale Abhängigkeit von `next@16.4.5` (`sharp@^0.35.5`). Auf glibc-Linux kann zusätzliche Konfiguration gegen hohen Speicherverbrauch nötig sein. Alternativ `unoptimized`. (N-Self, `node_modules/next/package.json`)
13. **Server Actions** nehmen standardmäßig höchstens **1 MB** Body an, einstellbar über `serverActions.bodySizeLimit`. (N-SA)

## Optionen

### A. Öffentliche Next-Route als Proxy, Dateifeld nicht geschützt (empfohlen)

Collection `foerderprojekte` mit Bildfeld `protected: false`, Regeln bleiben `null` (nur Superuser). Eine öffentliche Route, etwa `src/app/foerderprojekte/[id]/bild/[datei]/route.ts`, lädt den Datensatz mit dem Superuser-Client, prüft „auf Startseite zeigen“ und dass `datei` genau dem gespeicherten Dateinamen entspricht, holt die Datei (optional mit `?thumb=`) per `pb.files.getURL` und streamt sie durch.

- Kein Datei-Token nötig, weil das Feld nicht geschützt ist (Fakt 2/3). PocketBase bleibt intern.
- Die Prüfung in der Route ist die einzige Sperre, denn ungeschützte Dateien kennen keine Regel (Fakt 3). Das ist hier unkritisch, weil PocketBase von außen nicht erreichbar ist.
- Der Dateiname mit Zufallssuffix steckt in der URL (Fakt 1). Ein neues Bild ergibt eine neue URL, also darf die Route `Cache-Control: public, max-age=31536000, immutable` setzen. Dazu `X-Content-Type-Options: nosniff` und `Content-Type` von PocketBase übernehmen.
- Aufwand: eine Route plus eine Funktion im Förderprojekt-Paket, Muster wie bei `vorstandssicht.ts`.

### B. Wie A, aber Feld geschützt und Datei-Token des Superusers

Funktioniert (der Superuser erfüllt jede Regel), bringt aber nichts: Das Bild ist ohnehin öffentlich. Kostet pro Abruf einen zusätzlichen Token-Aufruf. Nur sinnvoll, wenn PocketBase später öffentlich erreichbar wird und Entwürfe geheim bleiben müssen.

### C. PocketBase-Dateipfad öffentlich freigeben (Reverse Proxy)

Nur `/api/files/foerderprojekte/*` über Traefik/Dokploy nach außen routen und die Bilder direkt laden. Spart die Next-Route, öffnet aber PocketBase nach außen, was die Architektur bisher bewusst vermeidet. Ungeschützte Dateien wären dann ohne Regelprüfung abrufbar, auch die nicht veröffentlichter Projekte (Fakt 3), soweit jemand Record-ID und Dateinamen kennt. Nicht empfohlen.

### D. `next/image` mit `remotePatterns` direkt auf den internen PocketBase-Host

Scheitert in Next 16 an der Sperre für private IPs (Fakt 10). Freischalten nur mit `dangerouslyAllowLocalIP: true`, das öffnet den Optimierer für SSRF ins Docker-Netz. Nicht empfohlen.

### E. `next/image` auf die Route aus A (Ergänzung zu A)

`<Image src="/foerderprojekte/ID/bild/DATEI">` mit `images.localPatterns: [{ pathname: "/foerderprojekte/**", search: "" }]`. Der Optimierer holt intern (Fakt 9), liefert `srcset`, WebP und passende Breiten.

- Plus: kleinere Dateien für Handys, kein Thumb-Feintuning in PocketBase.
- Minus: braucht `sharp` im Standalone-Build unter Bun. Das ist im Projekt bisher ungetestet, weil `next/image` noch nirgends optimiert (Fakt 12). Der Optimierer schreibt nach `.next/cache/images`. Im Dockerfile gehören `/app` und `/app/.next` nicht ausdrücklich dem Nutzer `bun`, das muss man im Container prüfen. Der Cache geht bei jedem Deploy verloren, das ist hier egal.

### F. PocketBase-Thumbnails statt Next-Optimierung (Ergänzung zu A)

Im Feld `thumbs` eine Kachelgröße eintragen, zum Beispiel `800x600` (mittig zuschneiden, passt zu festen Kachelformaten) oder `1200x0`. Die Route aus A hängt `?thumb=` an. Ausgabe mit `next/image` und `unoptimized` oder `<img>`.

- Plus: kein `sharp`, keine Next-Konfiguration, einmal erzeugt und in PocketBase gespeichert (Fakt 5).
- Minus: nur eine Größe statt `srcset`. WebP-Uploads werden als PNG verkleinert (Fakt 5), deshalb WebP besser nicht zulassen oder ohne Thumb ausliefern.

### G. Bild beim Build nach `public/` kopieren

Verworfen: Jede Bildänderung im Admin-Bereich bräuchte einen neuen Build.

## Empfehlung

**A + F für Donnerstag, E später optional.**

1. Feld `bild` in `foerderprojekte`: `protected: false`, `maxSelect: 1`, `required: true`, Collection-Regeln `null`.
2. Öffentliche Route `/foerderprojekte/[id]/bild/[datei]`, prüft Sichtbarkeit und Dateinamen, streamt mit `?thumb=800x600` von PocketBase, setzt `Cache-Control: public, max-age=31536000, immutable` und `X-Content-Type-Options: nosniff`. 404 bei allem anderen.
3. Kachel rendert `<Image unoptimized ...>` mit festen Maßen (oder `<img>` mit ESLint-Ausnahme wie in `bank-qr-code.tsx`).
4. Später, wenn Zeit ist: `unoptimized` entfernen, `localPatterns` setzen und `sharp` im Docker-Container testen (Option E). Dann den Thumb weglassen oder größer wählen, damit Next aus einem ausreichend großen Bild skaliert.

Begründung: A hält PocketBase intern und folgt dem vorhandenen Proxy-Muster. F braucht keine neue Abhängigkeit zur Laufzeit, das senkt das Risiko vor der Vorführung. E ist der bessere Endzustand, hängt aber an einem ungetesteten Baustein (`sharp` unter Bun im Standalone-Image).

Hinweis zur Startseite: Liest sie Förderprojekte aus PocketBase, ist sie nicht mehr rein statisch. Wie sie gecacht oder neu gerendert wird, gehört zum Umsetzungs-Issue, nicht zu dieser Frage.

## Upload-Grenzen

| Einstellung | Wert | Grund |
|---|---|---|
| `mimeTypes` | `image/jpeg`, `image/png` | PocketBase prüft den echten Inhalt (Fakt 7). Kein SVG (Skript-Risiko), kein WebP wegen PNG-Thumbs (Fakt 5), kein HEIC (keine Thumbs, Browser zeigen es nicht überall). iPhones liefern beim Upload im Browser meist schon JPEG. |
| `maxSize` | 5 MB (`5242880`, wie die PDF-Felder) | PocketBase-Standard (Fakt 7), reicht für Handyfotos in JPEG. |
| `maxSelect` | 1 | Ein Bild pro Förderprojekt. |
| `thumbs` | z. B. `["800x600"]` | Nur eingetragene Größen werden erzeugt (Fakt 5). Format an die Kachel anpassen. |
| `serverActions.bodySizeLimit` | `"6mb"` | Standard 1 MB (Fakt 13) würde fast jedes Foto abweisen. Etwas Luft über `maxSize` für die übrigen Formularfelder. Alternative: Upload über eigenen Route Handler statt Server Action. |
| Zod-Schema in `src/lib/schemas.ts` | `z.instanceof(File)` mit `size <= 5 MB` und `type` in der Liste | Gleiche Prüfung im Browser und in der Server Action (AGENTS.md). Die echte Inhaltsprüfung macht PocketBase. |
| `images.maximumResponseBody` | `5_000_000` bis `6_000_000` | Nur relevant für Option E, schützt den Server (Fakt 11). |

## Offene Punkte

- `sharp` unter Bun im Standalone-Image ist nicht verifiziert (nur relevant für Option E).
- Schreibrechte von `bun` auf `/app/.next/cache` im Runtime-Image nicht geprüft (nur Option E).
- Der Bildzuschnitt (`800x600` oder anderes Format) hängt vom Kachel-Design ab.
