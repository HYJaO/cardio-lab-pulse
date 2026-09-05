import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicPage } from "@/components/cardiolab/topic/TopicPage";
import { ContentBlock } from "@/components/cardiolab/topic/ContentBlock";
import { ActiveRecall } from "@/components/cardiolab/topic/ActiveRecall";
import { MechanismMap } from "@/components/cardiolab/interactive/MechanismMap";
import { AssociationChain } from "@/components/cardiolab/interactive/AssociationChain";
import { MicroscopicEvidence } from "@/components/cardiolab/interactive/MicroscopicEvidence";
import { ATHEROSCLEROSIS } from "@/lib/mechanism-map";

const TITLE = "Atherosclerosis — Interactive Mechanism Map | CardioLab";
const DESCRIPTION =
  "Walk the ten-stage atherosclerosis pathway from endothelial dysfunction to plaque rupture and thrombosis, with a synchronized arterial-wall visualization, causal links and active recall.";

export const Route = createFileRoute("/topics/atherosclerosis")({
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
  component: AtherosclerosisTopic,
});

const HIGH_YIELD = [
  "Response to injury: endothelial dysfunction is the initiating event, and disturbed flow at branch points sets the distribution.",
  "LDL retention by intimal proteoglycans (apoB-100 binding) — not simply entry — is the rate-limiting step.",
  "Oxidised LDL is taken up through scavenger receptors (SR-A, CD36) that escape sterol feedback, so foam cells overload.",
  "VCAM-1 and MCP-1 recruit monocytes; macrophages and T cells — not neutrophils — dominate the lesion.",
  "The fatty streak is the earliest visible lesion, appears in childhood and is not obstructive.",
  "PDGF- and TGF-β-driven smooth-muscle migration builds the fibrous cap over the lipid core.",
  "Plaque composition, not degree of stenosis, predicts rupture: thin cap, big necrotic core, inflamed shoulder.",
  "Rupture exposes tissue factor and collagen → platelet-fibrin thrombus → acute coronary syndrome.",
];

const CLINICAL_BRIDGE: [string, string, string][] = [
  [
    "Risk factors",
    "→ Endothelial dysfunction",
    "Hyperlipidaemia, hypertension, smoking, diabetes, age, male sex and family history reduce nitric-oxide bioavailability and activate the endothelium. This is the window where blood-pressure control, statins, glycaemic control and smoking cessation act.",
  ],
  [
    "Atherosclerotic disease",
    "→ Stable plaque and ischaemia",
    "A fibrous plaque narrowing the lumen beyond about 70% causes exertional angina with a reproducible threshold and a normal resting ECG. Outward (Glagov) remodelling means the artery expands before the lumen ever narrows.",
  ],
  [
    "Vulnerable plaque",
    "→ Rupture or erosion",
    "Inflammation thins the cap while foam-cell death enlarges the necrotic core. Most infarct-causing plaques were less than 50% stenotic and produced no prior angina.",
  ],
  [
    "Thrombosis",
    "→ Acute coronary syndrome",
    "Partial or transient occlusion gives unstable angina or NSTEMI (subendocardial); complete occlusion gives STEMI with transmural coagulative necrosis. Elsewhere the same event produces stroke, acute limb ischaemia or mesenteric ischaemia.",
  ],
];

const RECALL = [
  {
    q: "What initiates LDL retention in the intima?",
    a: "Endothelial dysfunction increases permeability, and retained LDL is trapped by ionic binding between apolipoprotein B-100 and intimal proteoglycans (chondroitin and dermatan sulfate). Retention, not entry, is the rate-limiting step.",
  },
  {
    q: "Why can foam cells overload with cholesterol?",
    a: "Oxidised LDL is taken up through macrophage scavenger receptors (SR-A, CD36), which are not downregulated by intracellular cholesterol, so uptake continues unchecked while ABCA1/ABCG1 efflux to HDL is outpaced.",
  },
  {
    q: "Which cells become foam cells?",
    a: "Intimal macrophages derived from recruited monocytes, and to a lesser extent modified smooth-muscle cells. On H&E they have foamy, vacuolated cytoplasm.",
  },
  {
    q: "What is the fatty streak?",
    a: "A confluent collection of foam cells forming flat or slightly raised yellow intimal streaks — the earliest grossly visible lesion. It is non-obstructive, present in essentially everyone by the late teens, and not all fatty streaks progress.",
  },
  {
    q: "What creates the fibrous plaque?",
    a: "Medial smooth-muscle cells migrate into the intima under PDGF, FGF and TGF-β, switch to a synthetic phenotype and deposit type I/III collagen, elastin and proteoglycans as a cap over the lipid core.",
  },
  {
    q: "What converts a vulnerable plaque into an acute ischaemic event?",
    a: "Cap rupture (or endothelial erosion) exposes tissue factor and collagen to flowing blood. Tissue factor triggers the extrinsic cascade while collagen binds platelet GPVI and vWF–GPIb, producing an occlusive platelet-fibrin thrombus.",
  },
  {
    q: "USMLE trap: does degree of stenosis predict rupture risk?",
    a: "No. Vulnerability is about composition — thin cap (<65 µm), necrotic core >40% of plaque volume, dense macrophage infiltrate at the shoulders. Most infarct-causing plaques were <50% stenotic.",
  },
];

