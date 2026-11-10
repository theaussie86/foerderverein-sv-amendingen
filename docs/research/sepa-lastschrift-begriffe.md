# Research: SEPA-Lastschrift-Begriffe

Issue: #30 (Teil von #28 „Domänenmodell und Glossar“). Stand: 10.11.2026.

Frage: Welche Fachbegriffe verwendet das SEPA-Basislastschriftverfahren, und wie sind sie definiert? Ergebnis ist eine Begriffsliste mit Definition und Fundstelle, dazu ein Abgleich mit `src/lib/verein.ts`, dem übrigen Code und `GLOSSARY.md`.

## Quellen

| Kürzel | Quelle | Rolle |
|---|---|---|
| **EPC-RB** | [EPC016-06 SEPA Direct Debit Core Scheme Rulebook 2025 Version 1.1](https://www.europeanpaymentscouncil.eu/sites/default/files/kb/file/2025-10/EPC016-06%202025%20SDD%20Core%20Rulebook%20version%201.1.pdf), gültig ab 05.10.2025 | Regelwerk des Verfahrens (englisch) |
| **BGB** | [§ 675x](https://www.gesetze-im-internet.de/bgb/__675x.html), [§ 675u](https://www.gesetze-im-internet.de/bgb/__675u.html), [§ 676b](https://www.gesetze-im-internet.de/bgb/__676b.html) BGB | Gesetzliche Erstattungsansprüche |
| **BBk-GID** | Bundesbank: [Gläubiger-ID, Allgemeine Hinweise](https://www.bundesbank.de/de/aufgaben/unbarer-zahlungsverkehr/serviceangebot/sepa/glaeubiger-identifikationsnummer/allgemeine-hinweise-602858) und [FAQ zur Gläubiger-ID](https://www.bundesbank.de/dynamic/action/de/aufgaben/unbarer-zahlungsverkehr/serviceangebot/sepa/glaeubiger-identifikationsnummer/642684/haeufig-gestellte-fragen-zu-der-glaeubiger-identifikationsnummer) | Vergabe und Aufbau der Gläubiger-ID |
| **BBk-SEPA** | Bundesbank: [SEPA-Dossier „Inhalte“, Abschnitt SEPA-Lastschrift](https://www.bundesbank.de/de/aufgaben/unbarer-zahlungsverkehr/serviceangebot/sepa/inhalte/inhalte-642840?index=3) | Deutsche Begriffe, Fristen |
| **Bed-Einzug** | [Bedingungen für den Lastschrifteinzug (LBBW, Fassung ab 01.01.2021)](https://www.lbbw.de/rechts-und-kundeninformationen/uk-rechtliches/bedingungen-fuer-den-lastschrifteinzug_7vvre4sdd_m.pdf) | Muster der Inkassovereinbarung zwischen Bank und Zahlungsempfänger (Sparkassen-Finanzgruppe). Deutsche Fachbegriffe. |
| **Bed-Zahler** | [Bedingungen für Zahlungen mittels Lastschrift im SEPA-Basis-Lastschriftverfahren (Sparkasse Ingolstadt Eichstätt, Fassung Mai 2026)](https://www.spk-in-ei.de/content/dam/myif/sk-ingolstadt/work/dokumente/pdf/vertragsbedingungen/bedingungen-fuer-zahlungen-mittels-lastschrift-im-SEPA-basis-lastschriftverfahren.pdf) | Sparkassen-Bedingungen auf Seite des Zahlers |

Hinweise zu den Quellen:

- Das EPC hat laut Dokumentbibliothek eine Version 1.2 des 2025er Rulebooks veröffentlicht (gültig ab 30.09.2026), die laut Beschreibung nur die Frist für das unstrukturierte Adressformat verschiebt. Die Seite war für automatisierte Abrufe gesperrt (HTTP 403), geprüft wurde deshalb Version 1.1. Für die Begriffe unten ist keine Änderung zu erwarten, bitte bei Bedarf gegenprüfen.
- Bed-Einzug und Bed-Zahler sind Muster anderer Institute der Sparkassen-Finanzgruppe. Maßgeblich für den Verein ist die Inkassovereinbarung mit der **Sparkasse Memmingen-Lindau-Mindelheim**. Die liegt nicht vor, die Muster sind aber bundesweit fast wortgleich (Vorlage der Deutschen Kreditwirtschaft).
- Die SEPA-Seite der Deutschen Kreditwirtschaft (die-dk.de) nennt noch die Vorlagefristen D-5/D-2 aus der Zeit vor November 2016 und ist damit veraltet. Sie wurde nicht als Fundstelle verwendet.

## Begriffsliste

### Beteiligte

**Zahlungsempfänger** (EPC: *Creditor*, auch Lastschrifteinreicher, Gläubiger)
Natürliche oder juristische Person, die das Mandat vom Zahlungspflichtigen erhält, aufbewahrt und auf dieser Grundlage Lastschriften einzieht. Hier: der Förderverein.
Fundstelle: EPC-RB Kap. 7 „Definitions“, *Creditor*; Bed-Einzug Nr. 1.1.

**Zahlungspflichtiger** (EPC: *Debtor*, BGB: *Zahler*, Bed-Zahler: *Kunde*)
Person, die dem Zahlungsempfänger das Mandat erteilt und deren Konto belastet wird. Laut EPC ist der Zahlungspflichtige „by definition“ immer der Inhaber des belasteten Kontos.
Fundstelle: EPC-RB Kap. 7 „Definitions“, *Debtor*; Bed-Einzug Nr. 1.1 („nachfolgend ‚Zahlungspflichtiger‘ genannt“); BGB §§ 675x, 675u („Zahler“).

**Kontoinhaber**
Inhaber des Kontos, das belastet wird. Im SEPA-Verfahren identisch mit dem Zahlungspflichtigen. Das Mandat muss vom Kontoinhaber selbst oder von einer Person mit Vollmacht des Kontoinhabers unterschrieben sein.
Fundstelle: EPC-RB Abschnitt 4.1 „The Mandate must always be signed by the Debtor as account holder or by a person in possession of a form of authorisation (such as a power of attorney)“.

**Kontoinhaber vs. Mitglied**
Das SEPA-Verfahren kennt kein Mitglied. Schuldner des Beitrags (Mitglied, laut Satzung) und Zahlungspflichtiger (Kontoinhaber) können verschiedene Personen sein, etwa Eltern, die für ein minderjähriges Mitglied zahlen, oder Ehepartner mit getrennten Konten. Das Mandat bindet nur den Kontoinhaber.
Fundstelle: Ableitung aus EPC-RB Kap. 7 *Debtor* und Abschnitt 4.1.

**Zahlungsdienstleister des Zahlungsempfängers / des Zahlungspflichtigen** (EPC: *Creditor PSP* / *Debtor PSP*, Bed-Zahler: *Zahlstelle*)
Bank des Vereins (erste Inkassostelle) bzw. Bank des Zahlungspflichtigen.
Fundstelle: EPC-RB Abschnitt 3.1; Bed-Zahler Nr. 2.3 Abs. 2.

### Mandat und Kennungen

**SEPA-Lastschriftmandat** (EPC: *Mandate*)
Zustimmung und Autorisierung des Zahlungspflichtigen, die zwei Erklärungen enthält: die Ermächtigung des Zahlungsempfängers, Zahlungen per SEPA-Basislastschrift einzuziehen, und die Weisung an die eigene Bank, diese Lastschriften einzulösen. Pflichtangaben (Autorisierungsdaten): Bezeichnung des Zahlungsempfängers, Gläubiger-ID, Kennzeichnung als einmalige oder wiederkehrende Zahlung, Name des Zahlungspflichtigen, IBAN, Datum und Unterschrift. Das Mandat bleibt beim Zahlungsempfänger, der es aufbewahren muss, solange es besteht, und nach Erlöschen noch mindestens 14 Monate ab Fälligkeit der letzten Lastschrift. Ein Mandat ist unbefristet gültig, bis es widerrufen wird oder verfällt.
Das Mandat kann auf Papier oder elektronisch erteilt werden, elektronisch nur mit einer „legally binding method of signature“. In Deutschland verlangt Bed-Zahler „schriftlich oder in der mit seiner Sparkasse vereinbarten Art und Weise“.
Fundstelle: EPC-RB Abschnitt 4.1 und Dataset DS-01 (S. 65-67); Bed-Zahler Nr. 2.2.1; Bed-Einzug Nr. 5.4.

**Mandatstext** (Pflichttext im Mandat)
Pflichtwortlaut mit Ermächtigung, Weisung und Hinweis auf das Erstattungsrecht innerhalb von 8 Wochen ab Belastung. Das EPC gibt den Text auf Englisch vor und verweist auf Übersetzungen. Das Mandat muss als „SEPA-Lastschriftmandat“ (*SEPA Direct Debit Mandate*) überschrieben und von anderem Text klar getrennt sein.
Fundstelle: EPC-RB DS-01, „Guidelines for the design of the SEPA Direct Debit Mandate“.

**Mandatsreferenz** (EPC: *Unique Mandate Reference*, AT-M001)
Vom Zahlungsempfänger vergebene Kennung, die zusammen mit der Gläubiger-ID jedes Mandat eindeutig identifiziert. Muss dem Zahlungspflichtigen spätestens vor dem ersten Einzug mitgeteilt werden. Das Rulebook begrenzt die Länge nicht und empfiehlt eine kurze Referenz. Die technische Obergrenze im Datensatz liegt bei 35 Zeichen.
Fundstelle: EPC-RB Abschnitt 4.8.2 (AT-M001) und PT-01.01; BBk-GID FAQ; Bed-Einzug Nr. 5.1 („Die vom Zahlungsempfänger individuell vergebene Mandatsreferenz bezeichnet in Verbindung mit der Gläubiger-Identifikationsnummer das jeweilige Mandat eindeutig“ und „ist bis zu 35 alphanumerische Stellen lang“).

**Gläubiger-Identifikationsnummer** (Gläubiger-ID, EPC: *Creditor Identifier*, AT-E005)
Kennung, mit der der Zahlungsempfänger im SEPA-Raum eindeutig identifiziert wird. Sie identifiziert auch einen nicht rechtsfähigen Verein. In Deutschland vergibt sie die Bundesbank online, kostenfrei, je Antragsteller nur eine. Aufbau (18 Stellen): `DE` + 2 Prüfziffern (Berechnung wie bei der IBAN) + 3 Stellen Geschäftsbereichskennung (Standard `ZZZ`) + 11 Stellen nationales Merkmal, die 8. Stelle ist immer `0`. Testnummer der Bundesbank: `DE98ZZZ09999999999`. Die Zuteilung allein berechtigt nicht zum Einzug, dazu braucht es eine Inkassovereinbarung mit der eigenen Bank. Bei Namens- oder Adressänderung des Vereins bleibt die Nummer gleich.
Fundstelle: EPC-RB Abschnitt 4.8.15 (AT-E005); BBk-GID Allgemeine Hinweise und FAQ.

**Kennzeichnung einmalig / wiederkehrend** (EPC: *Transaction Type*, AT-M006)
Pflichtangabe im Mandat: Auf dem Mandat sind nur die Werte „einmalige Zahlung“ (*one-off*) und „wiederkehrende Zahlung“ (*recurrent*) erlaubt. Rechtlich unterscheiden sich beide nicht, ein Einmalmandat kann aber nur für genau eine Lastschrift genutzt werden.
Fundstelle: EPC-RB Abschnitt 2.3 und DS-01; Bed-Zahler Nr. 2.2.1.

### Ablauf des Einzugs

**Erstlastschrift, Folgelastschrift, letzte Lastschrift, Einmallastschrift** (Sequenztyp: `FRST`, `RCUR`, `FNAL`, `OOFF`)
Der Sequenztyp im Lastschriftdatensatz unterscheidet die erste (`FRST`), eine folgende (`RCUR`) und die letzte (`FNAL`) Lastschrift eines wiederkehrenden Mandats sowie die einzige Lastschrift eines Einmalmandats (`OOFF`). Seit Rulebook 9.0 (November 2016) ist `FRST` **optional**: Eine Erstlastschrift darf als `RCUR` eingereicht werden und wird ohnehin wie eine Folgelastschrift verarbeitet. Gleichzeitig entfiel die längere Vorlagefrist für Erstlastschriften (vorher D-5 statt D-2), seitdem gilt einheitlich D-1. Praktisch zählt nur noch die Unterscheidung einmalig/wiederkehrend. Einige Bankprogramme verlangen `FRST` weiterhin, das ist zulässig, aber nicht mehr nötig.
Fundstelle: EPC-RB Abschnitt 4.8.7 (AT-M006: „A Collection with the optional transaction type ‘first’ is processed as a recurrent Collection“) und Änderungshistorie V9.0; BBk-SEPA (Vorlagefrist seit November 2016 ein Geschäftstag für alle Sequenztypen).

**Fälligkeitsdatum** (Fälligkeitstag, EPC: *Due Date*, Tag „D“)
Tag, an dem die Zahlung des Zahlungspflichtigen an den Zahlungsempfänger fällig ist. Er muss im zugrunde liegenden Vertrag oder den Bedingungen zwischen beiden vereinbart sein (hier Beitragsordnung oder Satzung). Im Regelfall sind Fälligkeitsdatum, Verrechnungstag und Belastungstag derselbe Tag. Der Fälligkeitstag muss ein Geschäftstag sein, sonst gilt der nächste Geschäftstag.
Fundstelle: EPC-RB Abschnitt 4.3.1; Bed-Einzug Nr. 7.4; Bed-Zahler Nr. 2.4.1.

**Vorlagefrist** (Einreichungsfrist)
Die Bank des Zahlungspflichtigen muss die Lastschrift spätestens einen Geschäftstag vor Fälligkeit (D-1) und frühestens 14 Kalendertage vor Fälligkeit erhalten. Die Frist für die Einreichung durch den Verein bei seiner Bank steht im Preis- und Leistungsverzeichnis der Sparkasse.
Fundstelle: EPC-RB Abschnitt 4.3; Bed-Einzug Nr. 8.

**Vorabankündigung** (Pre-Notification, Vorabinformation, Bed-Einzug: „Ankündigung des Lastschrifteinzugs“)
Mitteilung des Zahlungsempfängers an den Zahlungspflichtigen über Betrag und Termin der Lastschrift vor dem Einzug. Sie kann gesondert oder als Teil einer Rechnung oder eines Vertrags erfolgen.
- **Regelfrist:** spätestens **14 Kalendertage vor Fälligkeit**.
- **Kürzere Frist:** Zahlungsempfänger und Zahlungspflichtiger können eine andere Frist vereinbaren. Das Rulebook nennt keine Untergrenze. Die Vereinbarung gehört in die Vertragsbedingungen, etwa in den Mitgliedsantrag.
- **Wiederkehrende gleiche Beträge:** Bei festen Beträgen genügt eine einmalige Ankündigung vor dem ersten Einzug mit Angabe der Fälligkeitstermine.
- Die Vorabankündigung ist eine Pflicht des Zahlungsempfängers aus dem Rulebook und der Inkassovereinbarung, keine Wirksamkeitsvoraussetzung der Lastschrift.
Fundstelle: EPC-RB Kap. 7 *Pre-notification*, Abschnitt 4.3 („at the latest 14 Calendar Days before the Due Date unless another time-line is agreed between the Debtor and the Creditor“) und PT-04.02; Bed-Einzug Nr. 6.

### Rücklastschriften und Erstattung

**R-Transaktion** (EPC: *R-transaction*), umgangssprachlich **Rücklastschrift**
Oberbegriff für jede Lastschrift, die nicht normal ausgeführt wird. Das EPC unterscheidet:

| EPC-Begriff | Deutsch | Wer, wann |
|---|---|---|
| *Reject* | Zurückweisung | Vor der Verrechnung, aus technischen Gründen oder durch die Bank des Zahlungspflichtigen (z. B. Konto erloschen, Lastschriftsperre) |
| *Refusal* | Widerspruch vor Belastung | Zahlungspflichtiger weist seine Bank vor Fälligkeit an, nicht zu zahlen |
| *Return* | Rückgabe | Bank des Zahlungspflichtigen nach der Verrechnung, bis 5 Geschäftstage danach (z. B. mangelnde Deckung, Konto aufgelöst) |
| *Refund* | Erstattung | Auf Verlangen des Zahlungspflichtigen, siehe unten |
| *Reversal* | Rückbuchung durch den Zahlungsempfänger | Verein stellt fest, dass er nicht hätte einziehen dürfen, und erstattet den vollen Betrag |
| *Revocation*, *Request for Cancellation* | Rückruf | Verein bzw. seine Bank ziehen den Auftrag vor der Verrechnung zurück |

Eine Rücklastschrift macht die Gutschrift beim Verein rückgängig. Nach Bed-Einzug dürfen zurückbelastete Lastschriften nicht erneut eingereicht werden, der Verein muss den Beitrag anders einfordern.
Fundstelle: EPC-RB Abschnitt 4.4 und 4.2; Bed-Einzug Nr. 10.

**Erstattung autorisierter Lastschriften (8 Wochen)**
Der Zahlungspflichtige kann ohne Angabe von Gründen innerhalb von acht Wochen ab Belastung von seiner Bank die Erstattung verlangen. Der Anspruch richtet sich gegen die eigene Bank, nicht gegen den Verein, und erlischt nach Ablauf der Frist. Die Erstattung ändert nichts an der Beitragsschuld.
Fundstelle: BGB § 675x Abs. 2 und 4; EPC-RB Abschnitt 4.3 und 4.2 („This Refund does not relieve the Debtor of its responsibility to resolve any issues … with the Creditor“); Bed-Zahler Nr. 2.5.

**Erstattung nicht autorisierter Lastschriften (13 Monate)**
Fehlt ein gültiges Mandat (nie erteilt, widerrufen, verfallen, falscher Unterzeichner), ist die Lastschrift nicht autorisiert. Der Zahlungspflichtige kann bis 13 Monate nach Belastung Erstattung verlangen. Nach Ablauf der 8 Wochen fordert die Bank dafür eine Kopie des Mandats beim Verein an.
Fundstelle: BGB § 675u und § 676b Abs. 2; EPC-RB Abschnitt 4.3, PT-04.20 und PT-04.21; BBk-SEPA („innerhalb von 13 Monaten nach Belastung“).

**Widerruf des Mandats**
Der Zahlungspflichtige kann das Mandat gegenüber dem Verein oder seiner Bank widerrufen, danach sind weitere Lastschriften nicht autorisiert. Eine Rückgabe mit Grund „no valid mandate“ gilt als Widerruf.
Fundstelle: Bed-Zahler Nr. 2.2.3; Bed-Einzug Nr. 5.5, 5.6.

**Verfall des Mandats (36 Monate)**
Reicht der Zahlungsempfänger 36 Monate lang keine Lastschrift auf ein Mandat ein, muss er es als erloschen behandeln und für weitere Einzüge ein neues Mandat einholen. Die Frist beginnt mit dem Datum der zuletzt eingereichten Lastschrift, auch wenn diese zurückgewiesen, zurückgegeben oder erstattet wurde. Die Banken prüfen das nicht, die Pflicht liegt allein beim Verein. Lastschriften auf ein verfallenes Mandat gelten als nicht autorisiert.
Fundstelle: EPC-RB Abschnitt 4.2 und PT-04.21; Bed-Einzug Nr. 5.4 und 7.5.

## Abgleich mit Code und Glossar

### `src/lib/verein.ts`

1. **`glaeubigerId: "DE00ZZZ00000000000"`** ist ein Platzhalter mit ungültiger Prüfziffer. Für Tests eignet sich die Bundesbank-Testnummer `DE98ZZZ09999999999`. Vor dem ersten echten Mandat muss die echte Gläubiger-ID drinstehen. Mandate, die mit dem Platzhalter unterschrieben wurden, nennen eine falsche Gläubiger-ID (Pflichtangabe), hier sollte der Vorstand bei der Bank klären, ob sie neu eingeholt werden müssen.
2. **`einzugstermin: "15. März"` mit Kommentar „dient zugleich als Vorabankündigung“**: Die Fachsprache trennt Fälligkeitsdatum (der Termin) und Vorabankündigung (die Mitteilung von Betrag und Termin). Inhaltlich trägt das Konzept: Bei festen wiederkehrenden Beträgen genügt eine einmalige Ankündigung mit den Fälligkeitsterminen (Bed-Einzug Nr. 6), und die Bestätigungsmail in `src/app/unterschreiben/[token]/actions.ts` nennt Betrag, Termin, Gläubiger-ID und Mandatsreferenz. Zwei Lücken:
   - Der 15. März fällt manchmal auf ein Wochenende (2026 Sonntag, 2031 Samstag). Dann wird am nächsten Geschäftstag belastet. Die Ankündigung sollte das sagen, sonst stimmt das angekündigte Datum nicht.
   - Wer weniger als 14 Tage vor dem 15. März unterschreibt, bekommt die Ankündigung zu spät, es sei denn, eine kürzere Frist ist vereinbart. Lösung: kürzere Frist in den Mitgliedsantrag aufnehmen oder den Erstbeitrag erst im Folgejahr einziehen. Das ist eine Frage an den Vorstand.
3. **`mandatstext()`** entspricht dem deutschen Standardtext (Ermächtigung, Weisung, 8-Wochen-Hinweis). Die Kennzeichnung „wiederkehrende Zahlung“ steht im PDF (`src/lib/pdf.ts`, Feld „Zahlungsart“), aber nicht im Formular auf `/mitglied-werden` und `/unterschreiben`. Für die Autorisierung zählt das unterschriebene Dokument. Wenn die Unterschrift auf der Webseite geleistet wird, sollte auch dort „wiederkehrende Zahlung“ stehen.
4. **`bank.kontoinhaber`** ist das Konto des Vereins (Zahlungsempfänger), nicht der Kontoinhaber im SEPA-Sinn. Im Code heißt das Feld des Mitglieds ebenfalls `kontoinhaber`. Für das Glossar braucht es eine klare Trennung, etwa „Vereinskonto“ gegenüber „Kontoinhaber (Zahlungspflichtiger)“.

### Übriger Code

5. **Mandatsreferenz `FV-` + 8 Zeichen** (`src/app/mitglied-werden/actions.ts`): 11 Zeichen, nur erlaubte Zeichen, eindeutig per Unique-Index in PocketBase. Passt zum Rulebook. Sie entsteht schon beim Absenden und wird vor dem ersten Einzug mitgeteilt, auch das ist zulässig.
6. **Ein Unterschriftsvorgang für Beitritt und Mandat** (`src/app/unterschreiben/[token]/unterschrift-formular.tsx`: „als Mitglied bzw. erziehungsberechtigt … als Kontoinhaber/in {kontoinhaber}“). Wenn Mitglied und Kontoinhaber verschiedene Personen sind und das Mitglied unterschreibt, fehlt eine Unterschrift des Kontoinhabers oder seines Bevollmächtigten. Dann ist das Mandat nicht autorisiert und 13 Monate lang erstattungsfähig. Das Formular füllt `kontoinhaber` mit dem Namen des Mitglieds vor, prüft aber nicht, wer unterschreibt.
7. **Elektronisches Mandat**: Das Rulebook lässt elektronische Mandate mit „legally binding method of signature“ zu. Bed-Zahler verlangt „schriftlich oder in der mit seiner Sparkasse vereinbarten Art“, das ist aber die Bank des Zahlers. Ob die Sparkasse des Vereins per Webseite unterschriebene Mandate akzeptiert, regelt die Inkassovereinbarung. Frage an den Vorstand bzw. die Sparkasse.
8. **Aufbewahrung „mindestens 14 Monate nach der letzten Lastschrift“** (Mail an den Vorstand, Datenschutzerklärung) deckt sich mit Bed-Einzug Nr. 5.4: Aufbewahrung, solange das Mandat besteht, danach 14 Monate ab Fälligkeit der letzten Lastschrift.
9. **Begriff „Vorabinformation“** in der Bestätigungsmail. Gängig sind Vorabankündigung, Vorabinformation und Pre-Notification, die Bank sagt „Ankündigung des Lastschrifteinzugs“. Fürs Glossar einen Begriff festlegen und die anderen als *Vermeiden* führen.
10. **FAQ auf der Startseite** („Du kannst jede Abbuchung innerhalb von acht Wochen bei deiner Bank zurückbuchen lassen“) ist inhaltlich richtig (§ 675x BGB). Fachlich heißt es „Erstattung verlangen“.

### `GLOSSARY.md`

11. **„Mitgliedsantrag … samt SEPA-Lastschriftmandat“**: Das Mandat ist eine eigene Erklärung des Kontoinhabers und hat einen eigenen Lebenszyklus (Widerruf, Verfall nach 36 Monaten, Ersatz bei Kontowechsel). Es sollte ein eigener Begriff sein, ebenso Zahlungspflichtiger/Kontoinhaber getrennt vom Mitglied.
12. Das Glossar nennt „Beitrittserklärung“ unter *Vermeiden*, der Code verwendet das Wort aber durchgehend (Formular, PDF, Mails). Das gehört nicht zu SEPA, aber auf die Abweichungsliste aus #28.
13. Im Glossar fehlen bisher alle SEPA-Begriffe. Kandidaten: SEPA-Lastschriftmandat, Mandatsreferenz, Gläubiger-ID, Zahlungspflichtiger (Kontoinhaber), Einzugstermin (Fälligkeitsdatum), Vorabankündigung, Rücklastschrift, Erstattung, Widerruf, Verfall.

## Offene Punkte für den Vorstand

- Echte Gläubiger-ID und Inkassovereinbarung mit der Sparkasse vorhanden? Zulässige Mandatsform (online unterschrieben)?
- Kürzere Frist für die Vorabankündigung vereinbaren oder Erstbeitrag bei Beitritt kurz vor dem 15. März ins Folgejahr schieben?
- Umgang mit Rücklastschriften (Gebühren, Mahnung, erneuter Einzug ist laut Bankbedingungen nicht erlaubt).
- Mitglieder, deren Beitrag drei Jahre lang nicht eingezogen wird (Beitragsfreiheit, Barzahlung): Mandat verfällt, neues Mandat nötig.
