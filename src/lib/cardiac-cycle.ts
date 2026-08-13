/**
 * Cardiac cycle model.
 * All time values are normalized fractions of one cardiac cycle (0 → 1).
 * At 75 bpm one cycle = 800 ms.
 */

export const CYCLE_MS = 800;

export type PhaseId =
  | "atrial-systole"
  | "isovolumetric-contraction"
  | "rapid-ejection"
  | "reduced-ejection"
  | "isovolumetric-relaxation"
  | "rapid-filling"
  | "diastasis";

export type Phase = {
  id: PhaseId;
  index: number;
  name: string;
  short: string;
  start: number;
  end: number;
  part: "systole" | "diastole";
  pressure: string;
  volume: string;
  valves: string;
  ecg: string;
  sound?: string;
  pearl: string;
};

export const PHASES: Phase[] = [
  {
    id: "atrial-systole",
    index: 1,
    name: "Atrial systole",
    short: "Atrial kick",
    start: 0,
    end: 0.1,
    part: "diastole",
    pressure:
      "Left atrial pressure rises to ~12 mmHg (a wave). Ventricular pressure rises passively to ~10 mmHg as blood is pushed in.",
    volume:
      "Adds the final 10–20 mL, completing end-diastolic volume at ~120 mL. Contributes ~10–20% of filling in a healthy heart.",
    valves: "Mitral open · Aortic closed",
    ecg: "Follows the P wave — atrial depolarization precedes atrial contraction.",
    sound: "S4 if present (stiff, non-compliant ventricle)",
    pearl:
      "Lost in atrial fibrillation — which is why AF decompensates patients who depend on the atrial kick (LVH, HFpEF, mitral stenosis).",
  },
  {
    id: "isovolumetric-contraction",
    index: 2,
    name: "Isovolumetric contraction",
    short: "IVC",
    start: 0.1,
    end: 0.16,
    part: "systole",
    pressure:
      "Ventricular pressure climbs steeply from ~10 to ~80 mmHg with no outflow. Highest rate of pressure rise (dP/dt) — an index of contractility.",
    volume: "Constant at end-diastolic volume (~120 mL). No blood enters or leaves.",
    valves: "Mitral closed · Aortic closed — all four valves shut",
    ecg: "Begins just after the QRS complex.",
    sound: "S1 — mitral and tricuspid closure",
    pearl:
      "The only period of the cycle with every valve closed alongside isovolumetric relaxation. Myocardial oxygen demand peaks here.",
  },
  {
    id: "rapid-ejection",
    index: 3,
    name: "Rapid ejection",
    short: "Rapid ejection",
    start: 0.16,
    end: 0.32,
    part: "systole",
    pressure:
      "Ventricular pressure exceeds aortic pressure, the aortic valve opens, and both rise together to a peak of ~120 mmHg.",
    volume: "About two-thirds of stroke volume leaves the ventricle in this short window.",
    valves: "Mitral closed · Aortic open",
    ecg: "Occurs during the ST segment.",
    pearl:
      "Aortic valve opening is silent in health; an ejection click here suggests a bicuspid aortic valve.",
  },
  {
    id: "reduced-ejection",
    index: 4,
    name: "Reduced ejection",
    short: "Reduced ejection",
    start: 0.32,
    end: 0.44,
    part: "systole",
    pressure:
      "Both ventricular and aortic pressure fall as repolarization begins; ventricular pressure drops slightly below aortic while flow continues by momentum.",
    volume: "Remaining stroke volume ejected, reaching end-systolic volume ~50 mL.",
    valves: "Mitral closed · Aortic open",
    ecg: "Spans the T wave — ventricular repolarization.",
    pearl:
      "Flow persists briefly against a reversed pressure gradient because of inertia — pressure gradient alone does not define flow.",
  },
  {
    id: "isovolumetric-relaxation",
    index: 5,
    name: "Isovolumetric relaxation",
    short: "IVR",
    start: 0.44,
    end: 0.5,
    part: "diastole",
    pressure:
      "Ventricular pressure collapses from ~95 to ~10 mmHg. Aortic pressure shows the dicrotic notch at valve closure.",
    volume: "Constant at end-systolic volume (~50 mL).",
    valves: "Mitral closed · Aortic closed — all four valves shut",
    ecg: "Just after the end of the T wave.",
    sound: "S2 — aortic then pulmonic closure (A2–P2)",
    pearl:
      "Active, ATP-dependent relaxation. Impaired here is diastolic dysfunction — the substrate of HFpEF.",
  },
  {
    id: "rapid-filling",
    index: 6,
    name: "Rapid filling",
    short: "Rapid filling",
    start: 0.5,
    end: 0.66,
    part: "diastole",
    pressure:
      "Ventricular pressure falls below atrial pressure, mitral valve opens, and pressures equalize at a low level (~5–8 mmHg).",
    volume: "Roughly 70–80% of ventricular filling happens passively here.",
    valves: "Mitral open · Aortic closed",
    ecg: "Electrically silent — the TP interval.",
    sound: "S3 if present (volume overload, dilated ventricle)",
    pearl:
      "A physiologic S3 can be normal under age 40 or in pregnancy; after 40 it suggests a failing, dilated ventricle.",
  },
  {
    id: "diastasis",
    index: 7,
    name: "Reduced filling (diastasis)",
    short: "Diastasis",
    start: 0.66,
    end: 1,
    part: "diastole",
    pressure: "Atrial and ventricular pressures rise together slowly as the ventricle fills.",
    volume: "Slow trickle of filling toward end-diastolic volume.",
    valves: "Mitral open · Aortic closed",
    ecg: "Silent until the next P wave.",
    pearl:
      "The first phase shortened by tachycardia — which is why very fast rates compromise filling and stroke volume.",
  },
];

