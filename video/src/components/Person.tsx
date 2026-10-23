import React from "react";
import { C } from "../theme";

// Flache Figur ohne Gesicht. Koordinaten: viewBox 0 0 200 400, Füße bei y=400.
export type PersonProps = {
  x: number;
  y: number; // Fußpunkt
  height?: number; // Pixelhöhe der Figur
  jacket?: string;
  stripe?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  walk?: number; // Phase in Radiant, 0 = stehen
  swing?: number; // Amplitude in Grad
  whistle?: boolean;
  number?: string;
  armUp?: "left" | "right" | "both" | null; // zeigen / jubeln
  flip?: boolean;
  opacity?: number;
  children?: React.ReactNode; // Zubehör in Figur-Koordinaten
};

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  height = 400,
  jacket = C.green,
  stripe = C.gold,
  pants = C.anthracite,
  skin = C.skin,
  hair = C.hair,
  walk = 0,
  swing = 22,
  whistle = false,
  number,
  armUp = null,
  flip = false,
  opacity = 1,
  children,
}) => {
  const s = height / 400;
  const a = walk === 0 ? 0 : Math.sin(walk) * swing;
  const bob = walk === 0 ? 0 : Math.abs(Math.cos(walk)) * -6;
  const leftArm = armUp === "left" || armUp === "both" ? 150 : -a * 0.9 + 4;
  const rightArm = armUp === "right" || armUp === "both" ? -150 : a * 0.9 - 4;

  return (
    <g
      transform={`translate(${x - 100 * s * (flip ? -1 : 1)}, ${y - 400 * s + bob * s}) scale(${s * (flip ? -1 : 1)}, ${s})`}
      opacity={opacity}
    >
      {/* Beine */}
      <g transform={`rotate(${a}, 85, 235)`}>
        <rect x={70} y={230} width={30} height={150} rx={12} fill={pants} />
        <rect x={64} y={372} width={42} height={22} rx={10} fill={C.dark} />
      </g>
      <g transform={`rotate(${-a}, 115, 235)`}>
        <rect x={100} y={230} width={30} height={150} rx={12} fill={pants} />
        <rect x={96} y={372} width={42} height={22} rx={10} fill={C.dark} />
      </g>
      {/* Arm hinten */}
      <g transform={`rotate(${leftArm}, 62, 138)`}>
        <rect x={48} y={130} width={28} height={112} rx={13} fill={jacket} />
        <rect x={48} y={150} width={7} height={80} fill={stripe} />
        <circle cx={62} cy={246} r={14} fill={skin} />
      </g>
      {/* Rumpf */}
      <path d="M58 140 Q58 118 84 116 L116 116 Q142 118 142 140 L146 244 Q100 254 54 244 Z" fill={jacket} />
      <rect x={98.5} y={118} width={3} height={130} fill={stripe} opacity={0.85} />
      {number && (
        <text x={100} y={205} textAnchor="middle" fontSize={56} fontWeight={800} fill={stripe} fontFamily="inherit">
          {number}
        </text>
      )}
      {/* Hals, Kopf, Haare */}
      <rect x={88} y={100} width={24} height={22} rx={6} fill={skin} />
      <circle cx={100} cy={70} r={40} fill={skin} />
      <path d="M60 68 Q60 26 100 26 Q140 26 140 68 Q130 50 100 48 Q72 48 60 68 Z" fill={hair} />
      {whistle && (
        <g>
          <path d="M86 118 Q100 160 114 118" stroke={C.white} strokeWidth={3} fill="none" />
          <rect x={92} y={150} width={18} height={12} rx={5} fill={C.goldLight} />
        </g>
      )}
      {/* Arm vorn */}
      <g transform={`rotate(${rightArm}, 138, 138)`}>
        <rect x={124} y={130} width={28} height={112} rx={13} fill={jacket} />
        <rect x={145} y={150} width={7} height={80} fill={stripe} />
        <circle cx={138} cy={246} r={14} fill={skin} />
      </g>
      {children}
    </g>
  );
};

// Kinderfiguren: Varianten für Haut und Haare, damit Gruppen lebendig wirken
const KID_SKINS = [C.skin, "#f0c9a5", C.skinDark, "#d9a57a"];
const KID_HAIRS = [C.hair, C.hairLight, "#2b1d15", "#c99a4b"];
export const kidLook = (i: number) => ({
  skin: KID_SKINS[i % KID_SKINS.length],
  hair: KID_HAIRS[(i * 3 + 1) % KID_HAIRS.length],
});
