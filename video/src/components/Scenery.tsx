import React from "react";
import { Img, staticFile } from "remotion";
import { C, H, W } from "../theme";

// Sportplatz Amendingen: Himmel, Bäume, Zaun, gemähter Rasen mit Linien
export const Field: React.FC<{ sun?: number; rain?: boolean; frame?: number; horizon?: number }> = ({
  sun = 1,
  rain = false,
  frame = 0,
  horizon = 560,
}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={rain ? "#8e9ca6" : C.sky} />
        <stop offset="1" stopColor={rain ? "#b8c2c8" : C.skyWarm} />
      </linearGradient>
    </defs>
    <rect width={W} height={horizon} fill="url(#sky)" />
    {!rain && <circle cx={1520} cy={horizon - 120 - sun * 160} r={90} fill={C.goldLight} opacity={0.9} />}
    {/* Baumreihe */}
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={i * 150 + (i % 2) * 40} cy={horizon - 30} r={90 + (i % 3) * 20} fill={i % 2 ? C.greenDark : "#275c28"} />
    ))}
    {/* Zaun */}
    <rect y={horizon - 40} width={W} height={10} fill={C.cream} opacity={0.8} />
    {Array.from({ length: 49 }).map((_, i) => (
      <rect key={i} x={i * 40} y={horizon - 70} width={6} height={70} fill={C.cream} opacity={0.8} />
    ))}
    {/* Rasen mit Mähstreifen */}
    <rect y={horizon} width={W} height={H - horizon} fill={C.greenLight} />
    {Array.from({ length: 8 }).map((_, i) => (
      <path
        key={i}
        d={`M${i * 260 - 200} ${H} L${i * 260 + 60} ${H} L${960 + (i - 3.5) * 150 + 75} ${horizon} L${960 + (i - 3.5) * 150} ${horizon} Z`}
        fill={i % 2 ? C.green : C.greenLight}
        opacity={0.55}
      />
    ))}
    {/* Linien und Tor */}
    <path d={`M0 ${horizon + 90} L${W} ${horizon + 90}`} stroke={C.white} strokeWidth={6} opacity={0.85} />
    <ellipse cx={960} cy={horizon + 260} rx={420} ry={110} fill="none" stroke={C.white} strokeWidth={6} opacity={0.85} />
    <g transform={`translate(260, ${horizon + 20})`}>
      <rect x={0} y={-120} width={8} height={130} fill={C.white} />
      <rect x={220} y={-120} width={8} height={130} fill={C.white} />
      <rect x={0} y={-124} width={228} height={8} fill={C.white} />
      <path d="M8 -116 L40 -90 L188 -90 L220 -116" stroke={C.white} strokeWidth={2} fill="none" opacity={0.6} />
    </g>
    {rain &&
      Array.from({ length: 90 }).map((_, i) => {
        const x = (i * 211) % W;
        const y = ((i * 137 + frame * 38) % (H + 100)) - 100;
        return <path key={i} d={`M${x} ${y} l-10 34`} stroke="#e8f0f5" strokeWidth={3} opacity={0.7} />;
      })}
  </svg>
);

// Wappen als Bild (nachgezeichnetes SVG, nur fürs Video)
export const Wappen: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img src={staticFile("wappen.svg")} style={{ width, height: width * (1830 / 2280), ...style }} />
);

// Ganzflächige Bühne für Grafikszenen
export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.cream }) => (
  <div style={{ position: "absolute", inset: 0, background: bg }}>{children}</div>
);
