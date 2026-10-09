import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { Checkpoint, type CheckpointQuestion } from "@/components/cardiolab/topic/Checkpoint";
import { MurmurTimingLab } from "@/components/cardiolab/interactive/MurmurTimingLab";
import { AuscultationMap } from "@/components/cardiolab/interactive/AuscultationMap";
import { ManeuverEngine } from "@/components/cardiolab/interactive/ManeuverEngine";
import { MURMURS, type MurmurId } from "@/lib/murmurs";

const TITLE = "Heart Murmurs — Interactive Auscultation Lab | CardioLab";
const DESCRIPTION =
  "Reason through murmurs by timing, location, contour, radiation and maneuvers: a synchronized phonocardiogram, chest auscultation map and maneuver engine for USMLE Step 1.";

export const Route = createFileRoute("/topics/heart-murmurs")({
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
  component: HeartMurmursTopic,
});

const OBJECTIVES = [
  "Place any murmur in systole or diastole relative to S1 and S2, and name its contour.",
  "Localize the lesion from the best auscultation site and radiation.",
  "Predict how preload, afterload and venous-return maneuvers change each murmur — including the HCM and MVP exceptions.",
  "Recognize that every diastolic murmur is pathologic.",
];

const CHECKPOINT: CheckpointQuestion[] = [
  {
    q: "Why does the HCM murmur get louder during Valsalva while the AS murmur gets softer?",
    options: [
      "Valsalva increases afterload, which increases the HCM gradient",
      "Less preload shrinks the LV cavity, worsening dynamic outflow obstruction in HCM, while less flow across a fixed AS valve lowers its murmur",
      "Valsalva increases right-sided venous return",
      "Valsalva stiffens the aortic valve",
    ],
    answer: 1,
    explanation:
      "AS is a fixed obstruction: murmur intensity tracks flow, so less preload means less flow and a softer murmur. HCM is dynamic: a smaller LV brings the septum and mitral leaflet closer, narrowing the outflow tract and increasing turbulence.",
  },
  {
    q: "A holosystolic apical murmur radiating to the axilla becomes louder with sustained handgrip. Why?",
    options: [
      "Handgrip raises afterload, so more LV blood regurgitates into the low-pressure LA",
      "Handgrip increases preload by squeezing veins",
      "Handgrip lowers heart rate, lengthening systole",
      "Handgrip increases right ventricular filling",
    ],
    answer: 0,
    explanation:
      "This is MR. Higher systemic resistance makes forward ejection harder, so a larger fraction of each stroke goes backward — regurgitant murmurs (MR, AR) and VSD intensify, while AS and HCM soften.",
  },
  {
    q: "A holosystolic murmur at the left lower sternal border increases with inspiration. Which mechanism best explains this?",
    options: [
      "Inspiration increases LV afterload",
      "Negative intrathoracic pressure increases venous return to the right heart, increasing tricuspid regurgitant flow",
      "Inspiration closes the pulmonic valve earlier",
      "Inspiration reduces RV preload",
    ],
    answer: 1,
    explanation:
      "Inspiration augments right-sided filling, so right-sided murmurs such as TR get louder (Carvallo sign). Left-sided murmurs typically do not, which helps localize the lesion.",
  },
];

