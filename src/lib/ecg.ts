/**
 * CardioLab ECG engine — original, schematic signal synthesis for teaching.
 * Waveforms are sums of Gaussian deflections sampled in time (s) and
 * amplitude (mV), drawn on standard paper: 25 mm/s and 10 mm/mV.
 * Illustrations only — never patient data.
 */

export const LIMB_LEADS = [
  { id: "I", angle: 0 },
  { id: "II", angle: 60 },
  { id: "III", angle: 120 },
  { id: "aVR", angle: -150 },
  { id: "aVL", angle: -30 },
  { id: "aVF", angle: 90 },
] as const;
export type LimbLeadId = (typeof LIMB_LEADS)[number]["id"];
export const PRECORDIAL_LEADS = ["V1", "V2", "V3", "V4", "V5", "V6"] as const;
export type PrecordialLeadId = (typeof PRECORDIAL_LEADS)[number];
export type LeadId = LimbLeadId | PrecordialLeadId;

export const GRID_ORDER: LeadId[][] = [
  ["I", "aVR", "V1", "V4"],
  ["II", "aVL", "V2", "V5"],
  ["III", "aVF", "V3", "V6"],
];

export const PAPER_SPEED = 25; // mm/s
export const GAIN = 10; // mm/mV

/* ---------- axis ---------- */

/** Normalize to (−180, +180]. */
export function normalizeAngle(a: number): number {
  const x = ((((a + 180) % 360) + 360) % 360) - 180;
  return x === -180 ? 180 : x;
}

/** Relative net QRS projection on a lead: cos(axis − lead orientation). */
export function projection(axis: number, leadAngle: number): number {
  return Math.cos(((axis - leadAngle) * Math.PI) / 180);
}

export type AxisClass = "normal" | "lad" | "rad" | "extreme";

/**
 * Practical teaching ranges: normal −30° to +90° (inclusive),
 * LAD −30° to −90°, RAD +90° to +180°, extreme −90° to −180°.
 * Exact boundaries are assigned: −30 and +90 → normal, −90 → LAD, ±180 → RAD.
 */
export function classifyAxis(a: number): AxisClass {
  const x = normalizeAngle(a);
  if (x >= -30 && x <= 90) return "normal";
  if (x >= -90 && x < -30) return "lad";
  if (x > 90 && x <= 180) return "rad";
  return "extreme";
}

export const AXIS_LABEL: Record<AxisClass, string> = {
  normal: "Normal axis",
  lad: "Left axis deviation",
  rad: "Right axis deviation",
  extreme: "Extreme axis deviation",
};

export function axisBoundaryNote(a: number): string | null {
  const x = normalizeAngle(a);
  if (x === -30) return "Exactly −30° is the lower limit of normal; one degree more negative is LAD.";
  if (x === 90) return "Exactly +90° is the upper limit of normal; beyond it is RAD.";
  if (x === -90) return "Exactly −90° is the far limit of LAD; beyond it is the extreme quadrant.";
  if (x === 180) return "±180° sits on the RAD / extreme border; treated here as the limit of RAD.";
  return null;
}

/* ---------- waveform model ---------- */

export type Wave = { at: number; amp: number; w: number };
export type StShape = "flat" | "coved" | "concave";
export type Complex = {
  /** QRS deflections, times relative to QRS onset (s). */
  qrs: Wave[];
  /** J point (end of QRS), s after onset. */
  j: number;
  /** ST deviation in mV (positive = elevation). */
  st?: number;
  stShape?: StShape;
  t: Wave;
  u?: Wave;
};
export type Rhythm = {
  duration: number;
  /** P-wave centres (s). */
  pTimes: number[];
  pAmp: number;
  pW?: number;
  beats: { at: number; complex: Complex }[];
  baseline?: (t: number) => number;
  /** PR-segment deviation in mV (e.g. pericarditis). */
  prSeg?: number;
};
export type Trace = { label: string; rhythm: Rhythm };
export type EcgFigure = {
  rows: Trace[][];
  cellDuration: number;
  rowHeight?: number;
  description: string;
};

