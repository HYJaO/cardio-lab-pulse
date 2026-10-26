/**
 * Heart murmur teaching model. Original, simplified envelopes on a
 * normalized cardiac cycle (0 → 1). Not a recording or clinical tool.
 * Relationships follow standard teaching (e.g. AHA Auscultation Guide,
 * First Aid for the USMLE Step 1).
 */

export const S1_T = 0.05;
export const S2_T = 0.4;

export type LandmarkId = "aortic" | "pulmonic" | "erb" | "tricuspid" | "mitral";
export type RadiationTarget = "carotids" | "axilla" | "lsb" | "rsb" | "none";
export type ManeuverId = "valsalva" | "squat" | "handgrip" | "inspiration";
export type Change = "up" | "down" | "none";

export type MurmurId =
  | "normal"
  | "as"
  | "mr"
  | "hcm"
  | "mvp"
  | "ar"
  | "ms"
  | "tr"
  | "vsd";

export type Murmur = {
  id: MurmurId;
  name: string;
  short: string;
  phase: "none" | "systolic" | "diastolic";
  timing: string;
  contour: string;
  site: LandmarkId | null;
  siteLabel: string;
  quality: string;
  pitch: "high" | "medium" | "low";
  radiation: string;
  radiationTargets: RadiationTarget[];
  associated: string;
  mechanism: string;
  association: string;
  clicks: { t: number; label: string }[];
  envelope: (t: number) => number;
  maneuvers: Record<ManeuverId, Change>;
  /** Optional per-maneuver nuance (e.g. click timing). */
  notes?: Partial<Record<ManeuverId, string>>;
  /** Included in the main lab selector (VSD is a differential card only). */
  inLab: boolean;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Symmetric diamond between a and b, peaking at p. */
const diamond = (t: number, a: number, p: number, b: number) =>
  t < a || t > b ? 0 : t <= p ? (t - a) / (p - a) : (b - t) / (b - p);

const plateau = (t: number, a: number, b: number, level: number) =>
  t < a || t > b ? 0 : level * Math.min(1, ramp(t, a, a + 0.015), 1 - ramp(t, b - 0.01, b));

export const MURMURS: Murmur[] = [
  {
    id: "normal",
    name: "Normal",
    short: "Normal",
    phase: "none",
    timing: "No murmur — S1 then S2",
    contour: "Silent systole and diastole",
    site: null,
    siteLabel: "S1 loudest at apex, S2 loudest at base",
    quality: "Crisp heart sounds only",
    pitch: "medium",
    radiation: "—",
    radiationTargets: [],
    associated: "Physiologic S2 split widens on inspiration",
    mechanism:
      "S1 = mitral and tricuspid closure at the start of systole; S2 = aortic and pulmonic closure at the start of diastole. Laminar flow is silent.",
    association: "Reference baseline for every comparison.",
    clicks: [],
    envelope: () => 0,
    maneuvers: { valsalva: "none", squat: "none", handgrip: "none", inspiration: "none" },
    inLab: true,
  },
  {
    id: "as",
    name: "Aortic stenosis",
    short: "AS",
    phase: "systolic",
    timing: "Systolic ejection murmur, after S1",
    contour: "Crescendo–decrescendo",
    site: "aortic",
    siteLabel: "Right upper sternal border (aortic area)",
    quality: "Harsh",
    pitch: "medium",
    radiation: "Carotids",
    radiationTargets: ["carotids"],
    associated: "Ejection click possible; soft or single S2 when severe",
    mechanism:
      "Turbulent ejection across a narrowed aortic valve. Flow — and the murmur — rises and falls with ejection; it peaks later as stenosis worsens.",
    association: "Age-related calcification; bicuspid aortic valve in younger patients. Syncope, angina, dyspnea; pulsus parvus et tardus.",
    clicks: [],
    envelope: (t) => 0.9 * diamond(t, 0.09, 0.22, 0.37),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "down", inspiration: "none" },
    inLab: true,
  },
  {
    id: "mr",
    name: "Mitral regurgitation",
    short: "MR",
    phase: "systolic",
    timing: "Holosystolic, S1 → S2",
    contour: "Plateau (flat) throughout systole",
    site: "mitral",
    siteLabel: "Apex (mitral area)",
    quality: "Blowing",
    pitch: "high",
    radiation: "Left axilla",
    radiationTargets: ["axilla"],
    associated: "May have S3 from volume overload",
    mechanism:
      "LV pressure exceeds LA pressure for all of systole, so backflow through an incompetent mitral valve lasts from S1 to S2.",
    association: "Ischemic papillary muscle dysfunction, MVP, LV dilation, rheumatic disease.",
    clicks: [],
    envelope: (t) => plateau(t, 0.06, 0.4, 0.62),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "up", inspiration: "none" },
    inLab: true,
  },
  {
    id: "hcm",
    name: "Hypertrophic cardiomyopathy",
    short: "HCM",
    phase: "systolic",
    timing: "Systolic ejection (mid-systolic)",
    contour: "Crescendo–decrescendo",
    site: "tricuspid",
    siteLabel: "Left lower sternal border",
    quality: "Harsh",
    pitch: "medium",
    radiation: "Usually little or no carotid radiation",
    radiationTargets: [],
    associated: "S4 common",
    mechanism:
      "Dynamic LV outflow obstruction: the septum and anterior mitral leaflet narrow the outflow tract. A smaller LV cavity worsens the obstruction.",
    association: "Autosomal dominant sarcomere mutations; syncope or sudden death in young athletes.",
    clicks: [],
    envelope: (t) => 0.75 * diamond(t, 0.11, 0.25, 0.37),
    maneuvers: { valsalva: "up", squat: "down", handgrip: "down", inspiration: "none" },
    notes: {
      valsalva: "Less preload → smaller LV cavity → more outflow obstruction.",
      squat: "More preload and afterload → larger cavity → less obstruction.",
      handgrip: "More afterload → larger cavity, less ejection gradient.",
    },
    inLab: true,
  },
  {
    id: "mvp",
    name: "Mitral valve prolapse",
    short: "MVP",
    phase: "systolic",
    timing: "Mid-systolic click, then late systolic murmur",
    contour: "Late systolic (crescendo to S2)",
    site: "mitral",
    siteLabel: "Apex (mitral area)",
    quality: "Blowing after a sharp click",
    pitch: "high",
    radiation: "Variable; often little",
    radiationTargets: [],
    associated: "Mid-systolic click",
    mechanism:
      "Redundant leaflets snap into the atrium (click) once the chordae tense, then leak for the remainder of systole.",
    association: "Myxomatous degeneration; Marfan and Ehlers–Danlos syndromes.",
    clicks: [{ t: 0.25, label: "Click" }],
    envelope: (t) => (t < 0.255 || t > 0.4 ? 0 : 0.35 + 0.35 * ramp(t, 0.255, 0.39)),
    maneuvers: { valsalva: "up", squat: "down", handgrip: "down", inspiration: "none" },
    notes: {
      valsalva: "Smaller LV → prolapse sooner: click moves earlier, murmur lengthens.",
      squat: "Larger LV → click moves later, murmur shortens.",
      handgrip: "Click and murmur shift later in systole.",
    },
    inLab: true,
  },
  {
    id: "ar",
    name: "Aortic regurgitation",
    short: "AR",
    phase: "diastolic",
    timing: "Early diastolic, immediately after S2",
    contour: "Decrescendo",
    site: "erb",
    siteLabel: "Left sternal border (Erb's point); sitting up, leaning forward, end-expiration",
    quality: "Blowing",
    pitch: "high",
    radiation: "Down the left sternal border",
    radiationTargets: ["lsb"],
    associated: "Wide pulse pressure; bounding pulses",
    mechanism:
      "Aortic pressure exceeds LV pressure as soon as the aortic valve closes; the gradient — and the murmur — fades as the LV fills.",
    association: "Aortic root dilation, bicuspid valve, endocarditis, rheumatic disease.",
    clicks: [],
    envelope: (t) => (t < 0.41 || t > 0.78 ? 0 : 0.7 * (1 - ramp(t, 0.41, 0.78))),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "up", inspiration: "none" },
    inLab: true,
  },
  {
    id: "ms",
    name: "Mitral stenosis",
    short: "MS",
    phase: "diastolic",
    timing: "Opening snap, then mid-diastolic rumble",
    contour: "Rumble with presystolic accentuation (sinus rhythm)",
    site: "mitral",
    siteLabel: "Apex, left lateral decubitus, bell",
    quality: "Rumbling",
    pitch: "low",
    radiation: "Usually none",
    radiationTargets: [],
    associated: "Loud S1; opening snap (shorter S2–OS interval = more severe)",
    mechanism:
      "The stiff mitral valve snaps open once LA pressure exceeds LV pressure, then flow across the narrowed orifice rumbles through diastole; atrial contraction accentuates it.",
    association: "Rheumatic heart disease; LA enlargement, atrial fibrillation.",
    clicks: [{ t: 0.46, label: "OS" }],
    envelope: (t) =>
      t < 0.48 ? 0 : t < 0.8 ? 0.5 * (1 - 0.5 * ramp(t, 0.5, 0.8)) * ramp(t, 0.48, 0.51) : t < 0.9 ? 0.18 : 0.18 + 0.4 * ramp(t, 0.9, 1),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "none", inspiration: "none" },
    notes: { handgrip: "Not a core handgrip clue on Step 1." },
    inLab: true,
  },
  {
    id: "tr",
    name: "Tricuspid regurgitation",
    short: "TR",
    phase: "systolic",
    timing: "Holosystolic, S1 → S2",
    contour: "Plateau (flat) throughout systole",
    site: "tricuspid",
    siteLabel: "Left lower sternal border (tricuspid area)",
    quality: "Blowing",
    pitch: "high",
    radiation: "Right sternal border",
    radiationTargets: ["rsb"],
    associated: "Prominent jugular v waves; pulsatile liver",
    mechanism:
      "RV pressure exceeds RA pressure throughout systole; inspiration increases venous return to the right heart and makes the murmur louder (Carvallo sign).",
    association: "RV dilation, pulmonary hypertension, IV drug use endocarditis.",
    clicks: [],
    envelope: (t) => plateau(t, 0.06, 0.4, 0.5),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "none", inspiration: "up" },
    inLab: true,
  },
  {
    id: "vsd",
    name: "Ventricular septal defect",
    short: "VSD",
    phase: "systolic",
    timing: "Holosystolic, S1 → S2",
    contour: "Plateau (flat) throughout systole",
    site: "tricuspid",
    siteLabel: "Left lower sternal border",
    quality: "Harsh",
    pitch: "high",
    radiation: "Across the precordium",
    radiationTargets: [],
    associated: "Smaller defects are often louder",
    mechanism: "Left-to-right shunt through the septum for all of systole.",
    association: "Most common congenital heart defect.",
    clicks: [],
    envelope: (t) => plateau(t, 0.06, 0.4, 0.66),
    maneuvers: { valsalva: "down", squat: "up", handgrip: "up", inspiration: "none" },
    inLab: false,
  },
];

