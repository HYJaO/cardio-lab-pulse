import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { ActiveRecall } from "@/components/cardiolab/topic/ActiveRecall";
import { Checkpoint, type CheckpointQuestion } from "@/components/cardiolab/topic/Checkpoint";
import { FailureHemodynamicsLab } from "@/components/cardiolab/interactive/FailureHemodynamicsLab";
import { CongestionCompare } from "@/components/cardiolab/interactive/CongestionCompare";
import { CompensationSequence } from "@/components/cardiolab/interactive/CompensationSequence";

const TITLE = "Heart Failure — Interactive Hemodynamics Lab | CardioLab";
const DESCRIPTION =
  "Learn heart failure by driving it: switch between Normal, HFrEF and HFpEF and watch EF, EDV/ESV, stroke volume and filling pressure move, then trace congestion, compensation and the high-yield pharmacology.";

export const Route = createFileRoute("/topics/heart-failure")({
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
  component: HeartFailureTopic,
});

const OBJECTIVES = [
  "Define heart failure as a syndrome of inadequate forward output and/or elevated filling pressures — not simply a low ejection fraction.",
  "Predict how impaired contractility versus impaired compliance move the pressure–volume loop, EF, EDV/ESV, stroke volume and LVEDP.",
  "Trace elevated upstream pressure to the specific bedside sign it produces on the left and on the right.",
  "Explain why each neurohormonal compensation helps acutely and harms chronically.",
  "Separate HFrEF (LVEF ≤ 40%), HFmrEF (41–49%) and HFpEF (≥ 50% plus evidence of raised filling pressures).",
];

const CORE_CHAIN: [string, string][] = [
  [
    "Reduced pump performance or impaired filling",
    "Either the ventricle cannot generate enough force to eject (systolic dysfunction) or it cannot accept volume at a low pressure (diastolic dysfunction).",
  ],
  [
    "Stroke volume falls · end-diastolic pressure rises",
    "Both lesions converge on the same two consequences: less blood leaves per beat, and the pressure the ventricle needs at end-diastole climbs.",
  ],
  [
    "Forward failure + backward congestion",
    "Low forward flow underperfuses muscle, kidney and brain; the high end-diastolic pressure is transmitted upstream to the atrium and its venous bed.",
  ],
  [
    "Neurohormonal compensation switches on",
    "Sympathetic drive, RAAS and ADH defend blood pressure and preload — and, sustained, raise preload and afterload further.",
  ],
  [
    "Symptoms and signs",
    "Fatigue and exertional intolerance from low output; dyspnea, orthopnea and crackles from pulmonary venous congestion; raised JVP, edema and hepatic congestion from systemic venous congestion.",
  ],
];

const COMPARISON: [string, string, string][] = [
  ["Primary defect", "Impaired contractility (flat ESPVR)", "Impaired relaxation and compliance (steep EDPVR)"],
  ["Ejection fraction", "≤ 40% (HFmrEF 41–49%)", "≥ 50%, plus objective evidence of raised filling pressures"],
  ["Ventricular geometry", "Eccentric hypertrophy, dilated chamber", "Concentric hypertrophy, small stiff cavity"],
  ["EDV / ESV", "Both high; ESV rises out of proportion", "EDV low-normal; ESV low"],
  ["Stroke volume", "Reduced despite a large EDV", "Reduced because the ventricle cannot fill"],
  ["Filling pressure (LVEDP)", "Elevated", "Elevated — often markedly, at a small volume"],
  ["Typical drivers", "Post-MI systolic failure, dilated cardiomyopathy, chronic volume overload", "Hypertensive LVH, aging, restrictive and hypertrophic cardiomyopathy"],
  ["Auscultation", "S3 gallop", "S4 gallop"],
];

const PHARM: [string, string][] = [
  [
    "ARNI / ACE inhibitor / ARB",
    "Interrupt RAAS-driven afterload, sodium retention and fibrotic remodeling. One agent from this axis is foundational therapy in HFrEF.",
  ],
  [
    "Evidence-based beta blocker",
    "Blunt chronic catecholamine toxicity, lower heart rate and oxygen demand and allow reverse remodeling. Only specific agents are supported in HFrEF, and they are started when the patient is not acutely congested.",
  ],
  [
    "Mineralocorticoid receptor antagonist",
    "Oppose aldosterone-driven sodium retention and myocardial fibrosis. Potassium and renal function are the monitoring concerns.",
  ],
  [
    "SGLT2 inhibitor",
    "Fourth foundational class in HFrEF, with benefit independent of diabetes status.",
  ],
  [
    "Loop diuretic",
    "Relieves congestion — the symptom axis. It reduces preload and filling pressure, which is not the same as improving contractility.",
  ],
];

