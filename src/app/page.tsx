import Link from "next/link";
import { mitgliederstand, type Mitgliederstand } from "@/lib/mitglieder";
import { mitgliedsbeitrag, verein } from "@/lib/verein";

// Mitgliederzähler stündlich neu berechnen.
export const revalidate = 3600;

const projekte = [
  {
    titel: "Fahrt nach Augsburg",
    text: "Zuschuss zur Fahrt für die gesamte Jugend. Ein Ausflug, an den sich die Kinder noch lange erinnern.",
  },
  {
    titel: "Trainingsanzüge",
    text: "Zuschüsse für Trainingsanzüge, damit jede Mannschaft einheitlich auftritt und kein Kind außen vor bleibt.",
  },
  {
    titel: "Trainingsmaterial",
    text: "Bälle, Hütchen, Leibchen: Material, das jede Woche gebraucht wird und schnell verschleißt.",
  },
  {
    titel: "FC-Bayern-Jugendcamp",
    text: "Besondere Projekte wie das Jugendcamp mit unserem Kooperationspartner FC Bayern München.",
  },
];

const hebel = [
  { mitglieder: 1, text: "ein neuer Spielball" },
  { mitglieder: 25, text: "Trainingsmaterial für eine Jugendmannschaft" },
  { mitglieder: 100, text: "ein Zuschuss für die nächste Jugendfahrt" },
];

const schritte = [
  { titel: "Formular ausfüllen", text: "Zwei Minuten, komplett online." },
  { titel: "Online unterschreiben", text: "Direkt am Handy oder Rechner. Kein Papier, kein Briefkasten." },
  { titel: "Fertig", text: `Der Beitrag wird einmal im Jahr zum ${verein.einzugstermin} per Lastschrift eingezogen.` },
];

const fragen = [
  {
    frage: "Ich bin schon Mitglied im SV Amendingen. Warum noch im Förderverein?",
    antwort:
      "Der Vereinsbeitrag deckt den Spielbetrieb. Der Förderverein finanziert das, wofür sonst kein Geld da ist: die kleinen Extras im Jugendbereich, für die sich kein eigener Sponsor findet.",
  },
  {
    frage: "Muss ich mithelfen oder zu Versammlungen kommen?",
    antwort: "Nein. Du kannst gerne mitreden und mitanpacken, musst aber nicht. Dein Beitrag allein hilft schon.",
  },
  {
    frage: "Kann ich wieder austreten?",
    antwort: "Ja. Schreib uns einfach über das Kontaktformular. Die Einzelheiten regelt die Satzung.",
  },
  {
    frage: "Wie sicher ist das SEPA-Lastschriftmandat?",
    antwort:
      "Es ist eine ganz normale SEPA-Lastschrift. Du kannst jede Abbuchung innerhalb von acht Wochen bei deiner Bank zurückbuchen lassen.",
  },
  {
    frage: "Kann ich mehr als " + mitgliedsbeitrag + " € geben?",
    antwort:
      "Sehr gerne, über eine zusätzliche Spende. Der Förderverein ist als gemeinnützig anerkannt, Spenden sind steuerlich absetzbar.",
  },
];

function MitgliedButton({ className = "", children = "Jetzt Mitglied werden" }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link
      href="/mitglied-werden"
      className={`inline-block rounded-md bg-sva-gold px-8 py-4 text-center text-sm font-black uppercase tracking-wide text-sva-charcoal-dark shadow-lg shadow-sva-gold/10 transition-colors hover:bg-sva-gold-light ${className}`}
    >
      {children}
    </Link>
  );
}

function Abschnitt({ titel, eyebrow, children, className = "" }: { titel: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sva-gold">{eyebrow}</p>}
        <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">{titel}</h2>
        <div className="mt-3 h-1 w-16 bg-sva-gold" />
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-sva-gray-200">{children}</div>
      </div>
    </section>
  );
}

