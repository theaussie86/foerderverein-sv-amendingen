import { describe, it } from "bun:test";
import { RuleTester } from "eslint";
import { keinZusammengesetzterFilter } from "./pocketbase-filter.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

new RuleTester().run("kein-zusammengesetzter-filter", keinZusammengesetzterFilter, {
  valid: [
    `pb.collection("x").getList(1, 10, { filter: 'status = "offen"' })`,
    "pb.collection('x').getFullList({ filter: `antrag != \"\"` })",
    `pb.collection("x").getList(1, 10, { filter: pb.filter("id = {:id}", { id }) })`,
    `pb.collection("x").getList(1, 10, { filter: teile.length ? pb.filter(teile.join(" && "), params) : "" })`,
    `pb.collection("x").getFirstListItem(pb.filter("email = {:email}", { email }))`,
    `liste.filter((x) => x.aktiv)`,
    `const optionen = { filter: \`a = \${b}\` }`,
  ],
  invalid: [
    {
      code: 'pb.collection("x").getList(1, 10, { filter: `email = "${email}"` })',
      errors: [{ messageId: "zusammengesetzt" }],
    },
    {
      code: `pb.collection("x").getFullList({ filter: 'email = "' + email + '"' })`,
      errors: [{ messageId: "zusammengesetzt" }],
    },
    {
      code: 'pb.collection("x").getList(1, 10, { filter: aktiv ? `id = "${id}"` : "" })',
      errors: [{ messageId: "zusammengesetzt" }],
    },
    {
      code: 'pb.collection("x").getFirstListItem(`email = "${email}"`)',
      errors: [{ messageId: "zusammengesetzt" }],
    },
    {
      code: 'pb.filter(`email = "${email}"`, {})',
      errors: [{ messageId: "zusammengesetzt" }],
    },
  ],
});
