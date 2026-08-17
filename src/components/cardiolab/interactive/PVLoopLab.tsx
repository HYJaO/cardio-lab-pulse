import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  PV_DEFAULTS,
  PV_PHASES,
  PV_RANGES,
  PV_STATES,
  derive,
  edpvr,
  espvr,
  loopPoints,
  phaseSegment,
  pvAt,
  pvPhaseAt,
  V0,
  type PVParams,
  type PVPhase,
  type PVStateId,
} from "@/lib/pv-loop";
import { PlaybackControls } from "./PlaybackControls";
import { ParameterSlider } from "./ParameterSlider";
import { useCycleClock } from "./useCycleClock";

/* chart geometry (SVG user units) */
const W = 620;
const H = 460;
const M = { top: 22, right: 26, bottom: 46, left: 58 };
const VMAX = 200;
const PMAX = 200;

const sx = (v: number) => M.left + (v / VMAX) * (W - M.left - M.right);
const sy = (p: number) => H - M.bottom - (p / PMAX) * (H - M.top - M.bottom);

const toPath = (pts: [number, number][], close = false) =>
  pts.map(([v, p], i) => `${i === 0 ? "M" : "L"}${sx(v).toFixed(1)} ${sy(p).toFixed(1)}`).join("") +
  (close ? "Z" : "");

export type PVLoopLabProps = {
  /** Starting parameters — the module is reusable for other ventricular models. */
  initialParams?: PVParams;
};