function Zaehler({ stand }: { stand: Mitgliederstand }) {
  const prozent = Math.min(100, Math.round((stand.gesamt / stand.ziel) * 100));
  return (
    <div className="rounded-xl border border-sva-gray-700 bg-sva-charcoal-light/80 p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-widest text-sva-gray-300">Wir sind schon</p>
      <p className="mt-1 text-6xl font-black tabular-nums text-white sm:text-7xl">{stand.gesamt}</p>
      <p className="text-lg font-bold uppercase text-sva-gold">Mitglieder</p>
      {stand.zuwachs && (
        <p className="mt-3 inline-block rounded-full bg-sva-green/30 px-3 py-1 text-sm font-semibold text-white">
          +{stand.zuwachs.anzahl} {stand.zuwachs.zeitraum}
        </p>
      )}
      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-sva-gray-700" role="progressbar" aria-valuemin={0} aria-valuemax={stand.ziel} aria-valuenow={stand.gesamt} aria-label="Mitglieder bis zum Ziel">
          <div className="h-full rounded-full bg-gradient-to-r from-sva-green to-sva-gold" style={{ width: `${prozent}%` }} />
        </div>
        <p className="mt-2 text-sm text-sva-gray-300">
          Unser Ziel: <strong className="text-white">{stand.ziel} Mitglieder</strong>. Noch {Math.max(0, stand.ziel - stand.gesamt)} fehlen.
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const stand = await mitgliederstand();
  const proMonat = (mitgliedsbeitrag / 12).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-sva-charcoal-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-sva-green-dark/40 via-sva-charcoal-dark to-sva-charcoal-dark" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-sva-gold">{verein.name}</p>
            <h1 className="text-4xl font-black uppercase leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Für {mitgliedsbeitrag} € im Jahr stehst du hinter jedem Kind auf unserem Platz.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sva-gray-300 sm:text-xl">
              Der Förderverein finanziert die kleinen Dinge, für die sich in der Jugend kein Sponsor findet:
              Material, Zuschüsse, gemeinsame Fahrten. Werde Mitglied und mach den SVA stärker.
            </p>
            <div className="mt-10">
              <MitgliedButton />
              <p className="mt-4 text-sm text-sva-gray-300">
                {mitgliedsbeitrag} € im Jahr · in 2 Minuten online · ohne Papierkram
              </p>
            </div>
          </div>
          <Zaehler stand={stand} />
        </div>
      </section>

      {/* 2. Problem */}
      <Abschnitt eyebrow="Das Problem" titel="Ehrenamt zahlt keine Rechnungen" className="bg-sva-charcoal">
        <p>
          Trainer stehen bei jedem Wetter am Platz. Eltern fahren zu Auswärtsspielen. Helfer mähen, kreiden, grillen.
          Ohne dieses Ehrenamt gäbe es keinen SVA.
        </p>
        <p>
          Aber Ehrenamt kauft keine Bälle. Es bezahlt keine Trainingsanzüge und keinen Bus zum Ausflug. Bei den
          Senioren helfen größere Sponsoren. <strong className="text-white">In der Jugend sind es oft kleine Beträge, für die sich niemand findet.</strong>
        </p>
      </Abschnitt>

      {/* 3. Lösung */}
      <Abschnitt eyebrow="Die Lösung" titel="Dafür gibt es den Förderverein" className="bg-sva-charcoal-dark">
        <p>
          Der {verein.name} ist ein eigenständiger, eingetragener und gemeinnütziger Verein mit genau einer Aufgabe:
          den SV Amendingen zu unterstützen. Vor allem dort, wo sonst kein Geld herkommt.
        </p>
        <p>
          Wir sammeln Mitgliedsbeiträge und Spenden und geben sie dort aus, wo der SVA sie braucht.{" "}
          <strong className="text-white">Jeder Euro bleibt in Amendingen.</strong>
        </p>
      </Abschnitt>

      {/* 4. Mittelverwendung */}
      <section className="bg-sva-charcoal py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sva-gold">Wofür dein Beitrag verwendet wird</p>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">Kleine Beiträge, die man sieht</h2>
          <div className="mt-3 h-1 w-16 bg-sva-gold" />
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-sva-gray-200">
            Keine großen Schlagzeilen, sondern Unterstützung im Hintergrund. Das haben wir zuletzt möglich gemacht:
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {projekte.map((p) => (
              <div key={p.titel} className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
                <h3 className="text-lg font-bold uppercase text-white">{p.titel}</h3>
                <p className="mt-2 leading-relaxed text-sva-gray-300">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Hebel */}
      <Abschnitt eyebrow="Warum 20 € viel bewirken" titel="Niemand muss viel geben, wenn viele mitmachen" className="bg-sva-green-dark">
        <p>
          {mitgliedsbeitrag} € im Jahr sind {proMonat} € im Monat. Allein ist das wenig. Genau darum geht es: Der Hebel
          ist nicht die Höhe des Beitrags, sondern die Zahl der Mitglieder.
        </p>
        <ul className="space-y-3 pt-2">
          {hebel.map((h) => (
            <li key={h.mitglieder} className="flex flex-wrap items-baseline gap-x-3 rounded-lg bg-black/20 px-5 py-4">
              <span className="font-black tabular-nums text-sva-gold">
                {h.mitglieder} {h.mitglieder === 1 ? "Mitglied" : "Mitglieder"} = {(h.mitglieder * mitgliedsbeitrag).toLocaleString("de-DE")} €
              </span>
              <span className="text-white">{h.text}</span>
            </li>
          ))}
        </ul>
        <div className="pt-4">
          <MitgliedButton />
        </div>
      </Abschnitt>

      {/* 6. Beweis */}
      <Abschnitt eyebrow="Darum lohnt es sich" titel="Ein Verein, auf den Amendingen stolz sein kann" className="bg-sva-charcoal-dark">
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { zahl: "1946", text: "Fußballtradition seit über 75 Jahren" },
            { zahl: stand.gesamt.toString(), text: "Mitglieder im Förderverein" },
            { zahl: "FC Bayern", text: "Einziger Kooperationsverein der Region" },
          ].map((f) => (
            <li key={f.text} className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-5 text-center">
              <p className="text-2xl font-black text-sva-gold">{f.zahl}</p>
              <p className="mt-1 text-sm text-sva-gray-300">{f.text}</p>
            </li>
          ))}
        </ul>
        <p>
          Mit zahlreichen Jugend- und Erwachsenenmannschaften ist der SV Amendingen fester Bestandteil des Lebens im
          Ort. Als erster und einziger Verein der Region hat der SVA eine Kooperation mit dem FC Bayern München.
        </p>
      </Abschnitt>

      {/* 7. Was du bekommst */}
      <Abschnitt eyebrow="Mitglied sein" titel="Mehr als eine Spende" className="bg-sva-charcoal">
        <ul className="space-y-4">
          {[
            { titel: "Du gehörst dazu.", text: "Du bist Teil der Gemeinschaft, die den SVA im Hintergrund trägt." },
            { titel: "Du redest mit.", text: "Bei der Mitgliederversammlung entscheidest du mit, wofür das Geld ausgegeben wird." },
            { titel: "Du weißt, wo dein Geld ankommt.", text: "Bei den Kindern und Jugendlichen auf unserem Platz. Nirgendwo sonst." },
          ].map((v) => (
            <li key={v.titel} className="flex gap-4">
              <svg className="mt-1 h-6 w-6 shrink-0 text-sva-gold" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <p>
                <strong className="text-white">{v.titel}</strong> {v.text}
              </p>
            </li>
          ))}
        </ul>
      </Abschnitt>

      {/* 8. So geht's */}
      <section className="bg-sva-charcoal-dark py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sva-gold">So einfach geht&apos;s</p>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">In drei Schritten dabei</h2>
          <div className="mt-3 h-1 w-16 bg-sva-gold" />
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {schritte.map((s, i) => (
              <li key={s.titel} className="rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sva-green text-lg font-black text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold uppercase text-white">{s.titel}</h3>
                <p className="mt-2 leading-relaxed text-sva-gray-300">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <MitgliedButton />
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <Abschnitt eyebrow="Fragen" titel="Häufige Fragen" className="bg-sva-charcoal">
        <div className="space-y-3">
          {fragen.map((f) => (
            <details key={f.frage} className="group rounded-lg border border-sva-gray-700 bg-sva-charcoal-light px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                {f.frage}
                <span className="text-sva-gold transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-base text-sva-gray-300">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Abschnitt>

      {/* 10. Abschluss */}
      <section className="bg-sva-green py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
            Der SVA lebt von Menschen, die mehr tun als zuschauen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xl text-green-100">Werde einer davon.</p>
          <div className="mt-10">
            <MitgliedButton>Jetzt Mitglied werden · {mitgliedsbeitrag} € im Jahr</MitgliedButton>
          </div>
        </div>
      </section>

      {/* 11. P.S. + Nebenausgang */}
      <section className="bg-sva-charcoal-dark py-14">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-sva-gray-300 sm:px-6 lg:px-8">
          <p>
            <strong className="text-white">P.S.</strong> Jedes neue Mitglied zählt. Kennst du jemanden, dem der SVA am
            Herzen liegt? Schick ihr oder ihm diese Seite.
          </p>
          <div className="flex flex-col items-start gap-4 rounded-lg border border-sva-gray-700 bg-sva-charcoal-light p-6 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="block text-lg text-white">Lieber kein Mitglied werden?</strong>
              Du kannst den SVA auch mit einer einmaligen Spende unterstützen.
            </p>
            <Link
              href="/spenden"
              className="shrink-0 rounded-md border-2 border-sva-gold px-8 py-4 text-center text-sm font-black uppercase tracking-wide text-sva-gold transition-colors hover:bg-sva-gold hover:text-sva-charcoal-dark"
            >
              Einmalig spenden
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
