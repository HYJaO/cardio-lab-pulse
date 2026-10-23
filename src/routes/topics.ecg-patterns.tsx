import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { AxisExplorer } from "@/components/cardiolab/ecg/AxisExplorer";
import { ElectrodeLab } from "@/components/cardiolab/ecg/ElectrodeLab";
import { PatternLibrary } from "@/components/cardiolab/ecg/PatternLibrary";
import { EcgQuiz } from "@/components/cardiolab/ecg/EcgQuiz";
import { EcgPaper } from "@/components/cardiolab/ecg/EcgPaper";
import { normalComplex, twelveLead } from "@/lib/ecg";

const TITLE = "ECG Patterns — Axis, Leads & High-Yield Tracings | CardioLab";
const DESCRIPTION =
  "Rotate the QRS axis, place all 10 electrodes, read calibrated ECG paper and drill high-yield USMLE patterns with a 10-case quiz.";

export const Route = createFileRoute("/topics/ecg-patterns")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EcgPatternsTopic,
});

function EcgPatternsTopic() {
  const normal = useMemo(
    () => twelveLead((l) => normalComplex(l), "Normal twelve-lead: sinus rhythm 75 per minute, PR 160 ms, narrow QRS, axis +60 degrees."),
    [],
  );
  return (
    <TopicPage
      module="Cardiovascular · Electrophysiology"
      title="ECG Patterns"
      subtitle="Read rate, rhythm, axis, intervals, morphology and lead distribution in order. All tracings are original educational illustrations, not real-patient diagnostics."
      difficulty="Intermediate"
      minutes={40}
      sections={[
        {
          id: "paper",
          label: "ECG Paper",
          content: (
            <ContentBlock tag="high-yield" title="Calibrated ECG paper" lede="1 small box = 1 mm = 0.04 s; 1 large box = 5 mm = 0.2 s; the 10-mm calibration pulse = 1 mV. Rate ≈ 300 ÷ large boxes between R waves.">
              <EcgPaper figure={normal} />
            </ContentBlock>
          ),
        },
        { id: "axis", label: "Axis Explorer", content: <ContentBlock tag="mechanism" title="Frontal-plane axis explorer" lede="Drag the vector, use the slider (arrow keys) or a preset. Each limb lead records the projection of the mean QRS vector onto its orientation."><AxisExplorer /></ContentBlock> },
        { id: "electrodes", label: "Electrodes", content: <ContentBlock tag="classic-presentation" title="Electrode placement lab" lede="Select any of the 10 electrodes to see its exact landmark and which leads depend on it."><ElectrodeLab /></ContentBlock> },
        { id: "library", label: "Pattern Library", content: <ContentBlock tag="differential" title="High-yield pattern library" lede="Each schematic tracing pairs the diagnostic findings with the mechanism and the most common exam trap."><PatternLibrary /></ContentBlock> },
        { id: "quiz", label: "Final Quiz", content: <ContentBlock tag="usmle-trap" title="Final quiz: 10 ECG cases" lede="One hint per case before answering. Feedback walks through the systematic read."><EcgQuiz /></ContentBlock> },
      ]}
    />
  );
}
