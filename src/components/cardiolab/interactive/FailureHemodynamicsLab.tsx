import { useMemo, useState } from "react";
import {
  HF_STATES,
  deriveHF,
  edpvrP,
  espvrP,
  hfLoopPoints,
  type HFState,
  type HFStateId,
} from "@/lib/heart-failure";

const W = 640;
const H = 420;
const PAD = { l: 54, r: 16, t: 18, b: 42 };
const V_MAX = 230;
const P_MAX = 190;

const x = (v: number) => PAD.l + (v / V_MAX) * (W - PAD.l - PAD.r);
const y = (p: number) => H - PAD.b - (p / P_MAX) * (H - PAD.t - PAD.b);

const toPath = (pts: [number, number][]) =>
  pts.map(([v, p], i) => `${i === 0 ? "M" : "L"}${x(v).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");

function curve(fn: (v: number) => number, from = 0, to = V_MAX) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const v = from + ((to - from) * i) / 60;
    pts.push([v, fn(v)]);
  }
  return toPath(pts.filter(([, p]) => p <= P_MAX));
}

function delta(value: number, reference: number, tol = 0.03) {
  const d = (value - reference) / (reference || 1);
  if (Math.abs(d) < tol) return { glyph: "↔", tone: "text-muted-foreground", word: "unchanged" };
  return d > 0
    ? { glyph: "↑", tone: "text-amber", word: "increased" }
    : { glyph: "↓", tone: "text-crimson", word: "decreased" };
}

function Metric({
  label,
  value,
  unit,
  ref: reference,
  isNormal,
  note,
}: {
  label: string;
  value: number;
  unit: string;
  ref: number;
  isNormal: boolean;
  note?: string;
}) {
  const d = delta(value, reference);
  return (
    <div className="rounded-lg border border-hairline bg-surface/30 p-3">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-[19px] text-foreground">
          {value.toFixed(unit === "%" || unit === "L/min" ? 1 : 0)}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{unit}</span>
        {!isNormal && (
          <span className={`ml-auto font-mono text-[13px] ${d.tone}`}>
            {d.glyph}
            <span className="sr-only"> {d.word} versus normal</span>
          </span>
        )}
      </p>
      {note && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{note}</p>}
    </div>
  );
}

/**
 * Failure Hemodynamics Lab — toggle Normal / HFrEF / HFpEF and read the
 * pressure–volume loop, the contractility (ESPVR) and compliance (EDPVR)
 * relations, and the linked clinical-output panel. All values are
 * illustrative teaching values; directionality is what matters.
 */
export function FailureHemodynamicsLab() {
  const [id, setId] = useState<HFStateId>("hfref");
  const [ghost, setGhost] = useState(true);

  const state = HF_STATES.find((s) => s.id === id)!;
  const normal = HF_STATES[0]!;
  const d = useMemo(() => deriveHF(state), [state]);
  const nd = useMemo(() => deriveHF(normal), [normal]);
  const isNormal = state.id === "normal";

  const loop = useMemo(() => toPath(hfLoopPoints(state)) + " Z", [state]);
  const ghostLoop = useMemo(() => toPath(hfLoopPoints(normal)) + " Z", [normal]);

  const espvrTo = (s: HFState) => Math.min(V_MAX, s.v0 + P_MAX / s.ees);

  return (
    <div className="space-y-4">
      {/* state toggle */}
      <div
        role="radiogroup"
        aria-label="Ventricular state"
        className="flex flex-wrap gap-2"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const i = HF_STATES.findIndex((s) => s.id === id);
          const next =
            e.key === "ArrowRight"
              ? (i + 1) % HF_STATES.length
              : (i - 1 + HF_STATES.length) % HF_STATES.length;
          setId(HF_STATES[next]!.id);
        }}
      >
        {HF_STATES.map((s) => {
          const active = s.id === id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setId(s.id)}
              className={`rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 ${
                active
                  ? "border-cyan/60 bg-cyan/10 text-cyan"
                  : "border-hairline bg-surface/35 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block font-mono text-[12px] uppercase tracking-[0.12em]">
                {s.label}
              </span>
              <span className="block text-[11.5px] text-muted-foreground">{s.short}</span>
            </button>
          );
        })}
        <label className="ml-auto inline-flex items-center gap-2 rounded-md border border-hairline bg-surface/35 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <input
            type="checkbox"
            checked={ghost}
            onChange={(e) => setGhost(e.target.checked)}
            className="accent-[var(--cyan)]"
          />
          Overlay normal
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* chart */}
        <figure className="glass-panel rounded-xl p-3 md:p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[280px] w-full sm:h-[340px] lg:h-[400px]"
            role="img"
            aria-label={`Pressure–volume loop for ${state.label}: end-diastolic volume ${d.edv.toFixed(0)} millilitres, end-systolic volume ${d.esv.toFixed(0)} millilitres, stroke volume ${d.sv.toFixed(0)} millilitres, ejection fraction ${d.ef.toFixed(0)} percent, end-diastolic pressure ${d.lvedp.toFixed(0)} millimetres of mercury.`}
          >
            {/* axes */}
            <line x1={x(0)} y1={y(0)} x2={x(V_MAX)} y2={y(0)} stroke="var(--hairline)" />
            <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(P_MAX)} stroke="var(--hairline)" />
            {[0, 50, 100, 150, 200].map((p) => (
              <g key={p}>
                <line
                  x1={x(0)}
                  y1={y(p)}
                  x2={x(V_MAX)}
                  y2={y(p)}
                  stroke="var(--hairline)"
                  strokeOpacity="0.3"
                />
                <text
                  x={x(0) - 8}
                  y={y(p) + 3.5}
                  textAnchor="end"
                  className="fill-[var(--muted-foreground)] font-mono"
                  fontSize="10"
                >
                  {p}
                </text>
              </g>
            ))}
            {[50, 100, 150, 200].map((v) => (
              <text
                key={v}
                x={x(v)}
                y={H - PAD.b + 16}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)] font-mono"
                fontSize="10"
              >
                {v}
              </text>
            ))}
            <text
              x={x(V_MAX / 2)}
              y={H - 6}
              textAnchor="middle"
              className="fill-[var(--muted-foreground)] font-mono"
              fontSize="10"
            >
              LV volume (mL)
            </text>
            <text
              x={14}
              y={y(P_MAX / 2)}
              textAnchor="middle"
              transform={`rotate(-90 14 ${y(P_MAX / 2)})`}
              className="fill-[var(--muted-foreground)] font-mono"
              fontSize="10"
            >
              LV pressure (mmHg)
            </text>

            {/* ghost normal */}
            {ghost && !isNormal && (
              <>
                <path
                  d={ghostLoop}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeOpacity="0.45"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <path
                  d={curve((v) => espvrP(v, normal), normal.v0, espvrTo(normal))}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeOpacity="0.3"
                  strokeDasharray="3 5"
                />
              </>
            )}

            {/* relations */}
            <path
              d={curve((v) => espvrP(v, state), state.v0, espvrTo(state))}
              fill="none"
              stroke="var(--electric)"
              strokeWidth="1.4"
              className="motion-safe:transition-all motion-safe:duration-500"
            />
            <path
              d={curve((v) => edpvrP(v, state), state.v0, V_MAX)}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.4"
              className="motion-safe:transition-all motion-safe:duration-500"
            />

            {/* loop */}
            <path
              d={loop}
              fill="var(--cyan)"
              fillOpacity="0.08"
              stroke="var(--cyan)"
              strokeWidth="1.8"
              className="motion-safe:transition-all motion-safe:duration-500"
            />

            {/* markers */}
            <g className="font-mono" fontSize="10">
              <circle cx={x(d.edv)} cy={y(d.lvedp)} r="3.5" fill="var(--crimson)" />
              <text
                x={x(d.edv) + 7}
                y={y(d.lvedp) + 12}
                className="fill-[var(--crimson)]"
              >{`EDV ${d.edv.toFixed(0)} · LVEDP ${d.lvedp.toFixed(0)}`}</text>
              <circle cx={x(d.esv)} cy={y(d.peakP)} r="3.5" fill="var(--electric)" />
              <text
                x={x(d.esv) - 7}
                y={y(d.peakP) - 8}
                textAnchor="end"
                className="fill-[var(--electric)]"
              >{`ESV ${d.esv.toFixed(0)}`}</text>
              <line
                x1={x(d.esv)}
                y1={y(-6)}
                x2={x(d.edv)}
                y2={y(-6)}
                stroke="var(--cyan)"
                strokeOpacity="0.7"
              />
              <text
                x={x((d.esv + d.edv) / 2)}
                y={y(-6) - 5}
                textAnchor="middle"
                className="fill-[var(--cyan)]"
              >{`SV ${d.sv.toFixed(0)} mL`}</text>
            </g>
          </svg>
          <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="text-cyan">— PV loop</span>
            <span className="text-[var(--electric)]">— ESPVR (contractility)</span>
            <span className="text-teal">— EDPVR (compliance)</span>
            {ghost && !isNormal && <span>-- normal reference</span>}
          </figcaption>
        </figure>

        {/* clinical output panel */}
        <div className="space-y-3">
          <div className="glass-panel rounded-xl p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
              {state.label}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {state.lesion}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal">
                Classification ·{" "}
              </span>
              {state.classification}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="EF" value={d.ef} unit="%" ref={nd.ef} isNormal={isNormal} />
            <Metric label="Stroke volume" value={d.sv} unit="mL" ref={nd.sv} isNormal={isNormal} />
            <Metric label="EDV" value={d.edv} unit="mL" ref={nd.edv} isNormal={isNormal} />
            <Metric label="ESV" value={d.esv} unit="mL" ref={nd.esv} isNormal={isNormal} />
            <Metric
              label="LVEDP"
              value={d.lvedp}
              unit="mmHg"
              ref={nd.lvedp}
              isNormal={isNormal}
              note="Upstream filling pressure"
            />
            <Metric
              label="Cardiac output"
              value={d.co}
              unit="L/min"
              ref={nd.co}
              isNormal={isNormal}
              note="At an illustrative 70 bpm"
            />
          </div>

          <div className="rounded-lg border border-hairline bg-surface/30 p-3">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Pulmonary congestion risk
              </p>
              <p className="font-mono text-[11px] text-amber">
                {d.congestion < 0.2 ? "Low" : d.congestion < 0.6 ? "Moderate" : "High"}
              </p>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface"
              role="progressbar"
              aria-label="Pulmonary congestion risk"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(d.congestion * 100)}
            >
              <div
                className="h-full rounded-full bg-amber motion-safe:transition-[width] motion-safe:duration-500"
                style={{ width: `${Math.max(4, d.congestion * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">
              Derived from LVEDP: left atrial and pulmonary venous pressures track end-diastolic
              pressure, so a high LVEDP is what produces dyspnea — whatever the ejection fraction.
            </p>
          </div>

          <p className="glass-panel rounded-xl p-3 text-[12.5px] leading-relaxed text-muted-foreground">
            {state.teaching}
          </p>
        </div>
      </div>

      <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
        Illustrative teaching values — relationships and directionality, not exact numbers. Keyboard:
        Tab to the state group, then ← / → to switch state.
      </p>
    </div>
  );
}
