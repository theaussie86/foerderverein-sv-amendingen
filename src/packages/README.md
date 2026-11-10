# Pakete sind Deep Modules

Jedes Paket unter `src/packages/` bündelt viel Verhalten hinter einer kleinen Schnittstelle. Die öffentliche Schnittstelle sind die **Entry Points**: die Dateien direkt im Paketordner. Alles in Unterordnern ist privat.

```
src/packages/
  <name>/
    index.ts        ← Entry Point (öffentlich). Von außen nur das importieren.
    client.ts       ← weiterer Entry Point. Ein Paket darf mehrere haben.
    lib/            ← Implementierung: von außen unsichtbar, intern frei importierbar.
    tests/          ← Tests und Fixtures (Unterordner, also privat).
```

`src/packages/example/` ist eine Vorlage zum Kopieren oder Löschen.

**Keine Barrel-Dateien.** Statt einen ganzen Unterbaum über eine große `index.ts` zu re-exportieren, lieber mehrere kleine Entry Points (`index.ts`, `client.ts`, `server.ts`) anlegen. Ein neuer Entry Point ist einfach eine neue Datei im Paketordner.

## Regeln

Geprüft von dependency-cruiser (`.dependency-cruiser.cjs`), alle als Fehler.

1. **Entry-Point-Grenze:** Code außerhalb eines Pakets (App-Code oder andere Pakete) importiert nur dessen Entry Points, nie etwas aus seinen Unterordnern.
2. **Freiheit im Paket:** Die Dateien eines Pakets importieren sich gegenseitig frei.
3. **Tests über die Entry Points:** Dateien in `<paket>/tests/` dürfen die Entry Points beliebiger Pakete und die eigenen `tests/`-Fixtures importieren, aber keine Interna, auch nicht die eigenen.
4. **Keine Zyklen:** keine zirkulären Abhängigkeiten.

Pakete sind flach: eine Ebene unter `src/packages/`, kein Paket im Paket.

## Prüfen

```sh
bun run lint:boundaries
```

Läuft auch als Teil von `bun run check`.
