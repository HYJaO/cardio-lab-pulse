/**
 * Cardiac function (Frank–Starling) and vascular function curves.
 *
 * Framework-free model shared by the CardioLab PV-loop laboratory.
 * Units are illustrative teaching values, chosen so the normal operating
 * point sits at roughly RAP 2 mmHg and cardiac output 5 L/min — the
 * relationships (direction of every shift), not the absolute numbers,
 * are what the board tests.
 */

export type StarlingParams = {
  /** Inotropy multiplier: 1 = normal. */
  contractility: number;
  /** Total peripheral resistance multiplier: 1 = normal (afterload). */
  afterload: number;
  /** Blood volume / venomotor tone multiplier: 1 = normal (sets MSFP). */
  volume: number;
};

export const STARLING_DEFAULTS: StarlingParams = {
  contractility: 1,
  afterload: 1,
  volume: 1,
};

export const STARLING_RANGES = {
  contractility: { min: 0.4, max: 1.8, step: 0.05, unit: "×" },
  afterload: { min: 0.6, max: 1.8, step: 0.05, unit: "×" },
  volume: { min: 0.6, max: 1.6, step: 0.05, unit: "×" },
} as const;

/** Mean systemic filling pressure, mmHg — the x-intercept of venous return. */
export function msfp(p: StarlingParams): number {
  return 7 * p.volume;
}

/**
 * Cardiac function curve: cardiac output (L/min) as a function of
 * right atrial (filling) pressure. Contractility raises and steepens it;
 * increased afterload depresses it.
 */
export function cardiacOutput(rap: number, p: StarlingParams): number {
  const plateau = 13 * p.contractility * (1 / (0.55 + 0.45 * p.afterload));
  const x = Math.max(0, rap + 4);
  return plateau * (1 - Math.exp(-x / 5.2));
}

/**
 * Vascular function curve: venous return (L/min) as a function of right
 * atrial pressure. Zero at MSFP, plateauing when the great veins collapse.
 */
export function venousReturn(rap: number, p: StarlingParams): number {
  const resistance = 1.35 * (0.6 + 0.4 * p.afterload);
  const vr = (msfp(p) - rap) / resistance;
  const plateau = (msfp(p) + 4) / resistance;
  return Math.max(0, Math.min(vr, plateau));
}

export type OperatingPoint = { rap: number; co: number };

/** Steady state = intersection of the two curves (bisection). */
export function operatingPoint(p: StarlingParams): OperatingPoint {
  let lo = -4;
  let hi = 20;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (cardiacOutput(mid, p) - venousReturn(mid, p) > 0) hi = mid;
    else lo = mid;
  }
  const rap = (lo + hi) / 2;
  return { rap, co: cardiacOutput(rap, p) };
}

export type StarlingStateId =
  | "normal"
  | "increased-contractility"
  | "reduced-contractility"
  | "volume-loading"
  | "hemorrhage"
  | "increased-afterload";

export type StarlingState = {
  id: StarlingStateId;
  label: string;
  params: StarlingParams;
  example: string;
  teaching: string;
};

export const STARLING_STATES: StarlingState[] = [
  {
    id: "normal",
    label: "Normal",
    params: STARLING_DEFAULTS,
    example: "Healthy adult at rest.",
    teaching:
      "The cardiac function and vascular function curves cross at the steady-state operating point: cardiac output must equal venous return.",
  },
  {
    id: "increased-contractility",
    label: "↑ Contractility",
    params: { ...STARLING_DEFAULTS, contractility: 1.5 },
    example: "Sympathetic drive, exercise, dobutamine, digoxin.",
    teaching:
      "The cardiac function curve shifts up and left: at the same filling pressure the ventricle ejects more, so cardiac output rises and right atrial pressure falls.",
  },
  {
    id: "reduced-contractility",
    label: "↓ Contractility",
    params: { ...STARLING_DEFAULTS, contractility: 0.6 },
    example: "Systolic heart failure (HFrEF), post-MI, beta blockade.",
    teaching:
      "The curve flattens and shifts down and right: cardiac output falls and filling pressure rises — the haemodynamic signature of congestion.",
  },
  {
    id: "volume-loading",
    label: "↑ Blood volume / venous tone",
    params: { ...STARLING_DEFAULTS, volume: 1.35 },
    example: "Fluid resuscitation, transfusion, sympathetic venoconstriction.",
    teaching:
      "The vascular function curve shifts right in parallel: mean systemic filling pressure rises, so both venous return and cardiac output rise at a higher right atrial pressure.",
  },
  {
    id: "hemorrhage",
    label: "↓ Blood volume",
    params: { ...STARLING_DEFAULTS, volume: 0.7 },
    example: "Haemorrhage, dehydration, venodilators (nitroglycerin).",
    teaching:
      "The vascular function curve shifts left: mean systemic filling pressure falls, so venous return, right atrial pressure and cardiac output all fall.",
  },
  {
    id: "increased-afterload",
    label: "↑ Afterload / TPR",
    params: { ...STARLING_DEFAULTS, afterload: 1.6 },
    example: "Uncontrolled hypertension, aortic stenosis, vasopressors.",
    teaching:
      "Raising resistance depresses the cardiac function curve and flattens venous return: cardiac output falls while right atrial pressure drifts up.",
  },
];

/** Sample a curve for plotting. */
export function sampleCurve(
  fn: (rap: number, p: StarlingParams) => number,
  p: StarlingParams,
  from = -4,
  to = 16,
  steps = 120,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const rap = from + ((to - from) * i) / steps;
    pts.push([rap, fn(rap, p)]);
  }
  return pts;
}
