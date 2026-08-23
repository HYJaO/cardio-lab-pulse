import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  STARLING_DEFAULTS,
  STARLING_RANGES,
  STARLING_STATES,
  cardiacOutput,
  msfp,
  operatingPoint,
  sampleCurve,
  venousReturn,
  type StarlingParams,
  type StarlingStateId,
} from "@/lib/starling";
import { ParameterSlider } from "./ParameterSlider";

const W = 620;
const H = 420;
const M = { top: 20, right: 24, bottom: 48, left: 58 };
const XMIN = -4;
const XMAX = 16;
const YMAX = 16;

const sx = (rap: number) => M.left + ((rap - XMIN) / (XMAX - XMIN)) * (W - M.left - M.right);
const sy = (co: number) => H - M.bottom - (co / YMAX) * (H - M.top - M.bottom);

const toPath = (pts: [number, number][]) =>
  pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`)
    .join("");

type CurveKey = "cardiac" | "vascular" | null;

/**
 * Cardiac function (Frank–Starling) curve plotted against the vascular
 * function curve. The intersection is the steady-state operating point:
 * cardiac output must equal venous return.
 */
export function StarlingCurveLab() {
  const [params, setParams] = useState<StarlingParams>(STARLING_DEFAULTS);
  const [stateId, setStateId] = useState<StarlingStateId | null>("normal");
  const [compare, setCompare] = useState(true);
  const [focus, setFocus] = useState<CurveKey>(null);

  const cardiacPath = useMemo(() => toPath(sampleCurve(cardiacOutput, params)), [params]);
  const vascularPath = useMemo(() => toPath(sampleCurve(venousReturn, params)), [params]);
  const baseCardiac = useMemo(() => toPath(sampleCurve(cardiacOutput, STARLING_DEFAULTS)), []);
  const baseVascular = useMemo(() => toPath(sampleCurve(venousReturn, STARLING_DEFAULTS)), []);

  const op = useMemo(() => operatingPoint(params), [params]);
  const base = useMemo(() => operatingPoint(STARLING_DEFAULTS), []);
  const showGhost = compare && stateId !== "normal";

  const update = (key: keyof StarlingParams, value: number) => {
    setParams((p) => ({ ...p, [key]: value }));
    setStateId(null);
  };

  const applyState = (id: StarlingStateId) => {
    const s = STARLING_STATES.find((x) => x.id === id);
    if (!s) return;
    setParams(s.params);
    setStateId(id);
  };

  const active = STARLING_STATES.find((s) => s.id === stateId) ?? null;
  const delta = (v: number, b: number, unit: string) =>
    `${v > b + 0.05 ? "↑" : v < b - 0.05 ? "↓" : "="} ${v.toFixed(1)} ${unit}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <figure className="glass-panel rounded-xl p-3 md:p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Cardiac and vascular function curves. Operating point: right atrial pressure ${op.rap.toFixed(1)} millimetres of mercury, cardiac output ${op.co.toFixed(1)} litres per minute.`}
          >
            {[-4, 0, 4, 8, 12, 16].map((x) => (
              <g key={`x${x}`}>
                <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(YMAX)} stroke="var(--hairline)" strokeOpacity="0.5" />
                <text x={sx(x)} y={H - M.bottom + 18} textAnchor="middle" fontSize="11" className="font-mono" fill="var(--muted-foreground)">
                  {x}
                </text>
              </g>
            ))}
            {[0, 4, 8, 12, 16].map((y) => (
              <g key={`y${y}`}>
                <line x1={sx(XMIN)} y1={sy(y)} x2={sx(XMAX)} y2={sy(y)} stroke="var(--hairline)" strokeOpacity="0.5" />
                <text x={M.left - 10} y={sy(y) + 4} textAnchor="end" fontSize="11" className="font-mono" fill="var(--muted-foreground)">
                  {y}
                </text>
              </g>
            ))}
            <text x={sx((XMIN + XMAX) / 2)} y={H - 8} textAnchor="middle" fontSize="12" className="font-mono" fill="var(--muted-foreground)">
              Right atrial (filling) pressure — preload, mmHg
            </text>
            <text x={-H / 2} y={16} transform="rotate(-90)" textAnchor="middle" fontSize="12" className="font-mono" fill="var(--muted-foreground)">
              Cardiac output / venous return (L/min)
            </text>

            {showGhost && (
              <>
                <path d={baseCardiac} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.4" strokeDasharray="4 4" strokeWidth="1.2" />
                <path d={baseVascular} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.4" strokeDasharray="4 4" strokeWidth="1.2" />
                <circle cx={sx(base.rap)} cy={sy(base.co)} r="3.5" fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.6" />
              </>
            )}

            <path
              d={cardiacPath}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth={focus === "cardiac" ? 3.2 : 2}
              strokeOpacity={focus === "vascular" ? 0.3 : 1}
            />
            <path
              d={vascularPath}
              fill="none"
              stroke="var(--crimson)"
              strokeWidth={focus === "vascular" ? 3.2 : 2}
              strokeOpacity={focus === "cardiac" ? 0.3 : 1}
            />

            {/* MSFP intercept */}
            <circle cx={sx(msfp(params))} cy={sy(0)} r="3" fill="var(--crimson)" />
            <text x={sx(msfp(params))} y={sy(0) - 8} textAnchor="middle" fontSize="10.5" className="font-mono" fill="var(--crimson)">
              MSFP {msfp(params).toFixed(1)}
            </text>

            {/* operating point */}
            <line x1={sx(op.rap)} y1={sy(0)} x2={sx(op.rap)} y2={sy(op.co)} stroke="var(--electric)" strokeOpacity="0.5" strokeDasharray="3 3" />
            <line x1={sx(XMIN)} y1={sy(op.co)} x2={sx(op.rap)} y2={sy(op.co)} stroke="var(--electric)" strokeOpacity="0.5" strokeDasharray="3 3" />
            <circle cx={sx(op.rap)} cy={sy(op.co)} r="5.5" fill="var(--electric)" />
            <text x={sx(op.rap) + 10} y={sy(op.co) - 10} fontSize="11" className="font-mono" fill="var(--electric)">
              CO {op.co.toFixed(1)} L/min · RAP {op.rap.toFixed(1)}
            </text>

            <text x={sx(13.5)} y={sy(cardiacOutput(13.5, params)) - 10} textAnchor="end" fontSize="11" className="font-mono" fill="var(--cyan)">
              Cardiac function (Frank–Starling)
            </text>
            <text x={sx(msfp(params)) - 10} y={sy(venousReturn(msfp(params) - 3, params)) - 8} textAnchor="end" fontSize="11" className="font-mono" fill="var(--crimson)">
              Vascular function
            </text>
          </svg>
          <figcaption className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Illustrative teaching values — the direction of each shift is what matters
          </figcaption>
        </figure>

        <div className="space-y-3">
          <div className="glass-panel grid grid-cols-2 gap-3 rounded-xl p-4">
            <Readout label="Cardiac output" value={delta(op.co, base.co, "L/min")} />
            <Readout label="Right atrial pressure" value={delta(op.rap, base.rap, "mmHg")} />
            <Readout label="MSFP" value={`${msfp(params).toFixed(1)} mmHg`} />
            <Readout label="Venous return" value={`${venousReturn(op.rap, params).toFixed(1)} L/min`} />
          </div>

          <div className="space-y-3">
            <ParameterSlider
              id="starling-contractility"
              label="Contractility"
              hint="Shifts the cardiac function curve up/left"
              value={params.contractility}
              min={STARLING_RANGES.contractility.min}
              max={STARLING_RANGES.contractility.max}
              step={STARLING_RANGES.contractility.step}
              unit={STARLING_RANGES.contractility.unit}
              display={params.contractility.toFixed(2)}
              onChange={(v) => update("contractility", v)}
            />
            <ParameterSlider
              id="starling-volume"
              label="Blood volume / venous tone"
              hint="Shifts the vascular function curve in parallel (MSFP)"
              value={params.volume}
              min={STARLING_RANGES.volume.min}
              max={STARLING_RANGES.volume.max}
              step={STARLING_RANGES.volume.step}
              unit={STARLING_RANGES.volume.unit}
              display={params.volume.toFixed(2)}
              onChange={(v) => update("volume", v)}
            />
            <ParameterSlider
              id="starling-afterload"
              label="Afterload (TPR)"
              hint="Depresses cardiac function, flattens venous return"
              value={params.afterload}
              min={STARLING_RANGES.afterload.min}
              max={STARLING_RANGES.afterload.max}
              step={STARLING_RANGES.afterload.step}
              unit={STARLING_RANGES.afterload.unit}
              display={params.afterload.toFixed(2)}
              onChange={(v) => update("afterload", v)}
            />
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Curve focus
              </span>
              {(["cardiac", "vascular"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFocus((f) => (f === k ? null : k))}
                  aria-pressed={focus === k}
                  className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                    focus === k ? "border-cyan text-cyan" : "border-hairline text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k === "cardiac" ? "Cardiac function" : "Vascular function"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          {STARLING_STATES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => applyState(s.id)}
              aria-pressed={stateId === s.id}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                stateId === s.id ? "border-cyan bg-cyan/10 text-cyan" : "border-hairline text-muted-foreground hover:text-foreground"
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
            Overlay normal
          </label>
          <button
            type="button"
            onClick={() => {
              setParams(STARLING_DEFAULTS);
              setStateId("normal");
              setFocus(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-cyan"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
        {active && (
          <div className="mt-3 border-t border-border/50 pt-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">{active.example}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{active.teaching}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-[15px] text-foreground">{value}</p>
    </div>
  );
}
