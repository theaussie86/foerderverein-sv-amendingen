import { createHash } from "node:crypto";
import type { Antrag } from "./antrag";

// Prüfsumme über Antragsdaten und Unterschrift. Steht im PDF und belegt, dass beides
// zusammengehört und nachträglich nicht verändert wurde. Hängt an der Feldreihenfolge
// von JSON.stringify, siehe antrag.ts. Abgesichert durch den Goldtest.
export function pruefsumme(antrag: Antrag, unterschriftPng: Uint8Array): string {
  return createHash("sha256").update(JSON.stringify(antrag)).update(unterschriftPng).digest("hex");
}
