import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Förderverein SV Amendingen e.V.",
    template: "%s | Förderverein SV Amendingen",
  },
  description:
    "Der Förderverein SV Amendingen e.V. unterstützt den SV Amendingen finanziell und ideell. Spenden Sie oder werden Sie Mitglied!",
  keywords: [
    "Förderverein",
    "SV Amendingen",
    "Spenden",
    "Fußball",
    "Amendingen",
    "Verein",
  ],
  openGraph: {
    title: "Förderverein SV Amendingen e.V.",
    description:
      "Gemeinsam für den Sport in Amendingen. Unterstützen Sie den SV Amendingen mit einer Spende oder Mitgliedschaft.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sva-blue focus:px-4 focus:py-2 focus:text-white"
        >
          Zum Inhalt springen
        </a>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Förderverein SV Amendingen e.V.",
              description:
                "Der Förderverein SV Amendingen unterstützt den SV Amendingen finanziell und ideell.",
              url: "https://foerderverein-sv-amendingen.de",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Memmingen",
                addressRegion: "Bayern",
                postalCode: "87700",
                addressCountry: "DE",
              },
              sameAs: ["https://www.sv-amendingen-fussball.de/"],
            }),
          }}
        />
      </body>
    </html>
  );
}
