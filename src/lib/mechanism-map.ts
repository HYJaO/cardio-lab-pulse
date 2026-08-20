import type { TaxonomyKind } from "@/components/cardiolab/TaxonomyBadge";

/**
 * Generic, data-driven mechanism-map model.
 *
 * Any pathology pathway (atherosclerosis, rheumatic fever, MI pathogenesis,
 * heart-failure remodeling, endocarditis, hypertensive remodeling) can be
 * expressed as an ordered list of `MechanismStage`s plus an optional
 * association chain. The rendering engine in
 * `components/cardiolab/interactive/MechanismMap.tsx` is topic-agnostic.
 */
export type MechanismStage = {
  /** Stable slug, used for anchors, keys and the visual key. */
  id: string;
  /** Short label shown on the map node. */
  label: string;
  /** One-line causal summary shown under the node label. */
  short: string;
  /** Optional taxonomy accent for this stage's detail panel. */
  tag?: TaxonomyKind;
  /** How the previous stage causes this one (edge label). */
  edge?: string;
  what: string;
  why: string;
  /** Key cells / molecules, when relevant. */
  players?: string[];
  morphology: string;
  clinical: string;
  usmle: string[];
};

export type AssociationLink = {
  id: string;
  from: string;
  to: string;
  detail: string;
};

export type MechanismPathway = {
  id: string;
  title: string;
  stages: MechanismStage[];
  chain: AssociationLink[];
};

