import "server-only";
import PocketBase from "pocketbase";

// Die Website spricht PocketBase nur serverseitig und als eigener Superuser an.
// Ohne POCKETBASE_URL (lokale Entwicklung) wird nichts gespeichert.

let client: PocketBase | null = null;

// Für Pakete, die als Superuser schreiben müssen (src/packages/beleganfrage, src/packages/mitgliedsantrag).
export async function superuser(): Promise<PocketBase | null> {
  const url = process.env.POCKETBASE_URL;
  if (!url) return null;
  if (!client) {
    client = new PocketBase(url);
    client.autoCancellation(false);
  }
  if (!client.authStore.isValid) {
    const email = process.env.POCKETBASE_EMAIL;
    const passwort = process.env.POCKETBASE_PASSWORD;
    if (!email || !passwort) throw new Error("POCKETBASE_EMAIL oder POCKETBASE_PASSWORD fehlt.");
    await client.collection("_superusers").authWithPassword(email, passwort);
  }
  return client;
}
