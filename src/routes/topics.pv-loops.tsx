import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { ActiveRecall } from "@/components/cardiolab/topic/ActiveRecall";
import { PVLoopLab } from "@/components/cardiolab/interactive/PVLoopLab";

const TITLE = "Pressure–Volume Loops — Interactive LV Lab | CardioLab";
const DESCRIPTION =
  "Drive a live left-ventricular pressure–volume loop with preload, afterload and contractility. Watch EDV, ESV, stroke volume and ejection fraction change, and compare clinical states.";

export const Route = createFileRoute("/topics/pv-loops")({
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
  component: PVLoopTopic,
});

const HIGH_YIELD = [
  "The loop runs counter-clockwise: filling → isovolumetric contraction → ejection → isovolumetric relaxation.",
  "Loop width = stroke volume (EDV − ESV). Loop area = stroke work.",
  "The right-hand vertical limb sits at EDV; the left-hand vertical limb sits at ESV.",
  "Preload ↑ → EDV ↑ → SV ↑ at unchanged ESV (Frank–Starling, within physiologic limits).",
  "Afterload ↑ → ESV ↑ → SV ↓ at unchanged EDV.",
  "Contractility ↑ steepens the ESPVR → ESV ↓ → SV ↑ and EF ↑.",
];

const DRIVERS: [string, string, string][] = [
  [
    "Preload",
    "EDV ↑ → SV ↑",
    "Preload is end-diastolic sarcomere stretch, read on the loop as the end-diastolic volume where filling meets the EDPVR compliance curve. More stretch means more actin–myosin overlap and more force: the loop widens to the right while ESV is unchanged, so stroke volume rises. Beyond the physiologic limit the failing ventricle stops gaining force and only end-diastolic pressure rises.",
  ],
  [
    "Afterload",
    "ESV ↑ → SV ↓",
    "Afterload is the wall stress the ventricle must generate to open the aortic valve and keep ejecting. Raising it lifts the top of the loop and forces ejection to stop earlier — higher on the same ESPVR line — so ESV rises and stroke volume falls at an unchanged EDV.",
  ],
  [
    "Contractility",
    "ESV ↓ → SV ↑",
    "Contractility is inotropy independent of load, and it is the slope (Emax) of the end-systolic pressure–volume relationship. A steeper ESPVR lets the ventricle eject to a smaller end-systolic volume against the same pressure: ESV falls, stroke volume and ejection fraction rise.",
  ],
  [
    "Compliance",
    "EDPVR shifts",
    "Compliance is the shape of the diastolic curve. A stiff ventricle (LVH, restrictive disease, HFpEF) shifts the EDPVR up and left: the same volume now sits at a much higher end-diastolic pressure, which is why these patients get pulmonary congestion with a normal ejection fraction.",
  ],
];

const CLINICAL_LINKS: [string, string, string][] = [
  [
    "S1 and S2",
    "→ The two vertical limbs",
    "S1 (mitral closure) opens the isovolumetric contraction limb at EDV; S2 (aortic closure) opens the isovolumetric relaxation limb at ESV. The loop corners are the heart sounds.",
  ],
  [
    "Systole and diastole",
    "→ Right limb + top vs left limb + bottom",
    "Mechanical systole is isovolumetric contraction plus ejection — the right vertical limb and the upper limb. Diastole is isovolumetric relaxation plus filling — the left vertical limb and the lower limb on the EDPVR.",
  ],
  [
    "Aortic stenosis",
    "→ Tall, narrow loop",
    "A fixed outflow obstruction is a pure afterload load: peak ventricular pressure rises well above aortic pressure, ESV rises and SV falls. Chronically the ventricle hypertrophies, shifting the EDPVR up (stiff) even while EF stays normal.",
  ],
  [
    "Systolic heart failure (HFrEF)",
    "→ Wide, short, right-shifted loop",
    "A flattened ESPVR means the ventricle empties poorly: ESV is high, SV and EF fall, and compensatory volume retention pushes EDV and end-diastolic pressure to the right and up along the EDPVR.",
  ],
  [
    "Mitral regurgitation",
    "→ No true isovolumetric contraction",
    "Because the ventricle unloads into the atrium the moment it contracts, the right vertical limb disappears: the loop starts losing volume immediately, total SV is large but forward SV is reduced.",
  ],
  [
    "Cardiac cycle / Wiggers",
    "→ Same beat, different projection",
    "Every point on the loop is one instant on the Wiggers timeline; the loop simply plots ventricular pressure against ventricular volume instead of against time.",
  ],
];

const RECALL = [
  {
    q: "Which parameter primarily changes EDV?",
    a: "Preload. More venous return stretches the ventricle further along the EDPVR, so the loop's right-hand limb moves right. ESV is unchanged, so stroke volume rises (Frank–Starling).",
  },
  {
    q: "Which parameters primarily change ESV?",
    a: "Afterload and contractility. Afterload ↑ raises ESV (ejection stops earlier on the ESPVR); contractility ↑ lowers ESV (steeper ESPVR). Preload does not shift ESV meaningfully.",
  },
  {
    q: "How is stroke volume calculated, and where is it on the loop?",
    a: "SV = EDV − ESV. On the loop it is the horizontal width — normally about 120 − 50 = 70 mL.",
  },
  {
    q: "How is ejection fraction calculated?",
    a: "EF = SV ÷ EDV × 100 = (EDV − ESV) ÷ EDV × 100. Normal is roughly 55–70%.",
  },
  {
    q: "What happens to the loop when afterload increases?",
    a: "It becomes taller and narrower: the aortic valve opens at a higher pressure, ejection ends higher on the ESPVR, so ESV ↑ and SV ↓ with an unchanged EDV. EF falls.",
  },
  {
    q: "What happens with increased contractility?",
    a: "The ESPVR line steepens, ejection continues to a smaller volume: ESV ↓, SV ↑, EF ↑, at the same EDV and afterload. Stroke work and oxygen consumption rise.",
  },
  {
    q: "USMLE trap: does a normal ejection fraction exclude heart failure?",
    a: "No. In HFpEF the loop is narrow and shifted up on a stiff EDPVR — EDV and SV are both reduced, so their ratio (EF) stays normal while filling pressures are high.",
  },
];

