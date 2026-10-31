/**
 * CardioLab Heart Blocks engine — original schematic lead II rhythm strips
 * for AV-conduction teaching. Educational illustrations only, never patient data.
 */
import { limbComplex, type Complex, type Rhythm } from "./ecg";

export type BlockKind = "normal" | "first" | "mobitz1" | "mobitz2" | "twoToOne" | "third";

export const BLOCK_LABEL: Record<BlockKind, string> = {
  normal: "Normal sinus rhythm",
  first: "First-degree AV block",
  mobitz1: "Second-degree, Mobitz I (Wenckebach)",
  mobitz2: "Second-degree, Mobitz II",
  twoToOne: "2:1 AV block",
  third: "Third-degree (complete) AV block",
};

/** One atrial event and, when conducted, its QRS. */
export type PBeat = { p: number; qrs?: number; pr?: number };
export type BlockStrip = {
  kind: BlockKind;
  atrialRate: number;
  ventricularRate: number;
  duration: number;
  beats: PBeat[];
  /** Independent ventricular escape complexes (complete block only). */
  escapes: number[];
  wide: boolean;
  rhythm: Rhythm;
  description: string;
};

export const STRIP_SECONDS = 8;
const P_OFFSET = 0.05; // P centre sits PR − 0.05 s before QRS onset
const NARROW = limbComplex(1);
const WIDE: Complex = {
  qrs: [
    { at: 0.03, amp: 0.25, w: 0.02 },
    { at: 0.075, amp: 0.95, w: 0.026 },
    { at: 0.13, amp: -0.3, w: 0.024 },
  ],
  j: 0.16,
  t: { at: 0.38, amp: -0.3, w: 0.06 },
};

/** Ventricular escape rate used for complete-block strips (per minute). */
export const ESCAPE_RATE = 38;
const WENCKEBACH_PR = [0.18, 0.28, 0.34];

export function prFor(kind: BlockKind, k: number): number | undefined {
  switch (kind) {
    case "normal":
      return 0.16;
    case "first":
      return 0.28;
    case "mobitz1":
      return WENCKEBACH_PR[k % 4];
    case "mobitz2":
      return k % 4 === 3 ? undefined : 0.16;
    case "twoToOne":
      return k % 2 === 1 ? undefined : 0.18;
    case "third":
      return undefined;
  }
}

export function buildStrip(kind: BlockKind, atrialRate: number, duration = STRIP_SECONDS): BlockStrip {
  const pp = 60 / atrialRate;
  const beats: PBeat[] = [];
  for (let k = 0, p = 0.3; p < duration - 0.25; k++, p += pp) {
    const pr = prFor(kind, k);
    beats.push(pr === undefined ? { p } : { p, pr, qrs: p + pr - P_OFFSET });
  }
  const escapes: number[] = [];
  if (kind === "third") for (let t = 0.55; t < duration - 0.5; t += 60 / ESCAPE_RATE) escapes.push(t);
  const wide = kind === "third" || kind === "mobitz2";
  const qrsTimes = kind === "third" ? escapes : beats.flatMap((b) => (b.qrs === undefined ? [] : [b.qrs]));
  const ventricularRate = Math.round(kind === "third" ? ESCAPE_RATE : (atrialRate * conductedFraction(kind)));
  const rhythm: Rhythm = {
    duration,
    pTimes: beats.map((b) => b.p),
    pAmp: 0.14,
    beats: qrsTimes.map((at) => ({ at, complex: wide ? WIDE : NARROW })),
  };
  return {
    kind,
    atrialRate,
    ventricularRate,
    duration,
    beats,
    escapes,
    wide,
    rhythm,
    description: `Lead II educational strip: ${BLOCK_LABEL[kind]}, atrial rate ${atrialRate} per minute, ventricular rate about ${ventricularRate} per minute.`,
  };
}

/** Fraction of P waves that reach the ventricles. */
export function conductedFraction(kind: BlockKind): number {
  if (kind === "mobitz1" || kind === "mobitz2") return 3 / 4;
  if (kind === "twoToOne") return 1 / 2;
  if (kind === "third") return 0;
  return 1;
}

/* ---------- guided rhythm read ---------- */

export type ReadStepId = "rate" | "rhythm" | "p" | "pr" | "qrs" | "dx";
export type ReadStep = { id: ReadStepId; label: string; question: string; options: string[]; answer: number; hint: string; why: string };

export type ReadCase = { id: string; kind: BlockKind; rate: number; vignette: string; steps: ReadStep[] };

const DX_OPTIONS = ["First-degree AV block", "Mobitz I (Wenckebach)", "Mobitz II", "2:1 AV block", "Complete heart block"];

