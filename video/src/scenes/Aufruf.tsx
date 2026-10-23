import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import { C, H, W } from "../theme";
import { Stage, Wappen } from "../components/Scenery";
import { Person } from "../components/Person";
import { Phone } from "../components/Props";
import { countTo, ease, Headline, Pop, useSpring } from "../components/Text";

// Szene 6: Zähler "über 80" -> Ziel 100, Handy-Formular, Endkarte
export const Aufruf: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const phoneAt = beats[2].start - 4;
  const endAt = beats[3].start - 4;

  const n = Number(countTo(frame, 6, 45, 0, 80));
  const goal = ease(frame, beats[1].start, beats[1].start + 12);
  const pulse = 1 + Math.max(0, Math.sin((frame - beats[1].start) * 0.25)) * 0.06 * goal;

  return (
    <AbsoluteFill>
      {/* Zähler */}
      <AbsoluteFill style={{ opacity: 1 - ease(frame, phoneAt, phoneAt + 8) }}>
        <Stage>
          <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 50, fontWeight: 600, color: C.anthracite }}>Mitglieder im Förderverein</div>
            <div style={{ fontSize: 240, fontWeight: 800, color: C.green, letterSpacing: -8, lineHeight: 1 }}>
              {n >= 80 ? "über 80" : n}
            </div>
          </div>
          <div style={{ position: "absolute", left: 260, right: 260, top: 620 }}>
            <div style={{ height: 56, background: "#e3dccb", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${n}%`, height: "100%", background: C.green, borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 600, color: C.anthracite, marginTop: 14 }}>
              <span>0</span>
              <span style={{ opacity: goal, transform: `scale(${pulse})`, color: C.gold, fontWeight: 800 }}>Ziel: 100</span>
            </div>
          </div>
        </Stage>
      </AbsoluteFill>

      {/* Handy mit Formular */}
      <AbsoluteFill style={{ opacity: ease(frame, phoneAt, phoneAt + 8) * (1 - ease(frame, endAt, endAt + 8)) }}>
        <Stage bg={C.sky}>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <Phone x={1260} y={520} size={760}>
              <Form t={frame - phoneAt} />
            </Phone>
          </svg>
          <div style={{ position: "absolute", left: 160, top: 300 }}>
            <Pop delay={phoneAt + 6}>
              <Headline size={120} color={C.green}>2 Minuten.</Headline>
            </Pop>
            <Pop delay={phoneAt + 20}>
              <Headline size={90}>Komplett online.</Headline>
            </Pop>
          </div>
        </Stage>
      </AbsoluteFill>

      {/* Endkarte */}
      {frame > endAt && <Endkarte from={endAt} />}
    </AbsoluteFill>
  );
};

const Form: React.FC<{ t: number }> = ({ t }) => {
  const fields = ["Vorname", "Nachname", "E-Mail", "IBAN"];
  const done = ease(t, 70, 84);
  return (
    <g>
      <text x={-115} y={-200} fontSize={30} fontWeight={800} fill={C.green}>Mitglied werden</text>
      {fields.map((f, i) => {
        const fill = ease(t, 10 + i * 14, 22 + i * 14);
        return (
          <g key={f} transform={`translate(-115, ${-160 + i * 80})`}>
            <text y={0} fontSize={18} fill={C.anthracite}>{f}</text>
            <rect y={10} width={230} height={40} rx={8} fill="#f2f2f2" stroke="#d6d6d6" />
            <rect x={12} y={26} width={fill * (120 + (i % 2) * 60)} height={8} rx={4} fill={C.anthracite} />
          </g>
        );
      })}
      <rect x={-115} y={170} width={230} height={56} rx={12} fill={done > 0 ? C.green : C.gold} />
      <text x={0} y={206} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.white}>Absenden</text>
      <g opacity={done} transform={`translate(0, 0) scale(${0.6 + done * 0.4})`}>
        <rect x={-142} y={-270} width={284} height={540} rx={26} fill={C.white} opacity={0.94} />
        <circle r={80} fill={C.green} />
        <path d="M-36 2 L-8 30 L40 -26" stroke={C.white} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text y={140} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.green}>Willkommen!</text>
      </g>
    </g>
  );
};

const Endkarte: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const s = useSpring(from + 4, 12);
  const btn = useSpring(from + 26, 10);
  const glow = 1 + Math.max(0, Math.sin((frame - from) * 0.18)) * 0.03;
  return (
    <AbsoluteFill style={{ background: C.green, opacity: ease(frame, from, from + 8) }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Person x={1580} y={960} height={520} whistle armUp={frame > from + 30 ? "left" : null} flip stripe={C.goldLight} jacket={C.greenDark} />
      </svg>
      <div style={{ position: "absolute", left: 160, top: 110, transform: `scale(${s})`, transformOrigin: "left top" }}>
        <Wappen width={220} />
      </div>
      <div style={{ position: "absolute", left: 160, top: 330 }}>
        <Headline color={C.white} size={150}>Mitglied werden</Headline>
        <div style={{ fontSize: 70, fontWeight: 800, color: C.goldLight, marginTop: 10 }}>20 € im Jahr · 1,67 € im Monat</div>
        <div
          style={{
            display: "inline-block",
            marginTop: 50,
            background: C.gold,
            color: C.dark,
            fontSize: 56,
            fontWeight: 800,
            padding: "26px 56px",
            borderRadius: 18,
            opacity: btn,
            transform: `scale(${(0.8 + btn * 0.2) * glow})`,
            transformOrigin: "left center",
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
          }}
        >
          Jetzt Mitglied werden →
        </div>
        <div style={{ fontSize: 38, fontWeight: 600, color: C.white, opacity: 0.85, marginTop: 34 }}>foerderverein-sv-amendingen.de</div>
      </div>
    </AbsoluteFill>
  );
};
