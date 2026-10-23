import React from "react";
import { Composition, Still } from "remotion";
import { SalesVideo, TOTAL_FRAMES } from "./Video";
import { FPS, H, W } from "./theme";
import { Poster } from "./Poster";
import { Kurzfassung, PosterV2, TOTAL_FRAMES as V2_FRAMES } from "./v2/Kurzfassung";

export const Root: React.FC = () => (
  <>
    <Composition
      id="KurzfassungV2"
      component={Kurzfassung}
      durationInFrames={V2_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ subtitles: false }}
    />
    <Still id="PosterV2" component={PosterV2} width={W} height={H} />
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
