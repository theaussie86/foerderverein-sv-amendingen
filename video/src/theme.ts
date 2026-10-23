import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Geist lokal (Variable Font), damit das Rendern nicht vom Netz abhängt
export const FONT = "Geist";
loadFont({ family: FONT, url: staticFile("fonts/Geist-Variable.woff2"), weight: "100 900" });

// Vereinsfarben aus src/app/globals.css
export const C = {
  green: "#2d6a2e",
  greenLight: "#3a8a3b",
  greenDark: "#1e4d1f",
  gold: "#d4a017",
  goldLight: "#e6b422",
  anthracite: "#2a2a2a",
  dark: "#1a1a1a",
  white: "#ffffff",
  cream: "#f6f1e3",
  sky: "#cfe6f2",
  skyWarm: "#fbe3b8",
  skin: "#e2b48c",
  skinDark: "#b97d55",
  hair: "#4a3326",
  hairLight: "#8a5a35",
  red: "#c8322e",
  grey: "#9aa29a",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