const RELATED: { title: string; note: string; to?: "/topics/cardiac-cycle" | "/topics/pv-loops" }[] =
  [
    {
      title: "Cardiac Cycle (Wiggers)",
      note: "Ischaemia is a supply–demand failure across a specific part of the beat: coronary perfusion happens in diastole, and the Wiggers lab shows exactly where.",
      to: "/topics/cardiac-cycle",
    },
    {
      title: "Pressure–Volume Loops",
      note: "Infarction flattens the ESPVR: ESV rises, stroke volume and ejection fraction fall. Drive the loop to see post-MI systolic failure quantitatively.",
      to: "/topics/pv-loops",
    },
  ];

function AtherosclerosisTopic() {
  const [selectedMapStage, setSelectedMapStage] = useState<string>();

  return (
    <TopicPage
      module="Cardiovascular · Pathology"
      title="Atherosclerosis"
      subtitle="Follow the causal chain from endothelial injury through foam cells and the fibrous cap to plaque rupture and thrombosis."
      difficulty="Intermediate"
      minutes={28}
      sections={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <ContentBlock
              tag="high-yield"
              title="What you must know"
              lede="Eight statements that carry most of the exam weight on atherosclerosis."
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
          id: "mechanism",
          label: "Mechanism Map",
          content: (
            <ContentBlock
              tag="mechanism"
              title="Interactive mechanism map"
              lede="Ten stages in causal order. Select a stage to focus the arterial-wall section on that morphology and read what happens, why, the key players, the clinical consequence and the exam associations. Use Prev/Next, play the pathway, or press the left and right arrow keys; Home restarts."
            >
              <MechanismMap pathway={ATHEROSCLEROSIS} selectedStageId={selectedMapStage} />
              <MicroscopicEvidence
                onMapStage={(stageId) => {
                  setSelectedMapStage(stageId);
                  document.getElementById("mechanism")?.scrollIntoView({ block: "start" });
                }}
              />
            </ContentBlock>
          ),
        },
        {
          id: "progression",
          label: "Plaque Progression",
          content: (
            <ContentBlock
              tag="classic-presentation"
              title="Morphology you must recognise"
              lede="The same wall, four snapshots — this is the sequence pathology questions describe in words."
            >
              <div className="space-y-3">
                {ATHEROSCLEROSIS.stages
                  .filter((s) =>
                    ["fatty-streak", "fibrous-plaque", "vulnerable", "rupture"].includes(s.id),
                  )
                  .map((s) => (
                    <article
                      key={s.id}
                      className="glass-panel flex flex-col gap-2 rounded-xl p-4 md:flex-row md:items-start md:gap-6 md:p-5"
                    >
                      <div className="md:w-56 md:shrink-0">
                        <h3 className="text-[15px] font-semibold text-foreground">{s.label}</h3>
                        <p className="mt-1 font-mono text-[11px] text-cyan">{s.short}</p>
                      </div>
                      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                        {s.morphology}
                      </p>
                    </article>
                  ))}
              </div>
            </ContentBlock>
          ),
        },
        {
          id: "clinical",
          label: "Clinical Connection",
          content: (
            <ContentBlock
              tag="clinical-pearl"
              title="From risk factor to acute coronary syndrome"
              lede="The compact clinical bridge: what the lesion does to the patient at each point on the pathway."
            >
              <div className="space-y-3">
                {CLINICAL_BRIDGE.map(([anchor, link, body]) => (
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
            </ContentBlock>
          ),
        },
        {
          id: "chain",
          label: "Association Chain",
          content: (
            <ContentBlock
              tag="usmle-trap"
              title="Association chain"
              lede="Click any link to read the relationship. Traps live at the joints: retention (not entry) is rate-limiting, scavenger-receptor uptake is unregulated, and composition — not stenosis — drives rupture."
            >
              <AssociationChain links={ATHEROSCLEROSIS.chain} />
            </ContentBlock>
          ),
        },
        {
          id: "recall",
          label: "Active Recall",
          content: (
            <ContentBlock
              tag="differential"
              title="Active recall"
              lede="Answer out loud before revealing. Each answer is drawn from the mechanism map above."
            >
              <ActiveRecall items={RECALL} />
              <div className="mt-10 border-t border-border/50 pt-8">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Related concepts
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {RELATED.map((r) =>
                    r.to ? (
                      <Link
                        key={r.title}
                        to={r.to}
                        className="glass-panel group rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40 md:p-5"
                      >
                        <h4 className="text-[15px] font-semibold text-foreground">{r.title}</h4>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                          {r.note}
                        </p>
                        <span className="mt-3 inline-block font-mono text-[11px] text-cyan">
                          Open lab →
                        </span>
                      </Link>
                    ) : null,
                  )}
                </div>
              </div>
            </ContentBlock>
          ),
        },
      ]}
    />
  );
}