const gauss = (t: number, w: Wave) => w.amp * Math.exp(-((t - w.at) ** 2) / (2 * w.w * w.w));
const sig = (x: number) => 1 / (1 + Math.exp(-x));
const win = (t: number, a: number, b: number, e = 0.012) => sig((t - a) / e) * sig((b - t) / e);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

export function sampleRhythm(r: Rhythm, t: number): number {
  let v = r.baseline ? r.baseline(t) : 0;
  const pw = r.pW ?? 0.022;
  for (const pc of r.pTimes) {
    const d = t - pc;
    if (Math.abs(d) < 0.15) v += r.pAmp * Math.exp(-(d * d) / (2 * pw * pw));
  }
  for (const b of r.beats) {
    const d = t - b.at;
    if (d < -0.2 || d > 0.85) continue;
    const c = b.complex;
    for (const w of c.qrs) v += gauss(d, w);
    if (c.st) {
      const end = c.t.at;
      const f = clamp01((d - c.j) / Math.max(end - c.j, 0.05));
      const shape = c.stShape === "coved" ? 1 - 0.75 * f : c.stShape === "concave" ? 0.55 + 0.45 * f : 1;
      v += c.st * shape * win(d, c.j, end + c.t.w * 0.5);
    }
    v += gauss(d, c.t);
    if (c.u) v += gauss(d, c.u);
    if (r.prSeg) v += r.prSeg * win(d, -0.085, -0.008, 0.008);
  }
  return v;
}

