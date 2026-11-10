"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kontaktSchema, type KontaktFormData } from "@/lib/schemas";
import { verein } from "@/lib/verein";
import { nachrichtSenden } from "./actions";

const inputCls = "mt-1 w-full rounded-md border border-sva-gray-600 bg-sva-charcoal px-4 py-2.5 text-white focus:border-sva-gold focus:outline-none focus:ring-1 focus:ring-sva-gold";

export default function KontaktPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<KontaktFormData>({
    resolver: zodResolver(kontaktSchema),
    defaultValues: { name: "", email: "", betreff: "", nachricht: "", website: "" },
  });
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function onSubmit(data: KontaktFormData) {
    setFehler(null);
    const ergebnis = await nachrichtSenden(data);
    if (ergebnis.ok) {
      setGesendet(true);
      reset();
    } else setFehler(ergebnis.fehler);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">Kontakt</h1>
      <div className="mt-2 h-1 w-16 bg-sva-gold" />
      <p className="mt-4 max-w-2xl text-lg text-sva-gray-300">Haben Sie Fragen oder Anregungen? Wir freuen uns über Ihre Nachricht.</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-white">Schreiben Sie uns</h2>
          {gesendet ? (
            <div className="mt-6 rounded-lg border border-sva-green bg-sva-charcoal p-6" role="status">
              <p className="font-semibold text-white">Vielen Dank für Ihre Nachricht!</p>
              <p className="mt-2 text-sm text-sva-gray-300">Wir melden uns so bald wie möglich bei Ihnen.</p>
              <button type="button" onClick={() => setGesendet(false)} className="mt-4 text-sm text-sva-gold hover:text-sva-gold-light">Weitere Nachricht schreiben</button>
            </div>
          ) : (
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-sva-gray-300">Name *</label>
                <input id="contact-name" type="text" {...register("name")} className={inputCls} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-sva-gray-300">E-Mail *</label>
                <input id="contact-email" type="email" {...register("email")} className={inputCls} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="contact-betreff" className="block text-sm font-medium text-sva-gray-300">Betreff</label>
              <input id="contact-betreff" type="text" {...register("betreff")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="contact-nachricht" className="block text-sm font-medium text-sva-gray-300">Nachricht *</label>
              <textarea id="contact-nachricht" rows={5} {...register("nachricht")} className={inputCls} />
              {errors.nachricht && <p className="mt-1 text-xs text-red-400">{errors.nachricht.message}</p>}
            </div>
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>
            {fehler && <p className="text-sm text-red-400" role="alert">{fehler}</p>}
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-sva-green px-8 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-sva-green-light disabled:opacity-60">{isSubmitting ? "Wird gesendet …" : "Nachricht senden"}</button>
            <p className="text-xs text-sva-gray-400">Hinweise zur Verarbeitung Ihrer Daten finden Sie in der <a href="/datenschutz" className="text-sva-gold hover:text-sva-gold-light">Datenschutzerklärung</a>.</p>
          </form>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Kontaktdaten</h2>
            <dl className="mt-4 space-y-4 text-sm text-sva-gray-200">
              <div>
                <dt className="font-semibold text-white">Adresse</dt>
                <dd className="mt-1">{verein.name}<br />{verein.strasse}<br />{verein.plzOrt}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">E-Mail</dt>
                <dd className="mt-1"><a href={`mailto:${verein.email}`} className="text-sva-gold hover:text-sva-gold-light">{verein.email}</a></dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Anfahrt</h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-lg bg-sva-gray-700 text-sm text-sva-gray-400">Karte wird in Kürze eingebunden</div>
          </div>
        </div>
      </div>
    </div>
  );
}
