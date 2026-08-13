import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { ActiveRecall } from "@/components/cardiolab/topic/ActiveRecall";
import { CardiacCycleLab } from "@/components/cardiolab/interactive/CardiacCycleLab";
import { TaxonomyBadge } from "@/components/cardiolab/TaxonomyBadge";

const TITLE = "Cardiac Cycle — Interactive Wiggers Diagram | CardioLab";
const DESCRIPTION =
  "Scrub through all seven phases of the cardiac cycle: ECG, atrial, ventricular and aortic pressure, ventricular volume, valve timing and heart sounds — synchronized and interactive.";

export const Route = createFileRoute("/topics/cardiac-cycle")({
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
  component: CardiacCycleTopic,
});

const HIGH_YIELD = [
  "Systole and diastole are defined by ventricular events, not by the ECG.",
  "All four valves are closed twice per cycle: isovolumetric contraction and isovolumetric relaxation.",
  "S1 = AV valve closure (start of systole). S2 = semilunar valve closure (start of diastole).",
  "Stroke volume = EDV − ESV ≈ 120 − 50 = 70 mL; ejection fraction ≈ 55–70%.",
  "About 80% of ventricular filling is passive; the atrial kick supplies the last 10–20%.",
  "Tachycardia shortens diastole first, compromising filling and coronary perfusion.",
];

