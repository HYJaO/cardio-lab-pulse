import {
  axisFigure,
  limbAngle,
  limbComplex,
  makeTrace,
  modify,
  normalComplex,
  precordialComplex,
  projection,
  sinusTiming,
  stripFigure,
  twelveLead,
  type Complex,
  type EcgFigure,
  type LeadId,
  type Timing,
} from "./ecg";

export type FindingKey = "rate" | "rhythm" | "axis" | "intervals" | "morphology" | "distribution";
export const FINDING_LABEL: Record<FindingKey, string> = {
  rate: "Rate",
  rhythm: "Rhythm",
  axis: "Axis",
  intervals: "Intervals",
  morphology: "Morphology",
  distribution: "Lead distribution",
};
export type Findings = Partial<Record<FindingKey, string>>;

export type PatternVariant = { id: string; label: string; figure: () => EcgFigure; findings: Findings };
export type EcgPattern = {
  id: string;
  name: string;
  group: string;
  summary: string;
  mechanism: string;
  trap: string;
  variants: PatternVariant[];
};

/* ---------- reusable complexes ---------- */

const II = () => limbComplex(1);
const wideEscape: Complex = {
  qrs: [
    { at: 0.05, amp: 1.0, w: 0.022 },
    { at: 0.115, amp: -0.3, w: 0.02 },
  ],
  j: 0.145,
  t: { at: 0.36, amp: -0.3, w: 0.055 },
};
const vtComplex: Complex = {
  qrs: [
    { at: 0.07, amp: 1.3, w: 0.035 },
    { at: 0.17, amp: -0.7, w: 0.04 },
  ],
  j: 0.21,
  t: { at: 0.3, amp: -0.12, w: 0.05 },
};
const rbbbV1: Complex = {
  qrs: [
    { at: 0.02, amp: 0.3, w: 0.01 },
    { at: 0.05, amp: -0.4, w: 0.012 },
    { at: 0.095, amp: 0.9, w: 0.017 },
  ],
  j: 0.13,
  t: { at: 0.33, amp: -0.2, w: 0.05 },
};
const rbbbLateral: Complex = {
  qrs: [
    { at: 0.015, amp: -0.08, w: 0.007 },
    { at: 0.045, amp: 1.0, w: 0.012 },
    { at: 0.1, amp: -0.35, w: 0.022 },
  ],
  j: 0.13,
  t: { at: 0.33, amp: 0.25, w: 0.045 },
};
const lbbbV1: Complex = {
  qrs: [
    { at: 0.02, amp: 0.1, w: 0.01 },
    { at: 0.075, amp: -1.5, w: 0.03 },
  ],
  j: 0.15,
  st: 0.15,
  stShape: "concave",
  t: { at: 0.34, amp: 0.35, w: 0.05 },
};
const lbbbLateral: Complex = {
  qrs: [
    { at: 0.05, amp: 0.85, w: 0.02 },
    { at: 0.105, amp: 0.95, w: 0.02 },
  ],
  j: 0.15,
  st: -0.1,
  t: { at: 0.34, amp: -0.3, w: 0.05 },
};

/* ---------- figure builders ---------- */

function leadII(timing: Timing, c: Complex | ((i: number) => Complex), opts: Parameters<typeof makeTrace>[3] = {}) {
  return makeTrace("II", timing, typeof c === "function" ? c : () => c, opts);
}

function sinusFig(rate: number): EcgFigure {
  const c = rate > 100 ? modify(II(), { tAt: 0.25, tW: 0.038 }) : II();
  return stripFigure(
    [leadII(sinusTiming(rate, 6, 0.16), c)],
    `Lead II rhythm strip: sinus rhythm at ${rate} beats per minute, upright P before every narrow QRS.`,
  );
}

function axisDevFig(axis: number, label: string): EcgFigure {
  const timing = sinusTiming(75, 3);
  const tr = (id: LeadId) => makeTrace(id, timing, () => limbComplex(projection(axis, limbAngle(id)!)));
  return stripFigure([tr("I"), tr("II"), tr("aVF")], `Leads I, II and aVF showing ${label} (axis ${axis} degrees).`);
}

function avb1Fig(): EcgFigure {
  return stripFigure(
    [leadII(sinusTiming(70, 6, 0.28), II())],
    "Lead II: sinus rhythm at 70 per minute with a constant PR interval of about 280 ms; every P conducts.",
  );
}

function mobitz1Fig(): EcgFigure {
  const prs = [0.16, 0.26, 0.32];
  const pTimes: number[] = [];
  const qrsTimes: number[] = [];
  for (let k = 0; k < 8; k++) {
    const pc = 0.25 + k * 0.75;
    pTimes.push(pc);
    const g = k % 4;
    if (g < 3) qrsTimes.push(pc - 0.05 + prs[g]);
  }
  return stripFigure(
    [leadII({ duration: 6, pTimes, qrsTimes }, II())],
    "Lead II: regular P waves; PR lengthens progressively over three beats, then one P wave is not followed by a QRS (grouped beating).",
  );
}

