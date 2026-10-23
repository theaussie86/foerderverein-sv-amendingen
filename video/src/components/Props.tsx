import React from "react";
import { C } from "../theme";

type P = { x: number; y: number; size?: number; rot?: number; opacity?: number };

const at = ({ x, y, size = 100, rot = 0 }: P, base: number) =>
  `translate(${x}, ${y}) rotate(${rot}) scale(${size / base})`;

export const Ball: React.FC<P> = (p) => (
  <g transform={at(p, 100)} opacity={p.opacity ?? 1}>
    <circle r={50} fill={C.white} stroke={C.dark} strokeWidth={4} />
    <polygon points="0,-18 17,-6 11,15 -11,15 -17,-6" fill={C.dark} />
    <path d="M0 -18 L0 -48 M17 -6 L44 -16 M11 15 L28 40 M-11 15 L-28 40 M-17 -6 L-44 -16" stroke={C.dark} strokeWidth={4} />
  </g>
);

export const Cone: React.FC<P & { color?: string }> = (p) => (
  <g transform={at(p, 100)} opacity={p.opacity ?? 1}>
    <path d="M-12 -80 L12 -80 L40 0 L-40 0 Z" fill={p.color ?? "#f08a24"} />
    <path d="M-20 -50 L20 -50 L26 -34 L-26 -34 Z" fill={C.white} />
    <rect x={-50} y={-6} width={100} height={12} rx={4} fill={p.color ?? "#f08a24"} />
  </g>
);

export const Bus: React.FC<P & { label?: string; wheel?: number }> = (p) => (
  <g transform={at(p, 600)} opacity={p.opacity ?? 1}>
    <rect x={-300} y={-220} width={600} height={190} rx={34} fill={C.green} />
    <rect x={-300} y={-105} width={600} height={44} fill={C.gold} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-270 + i * 118} y={-195} width={100} height={80} rx={12} fill={C.sky} />
    ))}
    <rect x={200} y={-195} width={80} height={86} rx={12} fill={C.sky} />
    <text x={0} y={-72} fontSize={32} fontWeight={800} fill={C.dark} textAnchor="middle">
      {p.label ?? "SV AMENDINGEN"}
    </text>
    {[-180, 180].map((cx) => (
      <g key={cx} transform={`translate(${cx}, -18) rotate(${p.wheel ?? 0})`}>
        <circle r={46} fill={C.dark} />
        <circle r={18} fill={C.grey} />
        <rect x={-3} y={-40} width={6} height={22} fill={C.grey} />
      </g>
    ))}
  </g>
);

export const Car: React.FC<P & { color?: string }> = (p) => (
  <g transform={at(p, 400)} opacity={p.opacity ?? 1}>
    <path d="M-160 -60 L-110 -130 L90 -130 L150 -60 Z" fill={p.color ?? C.anthracite} />
    <rect x={-200} y={-70} width={400} height={80} rx={26} fill={p.color ?? C.anthracite} />
    <path d="M-95 -118 L-10 -118 L-10 -66 L-130 -66 Z" fill={C.sky} />
    <path d="M5 -118 L82 -118 L125 -66 L5 -66 Z" fill={C.sky} />
    <circle cx={-110} cy={12} r={36} fill={C.dark} />
    <circle cx={110} cy={12} r={36} fill={C.dark} />
    <circle cx={-110} cy={12} r={14} fill={C.grey} />
    <circle cx={110} cy={12} r={14} fill={C.grey} />
  </g>
);

export const Mower: React.FC<P> = (p) => (
  <g transform={at(p, 200)} opacity={p.opacity ?? 1}>
    <rect x={-80} y={-60} width={140} height={50} rx={12} fill={C.red} />
    <path d="M40 -55 L110 -170" stroke={C.dark} strokeWidth={8} strokeLinecap="round" />
    <circle cx={-55} cy={-6} r={18} fill={C.dark} />
    <circle cx={35} cy={-6} r={18} fill={C.dark} />
  </g>
);

