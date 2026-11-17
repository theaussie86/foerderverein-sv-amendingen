import PocketBase, { ClientResponseError } from "pocketbase";
import { z } from "zod";
import { STATUS } from "../anzeige";
import type { Antragsstand, Entscheidungsablage } from "../entscheidung";

// Aufnahme und Ablehnung in PocketBase. Schreibt als Superuser, weil der Vorstand die Collection
// "mitgliedsantraege" nur lesen darf. Nur nach vorstandErforderlich aufrufen.

const standSchema = z.object({ status: z.enum(STATUS), vorname: z.string(), email: z.string() });

export function pocketbaseEntscheidungen(superuser: () => Promise<PocketBase | null>): Entscheidungsablage {
  async function client(): Promise<PocketBase> {
    const pb = await superuser();
    if (!pb) throw new Error("PocketBase ist nicht konfiguriert.");
    return pb;
  }

  return {
    async stand(id: string): Promise<Antragsstand | null> {
      const pb = await client();
      let antrag;
      try {
        antrag = standSchema.parse(
          await pb.collection("mitgliedsantraege").getOne(id, { fields: "status,vorname,email" }),
        );
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 404) return null;
        throw e;
      }
      const mitglieder = await pb.collection("mitglieder").getList(1, 1, {
        filter: pb.filter("antrag = {:id}", { id }),
        fields: "id",
      });
      return { ...antrag, mitgliedVerknuepft: mitglieder.totalItems > 0 };
    },

    async annehmen(id: string): Promise<void> {
      await (await client()).collection("mitgliedsantraege").update(id, { status: "angenommen" });
    },

    async ablehnen(id: string, grund: string): Promise<void> {
      await (
        await client()
      )
        .collection("mitgliedsantraege")
        .update(id, { status: "abgelehnt", ablehnungsgrund: grund });
    },
  };
}
