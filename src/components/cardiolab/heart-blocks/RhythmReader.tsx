import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BlockStrip } from "./BlockStrip";
import { READ_CASES, buildStrip } from "@/lib/heart-blocks";

/** Guided six-stage read: rate → rhythm → P → PR → QRS → diagnosis. */
export function RhythmReader() {
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [pick, setPick] = useState<number | undefined>();
  const [hint, setHint] = useState(false);
  const [solved, setSolved] = useState(0);
  const c = READ_CASES[ci];
  const strip = useMemo(() => (c ? buildStrip(c.kind, c.rate) : undefined), [c]);
  if (!c || !strip) return null;
  const step = c.steps[si];
  const done = si >= c.steps.length;
  const correct = pick !== undefined && step && pick === step.answer;
  const next = () => { setPick(undefined); setHint(false); setSi(si + 1); };
  const loadCase = (k: number) => { setCi(k); setSi(0); setPick(undefined); setHint(false); setSolved(0); };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Rhythm cases" className="flex flex-wrap gap-2">
        {READ_CASES.map((r, k) => (
          <Button key={r.id} variant="ghost" type="button" role="tab" aria-selected={k === ci} onClick={() => loadCase(k)}
            className={`min-h-11 rounded-md border px-3 font-mono text-[11px] ${k === ci ? "border-cyan text-cyan" : "border-hairline text-muted-foreground"}`}>Strip {k + 1}</Button>
        ))}
      </div>
      <p className="text-[14.5px] text-foreground">{c.vignette}</p>
      <BlockStrip strip={strip} annotate={done} />
      <ol className="flex flex-wrap gap-1.5" aria-label="Reading stages">
        {c.steps.map((s, k) => (
          <li key={s.id} aria-current={k === si ? "step" : undefined}
            className={`rounded border px-2 py-1 font-mono text-[10.5px] ${k < si ? "border-emerald text-emerald" : k === si ? "border-cyan text-cyan" : "border-hairline text-muted-foreground"}`}>
            {k + 1}. {s.label}
          </li>
        ))}
      </ol>
      {done ? (
        <div className="rounded-lg border border-emerald/60 bg-surface/60 p-4" aria-live="polite">
          <p className="font-semibold text-emerald">Strip read — {solved} / {c.steps.length} first-try stages.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Annotations (P labels, PR in ms) are now shown on the strip. Remember: the ECG suggests the level of block, but the cause and exact level may need clinical context or further testing.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ci + 1 < READ_CASES.length && <Button variant="ghost" type="button" onClick={() => loadCase(ci + 1)} className="min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">Next strip</Button>}
            <Button variant="ghost" type="button" onClick={() => loadCase(ci)} className="min-h-11 rounded-md border border-hairline px-4 text-[13px]">Re-read this strip</Button>
          </div>
        </div>
      ) : step && (
        <fieldset className="space-y-3">
          <legend className="font-semibold text-foreground">Stage {si + 1} · {step.label}: {step.question}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {step.options.map((o, k) => {
              const good = pick !== undefined && k === step.answer && correct;
              const bad = pick === k && k !== step.answer;
              return (
                <Button key={o} variant="ghost" type="button" disabled={!!correct} aria-pressed={pick === k}
                  onClick={() => { if (pick === undefined && k === step.answer) setSolved((s) => s + 1); setPick(k); }}
                  className={`h-auto min-h-11 whitespace-normal rounded-md border px-3.5 py-2.5 text-left text-[13.5px] ${good ? "border-emerald text-foreground" : bad ? "border-crimson text-foreground" : "border-hairline text-muted-foreground"}`}>
                  {o}
                </Button>
              );
            })}
          </div>
          {pick !== undefined && (
            <p aria-live="polite" className={`text-[13.5px] ${correct ? "text-emerald" : "text-crimson"}`}>
              {correct ? `Correct. ${step.why}` : "Not quite — try another option."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {!correct && <Button variant="ghost" type="button" disabled={hint} onClick={() => setHint(true)} className="min-h-11 rounded-md border border-hairline px-4 text-[13px] text-amber disabled:opacity-50">{hint ? "Hint shown" : "Show hint"}</Button>}
            {correct && <Button variant="ghost" type="button" onClick={next} className="min-h-11 rounded-md bg-cyan px-5 font-semibold text-primary-foreground">{si + 1 < c.steps.length ? "Next stage" : "Finish strip"}</Button>}
          </div>
          {hint && !correct && <p className="text-[13px] text-amber">Hint: {step.hint}</p>}
        </fieldset>
      )}
    </div>
  );
}
