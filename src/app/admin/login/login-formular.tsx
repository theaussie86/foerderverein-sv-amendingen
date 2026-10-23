"use client";

import { useActionState } from "react";
import { anmelden, type LoginZustand } from "../actions";

const inputCls = "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";
const primaerCls = "w-full rounded-md bg-sva-gold px-6 py-3 text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light disabled:opacity-50";
const sekundaerCls = "w-full rounded-md border border-sva-gray-600 px-6 py-3 text-sm font-medium text-sva-gray-300 transition-colors hover:bg-sva-charcoal disabled:opacity-50";
const formCls = "mt-8 space-y-5 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6";

export function LoginFormular() {
  const [zustand, aktion, laeuft] = useActionState<LoginZustand, FormData>(anmelden, { schritt: "start" });
  const fehler = zustand.fehler && <p role="alert" className="text-sm text-red-400">{zustand.fehler}</p>;

  if (zustand.schritt === "code") {
    return (
      <form action={aktion} className={formCls}>
        <input type="hidden" name="email" value={zustand.email} />
        <input type="hidden" name="otpId" value={zustand.otpId} />
        <p className="text-sm text-sva-gray-300">
          Falls <strong className="text-white">{zustand.email}</strong> für den Vorstand freigeschaltet ist, kommt gleich
          eine E-Mail mit einem 6-stelligen Code. Er ist 10 Minuten gültig.
        </p>
        <div>
          <label htmlFor="code" className="text-sm font-medium text-sva-gray-200">Anmeldecode</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required autoFocus className={`${inputCls} tracking-[0.4em]`} />
        </div>
        {fehler}
        <button type="submit" name="modus" value="code-pruefen" disabled={laeuft} className={primaerCls}>
          {laeuft ? "Prüfen…" : "Anmelden"}
        </button>
        <button type="submit" name="modus" value="code-anfordern" formNoValidate disabled={laeuft} className={sekundaerCls}>
          Neuen Code schicken
        </button>
      </form>
    );
  }

  return (
    <form action={aktion} className={formCls}>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-sva-gray-200">E-Mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={zustand.email} className={inputCls} />
      </div>
      {fehler}
      <button type="submit" name="modus" value="code-anfordern" disabled={laeuft} className={primaerCls}>
        {laeuft ? "Senden…" : "Code per E-Mail schicken"}
      </button>
    </form>
  );
}
