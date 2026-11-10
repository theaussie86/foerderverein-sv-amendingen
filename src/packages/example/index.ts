// Entry point: die öffentliche Schnittstelle des Pakets.
import { bauGruss } from "./lib/impl";

export function gruss(name: string): string {
  return bauGruss(name);
}
