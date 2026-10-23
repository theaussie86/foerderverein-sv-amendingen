import React from "react";
import { Composition, Still } from "remotion";
import { SalesVideo, TOTAL_FRAMES } from "./Video";
import { FPS, H, W } from "./theme";
import { Poster } from "./Poster";

export const Root: React.FC = () => (
  <>
    <Composition
      id="SalesVideo"
      component={SalesVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ subtitles: true }}
    />
    <Still id="Poster" component={Poster} width={W} height={H} />
  </>
);
