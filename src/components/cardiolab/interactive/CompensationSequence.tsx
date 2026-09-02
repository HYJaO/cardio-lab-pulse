import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { COMPENSATION } from "@/lib/heart-failure";

/**
 * Interactive neurohormonal compensation sequence.
 * Each step contrasts the immediate benefit with the chronic harm.
 * Keyboard: ← / → step, Home restart, Space play/pause.
 */
export function CompensationSequence() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const step = COMPENSATION[index]!;
  const last = COMPENSATION.length - 1;

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(COMPENSATION.length - 1, next)));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(
      () => {
        setIndex((i) => {
          if (i >= last) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      },
      reduced ? 6000 : 3800,
    );
    return () => window.clearTimeout(id);
  }, [playing, index, last]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setPlaying(false);
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPlaying(false);
      go(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setPlaying(false);
      go(0);
    } else if (e.key === " ") {
      e.preventDefault();
      setPlaying((p) => !p);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="space-y-5"
      role="group"
      aria-label="Compensation sequence"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Play sequence"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            go(0);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restart
        </button>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(COMPENSATION.length).padStart(2, "0")}
        </span>
      </div>

      <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="Compensation steps">
        {COMPENSATION.map((s, i) => {
          const active = i === index;
          return (
            <li key={s.id} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setIndex(i);
                }}
                aria-current={active ? "step" : undefined}
                className={`rounded-md border px-3 py-2 text-left font-mono text-[11px] transition-colors motion-safe:duration-300 ${
                  active
                    ? "border-cyan text-cyan"
                    : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-2 opacity-70">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
              {i < last && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <div className="glass-panel rounded-xl p-5 md:p-6" aria-live="polite">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Trigger
        </p>
        <h3 className="mt-2 text-[19px] font-semibold text-foreground">{step.label}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{step.trigger}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-emerald/30 bg-emerald/5 p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-emerald">
              Helps now — short term
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/90">{step.shortTerm}</p>
          </section>
          <section className="rounded-lg border border-crimson/30 bg-crimson/5 p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-crimson">
              Harms later — chronic
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/90">{step.longTerm}</p>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Mediators
          </span>
          {step.mediators.map((m) => (
            <span
              key={m}
              className="rounded-[5px] border border-hairline px-2 py-[3px] font-mono text-[10.5px] text-cyan"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              go(index - 1);
            }}
            disabled={index === 0}
            className="rounded-md border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              go(index + 1);
            }}
            disabled={index === last}
            className="rounded-md border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <p className="font-mono text-[10.5px] text-muted-foreground">
        Keyboard: ← / → step · Home restart · Space play/pause
      </p>
    </div>
  );
}