export const ATHEROSCLEROSIS: MechanismPathway = {
  id: "atherosclerosis",
  title: "Atherosclerosis",
  stages: [
    {
      id: "injury",
      label: "Endothelial dysfunction",
      short: "Chronic injury makes the endothelium permeable and sticky.",
      what: "Haemodynamic and metabolic stress injures arterial endothelium at branch points and along the outer wall of bifurcations, where flow is disturbed and shear stress is low and oscillatory.",
      why: "Normal laminar flow keeps endothelium quiescent through **eNOS**-derived nitric oxide and the transcription factor **KLF2**. Turbulent flow, hypertension, smoking toxins, hyperglycaemia and modified lipids reduce NO, raise reactive oxygen species and switch the endothelium to an activated, pro-inflammatory, pro-thrombotic phenotype with increased permeability.",
      players: ["Endothelial cells", "Nitric oxide / eNOS", "ROS", "Angiotensin II"],
      morphology:
        "No lesion is visible yet. The wall is grossly normal; the change is functional — increased permeability and adhesion-molecule expression.",
      clinical:
        "The reversible window. Blood-pressure control, statins, glycaemic control and smoking cessation act largely here.",
      usmle: [
        "Lesions favour the abdominal aorta > coronary > popliteal > internal carotid > circle of Willis.",
        "Disturbed flow at branch points explains the ostial and bifurcation distribution.",
        "Response-to-injury hypothesis is the accepted model.",
      ],
    },
    {
      id: "ldl-entry",
      label: "LDL entry & retention",
      short: "LDL crosses the leaky endothelium and is trapped by matrix.",
      edge: "Increased permeability lets lipoprotein into the intima",
      what: "LDL particles pass into the subendothelial intima and are retained there rather than washing back out.",
      why: "Retention is driven by ionic binding between **apolipoprotein B-100** and intimal **proteoglycans** (chondroitin and dermatan sulfate). Retention — not simply entry — is the rate-limiting step, which is why the plasma LDL concentration is the dominant modifiable driver.",
      players: ["LDL / apoB-100", "Intimal proteoglycans", "Lipoprotein(a)"],
      morphology:
        "Microscopic extracellular lipid accumulation in the intima; still no gross lesion.",
      clinical:
        "Explains the linear LDL-lowering benefit of statins, ezetimibe and PCSK9 inhibitors, and the premature disease of familial hypercholesterolaemia.",
      usmle: [
        "Familial hypercholesterolaemia = LDL-receptor defect → very high LDL, tendon xanthomas, early MI.",
        "'Response-to-retention': apoB retention by proteoglycans initiates the lesion.",
      ],
    },
    {
      id: "oxidation",
      label: "LDL oxidation",
      short: "Trapped LDL is oxidised into a damage signal.",
      edge: "Retained LDL sits in an oxidant-rich intima",
      what: "Retained LDL is oxidatively and enzymatically modified by ROS from endothelium, smooth muscle and macrophages (myeloperoxidase, lipoxygenase).",
      why: "Oxidised LDL is no longer recognised by the LDL receptor but is a ligand for macrophage **scavenger receptors (SR-A, CD36)**, which are *not* downregulated by intracellular cholesterol. It is simultaneously chemotactic and cytotoxic, amplifying endothelial activation.",
      players: ["Oxidised LDL", "Myeloperoxidase", "CD36 / SR-A"],
      morphology: "Still microscopic; oxidised lipid plus early inflammatory infiltrate.",
      clinical:
        "The mechanistic reason atherosclerosis is an inflammatory disease, not simple lipid plumbing.",
      usmle: [
        "Scavenger-receptor uptake is unregulated — this is why foam cells can overload with cholesterol.",
        "Antioxidant vitamins do not reduce events despite the mechanism.",
      ],
    },
    {
      id: "monocyte",
      label: "Monocyte adhesion & migration",
      short: "Activated endothelium recruits monocytes into the intima.",
      edge: "OxLDL drives adhesion-molecule and chemokine expression",
      what: "Circulating monocytes roll, adhere firmly and then transmigrate between endothelial cells into the intima, where they differentiate into macrophages.",
      why: "Activated endothelium expresses **VCAM-1** (and ICAM-1, E- and P-selectin) and secretes **MCP-1 (CCL2)**; monocyte **CCR2** follows that gradient. **M-CSF** in the intima drives macrophage differentiation.",
      players: ["Monocytes", "VCAM-1", "MCP-1 / CCR2", "M-CSF", "T lymphocytes"],
      morphology: "Intimal inflammatory infiltrate of macrophages and a smaller T-cell population.",
      clinical:
        "Residual inflammatory risk: canakinumab (anti-IL-1β) and colchicine lower events independently of LDL.",
      usmle: [
        "VCAM-1 is the classic adhesion molecule of early atherosclerosis.",
        "Macrophages and T cells — not neutrophils — dominate the plaque.",
      ],
    },
    {
      id: "foam",
      label: "Foam-cell formation",
      short: "Macrophages engorge with oxLDL and become foam cells.",
      edge: "Intimal macrophages meet unregulated oxidised LDL",
      what: "Macrophages ingest oxidised LDL through scavenger receptors and fill with cholesteryl-ester droplets, becoming lipid-laden **foam cells**. Smooth-muscle cells can also take up lipid and become foam cells.",
      why: "Because scavenger receptors escape sterol feedback, uptake continues unchecked while cholesterol efflux via **ABCA1/ABCG1 to HDL** is outpaced. Overloaded foam cells eventually undergo apoptosis and secondary necrosis.",
      players: ["Macrophage foam cells", "Cholesteryl esters", "ABCA1 / HDL", "IL-1, TNF, IL-6"],
      morphology:
        "Foamy, vacuolated cytoplasm on H&E — the pathognomonic microscopic cell of the lesion.",
      clinical:
        "Low HDL efflux capacity tracks with risk; the same cell appears in xanthomas and xanthelasma.",
      usmle: [
        "Foam cell = lipid-laden macrophage (± modified smooth-muscle cell).",
        "HDL performs reverse cholesterol transport via ABCA1/ABCG1.",
      ],
    },
    {
      id: "fatty-streak",
      label: "Fatty streak",
      short: "Aggregated foam cells form the first visible lesion.",
      edge: "Foam cells accumulate into a confluent intimal collection",
      what: "Foam cells aggregate into flat, yellow intimal streaks — the earliest grossly visible lesion.",
      why: "Continued recruitment and lipid loading outstrip clearance. The streak is non-obstructive and potentially reversible; only some progress, determined by location, flow and risk-factor burden.",
      players: ["Foam cells", "Extracellular lipid"],
      morphology:
        "Flat or slightly raised yellow streaks, most often in the aorta; no luminal narrowing.",
      clinical:
        "Present in essentially everyone by the late teens, including in the aorta of children — presence alone is not disease.",
      usmle: [
        "Fatty streak = earliest visible lesion, appears in childhood, reversible, not obstructive.",
        "Not all fatty streaks become plaques.",
      ],
    },
    {
      id: "smc",
      label: "SMC migration & matrix",
      short: "Smooth muscle migrates in and lays down collagen.",
      edge: "Plaque cytokines and growth factors recruit smooth muscle",
      what: "Medial smooth-muscle cells migrate through the internal elastic lamina into the intima, proliferate and switch from a contractile to a synthetic phenotype.",
      why: "**PDGF** (from platelets, macrophages, endothelium), **FGF** and **TGF-β** drive migration, proliferation and synthesis of **type I/III collagen**, elastin and proteoglycans. This is a wound-healing response to persistent injury.",
      players: ["Smooth-muscle cells", "PDGF", "TGF-β", "FGF", "Collagen"],
      morphology:
        "Intimal thickening with a cellular and collagenous matrix overlying the lipid pool.",
      clinical:
        "Same biology drives restenosis after angioplasty — the rationale for drug-eluting (antiproliferative) stents.",
      usmle: [
        "PDGF is the key smooth-muscle chemotactic and mitogenic factor.",
        "Intimal SMC proliferation is the mechanism of post-PCI restenosis.",
      ],
    },
    {
      id: "fibrous-plaque",
      label: "Fibrous plaque",
      short: "A collagen cap forms over a lipid core.",
      edge: "Collagen deposition organises the lesion into a capped plaque",
      what: "The lesion matures into a raised, white-yellow **atheroma**: a fibrous cap of smooth muscle and collagen over a lipid-rich core, with a shoulder region rich in inflammatory cells.",
      why: "Cap strength is a balance — smooth-muscle collagen synthesis (stabilising) against macrophage **matrix metalloproteinases** and T-cell **interferon-γ**, which degrade collagen and inhibit its synthesis.",
      players: ["Fibrous cap", "Lipid core", "MMPs", "IFN-γ"],
      morphology:
        "Eccentric intimal plaque; fibrous cap, cellular shoulder, necrotic lipid core, with outward (Glagov) remodelling early on.",
      clinical:
        "Stable plaques narrowing the lumen >70% cause exertional angina with a reproducible threshold and a normal resting ECG.",
      usmle: [
        "Three components: fibrous cap, cells (SMC/macrophage/T cell), lipid-necrotic core.",
        "Glagov remodelling means the artery expands outward before the lumen narrows.",
      ],
    },
    {
      id: "vulnerable",
      label: "Vulnerable plaque",
      short: "Thin cap, big necrotic core, angry shoulder.",
      edge: "Inflammation thins the cap while the core enlarges",
      what: "The plaque progresses to a large **necrotic lipid core** with a thin fibrous cap, neovascularisation, intraplaque haemorrhage and dystrophic calcification.",
      why: "Foam-cell apoptosis with defective efferocytosis expands the necrotic core; MMP-driven collagen breakdown at the shoulder thins the cap. Fragile microvessels bleed, abruptly enlarging the plaque.",
      players: ["Necrotic core", "MMP-9", "Neovessels", "Calcium"],
      morphology:
        "Thin cap (<65 µm), core >40% of plaque volume, dense macrophage infiltrate at the shoulders.",
      clinical:
        "Vulnerability is about composition, not size — most infarct-causing plaques were <50% stenotic and produced no prior angina.",
      usmle: [
        "USMLE trap: degree of stenosis does not predict rupture risk.",
        "Statins stabilise plaques (pleiotropic, anti-inflammatory) beyond LDL lowering.",
      ],
    },
    {
      id: "rupture",
      label: "Rupture → thrombosis",
      short: "Cap rupture exposes thrombogenic core → acute occlusion.",
      edge: "Mechanical failure of the thin cap exposes the core to blood",
      what: "The cap ruptures (or the endothelium erodes), exposing **tissue factor** and collagen in the core to flowing blood; platelets adhere and aggregate and a thrombus forms, occluding or embolising downstream.",
      why: "Tissue factor triggers the extrinsic coagulation cascade while collagen binds platelet GPVI and vWF–GPIb; the resulting platelet-fibrin thrombus can occlude a coronary artery within minutes. Rupture peaks in the early morning with the surge in sympathetic tone and blood pressure.",
      players: ["Tissue factor", "Platelets (GPIIb/IIIa)", "Fibrin", "vWF"],
      morphology:
        "Fissured cap with superimposed platelet-fibrin thrombus; downstream coagulative necrosis if occlusion persists.",
      clinical:
        "Acute coronary syndrome: unstable angina, NSTEMI (partial/transient occlusion) or STEMI (complete occlusion). Elsewhere: stroke, acute limb ischaemia, mesenteric ischaemia. Also mural weakening → abdominal aortic aneurysm, and cholesterol emboli.",
      usmle: [
        "Rupture > erosion as a cause of ACS; erosion is relatively more common in women and smokers.",
        "Aspirin and P2Y12 inhibitors target the platelet response to rupture.",
        "Complete occlusion → transmural infarct/STEMI; partial → subendocardial/NSTEMI.",
      ],
    },
  ],
  chain: [
    {
      id: "c1",
      from: "Risk factors",
      to: "Endothelial dysfunction",
      detail:
        "Hyperlipidaemia, hypertension, smoking, diabetes, age, male sex and family history converge on reduced nitric-oxide bioavailability and an activated endothelium.",
    },
    {
      id: "c2",
      from: "Endothelial dysfunction",
      to: "LDL retention & modification",
      detail:
        "A permeable, activated intima lets apoB lipoproteins in; proteoglycan binding traps them and an oxidant-rich milieu modifies them.",
    },
    {
      id: "c3",
      from: "LDL modification",
      to: "Inflammation",
      detail:
        "Oxidised LDL induces VCAM-1 and MCP-1, recruiting monocytes and T cells — atherosclerosis becomes a chronic inflammatory lesion.",
    },
    {
      id: "c4",
      from: "Inflammation",
      to: "Foam cells / fatty streak",
      detail:
        "Macrophages take up oxLDL through unregulated scavenger receptors, become foam cells and aggregate into the earliest visible lesion.",
    },
    {
      id: "c5",
      from: "Fatty streak",
      to: "Fibrous plaque",
      detail:
        "PDGF- and TGF-β-driven smooth-muscle migration and collagen deposition build a fibrous cap over the lipid core.",
    },
    {
      id: "c6",
      from: "Fibrous plaque",
      to: "Plaque rupture",
      detail:
        "MMPs and IFN-γ thin the cap while foam-cell death enlarges the necrotic core, converting a stable plaque into a vulnerable one that fissures.",
    },
    {
      id: "c7",
      from: "Plaque rupture",
      to: "Thrombosis",
      detail:
        "Exposed tissue factor and collagen trigger platelet adhesion, aggregation and fibrin formation over the ruptured cap.",
    },
    {
      id: "c8",
      from: "Thrombosis",
      to: "Ischaemia / infarction",
      detail:
        "Partial occlusion gives unstable angina or NSTEMI; complete occlusion gives STEMI, with coagulative necrosis of the supplied myocardium.",
    },
  ],
};