function PVLoopTopic() {
  return (
    <TopicPage
      module="Cardiovascular · Physiology"
      title="Pressure–Volume Loops"
      subtitle="Understand how preload, afterload, contractility, and compliance change ventricular pressure and volume."
      difficulty="Intermediate"
      minutes={26}
      sections={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <ContentBlock
              tag="high-yield"
              title="What you must know"
              lede="Six statements that carry most of the exam weight on pressure–volume loops."
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
          id: "loop",
          label: "Interactive PV Loop",
          content: (
            <ContentBlock
              tag="mechanism"
              title="Interactive pressure–volume loop"
              lede="One cursor traverses the loop on the same cardiac-cycle timeline as the Wiggers lab. Play, pause, scrub, restart or change speed; select a phase to isolate its limb; move preload, afterload and contractility and watch EDV, ESV, stroke volume and ejection fraction recompute. Keyboard: space plays or pauses, arrow keys scrub, Home restarts, Escape clears the selected phase."
            >
              <PVLoopLab />
            </ContentBlock>
          ),
        },
        {
          id: "drivers",
          label: "What changes the loop?",
          content: (
            <ContentBlock
              tag="mechanism"
              title="What changes the loop"
              lede="Four determinants, each moving one edge of the loop in a predictable direction."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {DRIVERS.map(([name, rule, body]) => (
                  <article key={name} className="glass-panel rounded-xl p-4 md:p-5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-[16px] font-semibold text-foreground">{name}</h3>
                      <span className="font-mono text-[11px] text-cyan">{rule}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </article>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "states",
          label: "Clinical states",
          content: (
            <ContentBlock
              tag="classic-presentation"
              title="Loops you must recognize on sight"
              lede="Each state is selectable in the instrument above; overlay the normal loop to read the shift directly."
            >
              <div className="space-y-3">
                {[
                  [
                    "Increased preload",
                    "Wider, shifted right",
                    "Exercise, volume loading, chronic aortic or mitral regurgitation. EDV ↑ with an unchanged ESV, so SV ↑ and EF is preserved or high.",
                  ],
                  [
                    "Increased afterload",
                    "Taller, narrower",
                    "Aortic stenosis or uncontrolled hypertension. ESV ↑ at unchanged EDV, so SV ↓ and EF ↓; stroke work and oxygen demand rise.",
                  ],
                  [
                    "Increased contractility",
                    "Narrower on the left, taller",
                    "Sympathetic drive, dobutamine, digoxin. ESPVR steepens, ESV ↓, SV ↑, EF ↑.",
                  ],
                  [
                    "Reduced contractility (HFrEF)",
                    "Short, wide, right-shifted",
                    "Dilated cardiomyopathy, post-MI systolic failure, beta blockade. ESPVR flattens, ESV ↑ markedly; the ventricle dilates so EDV and end-diastolic pressure climb along the EDPVR. EF is low.",
                  ],
                  [
                    "Stiff ventricle (HFpEF)",
                    "Narrow, riding high on the EDPVR",
                    "LVH, restrictive or hypertrophic cardiomyopathy. The compliance curve shifts up and left: the same volume generates a much higher end-diastolic pressure. EDV and SV both fall, so EF stays normal.",
                  ],
                ].map(([name, shape, body]) => (
                  <article
                    key={name}
                    className="glass-panel flex flex-col gap-2 rounded-xl p-4 md:flex-row md:items-start md:gap-6 md:p-5"
                  >
                    <div className="md:w-56 md:shrink-0">
                      <h3 className="text-[15px] font-semibold text-foreground">{name}</h3>
                      <p className="mt-1 font-mono text-[11px] text-cyan">{shape}</p>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
                  </article>
                ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "connections",
          label: "Clinical connections",
          content: (
            <ContentBlock
              tag="clinical-pearl"
              title="Explicit relationship links"
              lede="Each row ties a loop feature to something you already know from the bedside or the Wiggers diagram."
            >
              <div className="space-y-3">
                {CLINICAL_LINKS.map(([anchor, link, body]) => (
                  <article key={anchor} className="glass-panel rounded-xl p-4 md:p-5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="font-mono text-[13px] uppercase tracking-[0.12em] text-cyan">
                        {anchor}
                      </h3>
                      <span className="font-mono text-[11.5px] text-muted-foreground">{link}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground">
                Time-domain view of the same beat:{" "}
                <Link to="/topics/cardiac-cycle" className="text-cyan underline-offset-4 hover:underline">
                  open the Cardiac Cycle Wiggers lab
                </Link>
                .
              </p>
            </ContentBlock>
          ),
        },
        {
          id: "recall",
          label: "Active Recall",
          content: (
            <ContentBlock
              tag="usmle-trap"
              title="Active recall"
              lede="Answer out loud before revealing. Retrieval, not recognition."
            >
              <ActiveRecall items={RECALL} />
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