function mobitz2Fig(): EcgFigure {
  const pTimes: number[] = [];
  const qrsTimes: number[] = [];
  for (let k = 0; k < 8; k++) {
    const pc = 0.25 + k * 0.75;
    pTimes.push(pc);
    if (k % 3 !== 2) qrsTimes.push(pc - 0.05 + 0.16);
  }
  return stripFigure(
    [leadII({ duration: 6, pTimes, qrsTimes }, II())],
    "Lead II: constant PR interval of 160 ms on conducted beats, with sudden non-conducted P waves and no prior PR lengthening.",
  );
}

function chbFig(): EcgFigure {
  const pTimes: number[] = [];
  for (let t = 0.2; t < 6; t += 0.667) pTimes.push(t);
  const qrsTimes = [0.5, 2.0, 3.5, 5.0];
  return stripFigure(
    [leadII({ duration: 6, pTimes, qrsTimes }, wideEscape)],
    "Lead II: P waves march through at about 90 per minute; wide QRS escape complexes at about 40 per minute with no fixed PR relationship.",
  );
}

function bbbFig(kind: "rbbb" | "lbbb"): EcgFigure {
  const timing = sinusTiming(70, 3);
  const v1 = kind === "rbbb" ? rbbbV1 : lbbbV1;
  const lat = kind === "rbbb" ? rbbbLateral : lbbbLateral;
  return stripFigure(
    [makeTrace("V1", timing, () => v1), makeTrace("V6", timing, () => lat), makeTrace("I", timing, () => lat)],
    kind === "rbbb"
      ? "Leads V1, V6 and I: QRS about 130 ms; rsR prime in V1 with inverted T; broad slurred S in V6 and I."
      : "Leads V1, V6 and I: QRS about 150 ms; deep broad S in V1; broad notched R in V6 and I with discordant ST-T changes.",
  );
}

function afFig(): EcgFigure {
  const rr = [0.62, 0.9, 0.55, 0.98, 0.7, 0.6, 0.84, 0.66, 0.92];
  const qrsTimes: number[] = [];
  let t = 0.3;
  for (let i = 0; t < 5.8; i++) {
    qrsTimes.push(t);
    t += rr[i % rr.length];
  }
  const fib = (x: number) =>
    0.05 * Math.sin(2 * Math.PI * 6.3 * x) + 0.035 * Math.sin(2 * Math.PI * 8.7 * x + 1) + 0.025 * Math.sin(2 * Math.PI * 11.1 * x + 2);
  return stripFigure(
    [leadII({ duration: 6, pTimes: [], qrsTimes }, II(), { baseline: fib })],
    "Lead II: irregularly irregular narrow QRS complexes with no discrete P waves and a fibrillatory baseline.",
  );
}

function flutterFig(): EcgFigure {
  const saw = (x: number) => {
    const ph = (((x - 0.12) / 0.2) % 1 + 1) % 1;
    return ph < 0.8 ? 0.08 - 0.28 * (ph / 0.8) : -0.2 + 0.28 * ((ph - 0.8) / 0.2);
  };
  const qrsTimes: number[] = [];
  for (let t = 0.3; t < 5.8; t += 0.8) qrsTimes.push(t);
  return stripFigure(
    [leadII({ duration: 6, pTimes: [], qrsTimes }, II(), { baseline: saw })],
    "Lead II: negative sawtooth flutter waves at 300 per minute with 4 to 1 conduction, ventricular rate 75 per minute.",
  );
}

function svtFig(): EcgFigure {
  const t = sinusTiming(180, 6);
  return stripFigure(
    [leadII({ ...t, pTimes: [] }, modify(II(), { tAt: 0.22, tW: 0.035 }))],
    "Lead II: regular narrow-complex tachycardia at 180 per minute with no visible P waves.",
  );
}

function vtFig(): EcgFigure {
  const t = sinusTiming(170, 6);
  return stripFigure(
    [leadII({ ...t, pTimes: [] }, vtComplex)],
    "Lead II: regular wide-complex tachycardia at about 170 per minute, QRS over 140 ms, monomorphic, no organized P waves.",
  );
}

type Region = "septal" | "anterior" | "lateral" | "inferior";
const REGIONS: Record<Region, { leads: LeadId[]; recip: LeadId[]; artery: string }> = {
  septal: { leads: ["V1", "V2"], recip: [], artery: "LAD" },
  anterior: { leads: ["V3", "V4"], recip: ["II", "III", "aVF"], artery: "LAD" },
  lateral: { leads: ["I", "aVL", "V5", "V6"], recip: ["II", "III", "aVF"], artery: "LCx" },
  inferior: { leads: ["II", "III", "aVF"], recip: ["I", "aVL"], artery: "RCA" },
};

