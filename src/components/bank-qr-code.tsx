"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// EPC QR Code format (European Payments Council)
// https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation
function buildEpcPayload({
  bic,
  name,
  iban,
  amount,
  reference,
}: {
  bic: string;
  name: string;
  iban: string;
  amount?: number;
  reference?: string;
}) {
  const lines = [
    "BCD", // Service Tag
    "002", // Version
    "1", // Character set (UTF-8)
    "SCT", // Identification (SEPA Credit Transfer)
    bic,
    name,
    iban.replace(/\s/g, ""),
    amount ? `EUR${amount.toFixed(2)}` : "",
    "", // Purpose
    reference || "Spende Foerderverein SVA",
    "", // Display text
  ];
  return lines.join("\n");
}

// Placeholder bank details — replace with real data
const BANK_DETAILS = {
  name: "Foerderverein SV Amendingen e.V.",
  iban: "DE00 0000 0000 0000 0000 00",
  bic: "XXXXXXXXXXX",
};

export function BankQrCode({ amount }: { amount?: number }) {
  const [svgDataUrl, setSvgDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const payload = buildEpcPayload({
      ...BANK_DETAILS,
      amount: amount && amount > 0 ? amount : undefined,
    });

    QRCode.toString(payload, {
      type: "svg",
      width: 200,
      margin: 2,
      color: { dark: "#2d6a2e", light: "#ffffff" },
    })
      .then((svg) => {
        const encoded = `data:image/svg+xml;base64,${btoa(svg)}`;
        setSvgDataUrl(encoded);
      })
      .catch(() => {
        // QR code generation failed silently
      });
  }, [amount]);

  if (!svgDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={svgDataUrl}
        alt="QR-Code für Banküberweisung"
        width={200}
        height={200}
        className="rounded-lg border border-sva-gray-200"
      />
      <p className="text-xs text-sva-gray-600 text-center max-w-[200px]">
        QR-Code scannen für Überweisung
        {amount && amount > 0 ? ` (${amount} €)` : ""}
      </p>
    </div>
  );
}
