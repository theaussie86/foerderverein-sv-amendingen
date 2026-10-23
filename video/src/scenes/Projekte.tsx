import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../Video";
import script from "../script.json";
import { C, H, W } from "../theme";
import { Person, kidLook } from "../components/Person";
import { Ball, BallNet, Bus, Cone, Flag, Tent } from "../components/Props";
import { ease, fade, Headline, Pop } from "../components/Text";

// Szene 4: vier echte Projekte mit Jahr und Betrag (Werte aus script.json)
export const Projekte: React.FC<SceneProps> = ({ dur, beats }) => {
  const frame = useCurrentFrame();
  const wrapAt = beats[4].start;
  const slots = beats.slice(0, 4).map((b, i) => ({
    start: i === 0 ? 0 : b.start - 4,
    end: i === 3 ? wrapAt + 6 : beats[i + 1].start + 6,
  }));
  const bg = [C.sky, C.cream, C.skyWarm, "#f3e6e4"];

  return (
    <AbsoluteFill>
      {script.projekte.map((p, i) => {
        const { start, end } = slots[i];
        const o = fade(frame, start, end, 8);
        if (o <= 0) return null;
        const local = frame - start;
        return (
          <AbsoluteFill key={p.key} style={{ background: bg[i], opacity: o }}>
            <svg width={W} height={H} style={{ position: "absolute" }}>
              <Illustration k={p.key} t={local} />
            </svg>
            <div style={{ position: "absolute", left: 110, top: 110 }}>
              <Pop delay={start + 6}>
                <div style={{ background: C.white, borderRadius: 22, padding: "26px 40px", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: C.gold }}>{p.jahr}</div>
                  <div style={{ fontSize: 110, fontWeight: 800, color: C.green, letterSpacing: -3, lineHeight: 1 }}>{p.betrag}</div>
                  <div style={{ fontSize: 44, fontWeight: 600, color: C.anthracite }}>{p.label}</div>
                </div>
              </Pop>
            </div>
          </AbsoluteFill>
        );
      })}

      {/* Abschluss: Kinder jubeln */}
      <AbsoluteFill style={{ background: C.green, opacity: ease(frame, wrapAt, wrapAt + 8) }}>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <rect y={760} width={W} height={320} fill={C.greenLight} />
          {Array.from({ length: 9 }).map((_, i) => {
            const jump = Math.max(0, Math.sin((frame - wrapAt) * 0.25 + i * 0.8)) * 30;
            return (
              <Person
                key={i}
                x={300 + i * 165}
                y={900 - jump}
                height={230 + (i % 3) * 20}
                {...kidLook(i)}
                jacket={C.green}
                stripe={C.goldLight}
                pants={C.white}
                armUp={frame - wrapAt > 30 + i * 3 ? "both" : null}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center" }}>
          <Pop delay={wrapAt + 6}>
            <Headline color={C.white} size={84}>Keine großen Schlagzeilen.</Headline>
          </Pop>
          {frame > beats[4].start + Math.round((beats[4].end - beats[4].start) * 0.5) && (
            <Pop delay={beats[4].start + Math.round((beats[4].end - beats[4].start) * 0.5)}>
              <Headline color={C.goldLight} size={96} style={{ marginTop: 16 }}>
                Aber die Kinder merken es.
              </Headline>
            </Pop>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Illustration: React.FC<{ k: string; t: number }> = ({ k, t }) => {
  if (k === "bus") {
    const x = interpolate(t, [0, 120], [2300, 1150], { extrapolateRight: "clamp", easing: (v) => 1 - Math.pow(1 - v, 2) });
    return (
      <g>
        <rect y={820} width={W} height={260} fill="#6f6f6f" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={((((i * 240 - t * 10) % (W + 240)) + W + 240) % (W + 240)) - 120} y={940} width={120} height={12} fill={C.white} />
        ))}
        <g transform="translate(1650, 620)">
          <rect x={-6} y={0} width={12} height={200} fill={C.anthracite} />
          <rect x={-150} y={-50} width={300} height={80} rx={8} fill="#f1c40f" />
          <text y={6} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.dark}>Augsburg</text>
        </g>
        <Bus x={x} y={900} size={820} wheel={-t * 12} />
      </g>
    );
  }
  if (k === "anzug") {
    return (
      <g>
        <rect y={800} width={W} height={280} fill={C.greenLight} />
        {Array.from({ length: 7 }).map((_, i) => {
          const o = ease(t, 8 + i * 5, 20 + i * 5);
          return (
            <Person key={i} x={820 + i * 150} y={940 - (1 - o) * 60} height={280 + (i % 2) * 24} opacity={o} {...kidLook(i)} />
          );
        })}
      </g>
    );
  }
  if (k === "material") {
    return (
      <g>
        <rect y={800} width={W} height={280} fill={C.greenLight} />
        <g opacity={ease(t, 0, 12)}>
          <BallNet x={1050} y={920} size={460} />
        </g>
        {Array.from({ length: 6 }).map((_, i) => (
          <Cone key={i} x={1300 + i * 95} y={920 - (i % 2) * 40} size={70} opacity={ease(t, 14 + i * 4, 22 + i * 4)} />
        ))}
        <Ball x={1700} y={840 - Math.abs(Math.sin(t * 0.12)) * 120} size={80} rot={t * 6} />
      </g>
    );
  }
  return (
    <g>
      <rect y={800} width={W} height={280} fill={C.greenLight} />
      <Tent x={1400} y={820} size={460} />
      <Flag x={1100} y={820} size={360} color={C.red} wave={Math.sin(t * 0.2)} />
      <text x={1180} y={510} fontSize={40} fontWeight={800} fill={C.white}>CAMP</text>
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i}>
          <Person x={900 + i * 180} y={980} height={220} {...kidLook(i + 2)} jacket={C.red} stripe={C.white} pants={C.white} walk={t * 0.35 + i} />
          <Ball x={960 + i * 180} y={968} size={44} rot={t * 8} />
        </g>
      ))}
    </g>
  );
};
