// Verbietet zusammengesetzte PocketBase-Filter wie filter: `email = "${email}"`.
// Werte aus Eingaben gehören in Platzhalter: pb.filter("email = {:email}", { email }).
// PocketBase maskiert sie dann, sonst lässt sich der Filter von außen umbiegen (Filter-Injection).

/** Ein String, der zur Laufzeit aus Werten zusammengesetzt wird. */
function istZusammengesetzt(node) {
  if (!node) return false;
  if (node.type === "TemplateLiteral") return node.expressions.length > 0;
  if (node.type === "BinaryExpression" && node.operator === "+") return true;
  if (node.type === "ConditionalExpression")
    return istZusammengesetzt(node.consequent) || istZusammengesetzt(node.alternate);
  if (node.type === "LogicalExpression") return istZusammengesetzt(node.left) || istZusammengesetzt(node.right);
  return false;
}

function methodenName(callee) {
  if (callee.type !== "MemberExpression" || callee.computed) return null;
  return callee.property.type === "Identifier" ? callee.property.name : null;
}

/** @type {import("eslint").Rule.RuleModule} */
export const keinZusammengesetzterFilter = {
  meta: {
    type: "problem",
    docs: { description: "PocketBase-Filter nur mit Platzhaltern über pb.filter() bauen." },
    messages: {
      zusammengesetzt:
        "PocketBase-Filter nicht per Template-String oder + zusammenbauen. Werte als Platzhalter übergeben: pb.filter('feld = {:wert}', { wert }). Feste Filterteile dürfen Strings ohne ${} sein.",
    },
    schema: [],
  },
  create(context) {
    return {
      // Optionsobjekt von getList, getFullList, getOne usw.: { filter: ... }
      Property(node) {
        if (node.computed || node.key.type !== "Identifier" || node.key.name !== "filter") return;
        if (node.parent.type !== "ObjectExpression" || node.parent.parent.type !== "CallExpression") return;
        if (istZusammengesetzt(node.value)) context.report({ node: node.value, messageId: "zusammengesetzt" });
      },
      // getFirstListItem(filter) und pb.filter(ausdruck, params)
      CallExpression(node) {
        const name = methodenName(node.callee);
        if (name !== "getFirstListItem" && name !== "filter") return;
        const [erstes] = node.arguments;
        if (istZusammengesetzt(erstes)) context.report({ node: erstes, messageId: "zusammengesetzt" });
      },
    };
  },
};

const plugin = {
  meta: { name: "verein" },
  rules: { "kein-zusammengesetzter-filter": keinZusammengesetzterFilter },
};

export default plugin;
