// Schreibt die WebVTT-Untertitel der Kurzfassung v2 aus src/v2/timeline.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const timeline = JSON.parse(readFileSync(new URL("../src/v2/timeline.json", import.meta.url), "utf8"));
const out = process.argv[2] ?? "out/untertitel-kurzfassung.de.vtt";

const ts = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}.${String(ms % 1000).padStart(3, "0")}`;
};

const body = timeline.cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}`).join("\n\n");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `WEBVTT\n\n${body}\n`);
console.log(`${timeline.cues.length} Untertitel -> ${out}`);
