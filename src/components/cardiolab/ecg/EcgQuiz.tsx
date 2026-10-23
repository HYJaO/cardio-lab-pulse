import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { EcgPaper } from "./EcgPaper";
import { ECG_QUIZ, FINDING_LABEL, getFigure, type FindingKey } from "@/lib/ecg-patterns";
import { scoreAnswers } from "@/lib/ecg";

export function EcgQuiz() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [hints, setHints] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const c = ECG_QUIZ[i];
  const fig = useMemo(() => getFigure(c.figure.pattern, c.figure.variant), [c]);
  const choice = answers[i];
  const answered = choice !== undefined;
  const score = scoreAnswers(answers, ECG_QUIZ.map((q) => q.answer));
  const reset = () => { setI(0); setAnswers([]); setHints([]); setDone(false); };

  if (done)
    return (
      <div className="rounded-lg border border-hairline bg-surface/60 p-6" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Final score</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">{score} / {ECG_QUIZ.length}</p>
        <ul className="mt-4 space-y-1.5 text-[13.5px]">
          {ECG_QUIZ.map((q, k) => (
            <li key={q.id} className="flex gap-2 text-muted-foreground">
              {answers[k] === q.answer ? <Check className="h-4 w-4 text-emerald" /> : <X className="h-4 w-4 text-crimson" />}
              Case {k + 1}: {q.options[q.answer]}
            </li>
          ))}
        </ul>
        <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">Replay quiz</button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
        <span>Case {i + 1} of {ECG_QUIZ.length}</span>
        <div className="h-1.5 flex-1 rounded bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={ECG_QUIZ.length} aria-valuenow={answers.filter((a) => a !== undefined).length} aria-label="Cases answered">
          <div className="h-full rounded bg-cyan motion-safe:transition-all" style={{ width: `${(answers.filter((a) => a !== undefined).length / ECG_QUIZ.length) * 100}%` }} />
        </div>
        <span className="tabular-nums">Score {score}</span>
      </div>
      <p className="text-[14.5px] text-foreground">{c.vignette}</p>
      <EcgPaper figure={fig} />
      <fieldset>
        <legend className="font-semibold text-foreground">{c.question}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {c.options.map((o, k) => {
            const good = answered && k === c.answer;
            const bad = answered && k === choice && k !== c.answer;
            return (
              <button key={o} type="button" disabled={answered} aria-pressed={choice === k}
                onClick={() => setAnswers((a) => { const n = [...a]; n[i] = k; return n; })}
                className={`min-h-11 rounded-md border px-3.5 py-2.5 text-left text-[13.5px] focus-visible:outline-2 focus-visible:outline-cyan ${good ? "border-emerald text-foreground" : bad ? "border-crimson text-foreground" : "border-hairline text-muted-foreground enabled:hover:text-foreground"}`}>
                {o}
              </button>
            );
          })}
        </div>
      </fieldset>
      {!answered && (
        <button type="button" disabled={hints[i]} onClick={() => setHints((h) => { const n = [...h]; n[i] = true; return n; })}
          className="min-h-11 rounded-md border border-hairline px-4 text-[13px] text-amber disabled:opacity-50">
          {hints[i] ? "Hint used" : "Show hint"}
        </button>
      )}
      {hints[i] && <p className="text-[13px] text-amber">Hint: {c.hint}</p>}
      {answered && (
        <div className="rounded-lg border border-hairline bg-surface/60 p-4" aria-live="polite">
          <p className={`font-semibold ${choice === c.answer ? "text-emerald" : "text-crimson"}`}>
            {choice === c.answer ? "Correct." : `Incorrect — answer: ${c.options[c.answer]}.`}
          </p>
          <dl className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            {(Object.keys(c.reasoning) as FindingKey[]).map((k) => (
              <div key={k}><dt className="inline font-mono text-cyan">{FINDING_LABEL[k]}: </dt><dd className="inline">{c.reasoning[k]}</dd></div>
            ))}
          </dl>
          <p className="mt-2 text-[13px] text-foreground">{c.takeaway}</p>
          <button type="button" onClick={() => (i + 1 < ECG_QUIZ.length ? setI(i + 1) : setDone(true))} className="mt-3 min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">
            {i + 1 < ECG_QUIZ.length ? "Next case" : "See final score"}
          </button>
        </div>
      )}
      <button type="button" onClick={reset} className="block font-mono text-[11px] text-muted-foreground underline">Reset quiz</button>
    </div>
  );
}
