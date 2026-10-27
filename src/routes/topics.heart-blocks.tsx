import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { BlockLab } from "@/components/cardiolab/heart-blocks/BlockLab";
import { RhythmReader } from "@/components/cardiolab/heart-blocks/RhythmReader";
import { BlockQuiz } from "@/components/cardiolab/heart-blocks/BlockQuiz";

const TITLE = "Heart Blocks — AV Block Rhythm Lab | CardioLab";
const DESCRIPTION =
  "Step through first-degree, Mobitz I, Mobitz II, 2:1 and complete AV block on calibrated rhythm strips, then test yourself with 10 USMLE-style cases.";

export const Route = createFileRoute("/topics/heart-blocks")({
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
  component: HeartBlocksTopic,
});

const TRAPS = [
  ["Mobitz I vs Mobitz II", "Compare the PR just before and just after the pause. Lengthening then drop = Mobitz I (usually nodal). Fixed PR with sudden drop = Mobitz II (usually infranodal, higher risk)."],
  ["2:1 AV block", "With only one conducted beat between drops there is no PR trend to read. Don't force a label: narrow QRS and longer strips favor nodal, wide QRS favors infranodal — confirmation may need more data."],
  ["Complete heart block", "More P waves than QRSs, both regular, with no consistent PR. A regular escape is the clue; cannon a waves and variable S1 are bedside correlates."],
  ["Blocked PAC ≠ AV block", "A non-conducted premature P arrives early. In true AV block the dropped P is on time."],
  ["The ECG is not the whole story", "Strips suggest the level of block, but cause (ischemia, drugs, Lyme, degeneration) and exact level need clinical context — sometimes electrophysiology testing."],
];

function HeartBlocksTopic() {
  return (
    <TopicPage
      module="Cardiovascular · Electrophysiology"
      title="Heart Blocks"
      subtitle="Learn to read AV conduction from the strip: rate, rhythm, P waves, PR, QRS — then diagnosis. All tracings are original educational illustrations, not clinical diagnostic tools or medical advice."
      difficulty="Advanced"
      minutes={26}
      sections={[
        {
          id: "lab", label: "Rhythm Lab",
          content: <ContentBlock tag="mechanism" title="AV conduction rhythm lab" lede="Pick a rhythm, change the sinus rate and step P wave by P wave. Labels mark each P, PR in milliseconds and every non-conducted beat."><BlockLab /></ContentBlock>,
        },
        {
          id: "read", label: "Guided Read",
          content: <ContentBlock tag="high-yield" title="Guided rhythm reading" lede="Six stages per strip. Each correct stage unlocks the next; hints are available, and annotations appear once the strip is read."><RhythmReader /></ContentBlock>,
        },
        {
          id: "traps", label: "Traps",
          content: (
            <ContentBlock tag="usmle-trap" title="High-yield distinctions and traps">
              <div className="grid gap-3 md:grid-cols-2">
                {TRAPS.map(([t, d]) => (
                  <article key={t} className="rounded-lg border border-hairline bg-surface/60 p-4">
                    <h3 className="font-semibold text-foreground">{t}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{d}</p>
                  </article>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "quiz", label: "Quiz Bank",
          content: <ContentBlock tag="classic-presentation" title="Quiz bank: 10 original cases" lede="Single best answer. Each explanation walks through the ECG clues and why the other choices are less likely."><BlockQuiz /></ContentBlock>,
        },
        {
          id: "related", label: "Related",
          content: (
            <ContentBlock tag="differential" title="Keep going">
              <div className="flex flex-wrap gap-3">
                <Link to="/topics/ecg-patterns" className="rounded-md border border-hairline px-4 py-3 text-[13.5px] text-foreground hover:border-cyan">ECG Patterns</Link>
                <Link to="/topics/cardiac-cycle" className="rounded-md border border-hairline px-4 py-3 text-[13.5px] text-foreground hover:border-cyan">Cardiac Cycle</Link>
              </div>
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
