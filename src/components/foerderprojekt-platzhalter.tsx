import Image from "next/image";
import { cn } from "@/lib/utils";

// Standardbild für Förderprojekte ohne eigenes Bild: Rasen in Mähstreifen, Wappen und Titel. Wird
// im Browser gezeichnet, passt sich also jedem Titel an. In kleinen Rahmen (Liste, Admin) steht nur
// das Wappen, ab 16rem Breite kommen Absender und Titel dazu.
export function FoerderprojektPlatzhalter({ titel, className }: { titel: string; className?: string }) {
  return (
    <div
      className={cn(
        "@container relative overflow-hidden bg-sva-green-dark",
        "bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.05)_0_12.5%,transparent_12.5%_25%)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(0_0_0/0.45))]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4cqw] p-[8cqw] text-center">
        <Image
          src="/sva-wappen.png"
          alt=""
          width={512}
          height={512}
          unoptimized
          className="w-[48cqw] drop-shadow-[0_4px_12px_rgb(0_0_0/0.4)] @3xs:w-[20cqw]"
        />
        <div className="hidden @3xs:block">
          <p className="text-[clamp(0.6rem,2.4cqw,0.8rem)] font-bold tracking-[0.2em] text-sva-gold uppercase">
            Förderverein SV Amendingen
          </p>
          <p className="mt-[1.5cqw] text-[clamp(1.1rem,6.5cqw,2.25rem)] leading-tight font-black text-balance text-white">
            {titel}
          </p>
        </div>
      </div>
    </div>
  );
}
