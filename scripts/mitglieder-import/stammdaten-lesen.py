# /// script
# requires-python = ">=3.11"
# dependencies = ["openpyxl"]
# ///
"""Liest Manus Stammdaten.xlsx und gibt die Rohzeilen als JSON aus (#49).

Keine Logik außer Zellen in Text verwandeln: Die Auswertung macht auswerten.ts.
Die Excel-Datei und die Ausgabe enthalten IBANs und gehören nicht ins Repo.

    uv run scripts/mitglieder-import/stammdaten-lesen.py Stammdaten.xlsx > /tmp/stammdaten.json
"""

import json
import sys
from datetime import date, datetime
from fractions import Fraction

import openpyxl


def text(zelle):
    v = zelle.value
    if v is None:
        return ""
    if isinstance(v, (datetime, date)):
        return v.strftime("%Y-%m-%d")
    if isinstance(v, float) and not v.is_integer():
        # Hausnummern wie "17 1/2" stehen als Bruch formatiert in der Tabelle.
        if "?/?" in zelle.number_format:
            ganz = int(v)
            rest = Fraction(v - ganz).limit_denominator(9)
            return f"{ganz} {rest}" if ganz else str(rest)
        return str(v)
    if isinstance(v, float):
        return str(int(v))
    return str(v).strip()


def zeilen(blatt, ab=1, bis=None):
    for zeile in list(blatt.iter_rows())[ab:bis]:
        werte = [text(z) for z in zeile]
        if any(werte):
            yield werte


def main(pfad):
    wb = openpyxl.load_workbook(pfad)

    mitglieder = [
        dict(zip(["nr", "mref", "nachname", "vorname", "strasse", "hausnummer", "plz", "ort", "iban", "bic", "bank", "email"], z))
        for z in zeilen(wb["Migliederliste"])
    ]
    emails = [dict(zip(["nr", "nachname", "vorname", "email"], z)) for z in zeilen(wb["E-Mail Adressen"])]

    # Im Blatt "Mandatsreferenznr." steht unter der Referenzliste ein Verlauf mit der Kopfzeile
    # "letzter Eintrag | Name | Mandat | <Art>": Datum, "Nachname, Vorname", Mandatsreferenz, Beitritt/Kündigung/…
    blatt = list(wb["Mandatsreferenznr."].iter_rows())
    start = next(i for i, z in enumerate(blatt) if text(z[0]) == "letzter Eintrag")
    ereignisse = [
        dict(zip(["datum", "name", "mref", "art"], z[:4]))
        for z in ([text(c) for c in zeile] for zeile in blatt[start + 1 :])
        if any(z[:4])
    ]

    json.dump({"mitglieder": mitglieder, "emails": emails, "ereignisse": ereignisse}, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