export const READ_CASES: ReadCase[] = [
  {
    id: "w",
    kind: "mobitz1",
    rate: 80,
    vignette: "A 22-year-old marathon runner has an incidental irregular pulse at a sports physical.",
    steps: [
      { id: "rate", label: "Rate", question: "Compare the atrial and ventricular rates.", options: ["Equal", "Ventricular rate is slower than atrial", "Ventricular rate is faster"], answer: 1, hint: "Count P waves, then count QRS complexes.", why: "Every fourth P is not conducted, so the ventricles beat at ~60 while atria fire at 80." },
      { id: "rhythm", label: "Rhythm", question: "Is the R–R interval regular?", options: ["Regular", "Regularly irregular (grouped)", "Irregularly irregular"], answer: 1, hint: "Look for a repeating pattern of beats then a pause.", why: "Groups of three QRS complexes separated by a pause — grouped beating." },
      { id: "p", label: "P waves", question: "What do the P waves do?", options: ["Absent", "March out regularly", "Vary in shape"], answer: 1, hint: "Measure P-to-P intervals.", why: "The sinus node is fine: P–P is constant. The problem is downstream." },
      { id: "pr", label: "PR interval", question: "How does the PR behave before the dropped beat?", options: ["Constant", "Progressively lengthens", "No relationship to QRS"], answer: 1, hint: "Measure each PR in the group.", why: "PR grows 180 → 280 → 340 ms, then a P fails to conduct: decremental (fatigue-like) AV nodal conduction." },
      { id: "qrs", label: "QRS", question: "QRS width?", options: ["Narrow", "Wide"], answer: 0, hint: "Narrow is < 120 ms (3 small boxes).", why: "Narrow QRS fits block at the AV node with normal His–Purkinje conduction." },
      { id: "dx", label: "Diagnosis", question: "Best interpretation?", options: DX_OPTIONS, answer: 1, hint: "Lengthening PR + dropped beat.", why: "Mobitz I: usually AV nodal, often vagal, typically benign in athletes." },
    ],
  },
  {
    id: "m2",
    kind: "mobitz2",
    rate: 75,
    vignette: "A 71-year-old has two episodes of near-syncope. He has a known bundle branch block.",
    steps: [
      { id: "rate", label: "Rate", question: "Compare atrial and ventricular rates.", options: ["Equal", "Ventricular rate is slower than atrial", "Ventricular rate is faster"], answer: 1, hint: "Count Ps vs QRSs.", why: "Some Ps are not conducted, so the ventricular rate falls below the atrial rate." },
      { id: "rhythm", label: "Rhythm", question: "Is the R–R interval regular?", options: ["Regular", "Regular with sudden pauses", "Irregularly irregular"], answer: 1, hint: "Look at the pause length.", why: "Conducted beats are regular; pauses equal exactly two P–P intervals." },
      { id: "p", label: "P waves", question: "What do the P waves do?", options: ["Absent", "March out regularly", "Vary in shape"], answer: 1, hint: "Measure P–P.", why: "Sinus P waves march through, including the blocked one." },
      { id: "pr", label: "PR interval", question: "PR before and after the dropped beat?", options: ["Constant", "Progressively lengthens", "No relationship to QRS"], answer: 0, hint: "Compare the PR just before and just after the pause.", why: "PR is fixed at 160 ms; the drop is sudden — all-or-none infranodal conduction failure." },
      { id: "qrs", label: "QRS", question: "QRS width?", options: ["Narrow", "Wide"], answer: 1, hint: "More than 3 small boxes?", why: "Wide QRS suggests diseased His–Purkinje tissue, typical (not universal) for Mobitz II." },
      { id: "dx", label: "Diagnosis", question: "Best interpretation?", options: DX_OPTIONS, answer: 2, hint: "Constant PR, sudden drop.", why: "Mobitz II: usually infranodal, can progress to complete heart block — typically a pacemaker indication." },
    ],
  },
  {
    id: "chb",
    kind: "third",
    rate: 90,
    vignette: "An 80-year-old presents with fatigue and a pulse of 38/min. Neck exam shows intermittent cannon a waves.",
    steps: [
      { id: "rate", label: "Rate", question: "Compare atrial and ventricular rates.", options: ["Equal", "Ventricular rate is much slower than atrial", "Ventricular rate is faster"], answer: 1, hint: "Atria ~90, ventricles?", why: "Atria at 90, ventricular escape at ~38." },
      { id: "rhythm", label: "Rhythm", question: "Is the R–R interval regular?", options: ["Regular", "Grouped", "Irregularly irregular"], answer: 0, hint: "The escape focus is its own clock.", why: "The escape pacemaker fires regularly, independent of the atria." },
      { id: "p", label: "P waves", question: "What do the P waves do?", options: ["Absent", "March out regularly, some hidden in QRS/T", "Vary in shape"], answer: 1, hint: "Look for Ps buried in complexes.", why: "P waves keep a constant P–P and fall anywhere, sometimes inside QRS or T." },
      { id: "pr", label: "PR interval", question: "PR relationship?", options: ["Constant", "Progressively lengthens", "No consistent relationship"], answer: 2, hint: "Does any PR repeat?", why: "PR varies randomly — AV dissociation: no atrial impulse reaches the ventricles." },
      { id: "qrs", label: "QRS", question: "QRS width?", options: ["Narrow", "Wide"], answer: 1, hint: "Look at the escape complexes.", why: "Wide, slow (~30–40) escape suggests a ventricular escape focus; a junctional escape would be narrower and ~40–60." },
      { id: "dx", label: "Diagnosis", question: "Best interpretation?", options: DX_OPTIONS, answer: 4, hint: "Atria and ventricles are independent.", why: "Complete heart block with AV dissociation; cannon a waves occur when the atrium contracts against a closed tricuspid valve." },
    ],
  },
];