export const Umbrella: React.FC<P> = (p) => (
  <g transform={at(p, 200)} opacity={p.opacity ?? 1}>
    <path d="M-110 0 Q0 -120 110 0 Q82 -14 55 0 Q28 -14 0 0 Q-28 -14 -55 0 Q-82 -14 -110 0 Z" fill={C.gold} />
    <path d="M0 0 L0 120 Q0 136 -14 136" stroke={C.dark} strokeWidth={6} fill="none" />
  </g>
);

export const Tracksuit: React.FC<P> = (p) => (
  <g transform={at(p, 200)} opacity={p.opacity ?? 1}>
    <path d="M-50 -90 L50 -90 L95 -40 L70 -10 L50 -30 L50 90 L-50 90 L-50 -30 L-70 -10 L-95 -40 Z" fill={C.green} />
    <rect x={-2} y={-90} width={4} height={180} fill={C.gold} />
    <path d="M-50 -90 L-95 -40 L-88 -32 L-50 -76 Z" fill={C.gold} />
    <path d="M50 -90 L95 -40 L88 -32 L50 -76 Z" fill={C.gold} />
  </g>
);

export const PriceTag: React.FC<P & { text: string }> = (p) => (
  <g transform={at(p, 100)} opacity={p.opacity ?? 1}>
    <path d="M0 -80 L0 -40" stroke={C.anthracite} strokeWidth={3} />
    <path d="M-60 -40 L60 -40 L60 30 L-60 30 Z" fill={C.gold} />
    <circle cx={0} cy={-28} r={6} fill={C.cream} />
    <text y={18} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.dark}>
      {p.text}
    </text>
  </g>
);

export const Coin: React.FC<P> = (p) => (
  <g transform={at(p, 100)} opacity={p.opacity ?? 1}>
    <circle r={50} fill={C.goldLight} stroke={C.gold} strokeWidth={8} />
    <text y={20} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.dark}>
      €
    </text>
  </g>
);

export const BallNet: React.FC<P> = (p) => (
  <g transform={at(p, 300)} opacity={p.opacity ?? 1}>
    <path d="M-100 -230 Q-140 -60 -90 0 L90 0 Q140 -60 100 -230 Z" fill="none" stroke={C.anthracite} strokeWidth={5} />
    {[-60, 0, 60].map((cx, i) => (
      <Ball key={i} x={cx} y={-50} size={80} />
    ))}
    {[-30, 30].map((cx, i) => (
      <Ball key={`b${i}`} x={cx} y={-120} size={80} />
    ))}
    <Ball x={0} y={-185} size={80} />
    <path d="M-110 -95 L110 -95 M-120 -160 L120 -160 M-50 -230 L-40 0 M50 -230 L40 0" stroke={C.anthracite} strokeWidth={3} opacity={0.6} />
    <rect x={-115} y={-245} width={230} height={18} rx={8} fill={C.anthracite} />
  </g>
);

export const Flag: React.FC<P & { color?: string; wave?: number }> = (p) => {
  const w = p.wave ?? 0;
  return (
    <g transform={at(p, 300)} opacity={p.opacity ?? 1}>
      <rect x={-4} y={-300} width={8} height={300} fill={C.anthracite} />
      <path
        d={`M4 -296 Q60 ${-316 + w * 14} 120 -296 Q170 ${-276 - w * 14} 200 -296 L200 -200 Q170 ${-180 - w * 14} 120 -200 Q60 ${-220 + w * 14} 4 -200 Z`}
        fill={p.color ?? C.red}
      />
    </g>
  );
};

export const Tent: React.FC<P> = (p) => (
  <g transform={at(p, 400)} opacity={p.opacity ?? 1}>
    <path d="M-200 0 L0 -220 L200 0 Z" fill={C.red} />
    <path d="M-70 0 L0 -220 L70 0 Z" fill={C.white} />
    <path d="M-35 0 L0 -90 L35 0 Z" fill={C.dark} opacity={0.5} />
  </g>
);

export const Phone: React.FC<P & { children?: React.ReactNode }> = (p) => (
  <g transform={at(p, 600)} opacity={p.opacity ?? 1}>
    <rect x={-160} y={-300} width={320} height={600} rx={44} fill={C.dark} />
    <rect x={-142} y={-270} width={284} height={540} rx={26} fill={C.white} />
    <rect x={-40} y={-288} width={80} height={10} rx={5} fill={C.anthracite} />
    {p.children}
  </g>
);
