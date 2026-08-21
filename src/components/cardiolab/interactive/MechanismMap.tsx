import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MechanismPathway } from "@/lib/mechanism-map";
import { TaxonomyBadge } from "../TaxonomyBadge";
import { ArteryCrossSection, STAGE_FEATURES } from "./ArteryCrossSection";
import { PlaybackControls } from "./PlaybackControls";
import { prefersReducedMotion } from "./useCycleClock";
import { RichText } from "./RichText";

const STEP_MS = 4200;

/**
 * Topic-agnostic mechanism-map engine.
 *
 * Renders an ordered causal pathway as selectable nodes with a synchronized
 * morphology visualization and a contextual detail panel. Any
 * `MechanismPathway` (atherosclerosis, MI pathogenesis, HF remodeling…)
 * can drive it.
 */
export function MechanismMap({
  pathway,
  renderVisual,
}: {
  pathway: MechanismPathway;
  /** Optional morphology renderer; defaults to the arterial-wall section. */
  renderVisual?: (stageId: string, zoom: boolean) => React.ReactNode;
}) {
  const stages = pathway.stages;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  const stage = stages[index]!;
  const prev = index > 0 ? stages[index - 1] : undefined;
  const next = index < stages.length - 1 ? stages[index + 1] : undefined;

  const select = useCallback((i: number) => {
    setIndex(i);
    setZoom(true);
    window.setTimeout(() => setZoom(false), 520);
  }, []);

  const goPrev = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(stages.length - 1, i + 1));
  }, [stages.length]);
  const restart = useCallback(() => setIndex(0), []);

  // auto-advance through the pathway in order
  useEffect(() => {
    if (!playing) return;
    if (prefersReducedMotion()) {
      setPlaying(false);
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => {
        if (i >= stages.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, STEP_MS / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, stages.length]);

  // keep the active node in view on the horizontal rail
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-node="${index}"]`);
    el?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [index]);

  const visual = useMemo(() => {
    if (renderVisual) return renderVisual(stage.id, zoom);
    const features = STAGE_FEATURES[stage.id] ?? { severity: 0 };
    return (
      <ArteryCrossSection
        features={features}
        zoom={zoom}
        animate={!prefersReducedMotion()}
        label={`Arterial wall at stage ${index + 1}: ${stage.label}`}
      />
    );
  }, [renderVisual, stage.id, stage.label, index, zoom]);

  const progress = ((index + 1) / stages.length) * 100;

  return (
    <div
      className="space-y-5"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goPrev();
        } else if (e.key === "Home") {
          e.preventDefault();
          restart();
        }
      }}
    >
      {/* node rail */}
      <nav aria-label={`${pathway.title} pathway stages`}>
        <ol
          ref={listRef}
          className="flex snap-x gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible"
        >
          {stages.map((s, i) => {
            const active = i === index;
            const passed = i < index;
            return (
              <li key={s.id} data-node={i} className="min-w-[190px] snap-center lg:min-w-0">
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={active ? "step" : undefined}
                  className={`h-full w-full rounded-lg border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 ${
                    active
                      ? "border-cyan/60 bg-cyan/10"
                      : passed
                        ? "border-hairline bg-surface/40 opacity-80"
                        : "border-hairline bg-surface/25 opacity-45 hover:opacity-90"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] tracking-[0.16em] ${active ? "text-cyan" : "text-muted-foreground"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-[13px] font-semibold leading-snug text-foreground">
                    {s.label}
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-muted-foreground">
                    {s.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* progress + transport */}
      <div className="space-y-3">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={stages.length}
          aria-label="Pathway progress"
        >
          <div
            className="h-full rounded-full bg-cyan transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-cyan/50 hover:text-cyan disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={index === stages.length - 1}
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-cyan/50 hover:text-cyan disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-foreground"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] text-muted-foreground">
            Stage {index + 1} / {stages.length}
          </span>
          <div className="w-full sm:ml-auto sm:w-auto">
            <PlaybackControls
              playing={playing}
              onToggle={() => {
                if (!playing && index === stages.length - 1) setIndex(0);
                setPlaying((p) => !p);
              }}
              onRestart={() => {
                setPlaying(false);
                restart();
              }}
              speed={speed}
              onSpeed={setSpeed}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {visual}
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber/70" /> Lipid / foam cells
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-cyan/70" /> Fibrous cap
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-crimson/70" /> Necrosis / thrombus
            </span>
          </div>
        </div>

        {/* detail panel */}
        <article
          key={stage.id}
          aria-live="polite"
          className="glass-panel rounded-xl p-5 md:p-6"
        >
          <TaxonomyBadge kind={stage.tag ?? "mechanism"} />
          <h3 className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
            {stage.label}
          </h3>

          {prev && stage.edge && (
            <p className="mt-3 rounded-md border border-hairline bg-surface/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <span className="text-cyan">{prev.label}</span> → {stage.edge}
            </p>
          )}

          <dl className="mt-5 space-y-4 text-[13.5px] leading-relaxed">
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                What happens
              </dt>
              <dd className="mt-1 text-muted-foreground">
                <RichText text={stage.what} />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                Mechanism
              </dt>
              <dd className="mt-1 text-muted-foreground">
                <RichText text={stage.why} />
              </dd>
            </div>
            {stage.players && stage.players.length > 0 && (
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                  Key players
                </dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {stage.players.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-hairline bg-surface/50 px-2 py-[3px] font-mono text-[10.5px] text-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                Morphology
              </dt>
              <dd className="mt-1 text-muted-foreground">
                <RichText text={stage.morphology} />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
                Clinical consequence
              </dt>
              <dd className="mt-1 text-muted-foreground">
                <RichText text={stage.clinical} />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-crimson">
                USMLE associations
              </dt>
              <dd className="mt-2">
                <ul className="space-y-1.5">
                  {stage.usmle.map((u) => (
                    <li key={u} className="flex gap-2 text-muted-foreground">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-crimson" />
                      <RichText text={u} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          {next && (
            <button
              type="button"
              onClick={goNext}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-muted-foreground transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              Next: {next.label}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </article>
      </div>
    </div>
  );
}
