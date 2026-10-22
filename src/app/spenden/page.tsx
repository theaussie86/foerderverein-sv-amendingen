"use client";

import { useState } from "react";
import Link from "next/link";
import { BankQrCode } from "@/components/bank-qr-code";
import { verein } from "@/lib/verein";

const amounts = [10, 25, 50, 100];

function paypalLink(amount: number): string {
  const params = new URLSearchParams({
    business: verein.paypal,
    currency_code: "EUR",
    item_name: verein.spendenVerwendungszweck,
  });
  if (amount > 0) params.set("amount", amount.toFixed(2));
  return `https://www.paypal.com/donate?${params}`;
}

export default function SpendenPage() {
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState("");

  const activeAmount = selected ?? (custom ? Number(custom) : 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Spenden</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 text-lg text-sva-gray-300">
        Jeder Euro kommt direkt dem SV Amendingen zugute, vor allem unserer Jugend: Trainingsmaterial, Trikots, Ausflüge.
      </p>

      <div className="mt-10 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">1. Betrag wählen</h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => { setSelected(amount); setCustom(""); }}
              className={`rounded-md border-2 px-4 py-3 text-center text-lg font-semibold transition-colors ${
                selected === amount
                  ? "border-sva-gold bg-sva-gold text-sva-charcoal-dark"
                  : "border-sva-gray-600 text-sva-gray-200 hover:border-sva-gold hover:text-sva-gold"
              }`}
            >
              {amount}&thinsp;&euro;
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="custom-amount" className="block text-sm font-medium text-sva-gray-300">
            Oder eigenen Betrag eingeben
          </label>
          <div className="relative mt-1">
            <input
              id="custom-amount"
              type="number"
              min="1"
              inputMode="decimal"
              placeholder="Betrag"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              className="w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-3 pr-10 text-white placeholder:text-sva-gray-400 focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sva-gray-400">&euro;</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border-2 border-sva-green bg-sva-charcoal-light p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-white">2. Per Überweisung spenden</h2>
          <span className="rounded-full bg-sva-green/20 px-3 py-1 text-xs font-semibold text-sva-green-light">ohne Gebühren</span>
        </div>
        <p className="mt-2 text-sm text-sva-gray-300">
          QR-Code mit der Banking-App scannen: Empfänger, IBAN und Betrag sind schon ausgefüllt.
        </p>

        <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <BankQrCode amount={activeAmount > 0 ? activeAmount : undefined} />

          <dl className="flex-1 space-y-2 font-mono text-sm text-sva-gray-200">
            {[
              ["Empfänger", verein.bank.kontoinhaber],
              ["IBAN", verein.bank.iban],
              ["BIC", verein.bank.bic],
              ["Bank", verein.bank.name],
              ["Verwendung", verein.spendenVerwendungszweck],
              ...(activeAmount > 0 ? [["Betrag", `${activeAmount} €`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-28 shrink-0 font-semibold text-white">{k}:</dt>
                <dd className="break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-xs text-sva-gray-400">
          Regelmäßig unterstützen? Richten Sie einfach einen Dauerauftrag mit diesen Daten ein.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Oder mit PayPal</h2>
        {verein.paypal ? (
          <>
            <p className="mt-2 text-sm text-sva-gray-300">Sie werden zu PayPal weitergeleitet. Dort ist auch eine monatliche Spende möglich.</p>
            <a
              href={paypalLink(activeAmount)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full rounded-md bg-sva-gold px-6 py-4 text-center text-sm font-bold uppercase text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
            >
              {activeAmount > 0 ? `${activeAmount} € mit PayPal spenden` : "Mit PayPal spenden"}
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm text-sva-gray-400">PayPal-Spenden werden in Kürze freigeschaltet.</p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-sva-gray-700 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Spendenquittung</h2>
        <p className="mt-2 text-sm leading-relaxed text-sva-gray-300">
          Der {verein.name} ist als gemeinnützig anerkannt, Ihre Spende ist steuerlich absetzbar. Bis 300 € genügt dem
          Finanzamt Ihr Kontoauszug bzw. der PayPal-Beleg als Nachweis. Für höhere Beträge oder auf Wunsch stellen wir
          Ihnen gern eine Zuwendungsbestätigung aus. Schreiben Sie uns dazu einfach über das{" "}
          <Link href="/kontakt" className="text-sva-gold underline hover:text-sva-gold-light">Kontaktformular</Link> mit Ihrer Anschrift.
        </p>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sva-gray-300">Lieber dauerhaft dabei sein?</p>
        <Link
          href="/mitglied-werden"
          className="mt-3 inline-block rounded-md bg-sva-green px-6 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light"
        >
          Mitglied werden
        </Link>
      </div>
    </div>
  );
}