/* ---------- quiz bank ---------- */

export type QuizQ = {
  id: string;
  kind: BlockKind;
  rate: number;
  vignette: string;
  question: string;
  options: string[];
  answer: number;
  clues: string;
  /** Why each option is right or less likely, same order as options. */
  why: string[];
};

const RAW_QUIZ: QuizQ[] = [
  {
    id: "q1", kind: "first", rate: 72,
    vignette: "A 45-year-old woman taking a beta-blocker has a routine ECG before minor surgery. She is asymptomatic.",
    question: "Which finding best describes this strip?",
    options: ["First-degree AV block", "Mobitz I", "Normal sinus rhythm", "Complete heart block"],
    answer: 0,
    clues: "Every P is followed by a narrow QRS; PR is constant at ~280 ms (7 small boxes, > 200 ms).",
    why: ["Correct: prolonged, fixed PR with 1:1 conduction.", "No dropped beats and no PR lengthening.", "PR exceeds 200 ms, so not normal.", "Ps and QRSs are clearly linked."],
  },
  {
    id: "q2", kind: "mobitz1", rate: 75,
    vignette: "A 19-year-old swimmer has a slow, intermittently irregular pulse during sleep monitoring.",
    question: "Where is this conduction delay most likely located?",
    options: ["AV node", "Bundle of His below the node", "Sinoatrial node", "Left anterior fascicle"],
    answer: 0,
    clues: "Progressive PR prolongation ending in a dropped QRS, narrow complexes, grouped beating.",
    why: ["Correct: Wenckebach usually reflects decremental AV nodal conduction, often vagal.", "Infranodal block typically shows fixed PR (Mobitz II).", "P waves are regular, so the SA node fires normally.", "Fascicular block changes axis, not AV conduction."],
  },
  {
    id: "q3", kind: "mobitz2", rate: 72,
    vignette: "A 68-year-old with prior anterior MI reports lightheadedness. His QRS is wide.",
    question: "What is the most appropriate interpretation?",
    options: ["Mobitz II second-degree AV block", "Mobitz I", "Blocked premature atrial complex", "First-degree AV block"],
    answer: 0,
    clues: "Constant PR before and after the pause, sudden non-conducted P, wide QRS.",
    why: ["Correct: fixed PR with abrupt drops — typically infranodal and high risk.", "Mobitz I needs PR lengthening before the drop.", "The blocked P is on time (regular P–P), not premature.", "First-degree has no dropped beats."],
  },
  {
    id: "q4", kind: "twoToOne", rate: 84,
    vignette: "A 60-year-old has a pulse of 42/min. Every other P wave is not followed by a QRS.",
    question: "Which statement is most accurate?",
    options: ["Mobitz I and II cannot be reliably distinguished from this strip alone", "This is definitely Mobitz II", "This is definitely Mobitz I", "This is complete heart block"],
    answer: 0,
    clues: "2:1 conduction — there is never two consecutive conducted PRs to compare.",
    why: ["Correct: with 2:1 block you cannot see PR trend; QRS width, longer strips or maneuvers help localize.", "Fixed PR can't be confirmed across consecutive beats.", "Lengthening can't be demonstrated either.", "Conducted beats have a fixed PR, so atria and ventricles are linked."],
  },
  {
    id: "q5", kind: "third", rate: 88,
    vignette: "A 76-year-old with syncope has a pulse of 38/min and variable intensity of S1.",
    question: "Which finding best explains the variable S1?",
    options: ["AV dissociation changing mitral leaflet position at systole", "Atrial fibrillation", "Mitral stenosis", "Progressive PR prolongation"],
    answer: 0,
    clues: "Regular Ps at 88, regular wide escapes at ~38, PR varies randomly.",
    why: ["Correct: random PR timing changes how far the AV valves are open when the ventricle contracts.", "Discrete P waves are present.", "No murmur clue; doesn't explain the ECG.", "PR is not progressive — it is random (dissociation)."],
  },
  {
    id: "q6", kind: "mobitz1", rate: 90,
    vignette: "Day 2 after an inferior MI, a patient's monitor shows grouped beats with narrow QRS complexes.",
    question: "Which mechanism best explains this rhythm?",
    options: ["AV nodal ischemia/vagal tone from RCA territory infarction", "Septal necrosis of the bundle branches", "Accessory pathway conduction", "Hyperkalemia"],
    answer: 0,
    clues: "PR lengthens then a beat drops; narrow QRS. RCA usually supplies the AV nodal artery.",
    why: ["Correct: inferior MI commonly causes nodal (often transient) block.", "Septal/bundle necrosis is more typical of anterior MI and Mobitz II/CHB.", "Pre-excitation shortens PR with a delta wave.", "Hyperkalemia peaks T waves and widens QRS first."],
  },
  {
    id: "q7", kind: "third", rate: 80,
    vignette: "A 30-year-old who recently hiked in Connecticut has erythema migrans and new fatigue; pulse 40/min.",
    question: "What is the rhythm?",
    options: ["Complete heart block", "Mobitz I", "Sinus bradycardia", "2:1 AV block"],
    answer: 0,
    clues: "P–P and R–R are each regular but unrelated; P waves hide in QRS and T.",
    why: ["Correct: Lyme carditis is a classic reversible cause of high-grade AV block.", "No progressive PR with a pattern.", "Sinus bradycardia would have a P before each QRS with a fixed PR.", "In 2:1 block the conducted PR is fixed."],
  },
  {
    id: "q8", kind: "first", rate: 64,
    vignette: "A healthy 25-year-old has a PR of 280 ms on a pre-employment ECG.",
    question: "Which statement about this finding is most accurate?",
    options: ["Every atrial impulse still reaches the ventricles", "It reliably progresses to complete block", "QRS complexes are periodically dropped", "It proves His–Purkinje disease"],
    answer: 0,
    clues: "1:1 conduction with a fixed long PR.",
    why: ["Correct: first-degree is delay, not block of conduction.", "Usually benign; progression is uncommon in isolation.", "No dropped QRSs in first-degree block.", "Most delay is nodal; the ECG alone can't prove the level."],
  },
  {
    id: "q9", kind: "mobitz2", rate: 80,
    vignette: "A 74-year-old with RBBB and left anterior fascicular block has recurrent presyncope.",
    question: "What is the most important reason this rhythm is high-yield?",
    options: ["Risk of sudden progression to complete heart block", "It is usually caused by high vagal tone", "It typically resolves with sleep", "It is a normal variant in athletes"],
    answer: 0,
    clues: "Fixed PR, abrupt dropped Ps, wide QRS — infranodal disease.",
    why: ["Correct: Mobitz II is unpredictable and typically treated with pacing.", "Vagal tone suggests nodal (Mobitz I) block.", "Nocturnal improvement fits nodal, vagally mediated block.", "Athletic variants are Mobitz I and first-degree."],
  },
  {
    id: "q10", kind: "third", rate: 100,
    vignette: "A patient on telemetry has P waves at 100/min and wide QRS complexes at about 38/min. Some P waves fall within the T waves.",
    question: "Which finding is most specific for the diagnosis?",
    options: ["Atrial rate faster than ventricular rate with no fixed PR", "Wide QRS", "Bradycardia", "P waves buried in T waves"],
    answer: 0,
    clues: "Independent regular atrial and ventricular rhythms — AV dissociation with atria faster.",
    why: ["Correct: complete heart block = more Ps than QRSs and no consistent PR.", "Wide QRS occurs with many conduction disorders.", "Bradycardia is nonspecific.", "Buried Ps also occur with PACs or fast rates."],
  },
];

/** Rotate choices so the keyed answer lands in varied positions (written with the key first). */
const SLOTS = [2, 0, 3, 1, 2, 3, 1, 0, 3, 1];
export const HB_QUIZ: QuizQ[] = RAW_QUIZ.map((q, i) => {
  const n = q.options.length;
  const shift = (SLOTS[i] ?? 0) % n;
  const rot = <T,>(a: T[]) => a.map((_, k) => a[(k - shift + n) % n] as T);
  return { ...q, options: rot(q.options), why: rot(q.why), answer: (q.answer + shift) % n };
});

export function scoreQuiz(answers: (number | undefined)[]): number {
  return HB_QUIZ.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
}
