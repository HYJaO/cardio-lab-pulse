import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CYCLE_MS,
  PHASES,
  PHASE_EVENT,
  SOUNDS,
  VALVES,
  VALVE_IDS,
  aorticPressure,
  atrialPressure,
  curvePath,
  ecg,
  phaseAt,
  valveOpen,
  ventricularPressure,
  ventricularVolume,
  yFor,
  type Phase,
  type ValveId,
} from "@/lib/cardiac-cycle";
import { ValveDiagram } from "./ValveDiagram";

const W = 1000;
const H_ECG = 110;
const H_PRESSURE = 260;
const H_VOLUME = 120;
const PAD = 10;

const P_MIN = 0;
const P_MAX = 130;
const V_MIN = 40;
const V_MAX = 130;

const SPEEDS = [0.25, 0.5, 1, 2];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export function CardiacCycleLab() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [hoverPhase, setHoverPhase] = useState<Phase | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [valve, setValve] = useState<ValveId | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  // Respect reduced-motion: start paused, otherwise autoplay.
  useEffect(() => {
    if (!prefersReducedMotion()) setPlaying(true);
  }, []);


  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / (CYCLE_MS / speed);
        setT((prev) => (prev + dt) % 1);
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, [playing, speed]);

  const current = phaseAt(t);
  const detail = selectedPhaseId
    ? (PHASES.find((p) => p.id === selectedPhaseId) ?? current)
    : current;

  const scrubTo = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = Math.min(0.9999, Math.max(0, (clientX - rect.left) / rect.width));
    setT(next);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setPlaying(false);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    scrubTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) scrubTo(e.clientX);
  };

  const stepPhase = (dir: 1 | -1) => {
    setPlaying(false);
    const i = PHASES.findIndex((p) => p.id === current.id);
    const next = PHASES[(i + dir + PHASES.length) % PHASES.length] as Phase;
    setT(next.start + 0.001);
    setSelectedPhaseId(null);
  };

  const nudge = (delta: number) => {
    setPlaying(false);
    setT((prev) => Math.min(0.9999, Math.max(0, prev + delta)));
  };

  const restart = () => {
    setT(0);
    setSelectedPhaseId(null);
  };

  const onValveSelect = (v: ValveId) => setValve((prev) => (prev === v ? null : v));

  const activeSound = SOUNDS.find((s) => Math.abs(((t - s.t + 1.5) % 1) - 0.5) < 0.02) ?? null;

  const x = t * W;
  const highlight = hoverPhase ?? (selectedPhaseId ? detail : null);
  const focused = selectedPhaseId ? detail : null;
  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON") {
      if (!(e.key === "ArrowLeft" || e.key === "ArrowRight") || target.tagName === "INPUT") return;
    }
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      setPlaying((p) => !p);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(e.shiftKey ? 0.05 : 0.01);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(e.shiftKey ? -0.05 : -0.01);
    } else if (e.key === "Home") {
      e.preventDefault();
      restart();
    } else if (e.key === "Escape") {
      setSelectedPhaseId(null);
      setValve(null);
    }
  };

  return (
    <div
      className="space-y-4"
      role="group"
      aria-label="Interactive cardiac cycle instrument. Space plays or pauses, arrow keys scrub, Home restarts, Escape clears selection."
      tabIndex={0}
      onKeyDown={onKeyDown}
    >

      {/* controls */}
      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-2 rounded-md bg-cyan/15 px-3 py-2 text-[13px] font-medium text-cyan transition-colors hover:bg-cyan/25"
          aria-label={playing ? "Pause animation" : "Play animation"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restart
        </button>

        <div
          className="flex items-center gap-1 rounded-md border border-hairline p-0.5 font-mono text-[11px]"
          role="group"
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={`rounded px-2 py-1 transition-colors ${
                speed === s ? "bg-cyan/20 text-cyan" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => stepPhase(-1)}
            aria-label="Previous phase"
            className="rounded-md border border-hairline p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => stepPhase(1)}
            aria-label="Next phase"
            className="rounded-md border border-hairline p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>


        <div className="flex w-full items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Scrub
          </span>
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.001}
            value={t}
            aria-label="Scrub through the cardiac cycle"
            onChange={(e) => {
              setPlaying(false);
              setT(Number(e.target.value));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-cyan"
          />
          <span className="w-16 shrink-0 text-right font-mono text-[11px] text-cyan">
            {Math.round(t * CYCLE_MS)} ms
          </span>
        </div>
      </div>

      {/* phase selector rail */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Cardiac cycle phases"
      >
        {PHASES.map((p) => {
          const active = p.id === detail.id;
          const selected = p.id === selectedPhaseId;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onMouseEnter={() => setHoverPhase(p)}
              onMouseLeave={() => setHoverPhase(null)}
              onFocus={() => setHoverPhase(p)}
              onBlur={() => setHoverPhase(null)}
              onClick={() => {
                if (selected) {
                  setSelectedPhaseId(null);
                  return;
                }
                setPlaying(false);
                setSelectedPhaseId(p.id);
                setT(p.start + (p.end - p.start) / 2);
              }}
              className="min-h-11 shrink-0 rounded-md border px-3 py-2 text-left transition-colors"
              style={{
                borderColor: active ? "var(--cyan)" : "var(--hairline)",
                backgroundColor: active
                  ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                  : "transparent",
                opacity: selectedPhaseId && !selected ? 0.45 : 1,
              }}
            >
              <span className="block font-mono text-[10px] text-muted-foreground">
                {p.index} · {p.part === "systole" ? "SYSTOLE" : "DIASTOLE"}
              </span>
              <span className={`block text-[12.5px] ${active ? "text-cyan" : "text-foreground"}`}>
                {p.short}
              </span>
            </button>
          );
        })}
      </div>
      {selectedPhaseId && (
        <p className="font-mono text-[11px] text-muted-foreground">
          Phase focus on — unrelated phases dimmed.{" "}
          <button
            type="button"
            onClick={() => setSelectedPhaseId(null)}
            className="text-cyan underline-offset-4 hover:underline"
          >
            Clear focus
          </button>
        </p>
      )}


      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* charts */}
        <div
          ref={trackRef}
          className="glass-panel touch-pan-y select-none rounded-xl p-3 md:p-4"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <Panel
            title="ECG · Lead II"
            heightClass="h-20 md:h-24"
            height={H_ECG}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
            focus={focused}
          >
            <path
              d={curvePath(ecg, { width: W, height: H_ECG, min: -0.35, max: 1.15, pad: PAD })}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </Panel>

          <Panel
            title="Pressure (mmHg)"
            heightClass="h-56 md:h-64"
            height={H_PRESSURE}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
            focus={focused}
            gridValues={[0, 40, 80, 120]}
            scale={{ min: P_MIN, max: P_MAX }}
          >
            <path
              d={curvePath(aorticPressure, {
                width: W,
                height: H_PRESSURE,
                min: P_MIN,
                max: P_MAX,
                pad: PAD,
              })}
              fill="none"
              stroke="var(--crimson)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={curvePath(ventricularPressure, {
                width: W,
                height: H_PRESSURE,
                min: P_MIN,
                max: P_MAX,
                pad: PAD,
              })}
              fill="none"
              stroke="var(--amber)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={curvePath(atrialPressure, {
                width: W,
                height: H_PRESSURE,
                min: P_MIN,
                max: P_MAX,
                pad: PAD,
              })}
              fill="none"
              stroke="var(--electric)"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
            />
            {/* live dots */}
            <Dot x={x} y={yFor(aorticPressure(t), { height: H_PRESSURE, min: P_MIN, max: P_MAX, pad: PAD })} color="var(--crimson)" />
            <Dot x={x} y={yFor(ventricularPressure(t), { height: H_PRESSURE, min: P_MIN, max: P_MAX, pad: PAD })} color="var(--amber)" />
            <Dot x={x} y={yFor(atrialPressure(t), { height: H_PRESSURE, min: P_MIN, max: P_MAX, pad: PAD })} color="var(--electric)" />
          </Panel>

          <Panel
            title="Ventricular volume (mL)"
            heightClass="h-24 md:h-28"
            height={H_VOLUME}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
            focus={focused}
            gridValues={[50, 120]}
            scale={{ min: V_MIN, max: V_MAX }}
          >
            <path
              d={curvePath(ventricularVolume, {
                width: W,
                height: H_VOLUME,
                min: V_MIN,
                max: V_MAX,
                pad: PAD,
              })}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <Dot x={x} y={yFor(ventricularVolume(t), { height: H_VOLUME, min: V_MIN, max: V_MAX, pad: PAD })} color="var(--teal)" />
          </Panel>

          {/* valve + sound timeline */}
          <div className="mt-3 border-t border-border/50 pt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Valves &amp; heart sounds
            </p>
            <svg
              viewBox={`0 0 ${W} 132`}
              className="w-full"
              role="img"
              aria-label="Opening intervals for all four valves and heart sound markers"
            >
              {VALVE_IDS.map((id, i) => (
                <TimelineBar
                  key={id}
                  label={VALVES[id].name.replace(" valve", "")}
                  y={6 + i * 26}
                  segments={VALVES[id].openSegments}
                  dim={valve !== null && valve !== id}
                  active={valve === id}
                  onSelect={() => onValveSelect(id)}
                />
              ))}
              {SOUNDS.map((s) => (
                <g key={s.id}>
                  <line
                    x1={s.t * W}
                    x2={s.t * W}
                    y1={0}
                    y2={112}
                    stroke="var(--violet)"
                    strokeDasharray="3 3"
                    strokeOpacity={activeSound?.id === s.id ? 1 : 0.6}
                    strokeWidth={activeSound?.id === s.id ? 2 : 1}
                  />
                  <text
                    x={s.t * W + 6}
                    y={126}
                    fontSize="14"
                    className="font-mono"
                    fill="var(--violet)"
                    opacity={activeSound?.id === s.id ? 1 : 0.7}
                  >
                    {s.label}
                  </text>
                </g>
              ))}
              <line x1={x} x2={x} y1={0} y2={112} stroke="var(--cyan)" strokeWidth="2" />
            </svg>
          </div>


          <Legend />
        </div>

        {/* live readouts */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Live readout
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1">
              <Readout label="Ventricular P" value={`${ventricularPressure(t).toFixed(0)} mmHg`} color="var(--amber)" />
              <Readout label="Aortic P" value={`${aorticPressure(t).toFixed(0)} mmHg`} color="var(--crimson)" />
              <Readout label="Atrial P" value={`${atrialPressure(t).toFixed(0)} mmHg`} color="var(--electric)" />
              <Readout label="LV volume" value={`${ventricularVolume(t).toFixed(0)} mL`} color="var(--teal)" />
              <Readout
                label="Valves"
                value={VALVE_IDS.map((v) => `${VALVES[v].short}${valveOpen[v](t) ? "↑" : "↓"}`).join(" ")}
                color="var(--foreground)"
              />
              <Readout
                label="Heart sound"
                value={activeSound ? `${activeSound.label} — ${activeSound.detail.split("—")[0]?.trim()}` : "—"}
                color={activeSound ? "var(--violet)" : "var(--muted-foreground)"}
              />
              <Readout
                label="Cycle"
                value={current.part === "systole" ? "SYSTOLE" : "DIASTOLE"}
                color={current.part === "systole" ? "var(--crimson)" : "var(--cyan)"}
              />

            </div>
          </div>

          <ValveDiagram t={t} selected={valve} onSelect={onValveSelect} />
        </div>
      </div>

      {valve && (
        <div className="glass-panel rounded-xl border-l-2 border-l-cyan p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="font-display text-[15px] text-foreground">{VALVES[valve].name}</h4>
            <span
              className="rounded-[5px] px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: valveOpen[valve](t) ? "var(--emerald)" : "var(--crimson)",
                backgroundColor: `color-mix(in oklab, ${valveOpen[valve](t) ? "var(--emerald)" : "var(--crimson)"} 14%, transparent)`,
              }}
            >
              {valveOpen[valve](t) ? "OPEN" : "CLOSED"}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {VALVES[valve].side} heart · {VALVES[valve].type}
            </span>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
            <Field label="Pressure relationship" value={VALVES[valve].gradient} />
            <Field label="What opens it" value={VALVES[valve].opens} />
            <Field label="What closes it" value={VALVES[valve].closes} />
            <Field label="Associated heart sound" value={VALVES[valve].sound} />
            <Field label="Clinical link" value={VALVES[valve].clinical} />
          </dl>
        </div>
      )}


      {/* phase detail */}
      <div
        className="glass-panel rounded-xl p-5 md:p-6"
        style={focused ? { borderColor: "var(--cyan)" } : undefined}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-[5px] px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{
              color: detail.part === "systole" ? "var(--crimson)" : "var(--cyan)",
              backgroundColor: `color-mix(in oklab, ${detail.part === "systole" ? "var(--crimson)" : "var(--cyan)"} 14%, transparent)`,
            }}
          >
            {detail.part}
          </span>
          <h3 className="font-display text-lg text-foreground md:text-xl">
            {detail.index}. {detail.name}
          </h3>
          <span className="font-mono text-[11px] text-muted-foreground">
            {Math.round(detail.start * CYCLE_MS)}–{Math.round(detail.end * CYCLE_MS)} ms
          </span>
          {focused && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">
              Focused
            </span>
          )}
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-foreground">
          {PHASE_EVENT[detail.id]}
        </p>

        <dl className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
          <Field label="Pressure relationship" value={detail.pressure} />
          <Field label="Volume relationship" value={detail.volume} />
          <Field label="Valve status" value={detail.valves} />
          <Field label="ECG relationship" value={detail.ecg} />
          <Field label="Heart sound" value={detail.sound ?? "None in this phase"} />
          <Field label="Why it matters" value={detail.pearl} />
        </dl>
      </div>

    </div>
  );
}

function Panel({
  title,
  heightClass,
  height,
  x,
  children,
  highlight,
  hoverPhase,
  gridValues,
  scale,
  focus = null,
}: {
  title: string;
  heightClass: string;
  height: number;
  x: number;
  children: React.ReactNode;
  highlight: Phase | null;
  hoverPhase: (p: Phase | null) => void;
  gridValues?: number[];
  scale?: { min: number; max: number };
  focus?: Phase | null;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <svg viewBox={`0 0 ${W} ${height}`} className={`w-full ${heightClass}`} preserveAspectRatio="none" role="img" aria-label={title}>
        {/* phase bands */}
        {PHASES.map((p) => (
          <rect
            key={p.id}
            x={p.start * W}
            width={(p.end - p.start) * W}
            y={0}
            height={height}
            fill={
              highlight?.id === p.id
                ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                : p.part === "systole"
                  ? "color-mix(in oklab, var(--crimson) 5%, transparent)"
                  : "transparent"
            }
            onMouseEnter={() => hoverPhase(p)}
            onMouseLeave={() => hoverPhase(null)}
          />
        ))}

        {PHASES.map((p) => (
          <line
            key={`${p.id}-l`}
            x1={p.start * W}
            x2={p.start * W}
            y1={0}
            y2={height}
            stroke="var(--hairline)"
            strokeDasharray="2 4"
          />
        ))}
        {gridValues && scale
          ? gridValues.map((v) => {
              const y = yFor(v, { height, min: scale.min, max: scale.max, pad: PAD });
              return (
                <g key={v}>
                  <line x1={0} x2={W} y1={y} y2={y} stroke="var(--hairline)" strokeOpacity="0.5" />
                  <text x={4} y={y - 3} fontSize="11" className="font-mono" fill="var(--muted-foreground)">
                    {v}
                  </text>
                </g>
              );
            })
          : null}
        {children}
        {focus && (
          <g aria-hidden pointerEvents="none">
            <rect x={0} y={0} width={focus.start * W} height={height} fill="var(--background)" opacity="0.62" />
            <rect
              x={focus.end * W}
              y={0}
              width={(1 - focus.end) * W}
              height={height}
              fill="var(--background)"
              opacity="0.62"
            />
            <rect
              x={focus.start * W}
              y={0}
              width={(focus.end - focus.start) * W}
              height={height}
              fill="none"
              stroke="var(--cyan)"
              strokeOpacity="0.6"
            />
          </g>
        )}
        <line x1={x} x2={x} y1={0} y2={height} stroke="var(--cyan)" strokeWidth="2" />

      </svg>
    </div>
  );
}

function Dot({ x, y, color }: { x: number; y: number; color: string }) {
  return <circle cx={x} cy={y} r="4" fill={color} stroke="var(--background)" strokeWidth="1.5" />;
}

function TimelineBar({
  label,
  y,
  segments,
  dim = false,
  active = false,
  onSelect,
}: {
  label: string;
  y: number;
  segments: [number, number][];
  dim?: boolean;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <g
      opacity={dim ? 0.35 : 1}
      className={onSelect ? "cursor-pointer" : undefined}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      aria-label={onSelect ? `${label} valve opening interval` : undefined}
    >
      <rect
        x={0}
        y={y}
        width={W}
        height="18"
        fill="color-mix(in oklab, var(--crimson) 8%, transparent)"
        rx="4"
        stroke={active ? "var(--cyan)" : "transparent"}
      />
      {segments.map(([s, e]) => (
        <rect
          key={s}
          x={s * W}
          y={y}
          width={(e - s) * W}
          height="18"
          rx="4"
          fill="color-mix(in oklab, var(--emerald) 32%, transparent)"
        />
      ))}
      <text x={8} y={y + 13} fontSize="12" className="font-mono" fill="var(--muted-foreground)">
        {label}
      </text>
    </g>
  );
}


function Legend() {
  const items = [
    ["Aortic pressure", "var(--crimson)"],
    ["Ventricular pressure", "var(--amber)"],
    ["Atrial pressure", "var(--electric)"],
    ["Ventricular volume", "var(--teal)"],
  ] as const;
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/50 pt-3 font-mono text-[10.5px] text-muted-foreground">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
      <span className="ml-auto hidden sm:inline">Drag across the chart to scrub</span>
    </div>
  );
}

function Readout({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[15px] tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">{label}</dt>
      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{value}</dd>
    </div>
  );
}
