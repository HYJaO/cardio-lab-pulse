import { describe, expect, test } from "bun:test";
import { axisFigure, classifyAxis, LIMB_LEADS, makeTrace, normalComplex, projection, scoreAnswers, sinusTiming, stripFigure, twelveLead } from "./ecg";
import { ECG_PATTERNS, ECG_QUIZ, getFigure } from "./ecg-patterns";

describe("ECG teaching rules", () => {
  test("quiz contains exactly ten distinct cases with valid answers", () => {
    expect(ECG_QUIZ).toHaveLength(10);
    expect(new Set(ECG_QUIZ.map(q => q.id)).size).toBe(10);
    for (const q of ECG_QUIZ) {
      expect(q.options[q.answer]).toBeDefined();
      expect(getFigure(q.figure.pattern, q.figure.variant).rows.length).toBeGreaterThan(0);
    }
  });
  test("ten correct answers score ten; unanswered and incorrect score zero", () => {
    const keys = ECG_QUIZ.map(q => q.answer);
    expect(scoreAnswers(keys, keys)).toBe(10);
    expect(scoreAnswers([], keys)).toBe(0);
    expect(scoreAnswers(keys.map(k => (k + 1) % 4), keys)).toBe(0);
    expect(scoreAnswers(keys.map((k, i) => i === 0 ? (k + 1) % 4 : k), keys)).toBe(9);
  });
  test("axis boundaries have explicit ownership", () => {
    for (const [angle, cls] of [[-30, "normal"], [90, "normal"], [-31, "lad"], [-90, "lad"], [91, "rad"], [180, "rad"], [-180, "rad"], [-91, "extreme"], [-179, "extreme"]]) expect(classifyAxis(angle)).toBe(cls);
  });
  test("all six standard lead orientations use cosine projection", () => {
    expect(LIMB_LEADS.map(l => l.angle)).toEqual([0, 60, 120, -150, -30, 90]);
    expect(projection(60, 60)).toBeCloseTo(1);
    expect(projection(60, -30)).toBeCloseTo(0);
    expect(projection(60, -150)).toBeCloseTo(-Math.sqrt(3) / 2);
    expect(axisFigure(60).rows.flat().map(t => t.label).sort()).toEqual(["I", "II", "III", "aVF", "aVL", "aVR"].sort());
  });
  test("all requested ECG pattern families and four STEMI territories exist", () => {
    const ids = ECG_PATTERNS.map(p => p.id);
    for (const id of ["sinus", "axis", "avb1", "mobitz1", "mobitz2", "chb", "rbbb", "lbbb", "af", "flutter", "svt", "vt", "stemi", "ischemia", "hyperk", "hypok", "longqt", "brugada", "wpw", "pericarditis"]) expect(ids).toContain(id);
    expect(ECG_PATTERNS.find(p => p.id === "stemi")?.variants.map(v => v.id)).toEqual(["septal", "anterior", "lateral", "inferior"]);
    for (const p of ECG_PATTERNS) for (const v of p.variants) for (const trace of v.figure().rows.flat()) expect(trace.rhythm.beats.every(b => Number.isFinite(b.at))).toBe(true);
  });
  test("optional signal parameters remain omitted when absent", () => {
    const tr = makeTrace("II", sinusTiming(75, 3), () => normalComplex("II"));
    expect(Object.hasOwn(tr.rhythm, "pW")).toBe(false);
    expect(Object.hasOwn(tr.rhythm, "prSeg")).toBe(false);
    expect(Object.hasOwn(stripFigure([tr], "test"), "rowHeight")).toBe(false);
    expect(twelveLead(normalComplex, "test").rows.flat().every(t => !Object.hasOwn(t.rhythm, "prSeg"))).toBe(true);
  });
});