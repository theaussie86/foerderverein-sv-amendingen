import Link from "next/link";
import { connection } from "next/server";
import { bannerSichtbar, dorfmeisterschaft } from "@/lib/dorfmeisterschaft";

// Save-the-Date-Leiste auf der Startseite. Verschwindet am Tag nach der Dorfmeisterschaft von selbst.
export async function DorfmeisterschaftBanner() {
  await connection();
  if (!bannerSichtbar(new Date())) return null;

  return (
    <Link
      href={dorfmeisterschaft.pfad}
      className="group block bg-sva-gold text-sva-charcoal-dark transition-colors hover:bg-sva-gold-light"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-center text-sm sm:px-6 lg:px-8">
        <span className="rounded-sm bg-sva-charcoal-dark px-2 py-0.5 text-xs font-black tracking-widest text-sva-gold uppercase">
          Save the Date
        </span>
        <span className="font-bold">
          Fußball-Dorfmeisterschaft am {dorfmeisterschaft.datumKurz}
          <span aria-hidden="true" className="ml-2 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
