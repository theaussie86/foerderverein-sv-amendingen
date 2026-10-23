// Erzeugt die Sprecherspur aus src/script.json und schreibt src/timing.json
// sowie die Untertitel als WebVTT. Stimme: macOS `say` (Platzhalter).
// Später einfach public/audio/voice.wav ersetzen und Timing neu messen.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const script = JSON.parse(readFileSync(join(root, "src/script.json"), "utf8"));
const tmp = join(root, ".tts");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(join(root, "public/audio"), { recursive: true });

const RATE = 48000;
const LEAD_IN = 0.6;

const duration = (file) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );

const silence = (name, seconds) => {
  const file = join(tmp, `${name}.wav`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `anullsrc=r=${RATE}:cl=mono`, "-t", String(seconds), file]);
  return file;
};

const parts = [silence("lead", LEAD_IN)];
let t = LEAD_IN;
const scenes = [];

script.scenes.forEach((scene, si) => {
  const start = si === 0 ? 0 : t;
  const sentences = [];
  scene.sentences.forEach((s, i) => {
    const aiff = join(tmp, `${si}_${i}.aiff`);
    const wav = join(tmp, `${si}_${i}.wav`);
    execFileSync("say", ["-v", script.voice, "-r", String(script.rate), "-o", aiff, s.tts ?? s.text]);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", aiff, "-ar", String(RATE), "-ac", "1", wav]);
    const d = duration(wav);
    sentences.push({ text: s.text, start: t, end: t + d });
    parts.push(wav);
    t += d;
    const last = i === scene.sentences.length - 1;
    const pause = last ? (scene.tail ?? script.pauseScene) : script.pauseSentence;
    parts.push(silence(`p${si}_${i}`, pause));
    t += pause;
  });
  scenes.push({ id: scene.id, start, end: t, sentences });
});

const list = join(tmp, "list.txt");
writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n"));
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-ar", String(RATE), "-ac", "1", join(root, "public/audio/voice.wav")]);

const total = duration(join(root, "public/audio/voice.wav"));
writeFileSync(join(root, "src/timing.json"), JSON.stringify({ total, scenes }, null, 2) + "\n");

const ts = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}.${String(ms % 1000).padStart(3, "0")}`;
};
const cues = scenes.flatMap((sc) => sc.sentences);
const vtt = ["WEBVTT", "", ...cues.flatMap((c, i) => [String(i + 1), `${ts(c.start)} --> ${ts(c.end)}`, c.text, ""])].join("\n");
mkdirSync(join(root, "out"), { recursive: true });
writeFileSync(join(root, "out/untertitel.de.vtt"), vtt);

rmSync(tmp, { recursive: true, force: true });
console.log(`voice.wav ${total.toFixed(1)} s, ${cues.length} Untertitel`);
scenes.forEach((s) => console.log(`  ${s.id.padEnd(10)} ${s.start.toFixed(1)}-${s.end.toFixed(1)} s`));