export function stemiFigure(region: Region): EcgFigure {
  const r = REGIONS[region];
  return twelveLead((lead) => {
    const base = normalComplex(lead);
    if (r.leads.includes(lead)) return modify(base, { st: 0.28, tAmp: Math.max(base.t.amp, 0.15) + 0.35 });
    if (r.recip.includes(lead)) return modify(base, { st: -0.14, tAmp: base.t.amp * 0.4 });
    return base;
  }, `Twelve-lead illustration: ST elevation in ${r.leads.join(", ")}${r.recip.length ? `, reciprocal ST depression in ${r.recip.join(", ")}` : ""}.`);
}

function hyperkFig(): EcgFigure {
  const t = sinusTiming(70, 4);
  const ii: Complex = {
    qrs: [
      { at: 0.05, amp: 0.9, w: 0.018 },
      { at: 0.1, amp: -0.3, w: 0.02 },
    ],
    j: 0.13,
    t: { at: 0.27, amp: 0.85, w: 0.024 },
  };
  const v2: Complex = {
    qrs: [
      { at: 0.03, amp: 0.3, w: 0.015 },
      { at: 0.09, amp: -1.2, w: 0.022 },
    ],
    j: 0.13,
    t: { at: 0.27, amp: 1.1, w: 0.024 },
  };
  return stripFigure(
    [makeTrace("II", t, () => ii, { pAmp: 0.04 }), makeTrace("V2", t, () => v2, { pAmp: 0.03 })],
    "Leads II and V2: tall, narrow, peaked T waves, flattened P waves and a widened QRS.",
  );
}

function hypokFig(): EcgFigure {
  const t = sinusTiming(70, 4);
  return stripFigure(
    [
      makeTrace("II", t, () => modify(II(), { st: -0.08, tAmp: 0.07, u: { at: 0.5, amp: 0.14, w: 0.04 } })),
      makeTrace("V2", t, () => modify(precordialComplex("V2"), { st: -0.1, tAmp: 0.08, u: { at: 0.5, amp: 0.2, w: 0.04 } })),
    ],
    "Leads II and V2: flattened T waves, mild ST depression and prominent U waves after the T.",
  );
}

function longQtFig(): EcgFigure {
  return stripFigure(
    [leadII(sinusTiming(60, 6), modify(II(), { tAt: 0.47, tW: 0.06, tAmp: 0.3 }))],
    "Lead II: sinus rhythm at 60 per minute with a QT interval of about 530 ms, longer than half the RR interval.",
  );
}

function brugadaFig(): EcgFigure {
  const t = sinusTiming(70, 3);
  const v = (st: number): Complex => ({
    qrs: [
      { at: 0.02, amp: 0.25, w: 0.01 },
      { at: 0.05, amp: -0.35, w: 0.012 },
      { at: 0.085, amp: 0.5, w: 0.012 },
    ],
    j: 0.1,
    st,
    stShape: "coved",
    t: { at: 0.3, amp: -0.3, w: 0.05 },
  });
  return stripFigure(
    [makeTrace("V1", t, () => v(0.38)), makeTrace("V2", t, () => v(0.3)), makeTrace("V5", t, () => precordialComplex("V5"))],
    "Leads V1, V2 and V5: coved ST elevation of at least 2 mm with T inversion in V1 and V2 (type 1 pattern); V5 normal.",
  );
}

function wpwFig(): EcgFigure {
  const t = sinusTiming(75, 4, 0.1);
  const mk = (s: number): Complex => ({
    qrs: [
      { at: 0.035, amp: 0.35 * s, w: 0.022 },
      { at: 0.085, amp: 1.0 * s, w: 0.013 },
      { at: 0.115, amp: -0.15, w: 0.012 },
    ],
    j: 0.135,
    t: { at: 0.34, amp: 0.18, w: 0.05 },
  });
  return stripFigure(
    [makeTrace("II", t, () => mk(1)), makeTrace("V1", t, () => mk(0.7))],
    "Leads II and V1: short PR interval of about 100 ms, slurred delta-wave upstroke and a widened QRS.",
  );
}

function pericarditisFig(): EcgFigure {
  const diffuse: LeadId[] = ["I", "II", "aVL", "aVF", "V2", "V3", "V4", "V5", "V6"];
  return twelveLead(
    (lead) => {
      const base = normalComplex(lead);
      if (lead === "aVR") return modify(base, { st: -0.1 });
      if (lead === "III") return modify(base, { st: 0.08, stShape: "concave" });
      if (diffuse.includes(lead)) return modify(base, { st: 0.16, stShape: "concave" });
      return base;
    },
    "Twelve-lead illustration: diffuse concave ST elevation with PR depression across limb and precordial leads; ST depression and PR elevation in aVR.",
    {
      prSegFor: (lead) => (lead === "aVR" ? 0.05 : lead === "V1" ? undefined : -0.05),
    },
  );
}

