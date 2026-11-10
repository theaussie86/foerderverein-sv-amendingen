import type { Metadata } from "next";
import { verein } from "@/lib/verein";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieHinweis } from "@/components/cookie-hinweis";
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
    default: verein.name,
    template: "%s | Förderverein SV Amendingen",
  },
  description: `Der ${verein.name} unterstützt die Fußballabteilung des SV Amendingen finanziell und ideell. Werde Mitglied oder unterstütze uns mit einer Spende.`,
  keywords: ["Förderverein", "SV Amendingen", "Spenden", "Fußball", "Amendingen", "Verein"],
  openGraph: {
    title: verein.name,
    description:
      "Gemeinsam für den Fußball in Amendingen. Unterstütze die Fußballabteilung des SV Amendingen als Mitglied oder mit einer Spende.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-sva-green focus:px-4 focus:py-2 focus:text-white"
        >
          Zum Inhalt springen
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieHinweis />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: verein.name,
              description: "Der Förderverein unterstützt die Fußballabteilung des SV Amendingen finanziell und ideell.",
              url: "https://foerderverein-sv-amendingen.de",
              email: verein.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: verein.strasse,
                addressLocality: verein.ort,
                addressRegion: "Bayern",
                postalCode: verein.plz,
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
