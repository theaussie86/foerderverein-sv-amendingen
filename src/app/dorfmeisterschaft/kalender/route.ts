import { dorfmeisterschaft, kalenderEintrag } from "@/lib/dorfmeisterschaft";

export const dynamic = "force-static";

export function GET() {
  return new Response(kalenderEintrag(`https://foerderverein-sv-amendingen.de${dorfmeisterschaft.pfad}`), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="dorfmeisterschaft-2027.ics"',
    },
  });
}
