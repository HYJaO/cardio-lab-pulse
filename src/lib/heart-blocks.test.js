import { describe, expect, test } from "bun:test";
import { HB_QUIZ, READ_CASES, buildStrip, scoreQuiz } from "./heart-blocks";

describe("heart blocks", () => {
  test("quiz has exactly 10 distinct questions with valid keys and per-option explanations", () => {
    expect(HB_QUIZ.length).toBe(10);
    expect(new Set(HB_QUIZ.map((q) => q.id)).size).toBe(10);
    for (const q of HB_QUIZ) {
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.why.length).toBe(q.options.length);
    }
  });
  test("scoring counts only correct answers", () => {
    expect(scoreQuiz(HB_QUIZ.map((q) => q.answer))).toBe(10);
    expect(scoreQuiz([])).toBe(0);
  });
  test("Mobitz I PR lengthens before the drop; Mobitz II PR is fixed", () => {
    const w = buildStrip("mobitz1", 75).beats.slice(0, 4);
    expect(w.map((b) => b.pr)).toEqual([0.18, 0.28, 0.34, undefined]);
    const m = buildStrip("mobitz2", 75).beats.slice(0, 4);
    expect(m.map((b) => b.pr)).toEqual([0.16, 0.16, 0.16, undefined]);
  });
  test("first-degree conducts every P with PR > 200 ms; 2:1 drops every other P", () => {
    expect(buildStrip("first", 70).beats.every((b) => b.pr === 0.28)).toBe(true);
    const t = buildStrip("twoToOne", 80).beats;
    t.forEach((b, i) => expect(b.qrs === undefined).toBe(i % 2 === 1));
  });
  test("complete block: no P conducts and escape rate is independent of atrial rate", () => {
    const a = buildStrip("third", 60), b = buildStrip("third", 110);
    expect(a.beats.every((x) => x.qrs === undefined)).toBe(true);
    expect(a.escapes).toEqual(b.escapes);
  });
  test("each guided read ends in a diagnosis stage", () => {
    for (const c of READ_CASES) expect(c.steps.map((s) => s.id)).toEqual(["rate", "rhythm", "p", "pr", "qrs", "dx"]);
  });
});
