import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { At, K, Reveal, Shot, Tag, Wappen, beatFrame, clamp, useAppear } from "./ui";

export type SceneProps = { from: number; dur: number };

// Panelgrößen in Pixeln nach scripts/prep-v2.py (vor dem Hochskalieren)
const P = {
  s01: [797, 378],
  s02: [797, 378],
  s03: [797, 398],
  s04: [797, 398],
  s05: [794, 397],
  s06: [794, 397],
  s07: [794, 397],
  s08: [794, 397],
  s09: [803, 419],
  s10: [803, 419],
  s11: [803, 385],
  s12: [803, 385],
  s14: [781, 383],
} as const;

const panel = (id: keyof typeof P) => ({ src: id, w: P[id][0], h: P[id][1] });

/** Aufzählung: jedes Wort als eigenes Etikett, erscheint beim Sprechen. Mittelpunkte wie im Text. */
const Sequence3: React.FC<{ words: string[]; at: number[]; size: number }> = ({ words, at, size }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      {words.map((w, i) => {
        const o = interpolate(frame, [at[i], at[i] + 7], [0, 1], clamp);
        return (
          <React.Fragment key={w}>
            {i > 0 && (
              <span style={{ opacity: o, color: K.white, fontFamily: FONT, fontWeight: 900, fontSize: size, textShadow: "0 2px 10px rgba(0,0,0,0.45)" }}>·</span>
            )}
            <Tag size={size} style={{ opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
              {w}
            </Tag>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 01 · Manu stellt sich vor
export const S01: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s01")} dur={dur} push={0.03} />
    <Reveal at={beatFrame("manu", from)} style={{ position: "absolute", left: 100, top: 776 }}>
      <Tag tone="green" size={50}>
        <span style={{ color: K.yellow }}>Manu</span>
        <span style={{ opacity: 0.6 }}> · </span>
        <span style={{ fontWeight: 650 }}>Jugendtrainer und Vorsitzender des Fördervereins</span>
      </Tag>
    </Reveal>
  </AbsoluteFill>
);

// 02 · Als Kind auf diesem Platz
export const S02: React.FC<SceneProps> = ({ dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s02")} dur={dur} push={0.02} fx={0.6} />
    <Reveal at={4} style={{ position: "absolute", left: 100, top: 786 }}>
      <Tag tone="yellow" size={68}>
        Als Kind beim SVA
      </Tag>
    </Reveal>
  </AbsoluteFill>
);

// Gelbe Striche um einen Betrag, wie im Storyboard
const Sparks: React.FC<{ p: number; color?: string }> = ({ p, color = K.yellow }) => (
  <svg viewBox="0 0 300 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
    {[
      [18, 34, 40, 46],
      [10, 66, 36, 64],
      [282, 34, 260, 46],
      [290, 66, 264, 64],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={p} />
    ))}
  </svg>
);

// 03 · Damit unsere Kinder gern hier spielen
export const S03: React.FC<SceneProps> = ({ from, dur }) => {
  const at = beatFrame("betrag03", from) - 3;
  const p = useAppear(at);
  return (
    <AbsoluteFill>
      <Shot {...panel("s03")} dur={dur} fx={1}>
        {/* grüne Fläche oben rechts, Panelkoordinaten */}
        <At x={470} y={8} w={310} h={122} style={{ opacity: p, transform: `scale(${0.92 + 0.08 * p})` }}>
          <Sparks p={p} />
          <div style={{ fontFamily: FONT, color: K.white, textAlign: "center", fontWeight: 900, lineHeight: 1 }}>
            <div style={{ fontSize: 58, marginTop: 10, letterSpacing: "-0.02em" }}>20 €</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>im Jahr</div>
          </div>
        </At>
      </Shot>
    </AbsoluteFill>
  );
};

// 04 · Ehrenamt im Verein
export const S04: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s04")} dur={dur} />
    <At x={0} y={790} w={1920} style={{ textAlign: "center" }}>
      <Sequence3
        words={["Trainer", "Eltern", "Helfer"]}
        at={[beatFrame("trainer", from), beatFrame("eltern", from), beatFrame("helfer", from)]}
        size={72}
      />
    </At>
  </AbsoluteFill>
);

// 05 · Ehrenamt kauft keine Bälle
export const S05: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s05")} dur={dur} zoom={1.12} fx={0.55} fy={0.45} />
    <Reveal at={Math.max(4, beatFrame("ehrenamt", from))} style={{ position: "absolute", left: 96, top: 84, width: 620 }}>
      <Tag size={78} style={{ whiteSpace: "normal" }}>
        Ehrenamt kauft keine Bälle.
      </Tag>
    </Reveal>
  </AbsoluteFill>
);

// 06 · Dafür gibt es den Förderverein
export const VereinsCard: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.4,
      background: K.green,
      color: K.white,
      fontFamily: FONT,
      fontWeight: 850,
      fontSize: size,
      lineHeight: 1.05,
      padding: `${size * 0.32}px ${size * 0.5}px ${size * 0.32}px ${size * 0.36}px`,
      borderRadius: size * 0.3,
      boxShadow: "0 10px 32px rgba(0,0,0,0.25)",
    }}
  >
    <Wappen height={size * 2.1} />
    <div>
      Förderverein
      <br />
      SV Amendingen
    </div>
  </div>
);

export const S06: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s06")} dur={dur} />
    <Reveal at={Math.max(4, beatFrame("foerderverein", from))} style={{ position: "absolute", left: 80, top: 60 }}>
      <VereinsCard size={52} />
    </Reveal>
    <At x={0} y={782} w={1920} style={{ textAlign: "center" }}>
      <Reveal at={beatFrame("jederEuro", from)}>
        <Tag tone="yellow" size={66}>
          Jeder Euro bleibt in Amendingen.
        </Tag>
      </Reveal>
    </At>
  </AbsoluteFill>
);