const TRAPS: [string, string][] = [
  [
    "Preload reduction ≠ improved contractility",
    "A diuretic or nitrate moves the ventricle down its filling curve: LVEDP falls and the patient breathes more easily, but the ESPVR — the contractility line — is untouched. Symptom relief is not inotropy.",
  ],
  [
    "Preserved EF ≠ absence of heart failure",
    "In HFpEF, EDV and stroke volume fall together, so their ratio stays normal while filling pressures are high. The diagnosis requires EF ≥ 50% plus objective evidence of raised filling pressures.",
  ],
  [
    "A dilated ventricle is not a well-filling ventricle",
    "In HFrEF the chamber is large, yet end-diastolic pressure is high — volume and pressure are different axes.",
  ],
  [
    "The commonest cause of right heart failure is left heart failure",
    "Not primary lung disease. Pulmonary venous hypertension from the failing left side is transmitted through the pulmonary circulation to the right ventricle.",
  ],
];

const CHECKPOINT: CheckpointQuestion[] = [
  {
    q: "A patient has an LVEF of 60%, a small stiff ventricle and a high LVEDP with pulmonary congestion. What is the dominant defect?",
    options: [
      "Reduced contractility with a flattened ESPVR",
      "Reduced diastolic compliance with an upward-shifted EDPVR",
      "Chronic volume overload with eccentric dilation",
      "Reduced afterload with a widened pulse pressure",
    ],
    answer: 1,
    explanation:
      "This is HFpEF. Contractility is preserved, so the ESPVR is steep and EF is normal, but a stiff ventricle sits high on the EDPVR: the same volume generates a much higher end-diastolic pressure, which is transmitted to the pulmonary veins. EF is a ratio — with EDV and SV both reduced, it stays normal while the patient is genuinely in heart failure.",
  },
  {
    q: "Why does chronic RAAS activation ultimately worsen heart failure despite defending blood pressure acutely?",
    options: [
      "It lowers preload below the level needed for Frank–Starling reserve",
      "It steepens the ESPVR and increases stroke work indefinitely",
      "It raises both preload and afterload and drives fibrotic remodeling",
      "It causes a free-water diuresis and hypernatremia",
    ],
    answer: 2,
    explanation:
      "Angiotensin II vasoconstricts (↑ afterload) while aldosterone retains salt and water (↑ preload), and both drive interstitial fibrosis and remodeling. A ventricle already on the flat part of its function curve gains no output from added preload — only higher filling pressure and congestion. That is exactly why ARNI/ACEi/ARB and mineralocorticoid receptor antagonists are foundational in HFrEF.",
  },
  {
    q: "A patient with heart failure has an elevated JVP, dependent peripheral edema, hepatomegaly and ascites, without crackles. Which pressure is primarily elevated?",
    options: [
      "Pulmonary capillary hydrostatic pressure",
      "Left atrial pressure",
      "Systemic arterial pressure",
      "Right atrial and systemic venous pressure",
    ],
    answer: 3,
    explanation:
      "These are the signs of systemic venous congestion from right-sided failure: raised RVEDP is transmitted to the right atrium and the systemic veins. The jugular column is the bedside manometer for right atrial pressure, and the same hydrostatic pressure drives dependent edema and hepatic/peritoneal congestion. Pulmonary findings such as crackles, orthopnea and PND would point to raised left-sided (pulmonary venous) pressures instead.",
  },
];

