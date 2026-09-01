/**
 * Heart-failure hemodynamics model.
 *
 * Framework-free teaching model for the CardioLab Failure Hemodynamics Lab.
 * Values are ILLUSTRATIVE teaching values chosen so the directional
 * relationships (EF, EDV/ESV, stroke volume, filling pressure, congestion
 * risk) read correctly. Directionality — not the absolute numbers — is what
 * the board tests.
 */

export type HFStateId = "normal" | "hfref" | "hfpef";

export type HFState = {
  id: HFStateId;
  label: string;
  short: string;
  /** End-systolic elastance Emax (contractility), mmHg/mL. */
  ees: number;
  /** EDPVR scale factor (diastolic stiffness). */
  edpvrA: number;
  /** EDPVR exponent (diastolic stiffness). */
  edpvrBeta: number;
  /** Unstressed volume, mL. */
  v0: number;
  /** End-diastolic volume, mL. */
  edv: number;
  /** Aortic diastolic pressure the ventricle ejects against, mmHg. */
  afterload: number;
  /** One-line lesion statement. */
  lesion: string;
  /** Classification language. */
  classification: string;
  teaching: string;
};

export const HF_STATES: HFState[] = [
  {
    id: "normal",
    label: "Normal",
    short: "Reference ventricle",
    ees: 2.5,
    edpvrA: 0.6,
    edpvrBeta: 0.02,
    v0: 10,
    edv: 120,
    afterload: 80,
    lesion: "Normal contractility and normal diastolic compliance.",
    classification: "LVEF ≥ 50% with normal filling pressures.",
    teaching:
      "The reference loop: the ventricle fills at a low end-diastolic pressure along a compliant EDPVR, and empties along a steep ESPVR to a small end-systolic volume. Forward output and upstream pressures are both normal.",
  },
  {
    id: "hfref",
    label: "HFrEF",
    short: "Systolic dysfunction",
    ees: 0.7,
    edpvrA: 0.35,
    edpvrBeta: 0.024,
    v0: 10,
    edv: 190,
    afterload: 80,
    lesion: "Impaired contractility — the ESPVR is flattened.",
    classification: "LVEF ≤ 40% (HFmrEF is 41–49%).",
    teaching:
      "A flattened ESPVR means the ventricle cannot eject to a small volume: ESV rises first, and stroke volume falls. Neurohormonal salt-and-water retention plus eccentric remodeling then push EDV far to the right, so end-diastolic pressure climbs even though the chamber is dilated and relatively compliant. EF falls because ESV rises out of proportion to the gain in EDV.",
  },
  {
    id: "hfpef",
    label: "HFpEF",
    short: "Diastolic dysfunction",
    ees: 2.8,
    edpvrA: 1.1,
    edpvrBeta: 0.038,
    v0: 10,
    edv: 90,
    afterload: 90,
    lesion: "Impaired relaxation and reduced compliance — the EDPVR is steep and shifted up/left.",
    classification:
      "LVEF ≥ 50% PLUS objective evidence of raised filling pressures — preserved EF alone does not exclude heart failure.",
    teaching:
      "Contractility is preserved or supranormal, but a stiff ventricle cannot accept volume at a low pressure. The loop is narrow and sits high on the EDPVR: EDV and stroke volume are both reduced, so their ratio (EF) looks normal while LVEDP — and therefore pulmonary venous pressure — is high. Preserved EF does not mean preserved cardiac function.",
  },
];

export function espvrP(v: number, s: HFState): number {
  return Math.max(0, s.ees * (v - s.v0));
}

export function edpvrP(v: number, s: HFState): number {
  return Math.max(0, s.edpvrA * (Math.exp(s.edpvrBeta * Math.max(0, v - s.v0)) - 1));
}

export type HFDerived = {
  edv: number;
  esv: number;
  sv: number;
  ef: number;
  /** LV end-diastolic pressure, mmHg — proxy for upstream filling pressure. */
  lvedp: number;
  /** Peak systolic pressure, mmHg. */
  peakP: number;
  /** Cardiac output at an illustrative fixed rate, L/min. */
  co: number;
  /** 0–1 congestion index derived from LVEDP. */
  congestion: number;
};

const HEART_RATE = 70;

