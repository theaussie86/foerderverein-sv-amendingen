import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import { C, H, W } from "../theme";
import { Stage, Wappen } from "../components/Scenery";
import { Person } from "../components/Person";
import { Coin } from "../components/Props";
import { ease, Pop, useSpring } from "../components/Text";

// Szene 3: Wappen + Schriftzug Förderverein, Geld fließt zum Platz
export const Verein: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const wappen = useSpring(0, 12);
  const word = "Förderverein";
  const letters = Math.floor(ease(frame, 14, 50, 0, word.length));
  const flowAt = beats[2].start - 10;
  const lift = ease(frame, flowAt - 10, flowAt + 10, 0, 1);

  return (
    <AbsoluteFill>
      <Stage>
        {/* Platz unten, erscheint wenn das Geld fließt */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g opacity={lift} transform={`translate(0, ${(1 - lift) * 200})`}>
            <rect x={0} y={760} width={W} height={320} fill={C.greenLight} />
            <ellipse cx={960} cy={900} rx={360} ry={80} fill="none" stroke={C.white} strokeWidth={6} />
            <path d="M960 760 L960 1080" stroke={C.white} strokeWidth={6} />
          </g>
          {Array.from({ length: 14 }).map((_, i) => {
            const t = frame - flowAt - i * 5;
            if (t < 0) return null;
            const p = Math.min(1, t / 34);
            const x = interpolate(p, [0, 1], [400, 230 + (i % 7) * 50]);
            const y = 300 + p * 560 - Math.sin(p * Math.PI) * 60;
            return <Coin key={i} x={x} y={y} size={64} opacity={p < 1 ? 1 : Math.max(0, 1 - (t - 34) / 10)} />;
          })}
          <Person x={1560} y={700 + lift * 200} height={440} whistle armUp={frame > beats[1].start ? "left" : null} flip />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 220,
            top: 170 - lift * 40,
            display: "flex",
            alignItems: "center",
            gap: 50,
          }}
        >
          <div style={{ transform: `scale(${wappen})` }}>
            <Wappen width={360} />
          </div>
          <div>
            <div style={{ fontSize: 132, fontWeight: 800, color: C.green, letterSpacing: -3, minWidth: 820 }}>
              {word.slice(0, letters)}
              <span style={{ opacity: letters < word.length ? 1 : 0, color: C.gold }}>|</span>
            </div>
            <div style={{ fontSize: 44, fontWeight: 600, color: C.anthracite, opacity: ease(frame, 50, 62) }}>
              SV Amendingen e.V.
            </div>
            {frame > beats[1].start + 10 && (
              <div style={{ display: "flex", gap: 18, marginTop: 30, opacity: 1 - lift }}>
                <Pop delay={beats[1].start + 10}>
                  <Badge>eigener Verein</Badge>
                </Pop>
                <Pop delay={beats[1].start + 22}>
                  <Badge>gemeinnützig</Badge>
                </Pop>
              </div>
            )}
          </div>
        </div>

        {frame > flowAt + 20 && (
          <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center" }}>
            <Pop delay={flowAt + 20}>
              <span style={{ background: C.gold, color: C.dark, fontSize: 60, fontWeight: 800, padding: "10px 32px", borderRadius: 14 }}>
                Jeder Euro bleibt in Amendingen.
              </span>
            </Pop>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ border: `4px solid ${C.green}`, color: C.green, fontSize: 38, fontWeight: 800, padding: "8px 24px", borderRadius: 999 }}>
    {children}
  </div>
);