const RECALL = [
  {
    q: "State the two hemodynamic consequences that define the heart-failure syndrome.",
    a: "Inadequate forward output (fatigue, exertional intolerance, hypoperfusion) and elevated upstream filling pressures (congestion). Both systolic and diastolic dysfunction converge on this pair.",
  },
  {
    q: "In HFrEF, why does EF fall even though EDV rises?",
    a: "A flattened ESPVR means ESV rises out of proportion to the compensatory gain in EDV. EF = (EDV − ESV) / EDV, so a disproportionately large ESV drives the ratio down.",
  },
  {
    q: "Why is dilutional hyponatremia a marker of severity in heart failure?",
    a: "Non-osmotic, baroreceptor-mediated ADH release retains free water out of proportion to sodium. The greater the perceived underfilling, the greater the ADH drive — so a lower sodium tracks with more severe neurohormonal activation.",
  },
  {
    q: "Which four drug classes are foundational in HFrEF, and what does a loop diuretic add?",
    a: "ARNI/ACEi/ARB, an evidence-based beta blocker, a mineralocorticoid receptor antagonist and an SGLT2 inhibitor. A loop diuretic relieves congestion — it treats the filling pressure, not the contractility.",
  },
  {
    q: "Give the current EF classification bands.",
    a: "HFrEF LVEF ≤ 40%; HFmrEF 41–49%; HFpEF ≥ 50%. For HFmrEF and HFpEF the diagnosis also requires objective evidence of increased filling pressures.",
  },
  {
    q: "How does Laplace's law explain compensatory hypertrophy?",
    a: "Wall stress ∝ (pressure × radius) ÷ (2 × wall thickness). Thickening the wall reduces stress acutely, which is protective — but concentric hypertrophy stiffens the ventricle and eccentric dilation raises radius, so both end in worse mechanics.",
  },
];

