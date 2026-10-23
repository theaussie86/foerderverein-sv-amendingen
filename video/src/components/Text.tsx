import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

export const useSpring = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

export const fade = (frame: number, start: number, end: number, len = 10) =>
  interpolate(frame, [start, start + len, end - len, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const ease = (frame: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(frame, [from, to], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Text, der mit Feder von unten einfliegt
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + s * 0.1})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Headline: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 96,
  color = C.dark,
  style,
}) => (
  <div style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1.05, letterSpacing: -2, ...style }}>{children}</div>
);

// Zählt von a nach b, deutsch formatiert
export const countTo = (frame: number, start: number, len: number, a: number, b: number) =>
  Math.round(
    interpolate(frame, [start, start + len], [a, b], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  ).toLocaleString("de-DE");
