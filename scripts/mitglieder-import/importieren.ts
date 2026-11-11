// Einmaliger Import der Bestandsmitglieder aus Manus Stammdaten.xlsx (#49).
//
//   uv run scripts/mitglieder-import/stammdaten-lesen.py Stammdaten.xlsx > /tmp/stammdaten.json
//   POCKETBASE_URL=… POCKETBASE_EMAIL=… POCKETBASE_PASSWORD=… \
//     bun scripts/mitglieder-import/importieren.ts /tmp/stammdaten.json [--schreiben]
//
// Ohne --schreiben zeigt das Skript nur, was es tun würde. Mitglieder, deren Mandatsreferenz
// schon in PocketBase steht, werden übersprungen. So kann es nach einem Abbruch erneut laufen.
import PocketBase from "pocketbase";
import { z } from "zod";
import { pocketbaseAblage } from "@/packages/mitglied/ablage";
import { mitglieder } from "@/packages/mitglied/index";
import { auswerten, stammdatenSchema } from "./auswerten";

const [pfad, ...optionen] = process.argv.slice(2);
const schreiben = optionen.includes("--schreiben");
if (!pfad) throw new Error("Pfad zur JSON-Datei aus stammdaten-lesen.py fehlt.");

const env = z
  .object({
    POCKETBASE_URL: z.string().url(),
    POCKETBASE_EMAIL: z.string().min(1),
    POCKETBASE_PASSWORD: z.string().min(1),
  })
  .parse(process.env);

const stammdaten = stammdatenSchema.parse(await Bun.file(pfad).json());

const pb = new PocketBase(env.POCKETBASE_URL);
pb.autoCancellation(false);
await pb.collection("_superusers").authWithPassword(env.POCKETBASE_EMAIL, env.POCKETBASE_PASSWORD);

const antraege = z
  .array(z.object({ id: z.string(), nachname: z.string(), iban: z.string(), mandatsreferenz: z.string() }))
  .parse(
    await pb.collection("mitgliedsantraege").getFullList({
      filter: 'status != "abgelehnt"',
      fields: "id,nachname,iban,mandatsreferenz",
    }),
  );

const { mitglieder: neu, hinweise } = auswerten(stammdaten, antraege);
const ablage = pocketbaseAblage(() => Promise.resolve(pb));
const m = mitglieder({ ablage, jetzt: () => new Date() });
const vorhanden = new Set(await ablage.mandatsreferenzen());
const offen = neu.filter((x) => !vorhanden.has(x.mandatsreferenz));

console.log(`Mitglieder in der Liste:    ${neu.length}`);
console.log(`  schon in PocketBase:      ${neu.length - offen.length}`);
console.log(`  neu anzulegen:            ${offen.length}`);
console.log(`  mit Eintrittsdatum:       ${neu.filter((x) => x.eintrittsdatum).length}`);
console.log(`  mit E-Mail:               ${neu.filter((x) => x.email).length}`);
console.log(`  mit Online-Antrag:        ${neu.filter((x) => x.antragId).length} von ${antraege.length} Anträgen`);
console.log(`\nHinweise (${hinweise.length}):`);
for (const h of hinweise) console.log(`  - ${h}`);

if (!schreiben) {
  console.log("\nNichts geschrieben. Mit --schreiben anlegen.");
  process.exit(0);
}

let fehler = 0;
for (const daten of offen) {
  const ergebnis = await m.anlegen(daten);
  if (!ergebnis.ok) {
    fehler++;
    console.error(`  Mandatsreferenz ${daten.mandatsreferenz}: ${ergebnis.grund}`);
  }
}
console.log(`\nAngelegt: ${offen.length - fehler}, Fehler: ${fehler}`);
process.exit(fehler ? 1 : 0);
