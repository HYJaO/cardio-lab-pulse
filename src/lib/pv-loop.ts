/**
 * Left-ventricular pressure–volume loop model.
 *
 * Reusable, framework-free physiology model: given three parameters
 * (preload, afterload, contractility) it returns the loop geometry,
 * derived haemodynamics and the pressure/volume state at any point of
 * the cardiac cycle (normalized time 0 → 1, shared with cardiac-cycle.ts).
 */

export type PVParams = {
  /** End-diastolic volume target, mL (preload). */
  preload: number;
  /** Aortic diastolic pressure, mmHg (afterload the ventricle must overcome). */
  afterload: number;
  /** End-systolic elastance Emax, mmHg/mL (contractility). */
  contractility: number;
};

export const PV_DEFAULTS: PVParams = {
  preload: 120,
  afterload: 80,
  contractility: 2.5,
};

export const PV_RANGES = {
  preload: { min: 80, max: 180, step: 1, unit: "mL" },
  afterload: { min: 50, max: 140, step: 1, unit: "mmHg" },
  contractility: { min: 0.8, max: 5, step: 0.1, unit: "mmHg/mL" },
} as const;

/** Volume-axis intercept of the ESPVR (unstressed volume), mL. */
export const V0 = 10;

/** End-diastolic pressure–volume relationship (passive compliance curve). */
export function edpvr(v: number): number {
  return 0.15 * (Math.exp(0.03 * Math.max(0, v - 15)) - 1);
}

/** End-systolic pressure–volume relationship (contractility line). */
export function espvr(v: number, contractility: number): number {
  return Math.max(0, contractility * (v - V0));
}

export type PVDerived = {
  edv: number;
  esv: number;
  sv: number;
  ef: number;
  /** End-diastolic pressure, mmHg. */
  edp: number;
  /** End-systolic (≈ peak systolic) pressure, mmHg. */
  pes: number;
  /** Aortic pressure at valve opening, mmHg. */
  pOpen: number;
  /** Peak ventricular pressure during ejection, mmHg. */
  pPeak: number;
  /** Stroke work, mmHg·mL (loop area approximation). */
  strokeWork: number;
};

export function derive(p: PVParams): PVDerived {
  const edv = p.preload;
  const pOpen = p.afterload;
  // End-systolic pressure tracks arterial load (~systolic pressure).
  const pes = pOpen * 1.2;
  const rawEsv = V0 + pes / p.contractility;
  const esv = Math.min(Math.max(rawEsv, V0 + 2), edv - 2);
  const sv = edv - esv;
  const ef = (sv / edv) * 100;
  const edp = edpvr(edv);
  const pPeak = Math.max(pes, pOpen * 1.25);
  return { edv, esv, sv, ef, edp, pes, pOpen, pPeak, strokeWork: sv * ((pes + pOpen) / 2) };
}

export type PVPhaseId = "filling" | "isovolumetric-contraction" | "ejection" | "isovolumetric-relaxation";

export type PVPhase = {
  id: PVPhaseId;
  index: number;
  name: string;
  short: string;
  /** Matching cardiac-cycle phases. */
  cyclePhases: string[];
  start: number;
  end: number;
  valves: string;
  pressure: string;
  volume: string;
  ecg: string;
  sound?: string;
  event: string;
};

/** Time windows are aligned with the seven-phase cardiac cycle model. */
export const PV_PHASES: PVPhase[] = [
  {
    id: "isovolumetric-contraction",
    index: 1,
    name: "Isovolumetric contraction",
    short: "IVC",
    cyclePhases: ["Isovolumetric contraction"],
    start: 0.1,
    end: 0.16,
    valves: "Mitral closed · Aortic closed",
    pressure: "Rises steeply from end-diastolic pressure to aortic diastolic pressure. Steepest dP/dt.",
    volume: "Fixed at EDV — no blood enters or leaves.",
    ecg: "Immediately after the QRS complex.",
    sound: "S1 — mitral and tricuspid closure",
    event: "Vertical right-hand limb of the loop: pressure climbs, volume constant.",
  },
  {
    id: "ejection",
    index: 2,
    name: "Ventricular ejection",
    short: "Ejection",
    cyclePhases: ["Rapid ejection", "Reduced ejection"],
    start: 0.16,
    end: 0.44,
    valves: "Mitral closed · Aortic open",
    pressure: "Ventricular pressure exceeds aortic pressure, peaks, then falls toward the end-systolic point.",
    volume: "Falls from EDV to ESV — the width of the loop is stroke volume.",
    ecg: "ST segment through the T wave.",
    event: "Upper limb, right to left. It ends exactly on the ESPVR line.",
  },
  {
    id: "isovolumetric-relaxation",
    index: 3,
    name: "Isovolumetric relaxation",
    short: "IVR",
    cyclePhases: ["Isovolumetric relaxation"],
    start: 0.44,
    end: 0.5,
    valves: "Mitral closed · Aortic closed",
    pressure: "Collapses from end-systolic pressure to below atrial pressure. Active, ATP-dependent.",
    volume: "Fixed at ESV.",
    ecg: "Just after the T wave.",
    sound: "S2 — aortic and pulmonic closure",
    event: "Vertical left-hand limb: pressure falls, volume constant.",
  },
  {
    id: "filling",
    index: 4,
    name: "Ventricular filling",
    short: "Filling",
    cyclePhases: ["Rapid filling", "Diastasis", "Atrial systole"],
    start: 0.5,
    end: 1,
    valves: "Mitral open · Aortic closed",
    pressure: "Low, rising gently along the compliance curve (EDPVR) to end-diastolic pressure.",
    volume: "Rises from ESV back to EDV — passive filling then the atrial kick.",
    ecg: "Electrically silent TP interval, then the P wave.",
    sound: "S3 (volume overload) or S4 (stiff ventricle) if present",
    event: "Lower limb, left to right, sitting on the EDPVR compliance curve.",
  },
];

