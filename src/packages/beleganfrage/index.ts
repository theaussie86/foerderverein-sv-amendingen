// Entry Point: Anwendungsfälle der Beleganfrage. Ablage und Postausgang werden hineingereicht,
// die echte Umgebung baut server.ts, Tests nehmen Fakes.
export { website as websiteBeleganfragen } from "./lib/website";
export type { StellenErgebnis, WebsiteUmgebung } from "./lib/website";
export { vorstand as vorstandsBeleganfragen } from "./lib/vorstand";
export type { AbschlussErgebnis, BelegPdf, ErfassenErgebnis, VorstandsUmgebung } from "./lib/vorstand";
export { ablehnungsmailVorlagen } from "./lib/mails";
export type {
  Ablehnung,
  Abschluss,
  BelegArt,
  Beleganfrage,
  Leseablage,
  Mail,
  NeueBeleganfrage,
  Postausgang,
  Schreibablage,
  Spenderangaben,
  Suche,
  Trefferliste,
} from "./lib/typen";
