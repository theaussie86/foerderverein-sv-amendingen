import { istAktiv, type Ablage, type Mitglied, type Mitgliedsdaten, type Speicherergebnis } from "../index";

// Ablage im Speicher mit denselben Eindeutigkeitsregeln wie die Collection "mitglieder".
export class FakeAblage implements Ablage {
  mitglieder: Mitglied[] = [];
  private naechsteId = 1;

  private konflikt(daten: Mitgliedsdaten, ausser?: string): Speicherergebnis | null {
    const andere = this.mitglieder.filter((m) => m.id !== ausser);
    if (andere.some((m) => m.mandatsreferenz === daten.mandatsreferenz))
      return { ok: false, grund: "mandatsreferenz-vergeben" };
    if (daten.antragId && andere.some((m) => m.antragId === daten.antragId))
      return { ok: false, grund: "antrag-vergeben" };
    return null;
  }

  suchen(): never {
    throw new Error("Im Fake nicht gebraucht");
  }

  laden(id: string) {
    return Promise.resolve(this.mitglieder.find((m) => m.id === id) ?? null);
  }

  anlegen(daten: Mitgliedsdaten): Promise<Speicherergebnis> {
    const k = this.konflikt(daten);
    if (k) return Promise.resolve(k);
    const id = `m${this.naechsteId++}`;
    this.mitglieder.push({ ...daten, id, angelegt: "", geaendert: "" });
    return Promise.resolve({ ok: true, id });
  }

  aendern(id: string, daten: Mitgliedsdaten): Promise<Speicherergebnis> {
    const i = this.mitglieder.findIndex((m) => m.id === id);
    const alt = this.mitglieder[i];
    if (!alt) return Promise.resolve({ ok: false, grund: "nicht-gefunden" });
    const k = this.konflikt(daten, id);
    if (k) return Promise.resolve(k);
    this.mitglieder[i] = { ...alt, ...daten };
    return Promise.resolve({ ok: true, id });
  }

  mandatsreferenzen() {
    return Promise.resolve(this.mitglieder.map((m) => m.mandatsreferenz));
  }

  anzahlAktiv(heute: string) {
    return Promise.resolve(this.mitglieder.filter((m) => istAktiv(m, heute)).length);
  }

  zuAntrag(antragId: string) {
    return Promise.resolve(this.mitglieder.find((m) => m.antragId === antragId)?.id ?? null);
  }

  verknuepfteAntraege() {
    return Promise.resolve(this.mitglieder.map((m) => m.antragId).filter(Boolean));
  }
}

export function daten(teil: Partial<Mitgliedsdaten> = {}): Mitgliedsdaten {
  return {
    mandatsreferenz: "1",
    vorname: "Max",
    nachname: "Muster",
    strasse: "Hauptstraße 1",
    plz: "87700",
    ort: "Memmingen",
    email: "",
    kontoinhaber: "",
    iban: "DE89370400440532013000",
    bic: "",
    bank: "",
    eintrittsdatum: "",
    mandatDatum: "",
    endeDatum: "",
    endeGrund: "",
    antragId: "",
    notiz: "",
    ...teil,
  };
}
