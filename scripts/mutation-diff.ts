// Mutation-Tests nur auf den geänderten Zeilen, auf Ansage (nicht im Hook, nicht in der CI).
// Stryker verändert den Code absichtlich (=== zu !==, + zu - usw.) und lässt die Tests laufen.
// Bleiben sie grün, hat der Mutant überlebt: Dann fehlt ein Test, der dieses Verhalten festhält.
//
// Aufruf:
//   bun run test:mutation                 geänderte Zeilen gegenüber origin/main, inkl. nicht committeter Änderungen
//   bun run test:mutation <basis>         gegenüber einem anderen Commit oder Branch
//   bun run test:mutation -- --datei src/lib/x.ts   ganze Datei(en)
// Bericht: Ausgabe im Terminal und reports/mutation/mutation.json

const MUTIERBAR = /^src\/.+\.tsx?$/;
const KEIN_TEST = (pfad: string) => !/\.test\.tsx?$/.test(pfad) && !/\/tests\//.test(pfad) && !pfad.endsWith(".d.ts");

/** Liest `git diff -U0` und liefert pro Datei die neuen bzw. geänderten Zeilenbereiche. */
export function geaenderteBereiche(diff: string): string[] {
  const bereiche: string[] = [];
  let datei: string | null = null;
  for (const zeile of diff.split("\n")) {
    const kopf = /^\+\+\+ b\/(.+)$/.exec(zeile);
    if (kopf) {
      const pfad = kopf[1];
      datei = MUTIERBAR.test(pfad) && KEIN_TEST(pfad) ? pfad : null;
      continue;
    }
    if (zeile.startsWith("+++ ")) datei = null;
    const hunk = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(zeile);
    if (datei && hunk) {
      const start = Number(hunk[1]);
      const anzahl = hunk[2] === undefined ? 1 : Number(hunk[2]);
      if (anzahl > 0) bereiche.push(`${datei}:${start}-${start + anzahl - 1}`);
    }
  }
  return bereiche;
}

async function git(...args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { stdout: "pipe", stderr: "inherit" });
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) throw new Error(`git ${args.join(" ")} ist fehlgeschlagen`);
  return text.trim();
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  let mutate: string[];
  if (args[0] === "--datei") {
    mutate = args.slice(1);
  } else {
    const basis = await git("merge-base", args[0] ?? "origin/main", "HEAD");
    mutate = geaenderteBereiche(await git("diff", "-U0", "--no-color", basis));
  }
  if (mutate.length === 0) {
    console.log("Keine geänderten Zeilen in src/ (ohne Tests). Nichts zu mutieren.");
    process.exit(0);
  }
  console.log(`Mutiere:\n  ${mutate.join("\n  ")}\n`);
  const stryker = Bun.spawn(["bunx", "stryker", "run", "--mutate", mutate.join(",")], {
    stdout: "inherit",
    stderr: "inherit",
  });
  process.exit(await stryker.exited);
}
