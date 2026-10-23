import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { C, FONT, FPS } from "./theme";
import { Intro } from "./scenes/Intro";
import { Ehrenamt } from "./scenes/Ehrenamt";
import { Verein } from "./scenes/Verein";
import { Projekte } from "./scenes/Projekte";
import { Rechnung } from "./scenes/Rechnung";
import { Aufruf } from "./scenes/Aufruf";

export type Beat = { text: string; start: number; end: number }; // Frames relativ zur Szene
export type SceneProps = { dur: number; beats: Beat[] };

const SCENES: Record<string, React.FC<SceneProps>> = {
  intro: Intro,
  ehrenamt: Ehrenamt,
  verein: Verein,
  projekte: Projekte,
  rechnung: Rechnung,
  aufruf: Aufruf,
};

const f = (sec: number) => Math.round(sec * FPS);
export const TOTAL_FRAMES = f(timing.total);

const Crossfade: React.FC<{ dur: number; children: React.ReactNode; first: boolean; last: boolean }> = ({
  dur,
  children,
  first,
  last,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, first ? 1 : 8, last ? dur - 1 : dur - 4, dur], [first ? 1 : 0, 1, 1, last ? 1 : 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue = timing.scenes.flatMap((s) => s.sentences).find((c) => t >= c.start && t < c.end + 0.25);
  if (!cue) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 56 }}>
      <div
        style={{
          maxWidth: 1480,
          background: "rgba(26,26,26,0.82)",
          color: C.white,
          fontSize: 46,
          fontWeight: 600,
          lineHeight: 1.3,
          padding: "14px 30px",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

export const SalesVideo: React.FC<{ subtitles: boolean }> = ({ subtitles }) => (
  <AbsoluteFill style={{ fontFamily: FONT, background: C.cream }}>
    {timing.scenes.map((sc, i) => {
      const from = f(sc.start);
      const dur = f(sc.end) - from;
      const Scene = SCENES[sc.id];
      const beats = sc.sentences.map((b) => ({ text: b.text, start: f(b.start) - from, end: f(b.end) - from }));
      return (
        <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
          <Crossfade dur={dur} first={i === 0} last={i === timing.scenes.length - 1}>
            <Scene dur={dur} beats={beats} />
          </Crossfade>
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/voice.wav")} />
    {subtitles && <Subtitles />}
  </AbsoluteFill>
);
