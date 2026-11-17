import type PocketBase from "pocketbase";

// Aufnahme: Der Mitgliedsantrag wird „angenommen“, sobald aus ihm ein Mitglied entstanden ist.
// Schreibt als Superuser, weil der Vorstand die Collection nur lesen darf.
export function aufnahme(superuser: () => Promise<PocketBase | null>) {
  return {
    async annehmen(id: string): Promise<void> {
      const pb = await superuser();
      if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
      await pb.collection("mitgliedsantraege").update(id, { status: "angenommen" });
    },
  };
}
