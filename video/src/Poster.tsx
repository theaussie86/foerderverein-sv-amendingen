import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, H, W } from "./theme";
import { Field } from "./components/Scenery";
import { Person } from "./components/Person";
import { Cone } from "./components/Props";

// Posterbild: Szene 1 mit Manu, Play-Fläche und Hinweis
export const Poster: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Field sun={0.7} />
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Cone key={i} x={1060 + i * 110} y={960 - (i % 2) * 30} size={60} />
      ))}
      <Person x={1560} y={960} height={520} whistle />
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(26,26,26,0.6) 0%, rgba(26,26,26,0.3) 55%, rgba(26,26,26,0) 75%)", justifyContent: "center", alignItems: "flex-start", paddingLeft: 160 }}>
      <div style={{ width: 200, height: 200, borderRadius: 999, background: C.gold, display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <svg width={90} height={90} viewBox="0 0 10 10"><path d="M3 1.5 L8.5 5 L3 8.5 Z" fill={C.dark} /></svg>
      </div>
      <div style={{ marginTop: 40, fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: C.white, maxWidth: 1200, textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        90 Sekunden:<br />Was der Förderverein macht
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
