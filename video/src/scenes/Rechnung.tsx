import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import { C, H, W } from "../theme";
import { Person, kidLook } from "../components/Person";
import { Ball, BallNet, Bus } from "../components/Props";
import { countTo, ease, Headline, Pop } from "../components/Text";

// Szene 5: aus einer Figur werden viele. 1 = 20 €, 25 = 500 €, 100 = 2.000 €
export const Rechnung: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const at25 = beats[2].start;
  const at100 = beats[3].start;
  const outro = beats[4].start;

  const stage = frame < at25 ? 1 : frame < at100 ? 25 : 100;
  const members = frame < at25 ? 1 : frame < at100 ? Number(countTo(frame, at25, 30, 1, 25)) : Number(countTo(frame, at100, 30, 25, 100));
  const euro = (members * 20).toLocaleString("de-DE");
  const gridOut = 1 - ease(frame, outro - 4, outro + 8);

  // Raster: bis zu 100 Figuren, 10 x 10, im rechten Bereich
  const cols = stage === 1 ? 1 : stage === 25 ? 5 : 10;
  const cell = stage === 1 ? 420 : stage === 25 ? 120 : 62;
  const gx = 1340;
  const gy = 560;

  const reward = {
    1: { label: "ein Spielball", icon: <Ball x={0} y={0} size={150} /> },
    25: { label: "Trainingsmaterial für ein Team", icon: <BallNet x={0} y={110} size={260} /> },
    100: { label: "Zuschuss für die nächste Jugendfahrt", icon: <Bus x={0} y={90} size={380} /> },
  }[stage as 1 | 25 | 100];
  const rewardAt = stage === 1 ? 10 : stage === 25 ? at25 + 24 : at100 + 24;

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill style={{ opacity: gridOut }}>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {Array.from({ length: members }).map((_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const rows = Math.ceil(stage / cols);
            const x = gx + (c - (cols - 1) / 2) * cell;
            const y = gy + (r - (rows - 1) / 2) * cell + cell * 0.45;
            return (
              <Person
                key={i}
                x={x}
                y={y}
                height={cell * 0.92}
                {...kidLook(i)}
                jacket={i === 0 ? C.green : i % 3 ? C.greenLight : C.gold}
                stripe={i % 3 ? C.gold : C.green}
                pants={C.anthracite}
              />
            );
          })}
        </svg>

        <div style={{ position: "absolute", left: 120, top: 150, width: 820 }}>
          <div style={{ fontSize: 44, fontWeight: 600, color: C.anthracite }}>
            {members === 1 ? "1 Mitglied" : `${members} Mitglieder`}
          </div>
          <div style={{ fontSize: 190, fontWeight: 800, color: C.green, letterSpacing: -6, lineHeight: 1 }}>{euro} €</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.gold, marginBottom: 36 }}>im Jahr</div>
          <Pop key={stage} delay={rewardAt}>
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <svg width={220} height={200} viewBox="-110 -100 220 200" style={{ overflow: "visible" }}>
                {reward.icon}
              </svg>
              <div style={{ fontSize: 50, fontWeight: 800, color: C.dark, lineHeight: 1.15 }}>= {reward.label}</div>
            </div>
          </Pop>
          {stage === 1 && frame > beats[1].start && (
            <Pop delay={beats[1].start}>
              <div style={{ fontSize: 40, fontWeight: 600, color: C.grey, marginTop: 30 }}>Allein ist das wenig.</div>
            </Pop>
          )}
        </div>
      </AbsoluteFill>

      {frame > outro && (
        <AbsoluteFill style={{ background: C.green, opacity: ease(frame, outro, outro + 8), justifyContent: "center", alignItems: "center" }}>
          <Pop delay={outro + 4}>
            <Headline color={C.white} size={104} style={{ textAlign: "center" }}>
              Niemand muss viel geben,
              <br />
              <span style={{ color: C.goldLight }}>wenn viele mitmachen.</span>
            </Headline>
          </Pop>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