export function phaseAt(t: number): Phase {
  const x = ((t % 1) + 1) % 1;
  return PHASES.find((p) => x >= p.start && x < p.end) ?? PHASES[PHASES.length - 1];
}

/* ---------- waveform models ---------- */

type Key = [number, number];

function interp(keys: Key[], t: number): number {
  const x = Math.min(0.9999, Math.max(0, t));
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, y0] = keys[i];
    const [x1, y1] = keys[i + 1];
    if (x >= x0 && x <= x1) {
      const u = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      const s = u * u * (3 - 2 * u); // smoothstep
      return y0 + (y1 - y0) * s;
    }
  }
  return keys[keys.length - 1][1];
}

const VENTRICULAR: Key[] = [
  [0, 6],
  [0.06, 11],
  [0.1, 10],
  [0.13, 45],
  [0.16, 80],
  [0.24, 118],
  [0.32, 120],
  [0.4, 104],
  [0.44, 92],
  [0.47, 40],
  [0.5, 8],
  [0.55, 4],
  [0.66, 6],
  [1, 6],
];

const AORTIC: Key[] = [
  [0, 84],
  [0.1, 81],
  [0.16, 80],
  [0.24, 118],
  [0.32, 120],
  [0.4, 106],
  [0.44, 98],
  [0.46, 92],
  [0.475, 99], // dicrotic notch rebound
  [0.55, 95],
  [0.75, 89],
  [1, 84],
];

const ATRIAL: Key[] = [
  [0, 7],
  [0.05, 12],
  [0.1, 8],
  [0.13, 10],
  [0.18, 7],
  [0.3, 9],
  [0.44, 13],
  [0.5, 10],
  [0.56, 4],
  [0.7, 6],
  [1, 7],
];

const VOLUME: Key[] = [
  [0, 108],
  [0.1, 120],
  [0.16, 120],
  [0.24, 85],
  [0.32, 62],
  [0.44, 50],
  [0.5, 50],
  [0.58, 88],
  [0.66, 100],
  [1, 108],
];

export const ventricularPressure = (t: number) => interp(VENTRICULAR, t);
export const aorticPressure = (t: number) => interp(AORTIC, t);
export const atrialPressure = (t: number) => interp(ATRIAL, t);
export const ventricularVolume = (t: number) => interp(VOLUME, t);

/** Simple analytic ECG (lead II) in arbitrary mV. */
export function ecg(t: number): number {
  const x = ((t % 1) + 1) % 1;
  const g = (c: number, w: number, a: number) => a * Math.exp(-((x - c) ** 2) / (2 * w * w));
  return (
    g(0.045, 0.018, 0.16) + // P
    g(0.112, 0.006, -0.09) + // Q
    g(0.128, 0.008, 1) + // R
    g(0.148, 0.007, -0.18) + // S
    g(0.36, 0.032, 0.26) // T
  );
}

export const mitralOpen = (t: number) => {
  const x = ((t % 1) + 1) % 1;
  return x < 0.1 || x >= 0.5;
};
export const aorticOpen = (t: number) => {
  const x = ((t % 1) + 1) % 1;
  return x >= 0.16 && x < 0.44;
};

export type HeartSound = { id: string; t: number; label: string; detail: string };

export const SOUNDS: HeartSound[] = [
  {
    id: "s1",
    t: 0.105,
    label: "S1",
    detail: "Mitral + tricuspid closure — start of systole",
  },
  {
    id: "s2",
    t: 0.447,
    label: "S2",
    detail: "Aortic + pulmonic closure — start of diastole",
  },
];

/** Sample a curve into an SVG polyline path across the full cycle. */
export function curvePath(
  fn: (t: number) => number,
  opts: { width: number; height: number; min: number; max: number; samples?: number; pad?: number },
): string {
  const { width, height, min, max } = opts;
  const samples = opts.samples ?? 240;
  const pad = opts.pad ?? 0;
  const usable = height - pad * 2;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const v = fn(t);
    const x = t * width;
    const y = pad + usable - ((v - min) / (max - min)) * usable;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export function yFor(
  value: number,
  opts: { height: number; min: number; max: number; pad?: number },
) {
  const pad = opts.pad ?? 0;
  const usable = opts.height - pad * 2;
  return pad + usable - ((value - opts.min) / (opts.max - opts.min)) * usable;
}