export const LAB_MURMURS = MURMURS.filter((m) => m.inLab);
export function getMurmur(id: MurmurId): Murmur {
  const murmur = MURMURS.find((m) => m.id === id) ?? MURMURS[0];
  if (!murmur) throw new Error("The murmur library must contain its reference model.");
  return murmur;
}

export const LANDMARKS: { id: LandmarkId; name: string; place: string; x: number; y: number }[] = [
  { id: "aortic", name: "Aortic", place: "Right upper sternal border, 2nd intercostal space", x: 128, y: 120 },
  { id: "pulmonic", name: "Pulmonic", place: "Left upper sternal border, 2nd intercostal space", x: 172, y: 120 },
  { id: "erb", name: "Erb's point", place: "Left sternal border, 3rd intercostal space", x: 174, y: 152 },
  { id: "tricuspid", name: "Tricuspid", place: "Left lower sternal border, 4th–5th intercostal space", x: 168, y: 196 },
  { id: "mitral", name: "Mitral (apex)", place: "5th intercostal space, midclavicular line", x: 212, y: 214 },
];

export const MANEUVERS: {
  id: ManeuverId;
  name: string;
  effect: string;
  mechanism: string;
}[] = [
  {
    id: "valsalva",
    name: "Standing / Valsalva",
    effect: "↓ Preload",
    mechanism:
      "Less venous return shrinks the LV. Flow-dependent murmurs soften — except HCM (more obstruction) and MVP (earlier prolapse), which get louder/longer.",
  },
  {
    id: "squat",
    name: "Squatting / passive leg raise",
    effect: "↑ Preload (squatting also ↑ afterload)",
    mechanism:
      "More venous return enlarges the LV. Most murmurs get louder; HCM softens (less obstruction) and MVP's click and murmur move later.",
  },
  {
    id: "handgrip",
    name: "Sustained handgrip",
    effect: "↑ Afterload",
    mechanism:
      "Higher systemic resistance pushes more blood backward: regurgitant murmurs (MR, AR) and VSD get louder. Forward-ejection murmurs (AS, HCM) soften because the gradient falls; MVP shifts later.",
  },
  {
    id: "inspiration",
    name: "Inspiration",
    effect: "↑ Venous return to the right heart",
    mechanism:
      "Negative intrathoracic pressure fills the right heart, so right-sided murmurs (TR, pulmonic) get louder. Left-sided murmurs are typically unchanged or slightly softer — that contrast localizes the lesion.",
  },
];

export function phaseAt(t: number) {
  if (Math.abs(t - S1_T) < 0.02) return "S1";
  if (Math.abs(t - S2_T) < 0.02) return "S2";
  if (t > S1_T && t < S2_T) return "Systole";
  return "Diastole";
}
