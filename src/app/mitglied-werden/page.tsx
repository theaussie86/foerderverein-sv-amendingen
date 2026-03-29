"use client";

import { useState } from "react";

type Step = 1 | 2 | 3;

const membershipTypes = [
  { id: "einzel", label: "Einzelmitglied", price: "24 € / Jahr" },
  { id: "familie", label: "Familienmitglied", price: "36 € / Jahr" },
  { id: "firma", label: "Firmenmitglied", price: "100 € / Jahr" },
];

export default function MitgliedWerdenPage() {
  const [step, setStep] = useState<Step>(1);
  const [memberType, setMemberType] = useState("einzel");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-sva-gray-900 sm:text-4xl">
        Mitglied werden
      </h1>
      <p className="mt-4 text-lg text-sva-gray-600">
        Werden Sie Teil des Fördervereins SV Amendingen und unterstützen Sie den
        Verein mit Ihrem Jahresbeitrag.
      </p>

      {/* Progress Steps */}
      <div className="mt-10 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s
                  ? "bg-sva-blue text-white"
                  : "bg-sva-gray-200 text-sva-gray-600"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-12 sm:w-20 ${
                  step > s ? "bg-sva-blue" : "bg-sva-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-xs text-sva-gray-600">
        <span className="w-8 text-center">Typ</span>
        <span className="w-12 sm:w-20" />
        <span className="w-8 text-center">Daten</span>
        <span className="w-12 sm:w-20" />
        <span className="w-8 text-center">Zahlung</span>
      </div>

      <div className="mt-8 rounded-xl border border-sva-gray-200 bg-white p-6 sm:p-8">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-sva-gray-900">
              Mitgliedschaftsart wählen
            </h2>
            <div className="mt-6 space-y-3">
              {membershipTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                    memberType === type.id
                      ? "border-sva-blue bg-sva-blue/5"
                      : "border-sva-gray-200 hover:border-sva-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="memberType"
                      value={type.id}
                      checked={memberType === type.id}
                      onChange={(e) => setMemberType(e.target.value)}
                      className="h-4 w-4 text-sva-blue focus:ring-sva-blue"
                    />
                    <span className="font-medium text-sva-gray-900">
                      {type.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-sva-blue">
                    {type.price}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-8 w-full rounded-lg bg-sva-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sva-blue-light"
            >
              Weiter zu persönlichen Daten
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-sva-gray-900">
              Persönliche Daten
            </h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="vorname" className="block text-sm font-medium text-sva-gray-700">
                    Vorname *
                  </label>
                  <input
                    id="vorname"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
                <div>
                  <label htmlFor="nachname" className="block text-sm font-medium text-sva-gray-700">
                    Nachname *
                  </label>
                  <input
                    id="nachname"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="strasse" className="block text-sm font-medium text-sva-gray-700">
                  Straße & Hausnummer *
                </label>
                <input
                  id="strasse"
                  type="text"
                  className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="plz" className="block text-sm font-medium text-sva-gray-700">
                    PLZ *
                  </label>
                  <input
                    id="plz"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ort" className="block text-sm font-medium text-sva-gray-700">
                    Ort *
                  </label>
                  <input
                    id="ort"
                    type="text"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sva-gray-700">
                    E-Mail *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
                <div>
                  <label htmlFor="geburtsdatum" className="block text-sm font-medium text-sva-gray-700">
                    Geburtsdatum
                  </label>
                  <input
                    id="geburtsdatum"
                    type="date"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 text-sva-gray-900 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-sva-gray-200 px-6 py-3 text-sm font-medium text-sva-gray-700 transition-colors hover:bg-sva-gray-50"
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-sva-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sva-blue-light"
              >
                Weiter zur Zahlung
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-sva-gray-900">
              Zahlungsart
            </h2>
            <p className="mt-2 text-sm text-sva-gray-600">
              Wählen Sie Ihre bevorzugte Zahlungsmethode für den Jahresbeitrag.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border-2 border-sva-blue bg-sva-blue/5 p-5">
                <h3 className="font-semibold text-sva-gray-900">
                  SEPA-Lastschrift
                </h3>
                <p className="mt-1 text-sm text-sva-gray-600">
                  Bequem per Lastschrift &mdash; wir ziehen den Jahresbeitrag
                  automatisch ein.
                </p>
                <div className="mt-4">
                  <label htmlFor="iban" className="block text-sm font-medium text-sva-gray-700">
                    IBAN *
                  </label>
                  <input
                    id="iban"
                    type="text"
                    placeholder="DE00 0000 0000 0000 0000 00"
                    className="mt-1 w-full rounded-lg border border-sva-gray-200 px-4 py-2.5 font-mono text-sm text-sva-gray-900 placeholder:text-sva-gray-300 focus:border-sva-blue focus:outline-none focus:ring-1 focus:ring-sva-blue"
                  />
                </div>
                <p className="mt-3 text-xs text-sva-gray-600">
                  Mit Absenden erteilen Sie dem Förderverein SV Amendingen e.V.
                  ein SEPA-Lastschriftmandat zum Einzug des Jahresbeitrags. Das
                  Mandat wird Ihnen als PDF zum Download bereitgestellt.
                </p>
              </div>

              <div className="rounded-lg border border-sva-gray-200 p-5 opacity-60">
                <h3 className="font-semibold text-sva-gray-900">PayPal</h3>
                <p className="mt-1 text-sm text-sva-gray-600">
                  PayPal-Integration wird in Kürze freigeschaltet.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-sva-gray-300 text-sva-blue focus:ring-sva-blue"
                />
                <span className="text-sm text-sva-gray-700">
                  Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                  <a
                    href="/datenschutz"
                    className="text-sva-blue underline hover:text-sva-blue-light"
                  >
                    Datenschutzerklärung
                  </a>{" "}
                  zu und akzeptiere die Vereinssatzung. *
                </span>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-sva-gray-200 px-6 py-3 text-sm font-medium text-sva-gray-700 transition-colors hover:bg-sva-gray-50"
              >
                Zurück
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-sva-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-sva-blue-light"
              >
                Beitrittserklärung absenden
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-sva-gray-600">
              Formularversand wird in Kürze aktiviert. Kontaktieren Sie uns
              gerne direkt.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
