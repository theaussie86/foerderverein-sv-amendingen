"use server";

import { revalidatePath } from "next/cache";
import { belegLaden } from "@/lib/spendenbelege";
import { spendenbelegAusgestellt } from "@/lib/pocketbase";
import { vorstandErforderlich } from "@/lib/vorstand-session";

export async function alsAusgestelltMarkieren(id: string): Promise<void> {
  const { pb, vorstand } = await vorstandErforderlich();
  // Mit dem Vorstands-Token laden, damit nur sichtbare und noch offene Anfragen abgehakt werden.
  const beleg = await belegLaden(pb, id);
  if (!beleg || beleg.status !== "offen") return;
  await spendenbelegAusgestellt(id, vorstand.id);
  revalidatePath("/admin/spenden");
  revalidatePath(`/admin/spenden/${id}`);
}