function HeartMurmursTopic() {
  const [id, setId] = useState<MurmurId>("as");
  const lesions = MURMURS.filter((m) => m.id !== "normal");

  return (
    <TopicPage
      module="Cardiovascular · Physical exam"
      title="Heart Murmurs"
      subtitle="Reason from timing, location, contour, radiation and maneuvers instead of memorizing a chart. Simplified, original teaching visuals for exam preparation — not personal medical advice or a substitute for clinical assessment, which often requires echocardiography."
      difficulty="Advanced"
      minutes={30}
      sections={[
        {
          id: "objectives",
          label: "Objectives",
          content: (
            <ContentBlock tag="high-yield" title="Learning objectives">
              <ul className="space-y-2 text-[14.5px] leading-relaxed text-muted-foreground">
                {OBJECTIVES.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="text-cyan">→</span>
                    {o}
                  </li>
                ))}
              </ul>
            </ContentBlock>
          ),
        },
        {
          id: "timing",
          label: "Timing Lab",
          content: (
            <ContentBlock tag="mechanism" title="Murmur timing lab" lede="Select a lesion, then play, scrub or jump to a phase to see where the murmur sits between S1 and S2.">
              <MurmurTimingLab value={id} onChange={setId} />
            </ContentBlock>
          ),
        },
        {
          id: "map",
          label: "Auscultation Map",
          content: (
            <ContentBlock tag="classic-presentation" title="Chest auscultation map" lede="The selected murmur's best site and radiation light up. Select any landmark to see which lesions live there.">
              <AuscultationMap value={id} onChange={setId} />
            </ContentBlock>
          ),
        },
        {
          id: "maneuvers",
          label: "Maneuver Engine",
          content: (
            <ContentBlock tag="usmle-trap" title="Maneuver engine" lede="Change preload, afterload or right-sided venous return and compare the response across every murmur.">
              <ManeuverEngine value={id} onChange={setId} />
            </ContentBlock>
          ),
        },
        {
          id: "patterns",
          label: "Pattern Matcher",
          content: (
            <ContentBlock tag="differential" title="Pattern matcher" lede="Select a row to load it into the labs. Diastolic murmurs are always pathologic.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[12.5px]">
                  <thead className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                    <tr>
                      {["Lesion", "Phase", "Contour", "Best site", "Radiation", "Maneuver clue"].map((h) => (
                        <th key={h} className="border-b border-border p-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lesions.map((m) => (
                      <tr key={m.id} className={`border-b border-border/50 ${m.id === id ? "bg-cyan/5" : ""}`}>
                        <td className="p-2">
                          <button type="button" onClick={() => m.inLab && setId(m.id)} className="font-semibold text-foreground hover:text-cyan">
                            {m.name}
                          </button>
                        </td>
                        <td className={`p-2 font-mono ${m.phase === "diastolic" ? "text-crimson" : "text-muted-foreground"}`}>
                          {m.phase === "diastolic" ? "Diastolic · pathologic" : "Systolic"}
                        </td>
                        <td className="p-2 text-muted-foreground">{m.contour}</td>
                        <td className="p-2 text-muted-foreground">{m.siteLabel}</td>
                        <td className="p-2 text-muted-foreground">{m.radiation}</td>
                        <td className="p-2 text-muted-foreground">
                          {m.id === "hcm" || m.id === "mvp"
                            ? "↑ Valsalva/standing, ↓ squat"
                            : m.id === "tr"
                              ? "↑ inspiration"
                              : m.maneuvers.handgrip === "up"
                                ? "↑ handgrip"
                                : m.maneuvers.handgrip === "down"
                                  ? "↓ handgrip"
                                  : "↑ squat"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "clinical",
          label: "Clinical Cards",
          content: (
            <ContentBlock tag="clinical-pearl" title="High-yield clinical cards">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lesions.map((m) => (
                  <article key={m.id} className="glass-panel rounded-xl p-5">
                    <p className="font-mono text-[11px] text-cyan">{m.short}{m.id === "vsd" ? " · holosystolic differential" : ""}</p>
                    <h3 className="mt-1 text-[16px] font-semibold text-foreground">{m.name}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{m.timing}. {m.mechanism}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground">{m.association}</p>
                  </article>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "checkpoint",
          label: "Checkpoint",
          content: (
            <ContentBlock tag="usmle-trap" title="Mechanism checkpoint">
              <Checkpoint questions={CHECKPOINT} />
            </ContentBlock>
          ),
        },
        {
          id: "related",
          label: "Related",
          content: (
            <ContentBlock tag="high-yield" title="Related labs">
              <ul className="space-y-2 text-[13.5px] text-muted-foreground">
                <li><Link to="/topics/cardiac-cycle" className="text-cyan hover:underline">Cardiac cycle / Wiggers</Link> — where S1, S2 and valve events sit.</li>
                <li><Link to="/topics/pv-loops" className="text-cyan hover:underline">PV loops / Starling</Link> — preload and afterload behind every maneuver.</li>
                <li><Link to="/topics/heart-failure" className="text-cyan hover:underline">Heart failure</Link> — S3/S4 and the downstream effects of valve disease.</li>
              </ul>
              <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                Educational material for exam preparation, not personal medical advice. Descriptors follow standard teaching (e.g. the AHA Heart Valve Auscultation Guide); all visuals are original and simplified.
              </p>
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
