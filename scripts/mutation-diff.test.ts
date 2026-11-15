import { describe, expect, test } from "bun:test";
import { geaenderteBereiche } from "./mutation-diff";

const diff = `diff --git a/src/lib/token.ts b/src/lib/token.ts
--- a/src/lib/token.ts
+++ b/src/lib/token.ts
@@ -9 +9 @@ function key(): Buffer {
@@ -20,0 +21,3 @@ export function seal
@@ -30,2 +33,0 @@ export function unseal
diff --git a/src/lib/token.test.ts b/src/lib/token.test.ts
--- a/src/lib/token.test.ts
+++ b/src/lib/token.test.ts
@@ -1 +1,2 @@
diff --git a/README.md b/README.md
+++ b/README.md
@@ -1 +1 @@
diff --git a/src/lib/alt.ts b/src/lib/alt.ts
--- a/src/lib/alt.ts
+++ /dev/null
@@ -1,5 +0,0 @@`;

describe("geaenderteBereiche", () => {
  test("nimmt neue Zeilen aus src/, ohne Tests, Doku und gelöschte Dateien", () => {
    expect(geaenderteBereiche(diff)).toEqual(["src/lib/token.ts:9-9", "src/lib/token.ts:21-23"]);
  });
});
