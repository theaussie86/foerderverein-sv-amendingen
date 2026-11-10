// Interne Implementierung: von außen nicht importierbar.
export function normalisiereName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function bauGruss(name: string): string {
  const sauber = normalisiereName(name);
  return sauber.length > 0 ? `Hallo, ${sauber}!` : "Hallo!";
}
