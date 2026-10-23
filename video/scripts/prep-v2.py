"""Schneidet die 14 Storyboard-Panels aus den Seiten-PNGs, entfernt eingebrannten
Text und skaliert für 1080p hoch.

Aufruf (Pillow + numpy nötig):
  python scripts/prep-v2.py assets-source/storyboard public/v2/scenes
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
UPSCALE = 3
INSET = 3  # abgerundete Ecken und Seitenrand abschneiden

# Seite, x, y, Breite, Höhe (Pixel in seite-0N.png)
PANELS = {
    "s01": (1, 20, 13, 803, 384),
    "s02": (1, 849, 13, 803, 384),
    "s03": (1, 20, 467, 803, 404),
    "s04": (1, 849, 467, 803, 404),
    "s05": (2, 22, 15, 800, 403),
    "s06": (2, 851, 15, 800, 403),
    "s07": (2, 22, 474, 800, 403),
    "s08": (2, 851, 474, 800, 403),
    "s09": (3, 19, 12, 809, 425),
    "s10": (3, 844, 12, 809, 425),
    "s11": (3, 19, 491, 809, 391),
    "s12": (3, 844, 491, 809, 391),
    "s14": (4, 868, 503, 787, 389),  # nur Bildteil rechts, Schrift links bleibt draußen
}


def harmonic_fill(a: np.ndarray, mask: np.ndarray, iters: int = 1500) -> np.ndarray:
    """Füllt maskierte Pixel glatt aus der Umgebung (Diffusion)."""
    a = a.astype(np.float32).copy()
    m = mask[..., None]
    for _ in range(iters):
        p = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode="edge")
        avg = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
        a = np.where(m, avg, a)
    return a


def dilate(mask: np.ndarray, r: int) -> np.ndarray:
    img = Image.fromarray((mask * 255).astype(np.uint8))
    return np.array(img.filter(ImageFilter.MaxFilter(2 * r + 1))) > 127


def clean_s03(a):
    # Grüne Fläche oben rechts bleibt (dort erscheint der Betrag), Text und gelbe Striche raus
    h, w, _ = a.shape
    reg = np.zeros((h, w), bool)
    reg[0:140, 455:w] = True
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    bright = (r + g + b) > 330
    yellow = (r > 150) & (g > 120) & (b < 120)
    mask = dilate(reg & (bright | yellow), 3) & reg
    return harmonic_fill(a, mask)


def clean_s10(a):
    # Rechte Karte durch Himmel ersetzen, angrenzende Baumkronen bleiben stehen.
    # Die linke Karte bleibt, Remotion legt die 20-€-Karte deckend darüber.
    h, w, _ = a.shape
    out = a.astype(np.float32).copy()
    r, g, b = (a[..., i].astype(int) for i in range(3))
    sky_px = (b > 200) & (b > r + 15)
    x0, y0, x1, y1 = 454, 20, 762, 170
    rows = np.arange(h)[:, None]
    tree = (g > r + 40) & (g > b + 20) & (rows >= 150)
    tree[:, :745] &= rows[:, 0:1] >= 158  # Text „500 €“ ist auch grün, aber höher
    card = np.zeros((h, w), bool)
    card[y0:y1, x0:x1] = True
    card &= ~tree
    color = None
    for y in range(y0, y1):
        ref = a[y, 412:452][sky_px[y, 412:452]]
        if len(ref) >= 30:  # sonst ragen im Spalt schon Bäume hinein, Zeile darüber nehmen
            color = np.median(ref, axis=0)
        out[y][card[y]] = color
    # Gelbe Striche rechts neben der Karte weich aus der Umgebung füllen
    reg = np.zeros((h, w), bool)
    reg[60:150, 755:w] = True
    yellow = (r > 150) & (g > 120) & (b < 110)
    return harmonic_fill(out, dilate(reg & yellow, 3) & reg, iters=300)


CLEAN = {"s03": clean_s03, "s10": clean_s10}

pages = {n: Image.open(SRC / f"seite-0{n}.png").convert("RGB") for n in range(1, 5)}
for name, (page, x, y, w, h) in PANELS.items():
    im = pages[page].crop((x + INSET, y + INSET, x + w - INSET, y + h - INSET))
    a = np.array(im)
    if name in CLEAN:
        a = CLEAN[name](a)
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    big = im.resize((im.width * UPSCALE, im.height * UPSCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    big.save(OUT / f"{name}.webp", quality=94, method=6)
    print(name, im.size, "->", big.size)
