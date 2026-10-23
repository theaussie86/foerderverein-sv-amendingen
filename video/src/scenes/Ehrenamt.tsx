import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import { C, H, W } from "../theme";
import { Field, Stage } from "../components/Scenery";
import { Person } from "../components/Person";
import { Ball, Bus, Car, Mower, PriceTag, Tracksuit, Umbrella } from "../components/Props";
import { ease, fade, Headline, useSpring } from "../components/Text";

// Szene 2: Ehrenamt (Trainer im Regen, Eltern im Auto, Helfer) und die kleinen Beträge
export const Ehrenamt: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const cardsOut = beats[2].start;
  const tagsIn = beats[3].start;
  const cardsOpacity = fade(frame, 0, cardsOut + 4, 8);

  const cards = [
    { label: "Trainer", delay: 0, word: beats[1].start },
    { label: "Eltern", delay: 10, word: beats[1].start + 12 },
    { label: "Helfer", delay: 20, word: beats[1].start + 24 },
  ];

  return (
    <AbsoluteFill>
      {/* Drei Vignetten */}
      <AbsoluteFill style={{ background: C.cream, opacity: cardsOpacity }}>
        <div style={{ display: "flex", gap: 48, padding: "120px 90px 0", justifyContent: "center" }}>
          {cards.map((c, i) => (
            <Card key={c.label} index={i} delay={c.delay} label={c.label} labelAt={c.word} frame={frame} />
          ))}
        </div>
      </AbsoluteFill>

      {/* Ehrenamt kauft keine Bälle */}
      <AbsoluteFill style={{ opacity: fade(frame, cardsOut, tagsIn + 6, 8) }}>
        <Stage bg={C.green}>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <Ball x={960} y={380 + Math.sin(frame * 0.2) * 20} size={180} rot={frame * 3} />
          </svg>
          <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center" }}>
            <Headline color={C.white} size={110}>
              Ehrenamt kauft <span style={{ color: C.goldLight }}>keine Bälle.</span>
            </Headline>
          </div>
        </Stage>
      </AbsoluteFill>

      {/* Preisschilder */}
      <AbsoluteFill style={{ opacity: ease(frame, tagsIn, tagsIn + 8) }}>
        <Stage>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            {[
              { x: 420, el: <Ball x={420} y={560} size={200} />, price: "Bälle" },
              { x: 960, el: <Tracksuit x={960} y={540} size={260} />, price: "Anzüge" },
              { x: 1500, el: <Bus x={1500} y={680} size={420} />, price: "Fahrten" },
            ].map((it, i) => {
              const sw = Math.sin((frame - tagsIn) * 0.12 + i) * 8;
              const o = ease(frame, tagsIn + 6 + i * 10, tagsIn + 16 + i * 10);
              return (
                <g key={i} opacity={o}>
                  {it.el}
                  <PriceTag x={it.x + 90} y={330} size={150} rot={sw} text="€" />
                  <text x={it.x} y={820} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.anthracite}>
                    {it.price}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center" }}>
            <Headline size={72}>Kleine Beträge, für die sich niemand findet.</Headline>
          </div>
        </Stage>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Card: React.FC<{ index: number; delay: number; label: string; labelAt: number; frame: number }> = ({
  index,
  delay,
  label,
  labelAt,
  frame,
}) => {
  const s = useSpring(delay);
  const l = useSpring(labelAt);
  const scene = [
    // Trainer im Regen
    <svg key="t" viewBox="0 0 520 600" width="100%" height="100%">
      <rect width={520} height={600} fill="#9fb0ba" />
      <rect y={430} width={520} height={170} fill={C.green} />
      {Array.from({ length: 30 }).map((_, i) => (
        <path key={i} d={`M${(i * 53) % 520} ${((i * 71 + frame * 22) % 640) - 40} l-6 22`} stroke="#eef4f7" strokeWidth={3} />
      ))}
      <Person x={260} y={540} height={330} whistle />
      <Umbrella x={300} y={240} size={200} />
    </svg>,
    // Eltern im Auto
    <svg key="e" viewBox="0 0 520 600" width="100%" height="100%">
      <rect width={520} height={600} fill={C.sky} />
      <rect y={430} width={520} height={170} fill="#7d7d7d" />
      <rect y={505} width={520} height={8} fill={C.white} strokeDasharray="20 20" />
      <g transform={`translate(${Math.sin(frame * 0.05) * 12}, 0)`}>
        <Car x={260} y={470} size={420} color={C.gold} />
        <circle cx={232} cy={380} r={18} fill={C.skin} />
        <circle cx={300} cy={380} r={14} fill={C.skinDark} />
      </g>
    </svg>,
    // Helfer mit Rasenmäher
    <svg key="h" viewBox="0 0 520 600" width="100%" height="100%">
      <rect width={520} height={600} fill={C.skyWarm} />
      <rect y={430} width={520} height={170} fill={C.greenLight} />
      <rect y={430} width={200 + Math.min(frame, 120) * 1.5} height={170} fill={C.green} opacity={0.5} />
      <Person x={150 + Math.min(frame, 120) * 1.2} y={540} height={300} walk={frame * 0.3} jacket={C.anthracite} stripe={C.goldLight} />
      <Mower x={290 + Math.min(frame, 120) * 1.2} y={555} size={200} />
    </svg>,
  ][index];

  return (
    <div
      style={{
        width: 520,
        height: 720,
        borderRadius: 28,
        overflow: "hidden",
        background: C.white,
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        transform: `translateY(${(1 - s) * 140}px)`,
        opacity: s,
      }}
    >
      <div style={{ height: 600 }}>{scene}</div>
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          fontWeight: 800,
          color: C.green,
          opacity: l,
          transform: `scale(${0.8 + l * 0.2})`,
        }}
      >
        {label}
      </div>
    </div>
  );
};