export function deriveHF(s: HFState): HFDerived {
  const pes = s.afterload * 1.08;
  const esv = Math.min(s.edv - 5, s.v0 + pes / s.ees);
  const sv = s.edv - esv;
  const lvedp = edpvrP(s.edv, s);
  return {
    edv: s.edv,
    esv,
    sv,
    ef: (sv / s.edv) * 100,
    lvedp,
    peakP: pes,
    co: (sv * HEART_RATE) / 1000,
    congestion: Math.max(0, Math.min(1, (lvedp - 8) / 18)),
  };
}

/** Closed PV-loop polygon for a state, as [volume, pressure] points. */
export function hfLoopPoints(s: HFState, samples = 160): [number, number][] {
  const d = deriveHF(s);
  const pts: [number, number][] = [];
  // filling: ESV → EDV along the EDPVR
  for (let i = 0; i <= samples; i++) {
    const v = d.esv + ((d.edv - d.esv) * i) / samples;
    pts.push([v, edpvrP(v, s)]);
  }
  // isovolumetric contraction at EDV
  const edp = edpvrP(d.edv, s);
  for (let i = 1; i <= 12; i++) pts.push([d.edv, edp + ((s.afterload - edp) * i) / 12]);
  // ejection: EDV → ESV, pressure arcs up to peak then to end-systolic point
  for (let i = 1; i <= samples; i++) {
    const f = i / samples;
    const v = d.edv - (d.edv - d.esv) * f;
    const arc = Math.sin(Math.PI * f) * 0.35;
    const base = s.afterload + (d.peakP - s.afterload) * f;
    pts.push([v, base + arc * (d.peakP - s.afterload + 14)]);
  }
  // isovolumetric relaxation at ESV
  const esp = edpvrP(d.esv, s);
  for (let i = 1; i <= 12; i++) pts.push([d.esv, d.peakP - (d.peakP - esp) * (i / 12)]);
  return pts;
}

/* ------------------------------------------------------------------ */
/* Congestion: left vs right                                           */
/* ------------------------------------------------------------------ */

export type CongestionSide = {
  id: "left" | "right";
  label: string;
  upstream: string;
  upstreamDetail: string;
  forward: string;
  signs: { sign: string; why: string }[];
};

