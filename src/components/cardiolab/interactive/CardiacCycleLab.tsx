import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CYCLE_MS,
  PHASES,
  SOUNDS,
  aorticOpen,
  aorticPressure,
  atrialPressure,
  curvePath,
  ecg,
  mitralOpen,
  phaseAt,
  ventricularPressure,
  ventricularVolume,
  yFor,
  type Phase,
} from "@/lib/cardiac-cycle";
import { ValveDiagram, VALVE_NOTES } from "./ValveDiagram";

const W = 1000;
const H_ECG = 110;
const H_PRESSURE = 260;
const H_VOLUME = 120;
const PAD = 10;

const P_MIN = 0;
const P_MAX = 130;
const V_MIN = 40;
const V_MAX = 130;

type ValveId = "mitral" | "aortic";

export function CardiacCycleLab() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.5);
  const [hoverPhase, setHoverPhase] = useState<Phase | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [valve, setValve] = useState<ValveId | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

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

  const x = t * W;
  const highlight = hoverPhase ?? (selectedPhaseId ? detail : null);

  return (
    <div className="space-y-4">
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
          onClick={() => {
            setT(0);
            setSelectedPhaseId(null);
          }}
          className="inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        <div className="flex items-center gap-1 rounded-md border border-hairline p-0.5 font-mono text-[11px]">
          {[0.25, 0.5, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
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
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {PHASES.map((p) => {
          const active = p.id === detail.id;
          return (
            <button
              key={p.id}
              type="button"
              onMouseEnter={() => setHoverPhase(p)}
              onMouseLeave={() => setHoverPhase(null)}
              onClick={() => {
                setPlaying(false);
                setSelectedPhaseId(p.id);
                setT(p.start + (p.end - p.start) / 2);
              }}
              className="shrink-0 rounded-md border px-3 py-2 text-left transition-colors"
              style={{
                borderColor: active ? "var(--cyan)" : "var(--hairline)",
                backgroundColor: active
                  ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                  : "transparent",
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
            height={H_ECG}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
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
            height={H_PRESSURE}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
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
            height={H_VOLUME}
            x={x}
            highlight={highlight}
            hoverPhase={setHoverPhase}
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
            <svg viewBox={`0 0 ${W} 74`} className="w-full" role="img" aria-label="Valve opening timeline and heart sound markers">
              <TimelineBar
                label="Mitral"
                y={6}
                segments={[
                  [0, 0.1],
                  [0.5, 1],
                ]}
              />
              <TimelineBar label="Aortic" y={34} segments={[[0.16, 0.44]]} />
              {SOUNDS.map((s) => (
                <g key={s.id}>
                  <line
                    x1={s.t * W}
                    x2={s.t * W}
                    y1={0}
                    y2={62}
                    stroke="var(--violet)"
                    strokeDasharray="3 3"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={s.t * W + 6}
                    y={70}
                    fontSize="14"
                    className="font-mono"
                    fill="var(--violet)"
                  >
                    {s.label}
                  </text>
                </g>
              ))}
              <line x1={x} x2={x} y1={0} y2={62} stroke="var(--cyan)" strokeWidth="2" />
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
                value={`${mitralOpen(t) ? "MV open" : "MV shut"} · ${aorticOpen(t) ? "AV open" : "AV shut"}`}
                color="var(--foreground)"
              />
              <Readout
                label="Cycle"
                value={current.part === "systole" ? "SYSTOLE" : "DIASTOLE"}
                color={current.part === "systole" ? "var(--crimson)" : "var(--cyan)"}
              />
            </div>
          </div>

          <ValveDiagram t={t} selected={valve} onSelect={(v) => setValve(v === valve ? null : v)} />
        </div>
      </div>

      {valve && (
        <div className="glass-panel rounded-xl border-l-2 border-l-cyan p-5">
          <h4 className="font-display text-[15px] text-foreground">{VALVE_NOTES[valve].title}</h4>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {VALVE_NOTES[valve].body}
          </p>
        </div>
      )}

      {/* phase detail */}
      <div className="glass-panel rounded-xl p-5 md:p-6">
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
        </div>

        <dl className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
          <Field label="Pressure changes" value={detail.pressure} />
          <Field label="Volume changes" value={detail.volume} />
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
  height,
  x,
  children,
  highlight,
  hoverPhase,
  gridValues,
  scale,
}: {
  title: string;
  height: number;
  x: number;
  children: React.ReactNode;
  highlight: Phase | null;
  hoverPhase: (p: Phase | null) => void;
  gridValues?: number[];
  scale?: { min: number; max: number };
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label={title}>
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
}: {
  label: string;
  y: number;
  segments: [number, number][];
}) {
  return (
    <g>
      <rect x={0} y={y} width={W} height="18" fill="color-mix(in oklab, var(--crimson) 8%, transparent)" rx="4" />
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
