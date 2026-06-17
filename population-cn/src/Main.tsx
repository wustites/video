import { Composition } from "remotion";
import { BarChartRace } from "./components/BarChartRace";

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="PopulationVideo"
      component={BarChartRace}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