function HeartFailureTopic() {
  return (
    <TopicPage
      module="Cardiovascular · Pathophysiology"
      title="Heart Failure"
      subtitle="A syndrome in which the ventricle cannot deliver enough forward output, or can only do so at an elevated filling pressure. Drive the hemodynamics lab to see how impaired contractility and impaired compliance produce the same congestion by different routes."
      difficulty="Intermediate"
      minutes={32}
      sections={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <ContentBlock
              tag="high-yield"
              title="What heart failure actually is"
              lede="Heart failure is a clinical syndrome, not a number. The ventricle either cannot eject enough or cannot fill at a normal pressure — and in both cases forward flow falls while upstream pressure rises."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <article className="glass-panel rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold text-foreground">Learning objectives</h3>
                  <ul className="mt-3 space-y-2">
                    {OBJECTIVES.map((o) => (
                      <li
                        key={o}
                        className="flex gap-3 text-[13.5px] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="glass-panel rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold text-foreground">
                    Classification you are expected to know
                  </h3>
                  <dl className="mt-3 space-y-3 text-[13.5px] leading-relaxed">
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                        HFrEF
                      </dt>
                      <dd className="text-muted-foreground">
                        LVEF ≤ 40%. Reduced ejection fraction from impaired contractility.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                        HFmrEF
                      </dt>
                      <dd className="text-muted-foreground">
                        LVEF 41–49%, with evidence of increased filling pressures.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                        HFpEF
                      </dt>
                      <dd className="text-muted-foreground">
                        LVEF ≥ 50%, again requiring objective evidence of increased filling
                        pressures. Preserved EF does not mean preserved cardiac function.
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 border-t border-border/50 pt-3 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                    Educational content for exam preparation. Not personal medical advice; no dosing
                    or treatment guidance.
                  </p>
                </article>
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "core-problem",
          label: "The Core Problem",
          content: (
            <ContentBlock
              tag="mechanism"
              title="The core problem, as a causal chain"
              lede="Read it top to bottom: one lesion, two hemodynamic consequences, one compensation loop, and the symptoms that follow."
            >
              <ol className="space-y-3">
                {CORE_CHAIN.map(([head, body], i) => (
                  <li key={head} className="glass-panel rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 font-mono text-[11px] text-cyan">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-foreground">{head}</h3>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </ContentBlock>
          ),
        },
        {
          id: "lab",
          label: "Hemodynamics Lab",
          content: (
            <ContentBlock
              tag="mechanism"
              title="Failure hemodynamics lab"
              lede="Switch between Normal, HFrEF and HFpEF. The pressure–volume loop, the ESPVR/EDPVR relations and the derived clinical panel all recompute together, with the normal loop retained as a ghost for comparison. Values are illustrative teaching values — the directions are what matter."
            >
              <FailureHemodynamicsLab />
            </ContentBlock>
          ),
        },
        {
          id: "congestion",
          label: "Left vs Right",
          content: (
            <ContentBlock
              tag="classic-presentation"
              title="Left versus right congestion"
              lede="Select a side to trace the elevated upstream pressure to each high-yield sign it produces."
            >
              <CongestionCompare />
            </ContentBlock>
          ),
        },
        {
          id: "compensation",
          label: "Compensation",
          content: (
            <ContentBlock
              tag="mechanism"
              title="Compensation: helps now, harms later"
              lede="Step through the neurohormonal cascade. Each stage shows the acute benefit alongside the chronic cost — the split that explains modern heart-failure pharmacology."
            >
              <CompensationSequence />
            </ContentBlock>
          ),
        },
        {
          id: "comparison",
          label: "HFrEF vs HFpEF",
          content: (
            <ContentBlock
              tag="differential"
              title="HFrEF versus HFpEF"
              lede="Two different lesions producing the same syndrome. Preserved EF means the ratio is normal, not that the ventricle is."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-3 pr-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                        Feature
                      </th>
                      <th className="py-3 pr-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cyan">
                        HFrEF — systolic
                      </th>
                      <th className="py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-teal">
                        HFpEF — diastolic
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(([feature, a, b]) => (
                      <tr key={feature} className="border-b border-border/40 align-top">
                        <td className="py-3 pr-4 text-[13px] font-medium text-foreground">
                          {feature}
                        </td>
                        <td className="py-3 pr-4 text-[13px] leading-relaxed text-muted-foreground">
                          {a}
                        </td>
                        <td className="py-3 text-[13px] leading-relaxed text-muted-foreground">
                          {b}
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
          label: "Clinical Reasoning",
          content: (
            <ContentBlock
              tag="clinical-pearl"
              title="High-yield clinical reasoning"
              lede="Mechanism-first pharmacology, the decompensation pattern, and the traps that cost points."
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
                    HFrEF pharmacology — four foundational classes
                  </h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {PHARM.map(([name, body]) => (
                      <article key={name} className="glass-panel rounded-xl p-4">
                        <h4 className="text-[14.5px] font-semibold text-foreground">{name}</h4>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
                    Acute decompensation — the volume-overload pattern
                  </h3>
                  <article className="glass-panel mt-3 rounded-xl p-4 md:p-5">
                    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                      A congestive trigger — dietary sodium, non-adherence, arrhythmia such as new
                      atrial fibrillation, ischemia, uncontrolled hypertension or an added
                      negative-inotropic burden — pushes the ventricle further up its filling curve.
                      Filling pressure rises acutely, so the patient presents with worsening dyspnea
                      and orthopnea, rapid weight gain, rising JVP, crackles and worsening
                      peripheral edema. Because the ventricle is already on the flat part of the
                      function curve, the extra preload buys no additional output — it converts
                      directly into congestion. Management concepts at this level are congestion
                      relief (preload reduction) plus identification and correction of the trigger.
                    </p>
                  </article>
                </div>

                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-oxblood">
                    USMLE traps
                  </h3>
                  <div className="mt-3 space-y-3">
                    {TRAPS.map(([name, body]) => (
                      <article key={name} className="glass-panel rounded-xl p-4 md:p-5">
                        <h4 className="text-[14.5px] font-semibold text-foreground">{name}</h4>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "checkpoint",
          label: "Checkpoint",
          content: (
            <ContentBlock
              tag="usmle-trap"
              title="Concept checkpoint"
              lede="Three questions. Commit to an answer before you look — the explanation is the point."
            >
              <Checkpoint questions={CHECKPOINT} />
            </ContentBlock>
          ),
        },
        {
          id: "recall",
          label: "Active Recall",
          content: (
            <ContentBlock
              tag="high-yield"
              title="Active recall"
              lede="Answer out loud before revealing. Retrieval, not recognition."
            >
              <ActiveRecall items={RECALL} />
              <div className="glass-panel mt-6 rounded-xl p-5">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
                  Related labs
                </h3>
                <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  <li>
                    <Link
                      to="/topics/pv-loops"
                      className="text-cyan underline-offset-4 hover:underline"
                    >
                      Pressure–volume loops
                    </Link>{" "}
                    — drive preload, afterload and contractility on a healthy ventricle first.
                  </li>
                  <li>
                    <Link
                      to="/topics/cardiac-cycle"
                      className="text-cyan underline-offset-4 hover:underline"
                    >
                      Cardiac cycle / Wiggers
                    </Link>{" "}
                    — where S3, S4 and the filling pressures sit on the timeline.
                  </li>
                  <li>
                    <Link
                      to="/topics/atherosclerosis"
                      className="text-cyan underline-offset-4 hover:underline"
                    >
                      Atherosclerosis
                    </Link>{" "}
                    — the ischemic route into post-infarct systolic failure.
                  </li>
                </ul>
              </div>
              <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                CardioLab is educational material for exam preparation and is not personal medical
                advice.
              </p>
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