/* ---------- library ---------- */

export const ECG_PATTERNS: EcgPattern[] = [
  {
    id: "sinus",
    name: "Sinus rhythm & rate",
    group: "Rate & rhythm",
    summary: "Every QRS is preceded by an upright P in II; the rate decides normal, brady or tachy.",
    mechanism:
      "The SA node sets the pace; autonomic tone shifts its rate. Rate ≈ 300 ÷ number of large (5-mm) boxes between R waves, or count QRS in 10 s × 6.",
    trap:
      "Sinus tachycardia is a response, not a diagnosis — look for the cause (pain, fever, hypovolemia, PE, hyperthyroidism) rather than ‘treating the rate’.",
    variants: [
      { id: "brady", label: "Bradycardia 48", figure: () => sinusFig(48), findings: { rate: "48 /min (< 60)", rhythm: "Regular, P before every QRS", intervals: "PR 160 ms, QRS narrow", morphology: "Upright P in II" } },
      { id: "normal", label: "Normal 75", figure: () => sinusFig(75), findings: { rate: "75 /min (4 large boxes)", rhythm: "Regular sinus", intervals: "PR 160 ms, QRS 90 ms", morphology: "Upright P in II" } },
      { id: "tachy", label: "Tachycardia 125", figure: () => sinusFig(125), findings: { rate: "125 /min (> 100)", rhythm: "Regular sinus; P may near the prior T", intervals: "PR normal, QT shortens with rate", morphology: "Upright P in II" } },
    ],
  },
  {
    id: "axis",
    name: "Axis deviation",
    group: "Rate & rhythm",
    summary: "Leads I and aVF are the fastest quadrant check; lead II separates borderline LAD.",
    mechanism:
      "The mean QRS vector shifts toward hypertrophied muscle and away from infarcted or slowly conducting regions (e.g. left anterior fascicular block → LAD; RVH → RAD).",
    trap:
      "Lead I positive with aVF negative is not automatically LAD: if lead II is still positive the axis is between 0° and −30°, which is normal.",
    variants: [
      { id: "lad", label: "LAD −60°", figure: () => axisDevFig(-60, "left axis deviation"), findings: { axis: "−60°", morphology: "I positive, II and aVF negative", distribution: "Limb leads" } },
      { id: "rad", label: "RAD +120°", figure: () => axisDevFig(120, "right axis deviation"), findings: { axis: "+120°", morphology: "I negative, aVF positive", distribution: "Limb leads" } },
    ],
  },
  {
    id: "avb1",
    name: "1st-degree AV block",
    group: "AV conduction",
    summary: "PR > 200 ms, constant, and every P conducts.",
    mechanism: "Slowed AV-nodal conduction (vagal tone, β-blockers, CCBs, digoxin, aging). No beats are dropped.",
    trap: "It is a delay, not a block of beats — usually benign and needs no pacing.",
    variants: [{ id: "a", label: "Lead II", figure: avb1Fig, findings: { rate: "70 /min", rhythm: "Regular, 1:1 conduction", intervals: "PR 280 ms, fixed", morphology: "Narrow QRS" } }],
  },
  {
    id: "mobitz1",
    name: "Mobitz I (Wenckebach)",
    group: "AV conduction",
    summary: "Progressive PR lengthening until a P fails to conduct; grouped beating.",
    mechanism: "Decremental conduction within the AV node; each beat arrives earlier in the node's refractory period until one is blocked.",
    trap: "Usually benign (often vagal / athletes or inferior MI). Don't confuse with Mobitz II, which has a constant PR.",
    variants: [{ id: "a", label: "Lead II", figure: mobitz1Fig, findings: { rate: "Atrial 80 /min, ventricular slower", rhythm: "Regularly irregular, grouped", intervals: "PR 160 → 260 → 320 ms, then drop", morphology: "Narrow QRS" } }],
  },
  {
    id: "mobitz2",
    name: "Mobitz II",
    group: "AV conduction",
    summary: "Constant PR with sudden non-conducted P waves.",
    mechanism: "Infranodal (His–Purkinje) block; often with bundle-branch disease. Can abruptly progress to complete block.",
    trap: "Usually needs a pacemaker. A 2:1 block cannot be labeled Mobitz I vs II from the strip alone.",
    variants: [{ id: "a", label: "Lead II", figure: mobitz2Fig, findings: { rate: "Atrial 80 /min", rhythm: "Intermittently dropped beats", intervals: "PR constant 160 ms before drops", morphology: "QRS often wide in real cases" } }],
  },
  {
    id: "chb",
    name: "Complete (3rd-degree) AV block",
    group: "AV conduction",
    summary: "AV dissociation: P waves and QRS complexes march independently.",
    mechanism: "No atrial impulses reach the ventricles; a junctional (narrow) or ventricular (wide) escape rhythm takes over.",
    trap: "Atrial rate > ventricular rate with variable PR. Cannon a waves on exam. Lyme disease is a classic reversible cause. Treat with pacing.",
    variants: [{ id: "a", label: "Lead II", figure: chbFig, findings: { rate: "Atrial ~90, ventricular ~40 /min", rhythm: "Both regular but dissociated", intervals: "PR varies randomly", morphology: "Wide escape QRS" } }],
  },
  {
    id: "rbbb",
    name: "Right bundle branch block",
    group: "Ventricular conduction",
    summary: "QRS ≥ 120 ms, rsR′ (‘rabbit ears’) in V1, wide slurred S in I and V6.",
    mechanism: "Septum and LV depolarize normally; the RV activates late via slow myocyte-to-myocyte spread, adding a terminal rightward R′.",
    trap: "Secondary T inversion in V1–V3 is expected in RBBB and is not ischemia by itself.",
    variants: [{ id: "a", label: "V1 · V6 · I", figure: () => bbbFig("rbbb"), findings: { intervals: "QRS ~130 ms", morphology: "rsR′ in V1; broad S in V6/I", distribution: "Right precordial (V1–V2) vs lateral leads" } }],
  },
  {
    id: "lbbb",
    name: "Left bundle branch block",
    group: "Ventricular conduction",
    summary: "QRS ≥ 120 ms, deep broad S in V1, broad notched R in I, aVL, V5–V6.",
    mechanism: "Septum depolarizes right-to-left and the LV activates late, so the whole complex points leftward with discordant ST-T.",
    trap: "New LBBB obscures STEMI recognition; discordant ST changes are expected, but concordant ST elevation suggests infarction (Sgarbossa).",
    variants: [{ id: "a", label: "V1 · V6 · I", figure: () => bbbFig("lbbb"), findings: { intervals: "QRS ~150 ms", morphology: "QS/rS V1; notched R V6, I", distribution: "Discordant ST-T in all" } }],
  },
  {
    id: "af",
    name: "Atrial fibrillation",
    group: "Tachyarrhythmias",
    summary: "Irregularly irregular narrow QRS, no discrete P waves.",
    mechanism: "Chaotic atrial re-entry, often from pulmonary-vein foci; the AV node conducts randomly.",
    trap: "Stroke risk drives anticoagulation (CHA₂DS₂-VASc) regardless of rate or rhythm control.",
    variants: [{ id: "a", label: "Lead II", figure: afFig, findings: { rate: "~85 /min average", rhythm: "Irregularly irregular", intervals: "No PR (no P waves)", morphology: "Fibrillatory baseline, narrow QRS" } }],
  },
  {
    id: "flutter",
    name: "Atrial flutter",
    group: "Tachyarrhythmias",
    summary: "Sawtooth F waves at ~300/min, best in II, III, aVF; fixed ratio conduction.",
    mechanism: "Macro re-entry around the tricuspid annulus (cavotricuspid isthmus); ablation of the isthmus is curative.",
    trap: "A regular narrow tachycardia at exactly ~150/min is 2:1 flutter until proven otherwise — F waves hide in the QRS and T.",
    variants: [{ id: "a", label: "Lead II · 4:1", figure: flutterFig, findings: { rate: "Atrial 300, ventricular 75 /min", rhythm: "Regular (4:1)", morphology: "Negative sawtooth waves", distribution: "Inferior leads II, III, aVF" } }],
  },
  {
    id: "svt",
    name: "Narrow-complex SVT",
    group: "Tachyarrhythmias",
    summary: "Regular narrow QRS at 150–250/min with P waves absent or buried.",
    mechanism: "Usually AV-nodal re-entry (AVNRT): a circuit using fast and slow nodal pathways; retrograde P hides in or just after the QRS.",
    trap: "Try vagal maneuvers, then adenosine — transient AV-node block terminates nodal re-entry and unmasks flutter.",
    variants: [{ id: "a", label: "Lead II", figure: svtFig, findings: { rate: "180 /min", rhythm: "Regular", intervals: "No visible PR; QRS narrow", morphology: "P waves buried" } }],
  },
  {
    id: "vt",
    name: "Ventricular tachycardia",
    group: "Tachyarrhythmias",
    summary: "Regular wide-complex tachycardia, QRS > 120 ms, ≥ 3 consecutive ventricular beats.",
    mechanism: "Re-entry around ventricular scar (prior MI) or a ventricular focus bypasses the His–Purkinje system, so complexes are wide and bizarre.",
    trap: "Assume any wide-complex tachycardia is VT, especially with prior MI — stable patients can still deteriorate; unstable → synchronized cardioversion.",
    variants: [{ id: "a", label: "Lead II", figure: vtFig, findings: { rate: "~170 /min", rhythm: "Regular", intervals: "QRS > 140 ms, no PR", morphology: "Monomorphic wide complexes" } }],
  },
  {
    id: "stemi",
    name: "STEMI localization",
    group: "Ischemia",
    summary: "ST elevation in contiguous leads localizes the infarct; reciprocal depression supports it.",
    mechanism:
      "Transmural injury currents shift the ST segment toward the injured wall. Leads facing the opposite wall record reciprocal ST depression.",
    trap:
      "Septal V1–V2 and anterior V3–V4 = LAD; lateral I, aVL, V5–V6 = LCx; inferior II, III, aVF = usually RCA. Inferior MI with hypotension → check right-sided leads; avoid nitrates.",
    variants: (["septal", "anterior", "lateral", "inferior"] as Region[]).map((r) => ({
      id: r,
      label: r[0].toUpperCase() + r.slice(1),
      figure: () => stemiFigure(r),
      findings: {
        rate: "75 /min sinus",
        morphology: "ST elevation with hyperacute T",
        distribution: `${REGIONS[r].leads.join(", ")} (${REGIONS[r].artery})${REGIONS[r].recip.length ? `; reciprocal ↓ in ${REGIONS[r].recip.join(", ")}` : ""}`,
      },
    })),
  },
  {
    id: "hyperk",
    name: "Hyperkalemia",
    group: "Electrolytes & channelopathies",
    summary: "Peaked T → PR prolongation and flat P → wide QRS → sine wave.",
    mechanism: "High extracellular K⁺ depolarizes the resting membrane, inactivating Na⁺ channels (slow conduction) and accelerating repolarization (peaked T).",
    trap: "Give IV calcium first to stabilize the membrane; it does not lower K⁺. Insulin + glucose shifts K⁺ into cells.",
    variants: [{ id: "a", label: "II · V2", figure: hyperkFig, findings: { rate: "70 /min", intervals: "QRS widened", morphology: "Tall narrow peaked T, flat P", distribution: "Most obvious in precordial leads" } }],
  },
  {
    id: "hypok",
    name: "Hypokalemia",
    group: "Electrolytes & channelopathies",
    summary: "Flat T waves, ST depression and prominent U waves.",
    mechanism: "Low K⁺ prolongs and delays ventricular repolarization, revealing the U wave and raising arrhythmia risk.",
    trap: "A large U wave fused with the T can be mistaken for a long QT; correct magnesium too.",
    variants: [{ id: "a", label: "II · V2", figure: hypokFig, findings: { rate: "70 /min", morphology: "Flat T, ST ↓, U wave", distribution: "Best in V2–V3" } }],
  },
  {
    id: "longqt",
    name: "Long QT",
    group: "Electrolytes & channelopathies",
    summary: "QTc > 450–470 ms; risk of torsades de pointes.",
    mechanism: "Delayed repolarization (K⁺-channel loss, drugs, hypoK/hypoMg/hypoCa) prolongs the action potential and allows early afterdepolarizations.",
    trap: "Drug causes: macrolides, fluoroquinolones, ondansetron, antipsychotics, class IA/III antiarrhythmics, methadone. Torsades → IV magnesium.",
    variants: [{ id: "a", label: "Lead II", figure: longQtFig, findings: { rate: "60 /min", rhythm: "Regular sinus", intervals: "QT ~530 ms (QTc ≈ 530 at RR 1 s)", morphology: "Broad, late T" } }],
  },
  {
    id: "brugada",
    name: "Brugada pattern",
    group: "Electrolytes & channelopathies",
    summary: "Coved ST elevation ≥ 2 mm with T inversion in V1–V2.",
    mechanism: "Autosomal-dominant loss-of-function in cardiac Na⁺ channels (SCN5A) → right-ventricular outflow repolarization gradient.",
    trap: "Pseudo-RBBB look; risk of sudden death (often Asian males, worse with fever). Treat with an ICD.",
    variants: [{ id: "a", label: "V1 · V2 · V5", figure: brugadaFig, findings: { morphology: "Coved ST ↑, inverted T", distribution: "Right precordial V1–V2 only" } }],
  },
  {
    id: "wpw",
    name: "Wolff–Parkinson–White",
    group: "Pre-excitation",
    summary: "Short PR (< 120 ms), delta wave, wide QRS.",
    mechanism: "An accessory pathway (bundle of Kent) bypasses AV-nodal delay, pre-exciting part of the ventricle — the slurred upstroke.",
    trap: "With AF + WPW avoid AV-nodal blockers (adenosine, β-blockers, CCBs, digoxin) — they favor the pathway and can cause VF. Use procainamide.",
    variants: [{ id: "a", label: "II · V1", figure: wpwFig, findings: { rate: "75 /min", intervals: "PR ~100 ms, QRS ~130 ms", morphology: "Delta wave (slurred upstroke)" } }],
  },
  {
    id: "pericarditis",
    name: "Acute pericarditis",
    group: "Inflammation",
    summary: "Diffuse concave ST elevation with PR depression; aVR reciprocal.",
    mechanism: "Inflamed epicardium produces a widespread injury current not confined to one coronary territory; atrial injury depresses the PR segment.",
    trap: "Versus STEMI: diffuse (not territorial), concave, PR depression, no reciprocal changes except aVR/V1. Pain is pleuritic and eased by leaning forward.",
    variants: [{ id: "a", label: "12-lead", figure: pericarditisFig, findings: { rate: "75 /min sinus", morphology: "Concave ST ↑, PR ↓", distribution: "Diffuse; aVR shows ST ↓ and PR ↑" } }],
  },
];