export function PVLoopLab({ initialParams = PV_DEFAULTS }: PVLoopLabProps) {
  const { t, setT, playing, toggle, setPlaying, speed, setSpeed, nudge, restart } = useCycleClock();
  const [params, setParams] = useState<PVParams>(initialParams);
  const [stateId, setStateId] = useState<PVStateId | null>("normal");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [compare, setCompare] = useState(true);

  const d = useMemo(() => derive(params), [params]);
  const normal = useMemo(() => derive(PV_DEFAULTS), []);
  const loop = useMemo(() => toPath(loopPoints(params), true), [params]);
  const normalLoop = useMemo(() => toPath(loopPoints(PV_DEFAULTS), true), []);

  const espvrPath = useMemo(() => {
    const vTop = Math.min(VMAX, V0 + PMAX / params.contractility);
    return `M${sx(V0)} ${sy(0)}L${sx(vTop)} ${sy(espvr(vTop, params.contractility))}`;
  }, [params.contractility]);

  const edpvrPath = useMemo(() => {
    const pts: [number, number][] = [];
    for (let v = V0; v <= VMAX; v += 4) pts.push([v, edpvr(v)]);
    return toPath(pts);
  }, []);

  const cursor = pvAt(t, params);
  const livePhase = cursor.phase;
  const focus = selectedPhaseId ? (PV_PHASES.find((p) => p.id === selectedPhaseId) as PVPhase) : null;
  const detail = focus ?? livePhase;
  const focusSeg = useMemo(
    () => (focus ? toPath(phaseSegment(params, focus)) : null),
    [focus, params],
  );

  const update = (key: keyof PVParams, value: number) => {
    setParams((p) => ({ ...p, [key]: value }));
    setStateId(null);
  };

  const applyState = (id: PVStateId) => {
    const s = PV_STATES.find((x) => x.id === id);
    if (!s) return;
    setParams(s.params);
    setStateId(id);
  };

  const resetAll = () => {
    setParams(PV_DEFAULTS);
    setStateId("normal");
    setSelectedPhaseId(null);
  };

  const stepPhase = (dir: 1 | -1) => {
    setPlaying(false);
    const i = PV_PHASES.findIndex((p) => p.id === pvPhaseAt(t).id);
    const next = PV_PHASES[(i + dir + PV_PHASES.length) % PV_PHASES.length] as PVPhase;
    setT(next.start + 0.001);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT") return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      toggle();
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
    }
  };

  const activeState = PV_STATES.find((s) => s.id === stateId) ?? null;
  const showGhost = compare && stateId !== "normal";

  return (
    <div
      className="space-y-4"
      role="group"
      tabIndex={0}
      aria-label="Interactive pressure–volume loop instrument. Space plays or pauses, arrow keys scrub, Home restarts, Escape clears the selected phase."
      onKeyDown={onKeyDown}
    >
      <PlaybackControls
        playing={playing}
        onToggle={toggle}
        onRestart={() => {
          restart();
          setSelectedPhaseId(null);
        }}
        speed={speed}
        onSpeed={setSpeed}
      />

      {/* scrub + phase stepping */}
      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl p-3">
        <button
          type="button"
          onClick={() => stepPhase(-1)}
          aria-label="Previous phase"
          className="rounded-md border border-hairline p-2 text-muted-foreground transition-colors hover:text-cyan"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <input
          type="range"
          min={0}
          max={0.999}
          step={0.001}
          value={t}
          onChange={(e) => {
            setPlaying(false);
            setT(Number(e.target.value));
          }}
          aria-label="Scrub cardiac cycle"
          aria-valuetext={`${Math.round(t * 800)} milliseconds — ${livePhase.name}`}
          className="min-w-[140px] flex-1 accent-[var(--cyan)]"
        />
        <button
          type="button"
          onClick={() => stepPhase(1)}
          aria-label="Next phase"
          className="rounded-md border border-hairline p-2 text-muted-foreground transition-colors hover:text-cyan"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">
          {String(Math.round(t * 800)).padStart(3, "0")} ms · {livePhase.short}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* ---------- chart ---------- */}
        <figure className="glass-panel rounded-xl p-3 md:p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[320px] w-full sm:h-[400px] lg:h-[460px]"
            role="img"
            aria-label={`Left ventricular pressure volume loop. End-diastolic volume ${Math.round(d.edv)} millilitres, end-systolic volume ${Math.round(d.esv)} millilitres, stroke volume ${Math.round(d.sv)} millilitres, ejection fraction ${Math.round(d.ef)} percent.`}
          >
            {/* grid */}
            {[0, 40, 80, 120, 160, 200].map((v) => (
              <g key={`v${v}`}>
                <line
                  x1={sx(v)}
                  y1={sy(0)}
                  x2={sx(v)}
                  y2={sy(PMAX)}
                  stroke="var(--hairline)"
                  strokeOpacity="0.5"
                />
                <text
                  x={sx(v)}
                  y={H - M.bottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  className="font-mono"
                  fill="var(--muted-foreground)"
                >
                  {v}
                </text>
              </g>
            ))}
            {[0, 50, 100, 150, 200].map((p) => (
              <g key={`p${p}`}>
                <line
                  x1={sx(0)}
                  y1={sy(p)}
                  x2={sx(VMAX)}
                  y2={sy(p)}
                  stroke="var(--hairline)"
                  strokeOpacity="0.5"
                />
                <text
                  x={M.left - 10}
                  y={sy(p) + 4}
                  textAnchor="end"
                  fontSize="11"
                  className="font-mono"
                  fill="var(--muted-foreground)"
                >
                  {p}
                </text>
              </g>
            ))}
            <text
              x={sx(VMAX / 2)}
              y={H - 8}
              textAnchor="middle"
              fontSize="12"
              className="font-mono"
              fill="var(--muted-foreground)"
            >
              LV volume (mL)
            </text>
            <text
              x={-H / 2}
              y={16}
              transform="rotate(-90)"
              textAnchor="middle"
              fontSize="12"
              className="font-mono"
              fill="var(--muted-foreground)"
            >
              LV pressure (mmHg)
            </text>

            {/* relationships */}
            <path d={espvrPath} stroke="var(--crimson)" strokeWidth="1.4" fill="none" strokeOpacity="0.8" />
            <text
              x={sx(Math.min(VMAX - 20, V0 + PMAX / params.contractility)) - 6}
              y={sy(Math.min(PMAX - 6, espvr(V0 + PMAX / params.contractility, params.contractility))) + 14}
              textAnchor="end"
              fontSize="11"
              className="font-mono"
              fill="var(--crimson)"
            >
              ESPVR
            </text>
            <path d={edpvrPath} stroke="var(--teal)" strokeWidth="1.4" fill="none" strokeOpacity="0.75" strokeDasharray="5 4" />
            <text x={sx(190)} y={sy(edpvr(190)) - 8} textAnchor="end" fontSize="11" className="font-mono" fill="var(--teal)">
              EDPVR
            </text>

            {/* ghost comparison loop */}
            {showGhost && (
              <path d={normalLoop} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.45" strokeDasharray="4 4" strokeWidth="1.2" />
            )}

            {/* main loop */}
            <path d={loop} fill="color-mix(in oklab, var(--cyan) 8%, transparent)" stroke="var(--cyan)" strokeWidth="2" strokeOpacity={focus ? 0.35 : 1} />
            {focusSeg && (
              <path d={focusSeg} fill="none" stroke="var(--electric)" strokeWidth="3.2" strokeLinecap="round" />
            )}

            {/* EDV / ESV markers */}
            <g>
              <circle cx={sx(d.esv)} cy={sy(d.pes)} r="4" fill="var(--crimson)" />
              <text x={sx(d.esv) - 8} y={sy(d.pes) - 8} textAnchor="end" fontSize="11" className="font-mono" fill="var(--crimson)">
                ESV {Math.round(d.esv)}
              </text>
              <circle cx={sx(d.edv)} cy={sy(d.edp)} r="4" fill="var(--teal)" />
              <text x={sx(d.edv) + 8} y={sy(d.edp) + 16} fontSize="11" className="font-mono" fill="var(--teal)">
                EDV {Math.round(d.edv)}
              </text>
              {/* stroke volume width */}
              <line x1={sx(d.esv)} y1={sy(-2)} x2={sx(d.edv)} y2={sy(-2)} stroke="var(--cyan)" strokeWidth="1.2" />
              <text x={sx((d.esv + d.edv) / 2)} y={sy(-2) - 6} textAnchor="middle" fontSize="11" className="font-mono" fill="var(--cyan)">
                SV {Math.round(d.sv)} mL
              </text>
            </g>

            {/* cursor */}
            <circle cx={sx(cursor.v)} cy={sy(cursor.p)} r="6" fill="var(--cyan)" />
            <circle cx={sx(cursor.v)} cy={sy(cursor.p)} r="11" fill="none" stroke="var(--cyan)" strokeOpacity="0.4" />
          </svg>
          <figcaption className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Left ventricle · {activeState ? activeState.label : "Custom parameters"}
          </figcaption>
        </figure>

        {/* ---------- right rail ---------- */}
        <div className="space-y-4">
          {/* derived values */}
          <div className="glass-panel grid grid-cols-2 gap-3 rounded-xl p-4">
            <Metric label="EDV" value={`${Math.round(d.edv)} mL`} note="End-diastolic volume" />
            <Metric label="ESV" value={`${Math.round(d.esv)} mL`} note="End-systolic volume" />
            <Metric label="Stroke volume" value={`${Math.round(d.sv)} mL`} note="SV = EDV − ESV" accent />
            <Metric
              label="Ejection fraction"
              value={`${d.ef.toFixed(0)} %`}
              note="EF = SV ÷ EDV × 100"
              accent
            />
            <Metric label="EDP" value={`${d.edp.toFixed(1)} mmHg`} note="On the EDPVR curve" />
            <Metric label="Stroke work" value={`${Math.round(d.strokeWork / 10) * 10}`} note="mmHg·mL (loop area)" />
          </div>

          {/* parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
                Parameters
              </h3>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
            <ParameterSlider
              id="pv-preload"
              label="Preload"
              hint={`EDV ${Math.round(d.edv)} mL · ${d.edv > normal.edv ? "SV ↑ (Frank–Starling)" : d.edv < normal.edv ? "SV ↓" : "reference"}`}
              value={params.preload}
              {...PV_RANGES.preload}
              onChange={(v) => update("preload", v)}
            />
            <ParameterSlider
              id="pv-afterload"
              label="Afterload"
              hint={`Aortic diastolic pressure · ESV ${Math.round(d.esv)} mL`}
              value={params.afterload}
              {...PV_RANGES.afterload}
              onChange={(v) => update("afterload", v)}
            />
            <ParameterSlider
              id="pv-contractility"
              label="Contractility"
              hint={`ESPVR slope (Emax) · EF ${d.ef.toFixed(0)}%`}
              value={params.contractility}
              display={params.contractility.toFixed(1)}
              {...PV_RANGES.contractility}
              onChange={(v) => update("contractility", v)}
            />
          </div>
        </div>
      </div>

      {/* phases */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PV_PHASES.map((p) => {
            const isLive = livePhase.id === p.id;
            const isSelected = selectedPhaseId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedPhaseId((prev) => (prev === p.id ? null : p.id));
                  setPlaying(false);
                  setT(p.start + 0.001);
                }}
                className={`rounded-md border px-3 py-2 text-left font-mono text-[11px] transition-colors ${
                  isSelected
                    ? "border-cyan bg-cyan/10 text-cyan"
                    : isLive
                      ? "border-cyan/40 text-foreground"
                      : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-2 opacity-70">{String(p.index).padStart(2, "0")}</span>
                {p.name}
              </button>
            );
          })}
        </div>

        <div className="glass-panel grid gap-4 rounded-xl p-4 md:grid-cols-2 md:p-5">
          <div className="md:col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cyan">
              {focus ? "Selected phase" : "Live phase"} · {detail.short}
            </p>
            <h4 className="mt-1 text-[17px] font-semibold text-foreground">{detail.name}</h4>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{detail.event}</p>
          </div>
          <Fact label="Valves" text={detail.valves} />
          <Fact label="Pressure" text={detail.pressure} />
          <Fact label="Volume" text={detail.volume} />
          <Fact label="ECG" text={detail.ecg} />
          <Fact label="Heart sound" text={detail.sound ?? "No sound in health."} />
          <Fact
            label="Cycle phases"
            text={`${detail.cyclePhases.join(", ")} · EDV ${Math.round(d.edv)} mL, ESV ${Math.round(d.esv)} mL, SV ${Math.round(d.sv)} mL`}
          />
        </div>
      </div>

      {/* clinical states */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {PV_STATES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={stateId === s.id}
              onClick={() => applyState(s.id)}
              className={`rounded-md border px-3 py-2 font-mono text-[11px] transition-colors ${
                stateId === s.id
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-hairline text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
          <label className="ml-auto inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="accent-[var(--cyan)]"
            />
            Overlay normal loop
          </label>
        </div>
        {activeState && (
          <div className="glass-panel rounded-xl p-4 text-[13.5px] leading-relaxed text-muted-foreground">
            <p className="text-foreground">{activeState.teaching}</p>
            <p className="mt-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cyan">
                Example ·{" "}
              </span>
              {activeState.example}
            </p>
            <p className="mt-2 font-mono text-[11.5px] text-muted-foreground">
              vs normal: EDV {fmtDelta(d.edv - normal.edv)} mL · ESV {fmtDelta(d.esv - normal.esv)} mL ·
              SV {fmtDelta(d.sv - normal.sv)} mL · EF {fmtDelta(d.ef - normal.ef, 0)} %
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDelta(n: number, digits = 0) {
  const v = n.toFixed(digits);
  return `${n > 0.5 ? "+" : ""}${v}`;
}

function Metric({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-[19px] font-semibold ${accent ? "text-cyan" : "text-foreground"}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-muted-foreground">{note}</p>
    </div>
  );
}

function Fact({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface/25 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}
