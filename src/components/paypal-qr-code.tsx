"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { verein } from "@/lib/verein";

// PayPals eigener QR-Code-Link des Vereinskontos mit dem Wappen in der Mitte. Fehlerkorrektur H verkraftet rund 30 % verdeckte
// Fläche, das Wappen deckt mit Rand etwa 5 % ab.
export function PaypalQrCode() {
  const [svgDataUrl, setSvgDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toString(verein.paypalQr, {
      type: "svg",
      width: 200,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#2d6a2e", light: "#ffffff" },
    })
      .then((svg) => setSvgDataUrl(`data:image/svg+xml;base64,${btoa(svg)}`))
      .catch(() => {
        // Ohne QR-Code bleibt der Button.
      });
  }, []);

  if (!svgDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- Data-URL, next/image bringt hier nichts */}
        <img
          src={svgDataUrl}
          alt="QR-Code für eine Spende per PayPal"
          width={200}
          height={200}
          className="rounded-lg border border-sva-gray-200"
        />
        <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- kleines statisches Bild über dem QR-Code */}
          <img src="/sva-wappen.png" alt="" width={36} height={36} />
        </span>
      </div>
      <p className="max-w-[200px] text-center text-xs text-sva-gray-400">QR-Code scannen für PayPal</p>
    </div>
  );
}