export function pvPhaseAt(t: number): PVPhase {
  const x = ((t % 1) + 1) % 1;
  return (
    PV_PHASES.find((p) => x >= p.start && x < p.end) ??
    (PV_PHASES.find((p) => p.id === "filling") as PVPhase)
  );
}

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));

export type PVPoint = { v: number; p: number; phase: PVPhase };

/** Pressure/volume state at normalized cycle time t. */
export function pvAt(t: number, params: PVParams): PVPoint {
  const x = ((t % 1) + 1) % 1;
  const d = derive(params);
  const phase = pvPhaseAt(x);
  const u = clamp01((x - phase.start) / (phase.end - phase.start));

  switch (phase.id) {
    case "isovolumetric-contraction": {
      return { v: d.edv, p: d.edp + (d.pOpen - d.edp) * smooth(u), phase };
    }
    case "ejection": {
      const v = d.edv - (d.edv - d.esv) * smooth(u);
      // Pressure rises to a peak in early ejection then falls to Pes.
      const rise = Math.sin(Math.PI * Math.min(1, u / 0.42)) ;
      const p = u < 0.42
        ? d.pOpen + (d.pPeak - d.pOpen) * rise
        : d.pPeak + (d.pes - d.pPeak) * smooth((u - 0.42) / 0.58);
      return { v, p, phase };
    }
    case "isovolumetric-relaxation": {
      const pEnd = edpvr(d.esv) + 1;
      return { v: d.esv, p: d.pes + (pEnd - d.pes) * smooth(u), phase };
    }
    default: {
      // Filling: volume ESV → EDV, mostly early (rapid filling), pressure on EDPVR.
      const fill = smooth(clamp01(u / 0.55)) * 0.85 + smooth(u) * 0.15;
      const v = d.esv + (d.edv - d.esv) * Math.min(1, fill);
      return { v, p: edpvr(v) + 1.2, phase };
    }
  }
}

/** Sample the whole loop as [volume, pressure] pairs. */
export function loopPoints(params: PVParams, samples = 400): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const { v, p } = pvAt(i / samples, params);
    pts.push([v, p]);
  }
  return pts;
}

/** Sample only the segment belonging to one phase. */
export function phaseSegment(
  params: PVParams,
  phase: PVPhase,
  samples = 80,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = phase.start + ((phase.end - phase.start) * i) / samples;
    const { v, p } = pvAt(Math.min(0.9999, t), params);
    pts.push([v, p]);
  }
  return pts;
}

/* ---------- clinical / comparison states ---------- */

export type PVStateId =
  | "normal"
  | "increased-preload"
  | "increased-afterload"
  | "increased-contractility"
  | "reduced-contractility";

export type PVState = {
  id: PVStateId;
  label: string;
  params: PVParams;
  example: string;
  teaching: string;
};

export const PV_STATES: PVState[] = [
  {
    id: "normal",
    label: "Normal",
    params: PV_DEFAULTS,
    example: "Healthy adult at rest, EF ≈ 60%.",
    teaching: "Reference loop: EDV 120 mL, ESV ≈ 48 mL, SV ≈ 72 mL.",
  },
  {
    id: "increased-preload",
    label: "Increased preload",
    params: { ...PV_DEFAULTS, preload: 160 },
    example: "Volume loading, exercise, mitral or aortic regurgitation.",
    teaching:
      "Loop widens to the right: EDV ↑ → SV ↑ at an unchanged ESV (Frank–Starling), within physiologic limits.",
  },
  {
    id: "increased-afterload",
    label: "Increased afterload",
    params: { ...PV_DEFAULTS, afterload: 120 },
    example: "Aortic stenosis, uncontrolled hypertension.",
    teaching: "Loop grows taller and narrower: ESV ↑ → SV ↓ at an unchanged EDV.",
  },
  {
    id: "increased-contractility",
    label: "Increased contractility",
    params: { ...PV_DEFAULTS, contractility: 4 },
    example: "Sympathetic drive, dobutamine, digoxin.",
    teaching: "ESPVR steepens: ESV ↓ → SV ↑ and EF ↑ with no change in EDV.",
  },
  {
    id: "reduced-contractility",
    label: "Reduced contractility",
    params: { ...PV_DEFAULTS, contractility: 1.2, preload: 150 },
    example: "Systolic heart failure (HFrEF), dilated cardiomyopathy, beta blockade.",
    teaching:
      "ESPVR flattens: ESV ↑ markedly, SV and EF fall; the ventricle dilates to defend stroke volume.",
  },
];