// 07 · Jugendfahrt nach Augsburg
export const S07: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s07")} dur={dur} />
    <Reveal at={Math.max(3, beatFrame("jugendfahrt", from))} style={{ position: "absolute", left: 96, top: 84 }}>
      <Tag tone="yellow" size={72}>
        Jugendfahrt nach Augsburg
      </Tag>
    </Reveal>
  </AbsoluteFill>
);

// 08 · Trainingsanzüge, Bälle und Hütchen
export const S08: React.FC<SceneProps> = ({ from, dur }) => (
  <AbsoluteFill>
    <Shot {...panel("s08")} dur={dur} />
    <At x={0} y={78} w={1920} style={{ textAlign: "center" }}>
      <Sequence3
        words={["Trainingsanzüge", "Bälle", "Hütchen"]}
        at={[Math.max(2, beatFrame("anzuege", from)), beatFrame("baelle", from), beatFrame("huetchen", from)]}
        size={70}
      />
    </At>
  </AbsoluteFill>
);

// 09 · Jugendcamp und Freude am Fußball (Schnitt auf Nahaufnahme beim zweiten Satz)
export const S09: React.FC<SceneProps> = ({ from, dur }) => {
  const frame = useCurrentFrame();
  const close = frame >= beatFrame("nahaufnahme", from);
  return (
    <AbsoluteFill>
      {close ? (
        <Shot {...panel("s09")} dur={dur} zoom={1.45} fx={1} fy={1} />
      ) : (
        <Shot {...panel("s09")} dur={dur} />
      )}
      <div style={{ position: "absolute", left: 740, top: 70, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <Reveal at={beatFrame("jugendcamp", from)}>
          <Tag tone="yellow" size={64}>
            Jugendcamp mit dem FC Bayern
          </Tag>
        </Reveal>
        <Reveal at={beatFrame("unterstuetzt", from)}>
          <Tag size={52}>Vom Förderverein unterstützt</Tag>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// Karte im Stil des Storyboards (Panelkoordinaten)
const PanelCard: React.FC<{ x: number; y: number; w: number; h: number; border?: boolean; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  w,
  h,
  border,
  children,
  style,
}) => (
  <At
    x={x}
    y={y}
    w={w}
    h={h}
    style={{
      background: K.cream,
      borderRadius: 14,
      border: border ? `3px solid ${K.green}` : undefined,
      boxSizing: "border-box",
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </At>
);

// 10 · Gemeinsam wird mehr daraus
export const S10: React.FC<SceneProps> = ({ from, dur }) => {
  const frame = useCurrentFrame();
  const p25 = useAppear(beatFrame("mitglieder25", from));
  const o500 = interpolate(frame, [beatFrame("euro500", from), beatFrame("euro500", from) + 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot {...panel("s10")} dur={dur}>
        {/* deckt die gezeichnete Karte ab, 20 € steht ab Szenenbeginn */}
        <PanelCard x={211} y={25} w={190} h={140}>
          <div style={{ color: K.greenText, fontWeight: 900, fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em" }}>20 €</div>
          <div style={{ color: K.ink, fontWeight: 800, fontSize: 25, marginTop: 6 }}>im Jahr</div>
        </PanelCard>
        <PanelCard
          x={462}
          y={27}
          w={290}
          h={136}
          style={{ opacity: p25, transform: `scale(${0.9 + 0.1 * p25})`, boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }}
        >
          <div style={{ color: K.ink, fontWeight: 800, fontSize: 27 }}>25 Mitglieder =</div>
          <div style={{ opacity: o500, display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
            <span style={{ color: K.greenText, fontWeight: 900, fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em" }}>500 €</span>
            <span style={{ color: K.ink, fontWeight: 800, fontSize: 25 }}>im Jahr</span>
          </div>
        </PanelCard>
      </Shot>
    </AbsoluteFill>
  );
};

// 11 · Viele helfen mit
export const S11: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [3, 11], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot {...panel("s11")} dur={dur}>
        {/* deckt den gezeichneten Text der Sprechblase ab */}
        <At x={160} y={10} w={530} h={100} style={{ background: "#fdf9f1", borderRadius: 34 }} />
        <At
          x={160}
          y={10}
          w={530}
          h={100}
          style={{
            opacity: o,
            fontFamily: FONT,
            fontWeight: 850,
            fontSize: 31,
            lineHeight: 1.2,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: K.greenText }}>Niemand muss viel geben,</span>
          <span style={{ color: K.ink }}>wenn viele mitmachen.</span>
        </At>
      </Shot>
    </AbsoluteFill>
  );
};

const People: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 44" width={size} height={(size * 44) / 64}>
    <g fill={K.greenMid}>
      <circle cx={14} cy={12} r={7} />
      <circle cx={50} cy={12} r={7} />
      <path d="M2 40c0-9 5-15 12-15s12 6 12 15z" />
      <path d="M38 40c0-9 5-15 12-15s12 6 12 15z" />
      <circle cx={32} cy={10} r={9} fill={K.green} />
      <path d="M17 44c0-11 7-18 15-18s15 7 15 18z" fill={K.green} />
    </g>
  </svg>
);

// 12 · Gemeinsam die hundert knacken
export const S12: React.FC<SceneProps> = ({ from, dur }) => {
  const frame = useCurrentFrame();
  const at80 = beatFrame("ueber80", from);
  const fill = interpolate(frame, [at80 - 14, at80 + 10], [0, 0.8], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const goal = useAppear(beatFrame("hundert", from));
  return (
    <AbsoluteFill>
      <Shot {...panel("s12")} dur={dur} fx={0.34}>
        <PanelCard x={211} y={45} w={572} h={252} border style={{ justifyContent: "flex-start", paddingTop: 32, alignItems: "flex-start", paddingLeft: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <People size={72} />
            <span style={{ color: K.ink, fontWeight: 850, fontSize: 34, letterSpacing: "-0.01em" }}>
              Über <span style={{ color: K.greenText, fontWeight: 900 }}>80</span> Mitglieder
            </span>
          </div>
          <div style={{ position: "relative", width: 430, height: 40, marginTop: 26, borderRadius: 20, border: `4px solid ${K.green}`, background: "#e3e3e0", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: K.greenMid, borderRadius: 16 }} />
          </div>
          <div style={{ width: 430, textAlign: "center", marginTop: 16 }}>
            <span
              style={{
                display: "inline-block",
                color: K.ink,
                fontWeight: 850,
                fontSize: 34,
                padding: "2px 14px",
                borderRadius: 10,
                background: `rgba(247,197,43,${goal})`,
              }}
            >
              Ziel: 100
            </span>
          </div>
        </PanelCard>
      </Shot>
    </AbsoluteFill>
  );
};

// 13 · Online Mitglied werden. Formular nach /mitglied-werden, Felder leer.
const Field: React.FC<{ label: string; caret?: boolean }> = ({ label, caret }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ color: "#b9bfb9", fontSize: 19, fontWeight: 550, marginBottom: 7 }}>{label}</div>
      <div style={{ height: 50, borderRadius: 8, background: "#2f322f", border: "1.5px solid #4b504b", position: "relative" }}>
        {caret && Math.floor(frame / 15) % 2 === 0 && (
          <div style={{ position: "absolute", left: 14, top: 12, width: 2.5, height: 26, background: "#e8ece8" }} />
        )}
      </div>
    </div>
  );
};

const Phone: React.FC = () => (
  <div
    style={{
      width: 420,
      height: 800,
      borderRadius: 60,
      background: "#141614",
      padding: 16,
      boxSizing: "border-box",
      boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
    }}
  >
    <div style={{ width: "100%", height: "100%", borderRadius: 46, background: "#202320", overflow: "hidden", fontFamily: FONT, position: "relative" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", marginLeft: -55, width: 110, height: 30, borderRadius: 15, background: "#000" }} />
      <div style={{ background: K.green, padding: "72px 30px 26px", color: K.white, fontWeight: 900, fontSize: 36, textTransform: "uppercase", letterSpacing: "0.01em" }}>
        Mitglied werden
      </div>
      <div style={{ padding: "26px 30px" }}>
        <div style={{ color: K.white, fontWeight: 700, fontSize: 24, marginBottom: 22 }}>Persönliche Daten</div>
        <Field label="Vorname *" caret />
        <Field label="Nachname *" />
        <Field label="Straße & Hausnummer *" />
        <Field label="E-Mail *" />
        <div style={{ marginTop: 8, background: "#2d6a2e", color: K.white, fontWeight: 750, fontSize: 18, textTransform: "uppercase", textAlign: "center", padding: "16px 0", borderRadius: 8 }}>
          Weiter zum Lastschriftmandat
        </div>
      </div>
    </div>
  </div>
);

export const S13: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const ph = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(140deg, ${K.greenMid} 0%, ${K.green} 70%)` }}>
      {/* gleiche Figuren und Pose wie im Storyboard, Ausschnitt aus Panel 06 */}
      <div style={{ position: "absolute", left: 96, top: 318, width: 1060, height: 600, borderRadius: 28, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.3)" }}>
        <Img src={staticFile("v2/scenes/s06.webp")} style={{ position: "absolute", width: 794 * 1.51, height: 397 * 1.51, left: -70 * 1.51, top: 0 }} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 84, display: "flex", gap: 22, alignItems: "center" }}>
        <Reveal at={Math.max(3, beatFrame("minuten", from))}>
          <Tag tone="yellow" size={78}>
            In 2 Minuten
          </Tag>
        </Reveal>
        <Reveal at={beatFrame("online", from)}>
          <Tag size={78}>Komplett online</Tag>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 1330, top: 104, opacity: ph, transform: `translateY(${(1 - ph) * 80}px)` }}>
        <Phone />
      </div>
    </AbsoluteFill>
  );
};

// 14 · Mach mit (Schlusskarte)
export const S14: React.FC<SceneProps> = ({ from }) => {
  const mach = Math.max(2, beatFrame("machMit", from));
  const kinder = beatFrame("fuerDieKinder", from);
  const [w, h] = P.s14;
  const s = 1.95;
  return (
    <AbsoluteFill style={{ background: K.green }}>
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 1080 - h * s,
          width: 1120,
          height: h * s,
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 14%), linear-gradient(to bottom, transparent 0, #000 16%)",
          WebkitMaskComposite: "source-in",
          maskImage: "linear-gradient(to right, transparent 0, #000 14%), linear-gradient(to bottom, transparent 0, #000 16%)",
          maskComposite: "intersect",
        }}
      >
        <Img src={staticFile("v2/scenes/s14.webp")} style={{ position: "absolute", left: 0, top: 0, width: w * s, height: h * s }} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 80, fontFamily: FONT, color: K.white, width: 900 }}>
        <Reveal at={0}>
          <Wappen height={150} />
        </Reveal>
        <Reveal at={mach} style={{ marginTop: 34 }}>
          <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.025em", whiteSpace: "nowrap" }}>Mitglied werden</div>
        </Reveal>
        <Reveal at={mach + 6} style={{ marginTop: 30 }}>
          <Tag tone="yellow" size={76}>
            20 € im Jahr
          </Tag>
        </Reveal>
        <Reveal at={kinder} style={{ marginTop: 36 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            Für die Kinder
            <br />
            auf unserem Platz.
          </div>
        </Reveal>
        <Reveal at={kinder + 12} style={{ marginTop: 22 }}>
          <div style={{ fontSize: 42, fontWeight: 550, opacity: 0.95 }}>foerderverein-sv-amendingen.de</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  s01: S01,
  s02: S02,
  s03: S03,
  s04: S04,
  s05: S05,
  s06: S06,
  s07: S07,
  s08: S08,
  s09: S09,
  s10: S10,
  s11: S11,
  s12: S12,
  s13: S13,
  s14: S14,
};
