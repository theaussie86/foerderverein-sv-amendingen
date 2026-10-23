import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline.json";
import { FONT } from "../theme";

export const FPS = timeline.fps;
export type BeatName = keyof typeof timeline.beats;

// Farben aus dem Storyboard (Grün und Gelb des Vereins)
export const K = {
  green: "#1c6328",
  greenMid: "#2a7a34",
  greenText: "#14501f",
  yellow: "#f7c52b",
  cream: "#fbf8f0",
  ink: "#16221a",
  white: "#ffffff",
};

/** Frame eines Beats relativ zum Szenenstart. */
export const beatFrame = (beat: BeatName, sceneFrom: number) => Math.round(timeline.beats[beat] * FPS) - sceneFrom;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 mit leichter Feder ab `at`. */
export const useAppear = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping: 20, stiffness: 160 }, durationInFrames: 14 });
};

/** Element blendet ab `at` ein und rutscht dabei 24 px nach oben. */
export const Reveal: React.FC<{ at: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  at,
  style,
  children,
}) => {
  const p = useAppear(at);
  return (
    <div style={{ ...style, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>{children}</div>
  );
};

/** Beschriftung als Etikett, wie im Storyboard. */
export const Tag: React.FC<{
  tone?: "yellow" | "white" | "green";
  size?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ tone = "white", size = 64, style, children }) => {
  const bg = tone === "yellow" ? K.yellow : tone === "green" ? K.green : K.cream;
  const fg = tone === "green" ? K.white : K.greenText;
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        fontFamily: FONT,
        fontWeight: 850,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: "-0.01em",
        padding: `${size * 0.2}px ${size * 0.38}px`,
        borderRadius: size * 0.26,
        boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Wappen: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("wappen.svg")} style={{ height, width: (height * 2280) / 1830, ...style }} />
);

/**
 * Ein Storyboard-Panel bildfüllend (cover). Kinder werden in Panel-Pixeln positioniert,
 * damit Overlays exakt auf der Illustration sitzen.
 * fx/fy: Ausschnitt 0 = links/oben bündig, 1 = rechts/unten bündig.
 * push: Zoomzuwachs über die Szene (0.03 = 3 %), 0 = ruhige Einstellung.
 */
export const Shot: React.FC<{
  src: string;
  w: number;
  h: number;
  dur: number;
  zoom?: number;
  push?: number;
  fx?: number;
  fy?: number;
  children?: React.ReactNode;
}> = ({ src, w, h, dur, zoom = 1, push = 0, fx = 0.5, fy = 0.5, children }) => {
  const frame = useCurrentFrame();
  const z = zoom * (1 + push * interpolate(frame, [0, dur], [0, 1], clamp));
  const s = Math.max(1920 / w, 1080 / h) * z;
  const left = (w - 1920 / s) * fx;
  const top = (h - 1080 / s) * fy;
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        transformOrigin: "0 0",
        transform: `scale(${s}) translate(${-left}px, ${-top}px)`,
      }}
    >
      <Img src={staticFile(`v2/scenes/${src}.webp`)} style={{ position: "absolute", width: w, height: h }} />
      {children}
    </div>
  );
};

/** Absolut positionierter Block in Panel- oder Bildschirmkoordinaten. */
export const At: React.FC<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  style,
  children,
}) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>;
