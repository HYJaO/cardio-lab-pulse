import { useState } from "react";
import { Check, X } from "lucide-react";

export type CheckpointQuestion = {
  q: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  explanation: string;
};

/**
 * End-of-lesson concept checkpoint: choose an option, get an immediate
 * explanation. No scoring theatrics — the explanation is the payload.
 */
export function Checkpoint({ questions }: { questions: CheckpointQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});

  return (
    <div className="space-y-4">
      {questions.map((item, qi) => {
        const choice = picked[qi];
        const answered = choice !== undefined;
        return (
          <fieldset key={item.q} className="glass-panel rounded-xl p-5 md:p-6">
            <legend className="flex items-baseline gap-3 text-[15px] font-semibold text-foreground">
              <span className="font-mono text-[11px] text-cyan">
                {String(qi + 1).padStart(2, "0")}
              </span>
              {item.q}
            </legend>
            <div className="mt-4 space-y-2">
              {item.options.map((opt, oi) => {
                const isChoice = choice === oi;
                const isCorrect = oi === item.answer;
                const reveal = answered && (isChoice || isCorrect);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    aria-pressed={isChoice}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed transition-colors motion-safe:duration-200 ${
                      reveal && isCorrect
                        ? "border-emerald/50 bg-emerald/5 text-foreground"
                        : reveal && isChoice
                          ? "border-crimson/50 bg-crimson/5 text-foreground"
                          : "border-hairline text-muted-foreground hover:border-cyan/40 hover:text-foreground"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {reveal && isCorrect ? (
                        <Check className="h-4 w-4 text-emerald" />
                      ) : reveal && isChoice ? (
                        <X className="h-4 w-4 text-crimson" />
                      ) : (
                        <span className="block h-4 w-4 rounded-full border border-hairline" />
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p
                aria-live="polite"
                className="mt-4 border-t border-border/50 pt-3 text-[13.5px] leading-relaxed text-muted-foreground"
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cyan">
                  Why
                </span>{" "}
                {item.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
