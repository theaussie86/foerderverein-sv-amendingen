import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import { C, H, W } from "../theme";
import { Field } from "../components/Scenery";
import { Person } from "../components/Person";
import { Ball, Cone } from "../components/Props";
import { ease, fade, Pop } from "../components/Text";

// Szene 1: Kind läuft aufs Feld, wird Spieler, wird Trainer (Manu)
export const Intro: React.FC<SceneProps> = ({ dur, beats }) => {
  const frame = useCurrentFrame();
  const toPlayer = beats[2].start + Math.round((beats[2].end - beats[2].start) * 0.45);
  const toCoach = beats[3].start - 6;

  // Kind läuft von links zur Mitte, kickt dann den Ball
  const runIn = ease(frame, 0, 90, 0, 1);
  const kidX = interpolate(runIn, [0, 1], [-120, 860]);
  const kidWalk = runIn < 1 ? frame * 0.45 : 0;
  const kid = 1 - ease(frame, toPlayer - 12, toPlayer + 6);
  const player = ease(frame, toPlayer - 6, toPlayer + 12) * (1 - ease(frame, toCoach - 10, toCoach + 6));
  const coach = ease(frame, toCoach, toCoach + 16);

  const ballX = kidX + 120 + Math.max(0, frame - 100) * 0 + (player > 0 ? (frame - toPlayer) * 7 : 0);
  const juggle = Math.abs(Math.sin(frame * 0.15)) * 50;

  return (
    <AbsoluteFill>
      <Field sun={ease(frame, 0, dur)} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* Kind */}
        <Person x={kidX} y={880} height={250} walk={kidWalk} swing={30} jacket={C.green} number="7" opacity={kid} pants={C.white} />
        {kid > 0 && <Ball x={kidX + 110} y={runIn < 1 ? 868 : 868 - juggle} size={50} opacity={kid} />}
        {/* Spieler */}
        <Person x={900} y={900} height={400} walk={frame * 0.3} swing={18} number="10" pants={C.white} opacity={player} />
        {player > 0 && <Ball x={Math.min(ballX, 1500)} y={880} size={66} rot={frame * 8} opacity={player} />}
        {/* Trainer Manu mit Hütchen */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Cone key={i} x={1180 + i * 120} y={900 - (i % 2) * 30} size={60} opacity={ease(frame, toCoach + 10 + i * 4, toCoach + 20 + i * 4)} />
        ))}
        <Person x={900} y={900} height={420} whistle jacket={C.green} stripe={C.gold} opacity={coach} armUp={frame > toCoach + 40 ? "right" : null} />
      </svg>

      {/* Ortsmarke */}
      <div style={{ position: "absolute", left: 80, top: 70, opacity: fade(frame, 6, beats[1].end) }}>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.greenDark, letterSpacing: 2, textTransform: "uppercase" }}>
          Samstagmorgen
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.dark }}>Sportplatz Amendingen</div>
      </div>

      {/* Stationen */}
      {[
        { label: "Als Kind", at: 20, until: toPlayer },
        { label: "Spieler beim SVA", at: toPlayer, until: toCoach },
      ].map((s) => (
        <div key={s.label} style={{ position: "absolute", right: 100, top: 90, opacity: fade(frame, s.at, s.until) }}>
          <div style={{ background: C.white, color: C.green, fontSize: 40, fontWeight: 800, padding: "12px 26px", borderRadius: 999 }}>
            {s.label}
          </div>
        </div>
      ))}

      {/* Bauchbinde Manu */}
      {frame > toCoach + 14 && (
        <div style={{ position: "absolute", left: 120, top: 560 }}>
          <Pop delay={toCoach + 14}>
            <div style={{ background: C.green, color: C.white, padding: "18px 34px", borderRadius: 12 }}>
              <div style={{ fontSize: 60, fontWeight: 800 }}>Manu</div>
              <div style={{ width: 64, height: 6, borderRadius: 3, background: C.gold, margin: "4px 0 10px" }} />
              <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.9 }}>Vorstand Förderverein · Jugendtrainer</div>
            </div>
          </Pop>
        </div>
      )}
    </AbsoluteFill>
  );
};