export function tracePath(r: Rhythm, duration: number, x0: number, y0: number, dt = 0.002): string {
  const n = Math.round(duration / dt);
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const x = x0 + t * PAPER_SPEED;
    const y = y0 - sampleRhythm(r, t) * GAIN;
    d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/* ---------- normal morphology ---------- */

export function limbAngle(lead: LeadId): number | undefined {
  return LIMB_LEADS.find((l) => l.id === lead)?.angle;
}

/** Normal limb-lead complex with relative net projection p ∈ [−1, 1]. */
export function limbComplex(p: number, tP = p): Complex {
  return {
    qrs: [
      { at: 0.015, amp: -0.08 * Math.max(p, 0), w: 0.007 },
      { at: 0.042, amp: 0.6 * (1 + p), w: 0.011 },
      { at: 0.068, amp: -0.55 * (1 - p), w: 0.011 },
    ],
    j: 0.095,
    t: { at: 0.3, amp: 0.28 * tP, w: 0.045 },
  };
}

const PRECORDIAL_SHAPE: Record<PrecordialLeadId, { q: number; r: number; s: number; t: number }> = {
  V1: { q: 0, r: 0.22, s: -1.0, t: 0.08 },
  V2: { q: 0, r: 0.4, s: -1.35, t: 0.35 },
  V3: { q: 0, r: 0.75, s: -0.8, t: 0.4 },
  V4: { q: 0, r: 1.25, s: -0.4, t: 0.42 },
  V5: { q: -0.08, r: 1.3, s: -0.2, t: 0.32 },
  V6: { q: -0.08, r: 1.05, s: -0.1, t: 0.25 },
};

export function precordialComplex(lead: PrecordialLeadId): Complex {
  const s = PRECORDIAL_SHAPE[lead];
  return {
    qrs: [
      { at: 0.015, amp: s.q, w: 0.007 },
      { at: 0.04, amp: s.r, w: 0.011 },
      { at: 0.068, amp: s.s, w: 0.012 },
    ],
    j: 0.095,
    t: { at: 0.3, amp: s.t, w: 0.045 },
  };
}

export function normalComplex(lead: LeadId, axis = 60): Complex {
  const a = limbAngle(lead);
  return a !== undefined ? limbComplex(projection(axis, a)) : precordialComplex(lead as PrecordialLeadId);
}

export function pAmpFor(lead: string): number {
  const a = limbAngle(lead as LeadId);
  if (a !== undefined) return 0.14 * projection(60, a);
  return lead === "V1" ? 0.05 : 0.1;
}

export function modify(
  c: Complex,
  m: { st?: number; stShape?: StShape; tAmp?: number; tAt?: number; tW?: number; u?: Wave },
): Complex {
  return {
    ...c,
    st: m.st ?? c.st,
    stShape: m.stShape ?? c.stShape,
    t: { at: m.tAt ?? c.t.at, amp: m.tAmp ?? c.t.amp, w: m.tW ?? c.t.w },
    u: m.u ?? c.u,
  };
}

/* ---------- timing & figure builders ---------- */

export type Timing = { duration: number; pTimes: number[]; qrsTimes: number[] };

/** Regular sinus timing. P centre sits PR − 0.05 s before QRS onset. */
export function sinusTiming(rate: number, duration: number, pr = 0.16, start = 0.3): Timing {
  const rr = 60 / rate;
  const qrsTimes: number[] = [];
  for (let t = start; t < duration - 0.12; t += rr) qrsTimes.push(t);
  return { duration, qrsTimes, pTimes: qrsTimes.map((q) => q - pr + 0.05) };
}

export function makeTrace(
  label: string,
  timing: Timing,
  complexFor: (i: number) => Complex,
  opts: { pAmp?: number; pW?: number; baseline?: (t: number) => number; prSeg?: number } = {},
): Trace {
  return {
    label,
    rhythm: {
      duration: timing.duration,
      pTimes: timing.pTimes,
      pAmp: opts.pAmp ?? pAmpFor(label),
      ...(opts.pW === undefined ? {} : { pW: opts.pW }),
      beats: timing.qrsTimes.map((at, i) => ({ at, complex: complexFor(i) })),
      ...(opts.baseline === undefined ? {} : { baseline: opts.baseline }),
      ...(opts.prSeg === undefined ? {} : { prSeg: opts.prSeg }),
    },
  };
}

export function stripFigure(traces: Trace[], description: string, rowHeight?: number): EcgFigure {
  return { rows: traces.map((t) => [t]), cellDuration: traces[0]?.rhythm.duration ?? 0, ...(rowHeight === undefined ? {} : { rowHeight }), description };
}

export function twelveLead(
  complexFor: (lead: LeadId) => Complex,
  description: string,
  opts: { rate?: number; pr?: number; prSegFor?: (lead: LeadId) => number | undefined } = {},
): EcgFigure {
  const timing = sinusTiming(opts.rate ?? 75, 2.5, opts.pr ?? 0.16);
  return {
    rows: GRID_ORDER.map((row) =>
      row.map((lead) => {
        const prSeg = opts.prSegFor?.(lead);
        return makeTrace(lead, timing, () => complexFor(lead), prSeg === undefined ? {} : { prSeg });
      }),
    ),
    cellDuration: 2.5,
    description,
  };
}

/** Six limb leads (2 × 3 layout) for a given frontal axis. */
export function axisFigure(axis: number): EcgFigure {
  const timing = sinusTiming(75, 1.6, 0.16, 0.35);
  const tr = (id: LimbLeadId) => makeTrace(id, timing, () => limbComplex(projection(axis, limbAngle(id) ?? 0)));
  return {
    rows: [
      [tr("I"), tr("aVR")],
      [tr("II"), tr("aVL")],
      [tr("III"), tr("aVF")],
    ],
    cellDuration: 1.6,
    description: `Limb leads I, II, III, aVR, aVL and aVF for a mean QRS axis of ${normalizeAngle(axis)} degrees.`,
  };
}

export function scoreAnswers(answers: (number | undefined)[], keys: number[]): number {
  return keys.reduce((n, k, i) => n + (answers[i] === k ? 1 : 0), 0);
}