function CardiacCycleTopic() {
  return (
    <TopicPage
      module="Cardiovascular · Physiology"
      title="Cardiac Cycle"
      subtitle="One heartbeat, seven mechanical phases. Follow pressure, volume, valve motion, electrical activity and heart sounds on a single synchronized timeline — then read the clinical consequence of each."
      difficulty="Foundational"
      minutes={24}
      sections={[
        {
          id: "high-yield",
          label: "High-yield summary",
          content: (
            <ContentBlock
              id="high-yield"
              tag="high-yield"
              title="What you must know"
              lede="The six statements examiners return to again and again."
            >
              <ul className="grid gap-3 md:grid-cols-2">
                {HIGH_YIELD.map((line) => (
                  <li
                    key={line}
                    className="glass-panel flex gap-3 rounded-lg p-4 text-[13.5px] leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    {line}
                  </li>
                ))}
              </ul>
            </ContentBlock>
          ),
        },
        {
          id: "visualization",
          label: "Interactive visualization",
          content: (
            <ContentBlock
              id="visualization"
              tag="mechanism"
              title="Interactive Wiggers diagram"
              lede="Play the cycle, pause anywhere, or drag across the chart to scrub. Select a phase to read its pressure, volume, valve and sound relationships; click a valve to see what opens and closes it."
            >
              <CardiacCycleLab />
            </ContentBlock>
          ),
        },
        {
          id: "mechanism",
          label: "Mechanism",
          content: (
            <ContentBlock
              id="mechanism"
              tag="mechanism"
              title="Why the cycle behaves this way"
              lede="Every valve event is a pressure-gradient event. Nothing in the cycle is scheduled — valves are passive and respond only to the pressure across them."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    h: "Valves are passive",
                    b: "A valve opens when the pressure behind it exceeds the pressure in front of it, and closes when the gradient reverses. Timing changes whenever pressures change — that is the entire logic of valvular disease.",
                  },
                  {
                    h: "Isovolumetric means no flow",
                    b: "With inflow and outflow valves both shut, the ventricle changes pressure without changing volume. The steepness of that pressure change (dP/dt) is a pure index of contractility.",
                  },
                  {
                    h: "Filling is mostly passive",
                    b: "Ventricular relaxation is active and ATP-dependent; the resulting low pressure sucks blood in. When relaxation fails, filling pressures rise and diastolic dysfunction follows.",
                  },
                ].map((c) => (
                  <div key={c.h} className="glass-panel rounded-xl p-5">
                    <h3 className="font-display text-[15px] text-foreground">{c.h}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{c.b}</p>
                  </div>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "clinical",
          label: "Clinical presentation",
          content: (
            <ContentBlock
              id="clinical"
              tag="classic-presentation"
              title="At the bedside"
              lede="What the cycle sounds and feels like when it goes wrong."
            >
              <div className="space-y-3">
                {[
                  {
                    h: "New-onset atrial fibrillation in mitral stenosis",
                    b: "Loss of the atrial kick removes the last 20% of filling across an already narrowed valve. Cardiac output falls abruptly and pulmonary oedema can follow within hours.",
                  },
                  {
                    h: "S3 gallop in decompensated heart failure",
                    b: "A dilated, volume-overloaded ventricle decelerates rapid filling abruptly, producing a low-pitched sound in early diastole — heard best at the apex with the bell in the left lateral position.",
                  },
                  {
                    h: "S4 in long-standing hypertension",
                    b: "A hypertrophied, stiff ventricle resists the atrial kick, producing a presystolic sound. It cannot exist in atrial fibrillation, because there is no organized atrial contraction.",
                  },
                ].map((c) => (
                  <div key={c.h} className="glass-panel rounded-xl border-l-2 border-l-emerald p-5">
                    <h3 className="font-display text-[15px] text-foreground">{c.h}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{c.b}</p>
                  </div>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "diagnostic",
          label: "Diagnostic interpretation",
          content: (
            <ContentBlock
              id="diagnostic"
              tag="differential"
              title="Reading the tracings"
              lede="How each recording maps back onto the same seven phases."
            >
              <div className="glass-panel overflow-hidden rounded-xl">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border/60 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Finding</th>
                      <th className="px-4 py-3">Where in the cycle</th>
                      <th className="px-4 py-3">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ["a wave (JVP / atrial trace)", "Atrial systole", "Atrial contraction against the ventricle; giant a waves in tricuspid stenosis or AV dissociation"],
                      ["c wave", "Isovolumetric contraction", "Bulging of the closed AV valve into the atrium"],
                      ["v wave", "Late systole", "Atrial filling against a closed AV valve; large in tricuspid or mitral regurgitation"],
                      ["Dicrotic notch", "Onset of isovolumetric relaxation", "Aortic valve closure and elastic recoil of the aorta"],
                      ["Wide pulse pressure", "Ejection + diastole", "Aortic regurgitation or increased stroke volume"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-cyan">{row[1]}</td>
                        <td className="px-4 py-3">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "usmle",
          label: "USMLE associations",
          content: (
            <ContentBlock
              id="usmle"
              tag="usmle-trap"
              title="Where candidates lose the point"
              lede="Reliable traps built on the same physiology."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["\u201cSystole starts at the QRS\u201d", "Electrical events precede mechanical events. Mechanical systole begins with mitral closure and S1, shortly after the QRS."],
                  ["Confusing EDV with preload", "Preload is end-diastolic sarcomere stretch; EDV is its usual surrogate but not identical, especially when compliance changes."],
                  ["Assuming flow follows the gradient exactly", "During reduced ejection, blood still leaves the ventricle although ventricular pressure has fallen slightly below aortic pressure — momentum matters."],
                  ["Forgetting coronary perfusion timing", "The left coronary fills during diastole. Tachycardia and aortic stenosis both shorten or compromise that window."],
                ].map(([h, b]) => (
                  <div key={h} className="glass-panel rounded-xl border-l-2 border-l-oxblood p-5">
                    <h3 className="font-display text-[14.5px] text-foreground">{h}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{b}</p>
                  </div>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "related",
          label: "Related concepts",
          content: (
            <ContentBlock
              id="related"
              tag="clinical-pearl"
              title="Where this leads next"
              lede="Concepts that build directly on the cardiac cycle. These lessons are being authored — they are listed here as the curriculum map, not as live links."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Pressure–volume loop", "The same cycle re-plotted as work"],
                  ["Starling curve", "How preload changes stroke volume"],
                  ["Heart murmurs", "Timing a murmur inside the cycle"],
                  ["Heart blocks", "When the electrical trigger fails"],
                  ["Heart failure", "Systolic vs diastolic failure of the cycle"],
                  ["Valvular disease", "What altered gradients do to valve timing"],
                ].map(([h, b]) => (
                  <div
                    key={h}
                    className="rounded-xl border border-dashed border-hairline p-4"
                    aria-disabled
                  >
                    <p className="text-[14px] font-medium text-foreground">{h}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{b}</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      In development
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[13px] text-muted-foreground">
                <Link to="/" className="text-cyan underline-offset-4 hover:underline">
                  Return to the cardiovascular module
                </Link>
              </p>
            </ContentBlock>
          ),
        },
        {
          id: "recall",
          label: "Active recall",
          content: (
            <ContentBlock
              id="recall"
              tag="high-yield"
              title="Active recall"
              lede="Answer before revealing. Retrieval, not rereading, is what consolidates this material."
            >
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <TaxonomyBadge kind="high-yield" />
                <span className="font-mono text-[11px] text-muted-foreground">
                  6 questions · untimed
                </span>
              </div>
              <ActiveRecall
                items={[
                  {
                    q: "During which two phases are all four cardiac valves closed?",
                    a: "Isovolumetric contraction and isovolumetric relaxation — ventricular pressure changes without any change in volume.",
                  },
                  {
                    q: "What event generates S1, and where does it sit relative to the QRS complex?",
                    a: "Closure of the mitral and tricuspid valves at the onset of isovolumetric contraction, just after the QRS complex.",
                  },
                  {
                    q: "A patient with LVH develops atrial fibrillation and decompensates. Which phase was lost?",
                    a: "Atrial systole — the atrial kick, which supplies 10–20% of end-diastolic volume and matters most when the ventricle is stiff.",
                  },
                  {
                    q: "What produces the dicrotic notch on the aortic pressure tracing?",
                    a: "Aortic valve closure at the start of isovolumetric relaxation, with brief backflow and elastic recoil of the aortic root.",
                  },
                  {
                    q: "Why does tachycardia reduce stroke volume more than it reduces ejection time?",
                    a: "Diastole shortens disproportionately — diastasis is lost first — so ventricular filling and end-diastolic volume fall.",
                  },
                  {
                    q: "Which measurement in the cycle best reflects contractility, independent of afterload?",
                    a: "The maximal rate of pressure rise (dP/dt max) during isovolumetric contraction.",
                  },
                ]}
              />
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
