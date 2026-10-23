import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import timeline from "./timeline.json";
import { SCENES, VereinsCard } from "./scenes";
import { K, Shot, clamp } from "./ui";

export const TOTAL_FRAMES = timeline.totalFrames;

// Die nächste Szene blendet ab dem Schnittpunkt kurz über die laufende ein.
// Mitten im Satz (07 -> 08 -> 09) harter Schnitt, damit der Bildwechsel genau auf dem Wort liegt.
const DISSOLVE = 6;
const DISSOLVE_IN_SENTENCE: Record<string, number> = { s08: 0, s09: 0 };

const FadeIn: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const o = len === 0 ? 1 : interpolate(frame, [0, len], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// Nur für die Vorschau. Die Website bekommt die WebVTT-Datei, im MP4 sind keine Untertitel.
const PreviewSubtitles: React.FC = () => {
  const t = useCurrentFrame() / timeline.fps;
  const cue = timeline.cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 }}>
      <div style={{ background: "rgba(0,0,0,0.75)", color: "#fff", fontFamily: FONT, fontSize: 44, fontWeight: 600, lineHeight: 1.25, padding: "10px 26px", borderRadius: 10, textAlign: "center", whiteSpace: "pre-line" }}>
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

export const Kurzfassung: React.FC<{ subtitles: boolean }> = ({ subtitles }) => {
  const scenes = timeline.scenes;
  return (
    <AbsoluteFill style={{ background: K.green }}>
      {scenes.map((sc, i) => {
        const Scene = SCENES[sc.id];
        const last = i === scenes.length - 1;
        const dur = sc.to - sc.from;
        const nextFade = last ? 0 : (DISSOLVE_IN_SENTENCE[scenes[i + 1].id] ?? DISSOLVE);
        const fadeIn = i === 0 ? 0 : (DISSOLVE_IN_SENTENCE[sc.id] ?? DISSOLVE);
        return (
          <Sequence key={sc.id} from={sc.from} durationInFrames={dur + nextFade} name={`${sc.id} ${sc.name}`}>
            <FadeIn len={fadeIn}>
              <Scene from={sc.from} dur={dur} />
            </FadeIn>
          </Sequence>
        );
      })}
      <Audio src={staticFile(timeline.audio)} />
      {subtitles && <PreviewSubtitles />}
    </AbsoluteFill>
  );
};

// Poster: Manu mit den Kindern auf dem Platz, Vereinskarte mit Wappen
export const PosterV2: React.FC = () => (
  <AbsoluteFill style={{ background: K.green }}>
    <Shot src="s06" w={794} h={397} dur={1} />
    <div style={{ position: "absolute", left: 80, top: 60 }}>
      <VereinsCard size={52} />
    </div>
  </AbsoluteFill>
);