export const CONGESTION: CongestionSide[] = [
  {
    id: "left",
    label: "Left-sided failure",
    upstream: "↑ LVEDP → ↑ left atrial pressure → ↑ pulmonary venous & capillary pressure",
    upstreamDetail:
      "The failing left ventricle cannot lower its end-diastolic pressure, and that pressure is transmitted backward through the left atrium into the pulmonary veins. Once capillary hydrostatic pressure exceeds the opposing oncotic pressure, fluid moves into the interstitium and then the alveoli.",
    forward: "Reduced forward output → fatigue, exertional intolerance, cool periphery.",
    signs: [
      {
        sign: "Exertional dyspnea",
        why: "Rising pulmonary capillary pressure on exertion causes interstitial edema, stiffening the lungs and stimulating J receptors.",
      },
      {
        sign: "Orthopnea",
        why: "Lying flat redistributes splanchnic and lower-limb blood centrally, acutely raising pulmonary venous pressure — relieved by sitting up or extra pillows.",
      },
      {
        sign: "Paroxysmal nocturnal dyspnea",
        why: "Nocturnal reabsorption of interstitial fluid plus recumbency raises pulmonary pressures hours into sleep, waking the patient breathless.",
      },
      {
        sign: "Bibasilar crackles",
        why: "Fluid-filled small airways and alveoli snapping open during inspiration — the auscultatory footprint of pulmonary edema.",
      },
      {
        sign: "S3 gallop",
        why: "Rapid early-diastolic filling into a dilated, volume-overloaded ventricle — classic in HFrEF with elevated filling pressures.",
      },
    ],
  },
  {
    id: "right",
    label: "Right-sided failure",
    upstream: "↑ RVEDP → ↑ right atrial pressure → ↑ systemic venous pressure",
    upstreamDetail:
      "The failing right ventricle raises right atrial pressure, which is transmitted backward into the systemic veins. The most common cause of right heart failure is left heart failure, via pulmonary venous hypertension.",
    forward: "Reduced pulmonary flow → reduced LV preload → low output despite a congested venous system.",
    signs: [
      {
        sign: "Elevated JVP",
        why: "The jugular veins are a manometer for right atrial pressure; a raised column is the most direct bedside read of systemic venous congestion.",
      },
      {
        sign: "Dependent peripheral edema",
        why: "High systemic venous pressure raises capillary hydrostatic pressure in the most gravity-dependent tissues — ankles when upright, sacrum when bedbound.",
      },
      {
        sign: "Hepatomegaly & hepatojugular reflux",
        why: "Congestion of hepatic veins and sinusoids (nutmeg liver); pressing the liver returns extra volume the right ventricle cannot accept, so the JVP rises.",
      },
      {
        sign: "Ascites",
        why: "Chronic hepatic venous congestion plus raised portal pressure drives fluid into the peritoneal cavity.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Compensation                                                        */
/* ------------------------------------------------------------------ */

export type CompensationStep = {
  id: string;
  label: string;
  trigger: string;
  shortTerm: string;
  longTerm: string;
  mediators: string[];
};

export const COMPENSATION: CompensationStep[] = [
  {
    id: "sensing",
    label: "Reduced forward output sensed",
    trigger: "Falling stroke volume reduces effective arterial filling.",
    shortTerm:
      "Arterial baroreceptors and the renal juxtaglomerular apparatus detect reduced perfusion pressure and set the compensatory cascade in motion.",
    longTerm:
      "The stimulus never resolves, so the compensatory programs stay switched on chronically — that persistence is what converts them from rescue to injury.",
    mediators: ["Carotid & aortic baroreceptors", "Juxtaglomerular apparatus"],
  },
  {
    id: "sympathetic",
    label: "Sympathetic activation",
    trigger: "Baroreceptor unloading → ↑ sympathetic outflow.",
    shortTerm:
      "↑ Heart rate and ↑ contractility raise cardiac output; venoconstriction shifts blood centrally to support preload.",
    longTerm:
      "Chronic catecholamine exposure raises myocardial oxygen demand, is arrhythmogenic, downregulates β1 receptors and drives myocyte loss — the rationale for evidence-based beta blockade in HFrEF.",
    mediators: ["Norepinephrine", "β1 and α1 receptors"],
  },
  {
    id: "raas",
    label: "RAAS activation",
    trigger: "Reduced renal perfusion → renin release.",
    shortTerm:
      "Angiotensin II vasoconstricts to defend blood pressure; aldosterone retains sodium and water to restore preload.",
    longTerm:
      "Sustained angiotensin II and aldosterone raise both afterload and preload and drive interstitial fibrosis — the rationale for ARNI/ACEi/ARB and mineralocorticoid receptor antagonists.",
    mediators: ["Renin", "Angiotensin II", "Aldosterone"],
  },
  {
    id: "adh",
    label: "ADH & water retention",
    trigger: "Baroreceptor-mediated (non-osmotic) ADH release.",
    shortTerm: "Free-water retention supports circulating volume and blood pressure.",
    longTerm:
      "Water retained out of proportion to sodium produces dilutional hyponatremia — a marker of severity — and worsens congestion.",
    mediators: ["ADH / vasopressin", "V1 and V2 receptors"],
  },
  {
    id: "loading",
    label: "↑ Preload and ↑ afterload",
    trigger: "Salt-water retention plus vasoconstriction.",
    shortTerm:
      "More preload recruits Frank–Starling reserve; higher systemic resistance maintains perfusion pressure to brain and kidney.",
    longTerm:
      "The failing ventricle sits on the flat part of its function curve: added preload raises filling pressure without raising output, while added afterload directly reduces stroke volume. Congestion appears.",
    mediators: ["Frank–Starling reserve", "Systemic vascular resistance"],
  },
  {
    id: "remodeling",
    label: "Remodeling",
    trigger: "Chronic wall stress plus neurohormonal signaling.",
    shortTerm:
      "Hypertrophy normalizes wall stress (Laplace: stress ∝ pressure × radius ÷ 2 × wall thickness), briefly protecting the ventricle.",
    longTerm:
      "Eccentric dilation in volume overload and concentric hypertrophy with impaired relaxation in pressure overload both end in worse mechanics, higher filling pressures and progressive decompensation.",
    mediators: ["Angiotensin II", "Aldosterone", "Catecholamines"],
  },
];
