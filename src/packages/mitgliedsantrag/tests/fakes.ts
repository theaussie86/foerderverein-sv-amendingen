import type { z } from "zod";
import type { Ablage, Mail, Siegel, Speicherergebnis, Umgebung, UnterschriebenerAntrag } from "../index";

// Ablage im Speicher. `verhalten` steuert, was speichern() meldet.
export class FakeAblage implements Ablage {
  gespeichert: UnterschriebenerAntrag[] = [];
  verhalten: Speicherergebnis | "wirft" = "gespeichert";
  ids: string[] | null | "wirft" = [];
  zaehlAufrufe: Date[] = [];

  speichern(eintrag: UnterschriebenerAntrag): Promise<Speicherergebnis> {
    if (this.verhalten === "wirft") return Promise.reject(new Error("PocketBase nicht erreichbar"));
    if (this.verhalten === "gespeichert") this.gespeichert.push(eintrag);
    return Promise.resolve(this.verhalten);
  }

  idsSeit(datum: Date): Promise<string[] | null> {
    this.zaehlAufrufe.push(datum);
    if (this.ids === "wirft") return Promise.reject(new Error("PocketBase nicht erreichbar"));
    return Promise.resolve(this.ids);
  }
}

// Postausgang im Speicher. Mit `fehlerAb` schlägt der n-te Versand (ab 0) und jeder weitere fehl.
export class FakePostausgang {
  gesendet: Mail[] = [];
  fehlerAb: number | null = null;
  versuche = 0;

  senden = (mail: Mail): Promise<void> => {
    const nr = this.versuche++;
    if (this.fehlerAb !== null && nr >= this.fehlerAb) return Promise.reject(new Error("Resend nicht erreichbar"));
    this.gesendet.push(mail);
    return Promise.resolve();
  };
}

// Uhr, die nur weiterläuft, wenn der Test sie stellt.
export class FakeUhr {
  constructor(public zeit = new Date("2026-11-10T09:15:00.000Z")) {}
  jetzt = (): Date => new Date(this.zeit);
  vorstellen(sekunden: number) {
    this.zeit = new Date(this.zeit.getTime() + sekunden * 1000);
  }
}

// Siegel ohne Kryptografie, aber mit Ablauf nach der Fake-Uhr und Prüfung per Schema wie das echte.
// Tokens sind lesbar ("token-1"), damit Testfehler verständlich bleiben.
export class FakeSiegel implements Siegel {
  private tokens = new Map<string, { inhalt: string; ablauf: number }>();
  constructor(private uhr: FakeUhr) {}

  versiegeln = (inhalt: unknown, gueltigSekunden: number): string => {
    const token = `token-${this.tokens.size + 1}`;
    this.tokens.set(token, {
      inhalt: JSON.stringify(inhalt),
      ablauf: this.uhr.jetzt().getTime() + gueltigSekunden * 1000,
    });
    return token;
  };

  entsiegeln = <T>(token: string, schema: z.ZodType<T>): T | null => {
    const eintrag = this.tokens.get(token);
    if (!eintrag || this.uhr.jetzt().getTime() > eintrag.ablauf) return null;
    const geprueft = schema.safeParse(JSON.parse(eintrag.inhalt));
    return geprueft.success ? geprueft.data : null;
  };

  gueltigBis(token: string): Date | null {
    const eintrag = this.tokens.get(token);
    return eintrag ? new Date(eintrag.ablauf) : null;
  }
}

// UUIDs, die neueId() der Reihe nach liefert.
export const IDS = ["3f2a9c1b-7d4e-4a6b-9c8d-1e2f3a4b5c6d", "a1b2c3d4-0000-4000-8000-000000000002"];

export function fakeUmgebung() {
  const uhr = new FakeUhr();
  const ablage = new FakeAblage();
  const postausgang = new FakePostausgang();
  const siegel = new FakeSiegel(uhr);
  let ids = 0;
  const umgebung: Umgebung = {
    ablage,
    postausgang,
    siegel,
    jetzt: uhr.jetzt,
    neueId: () => IDS[ids++ % IDS.length] ?? "",
    linkBasis: "https://foerderverein.test",
    antragEmpfaenger: "vorstand@foerderverein.test",
  };
  return { umgebung, uhr, ablage, postausgang, siegel };
}
