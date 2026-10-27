import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockStrip } from "./BlockStrip";
import { HB_QUIZ, buildStrip, scoreQuiz } from "@/lib/heart-blocks";

export function BlockQuiz() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [done, setDone] = useState(false);
  const q = HB_QUIZ[i];
  const strip = useMemo(() => (q ? buildStrip(q.kind, q.rate) : undefined), [q]);
  const score = scoreQuiz(answers);
  const count = answers.filter((a) => a !== undefined).length;
  const reset = () => { setI(0); setAnswers([]); setDone(false); };
  if (!q || !strip) return null;

  if (done)
    return (
      <div className="rounded-lg border border-hairline bg-surface/60 p-6" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Final score</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">{score} / {HB_QUIZ.length}</p>
        <ul className="mt-4 space-y-1.5 text-[13.5px]">
          {HB_QUIZ.map((x, k) => (
            <li key={x.id} className="flex gap-2 text-muted-foreground">
              {answers[k] === x.answer ? <Check className="h-4 w-4 shrink-0 text-emerald" /> : <X className="h-4 w-4 shrink-0 text-crimson" />}
              Q{k + 1}: {x.options[x.answer]}
            </li>
          ))}
        </ul>
        <Button variant="ghost" type="button" onClick={reset} className="mt-5 min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">Retry quiz</Button>
      </div>
    );

  const choice = answers[i];
  const answered = choice !== undefined;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
        <span>Question {i + 1} of {HB_QUIZ.length}</span>
        <div className="h-1.5 flex-1 rounded bg-secondary" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={HB_QUIZ.length} aria-valuenow={count}>
          <div className="h-full rounded bg-cyan motion-safe:transition-all" style={{ width: `${(count / HB_QUIZ.length) * 100}%` }} />
        </div>
        <span className="tabular-nums">Score {score}</span>
      </div>
      <p className="text-[14.5px] text-foreground">{q.vignette}</p>
      <BlockStrip strip={strip} annotate={false} />
      <fieldset>
        <legend className="font-semibold text-foreground">{q.question}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {q.options.map((o, k) => {
            const good = answered && k === q.answer;
            const bad = answered && k === choice && k !== q.answer;
            return (
              <Button key={o} variant="ghost" type="button" disabled={answered} aria-pressed={choice === k}
                onClick={() => setAnswers((a) => { const n = [...a]; n[i] = k; return n; })}
                className={`h-auto min-h-11 whitespace-normal rounded-md border px-3.5 py-2.5 text-left text-[13.5px] ${good ? "border-emerald text-foreground" : bad ? "border-crimson text-foreground" : "border-hairline text-muted-foreground"}`}>
                {o}
              </Button>
            );
          })}
        </div>
      </fieldset>
      {answered && (
        <div className="rounded-lg border border-hairline bg-surface/60 p-4" aria-live="polite">
          <p className={`font-semibold ${choice === q.answer ? "text-emerald" : "text-crimson"}`}>
            {choice === q.answer ? "Correct." : `Incorrect — best answer: ${q.options[q.answer]}.`}
          </p>
          <p className="mt-2 text-[13px] text-foreground"><span className="font-mono text-cyan">ECG clues: </span>{q.clues}</p>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            {q.options.map((o, k) => <li key={o}><span className="text-foreground">{o}:</span> {q.why[k]}</li>)}
          </ul>
          <Button variant="ghost" type="button" onClick={() => (i + 1 < HB_QUIZ.length ? setI(i + 1) : setDone(true))} className="mt-3 min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">
            {i + 1 < HB_QUIZ.length ? "Next question" : "See final score"}
          </Button>
        </div>
      )}
    </div>
  );
}