export function getFigure(patternId: string, variantId?: string): EcgFigure {
  const p = ECG_PATTERNS.find((x) => x.id === patternId)!;
  return (p.variants.find((v) => v.id === variantId) ?? p.variants[0]).figure();
}

/* ---------- quiz ---------- */

export type QuizCase = {
  id: string;
  vignette: string;
  question: string;
  figure: { pattern: string; variant?: string };
  options: string[];
  answer: number;
  hint: string;
  reasoning: Findings;
  takeaway: string;
};

export const ECG_QUIZ: QuizCase[] = [
  {
    id: "q-inferior",
    vignette: "A 62-year-old man has 40 minutes of crushing substernal pain and diaphoresis. BP 94/60 mm Hg.",
    question: "Which coronary artery is most likely occluded?",
    figure: { pattern: "stemi", variant: "inferior" },
    options: ["Left anterior descending", "Left circumflex", "Right coronary artery", "Left main"],
    answer: 2,
    hint: "Find the contiguous leads with ST elevation — which wall do they face?",
    reasoning: { rate: "75 /min", rhythm: "Regular sinus", morphology: "ST elevation, hyperacute T", distribution: "II, III, aVF elevated; reciprocal ↓ in I, aVL → inferior wall (RCA)" },
    takeaway: "Inferior STEMI with hypotension: suspect RV involvement and avoid nitrates.",
  },
  {
    id: "q-wenck",
    vignette: "An asymptomatic 23-year-old marathon runner has a slow, irregular pulse at a pre-participation exam.",
    question: "What is the rhythm?",
    figure: { pattern: "mobitz1" },
    options: ["Mobitz I (Wenckebach)", "Mobitz II", "First-degree AV block", "Complete heart block"],
    answer: 0,
    hint: "Measure the PR interval of each beat before the dropped one.",
    reasoning: { rate: "Atrial 80 /min", rhythm: "Grouped, regularly irregular", intervals: "PR progressively lengthens, then a P is not conducted", morphology: "Narrow QRS" },
    takeaway: "Progressive PR lengthening = AV-nodal (Mobitz I), usually benign with high vagal tone.",
  },
  {
    id: "q-hyperk",
    vignette: "A 58-year-old woman on hemodialysis missed two sessions and now has muscle weakness.",
    question: "What is the most appropriate first treatment for this ECG?",
    figure: { pattern: "hyperk" },
    options: ["IV magnesium sulfate", "IV calcium gluconate", "Adenosine", "Urgent cardiac catheterization"],
    answer: 1,
    hint: "Look at the T waves and the QRS width — which electrolyte makes T waves tall and narrow?",
    reasoning: { rate: "70 /min", intervals: "QRS widened", morphology: "Peaked narrow T, flattened P", distribution: "Diffuse, most striking in V2" },
    takeaway: "Hyperkalemia with ECG changes: calcium stabilizes the membrane first, then shift and remove K⁺.",
  },
  {
    id: "q-af",
    vignette: "A 71-year-old man with hypertension has 2 days of palpitations. His pulse is irregularly irregular.",
    question: "Which rhythm is shown?",
    figure: { pattern: "af" },
    options: ["Atrial flutter with 4:1 block", "Multifocal atrial tachycardia", "Sinus arrhythmia", "Atrial fibrillation"],
    answer: 3,
    hint: "Are there discrete P waves? Are the R–R intervals predictable?",
    reasoning: { rate: "~85 /min", rhythm: "Irregularly irregular", intervals: "No measurable PR", morphology: "No P waves; fibrillatory baseline; narrow QRS" },
    takeaway: "No P waves + irregularly irregular = AF; assess CHA₂DS₂-VASc for anticoagulation.",
  },
  {
    id: "q-wpw",
    vignette: "A 19-year-old has recurrent episodes of sudden palpitations. Her resting ECG is shown.",
    question: "Which drug class is most dangerous if she later develops atrial fibrillation?",
    figure: { pattern: "wpw" },
    options: ["Class IA (procainamide)", "AV-nodal blockers (e.g. verapamil)", "Anticoagulants", "Class IC (flecainide)"],
    answer: 1,
    hint: "Short PR plus a slurred upstroke means an alternate path to the ventricle.",
    reasoning: { rate: "75 /min", intervals: "PR ~100 ms; QRS ~130 ms", morphology: "Delta wave", distribution: "Visible in multiple leads" },
    takeaway: "WPW + AF: blocking the AV node pushes impulses down the accessory pathway → VF risk.",
  },
  {
    id: "q-chb",
    vignette: "An 80-year-old woman fainted at home. HR 40/min; intermittent cannon a waves in the jugular veins.",
    question: "What is the rhythm?",
    figure: { pattern: "chb" },
    options: ["Sinus bradycardia", "Mobitz II", "Complete (third-degree) AV block", "Mobitz I"],
    answer: 2,
    hint: "Compare the atrial rate with the ventricular rate — is the PR ever the same twice?",
    reasoning: { rate: "Atrial ~90, ventricular ~40 /min", rhythm: "Both regular, independent", intervals: "PR varies with no pattern", morphology: "Wide escape QRS" },
    takeaway: "AV dissociation with a slow escape rhythm → pacemaker.",
  },
  {
    id: "q-peri",
    vignette: "A 28-year-old man has sharp chest pain a week after a viral illness. It worsens lying flat and eases leaning forward.",
    question: "What is the most likely diagnosis?",
    figure: { pattern: "pericarditis" },
    options: ["Acute pericarditis", "Anterior STEMI", "Brugada pattern", "Hyperkalemia"],
    answer: 0,
    hint: "Does the ST elevation follow one coronary territory? Check the PR segments and aVR.",
    reasoning: { rate: "75 /min sinus", morphology: "Concave ST elevation with PR depression", distribution: "Diffuse, non-territorial; aVR ST ↓ / PR ↑" },
    takeaway: "Diffuse concave STE + PR depression = pericarditis; treat with NSAIDs + colchicine.",
  },
  {
    id: "q-lqt",
    vignette: "A 34-year-old woman taking azithromycin and ondansetron has an episode of syncope.",
    question: "Which finding most increases her risk of torsades de pointes?",
    figure: { pattern: "longqt" },
    options: ["Short PR interval", "Prominent delta wave", "Prolonged QT interval", "First-degree AV block"],
    answer: 2,
    hint: "Measure from QRS onset to the end of the T and compare it with half the R–R interval.",
    reasoning: { rate: "60 /min", rhythm: "Regular sinus", intervals: "QT ~530 ms, > half the RR", morphology: "Broad late T wave" },
    takeaway: "Two QT-prolonging drugs → long QT → torsades; treat torsades with IV magnesium.",
  },
  {
    id: "q-rbbb",
    vignette: "A 66-year-old man with COPD has an incidental finding on a pre-operative ECG.",
    question: "What conduction abnormality is shown?",
    figure: { pattern: "rbbb" },
    options: ["Left bundle branch block", "Right bundle branch block", "Wolff–Parkinson–White", "Ventricular tachycardia"],
    answer: 1,
    hint: "Look at the terminal deflection in V1 — does it point up or down?",
    reasoning: { intervals: "QRS ~130 ms", morphology: "rsR′ in V1; wide slurred S in I and V6", distribution: "Right precordial terminal positivity" },
    takeaway: "Wide QRS with terminal R′ in V1 = RBBB (‘rabbit ears’).",
  },
  {
    id: "q-vt",
    vignette: "A 67-year-old man with a prior anterior MI has palpitations and lightheadedness. HR 170/min.",
    question: "What is the most likely rhythm?",
    figure: { pattern: "vt" },
    options: ["SVT with aberrancy is most likely", "Atrial flutter 2:1", "Ventricular tachycardia", "Atrial fibrillation"],
    answer: 2,
    hint: "Measure the QRS width, then remember the patient's history.",
    reasoning: { rate: "~170 /min", rhythm: "Regular", intervals: "QRS > 140 ms; no P waves", morphology: "Monomorphic wide complexes" },
    takeaway: "Wide-complex tachycardia in a patient with prior MI is VT until proven otherwise.",
  },
];
