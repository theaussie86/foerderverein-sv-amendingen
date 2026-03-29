"use client";

import { useState } from "react";
import type { Metadata } from "next";

const amounts = [10, 25, 50, 100];

export default function SpendenPage() {
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState("");
  const [recurring, setRecurring] = useState(false);

  const activeAmount = selected ?? (custom ? Number(custom) : 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Spenden
      </h1>
      <p className="mt-4 text-lg text-sva-gray-600">
        Mit Ihrer Spende unterstützen Sie den SV Amendingen direkt.
        Spendenbescheinigungen werden auf Wunsch ausgestellt.
      </p>

      <div className="mt-10 rounded-xl border border-sva-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-sva-gray-900">
          Spendenbetrag wählen
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelected(amount);
                setCustom("");
              }}
              className={`rounded-lg border-2 px-4 py-3 text-center text-lg font-semibold transition-colors ${
                selected === amount
                  ? "border-sva-blue bg-sva-blue text-white"
                  : "border-sva-gray-200 text-sva-gray-700 hover:border-sva-blue hover:text-sva-blue"
              }`}
            >
              {amount}&thinsp;&euro;
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label
            htmlFor="custom-amount"
            className="block text-sm font-medium text-sva-gray-700"
          >
            Oder eigenen Betrag eingeben
          </label>
          <div className="relative mt-1">
            <input
              id="custom-amount"
              type="number"
              min="1"
              placeholder="Betrag"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(null);
              }}
              className="w-full rounded-lg border border-sva-gray-200 px-4 py-3 pr-10 text-sva-gray-900 placeholder:text-sva-gray-300 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sva-gray-400">
              &euro;
            </span>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-sva-gray-300 text-sva-blue focus:ring-sva-blue"
            />
            <span className="text-sm text-sva-gray-700">
              Monatlich wiederkehrende Spende
            </span>
          </label>
        </div>

        <div className="mt-8">
          <button
            type="button"
            disabled={!activeAmount || activeAmount <= 0}
            className="w-full rounded-lg bg-sva-blue px-6 py-4 text-center text-sm font-bold text-white transition-colors hover:bg-sva-blue-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeAmount > 0
              ? `${activeAmount} € ${recurring ? "monatlich " : ""}spenden mit PayPal`
              : "Bitte Betrag wählen"}
          </button>
          <p className="mt-3 text-center text-xs text-sva-gray-600">
            PayPal-Integration wird in Kürze aktiviert. Kontaktieren Sie uns
            gerne direkt für Ihre Spende.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-sva-gray-200 bg-sva-gray-50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-sva-gray-900">
          Banküberweisung
        </h2>
        <p className="mt-2 text-sm text-sva-gray-600">
          Alternativ können Sie direkt auf unser Vereinskonto überweisen:
        </p>
        <dl className="mt-4 space-y-2 font-mono text-sm text-sva-gray-700">
          <div className="flex gap-3">
            <dt className="font-semibold text-sva-gray-900 w-28">Empfänger:</dt>
            <dd>Förderverein SV Amendingen e.V.</dd>
          </div>
          <div className="flex gap-3">
            <dt className="font-semibold text-sva-gray-900 w-28">IBAN:</dt>
            <dd>DE00 0000 0000 0000 0000 00</dd>
          </div>
          <div className="flex gap-3">
            <dt className="font-semibold text-sva-gray-900 w-28">BIC:</dt>
            <dd>XXXXXXXXXXX</dd>
          </div>
          <div className="flex gap-3">
            <dt className="font-semibold text-sva-gray-900 w-28">Verwendung:</dt>
            <dd>Spende Förderverein SVA</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-sva-gray-600">
          Bankdaten werden in Kürze ergänzt. Bitte kontaktieren Sie den Vorstand
          für aktuelle Kontoinformationen.
        </p>
      </div>
    </div>
  );
}
