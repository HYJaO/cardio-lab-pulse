import { Button } from "@/components/ui/button";
import { useMemo, useRef, useState } from "react";
import { EcgPaper } from "./EcgPaper";
import {
  AXIS_LABEL,
  LIMB_LEADS,
  axisBoundaryNote,
  axisFigure,
  classifyAxis,
  normalizeAngle,
  projection,
} from "@/lib/ecg";

const PRESETS = [
  ["Normal +60°", 60],
  ["Limit −30°", -30],
  ["LAD −60°", -60],
  ["Limit +90°", 90],
  ["RAD +120°", 120],
  ["Extreme −150°", -150],
] as const;

const mostPositive = (a: number) =>
  LIMB_LEADS.reduce((b, l) => (projection(a, l.angle) > projection(a, b.angle) ? l : b)).id;

const CHALLENGES = [
  { prompt: "Make lead II the most positive limb lead.", check: (a: number) => mostPositive(a) === "II", hint: "Lead II points to +60°." },
  { prompt: "Make lead I isoelectric while aVF stays positive.", check: (a: number) => Math.abs(projection(a, 0)) < 0.09 && projection(a, 90) > 0, hint: "A lead is isoelectric when the vector is perpendicular to it." },
  { prompt: "Create left axis deviation.", check: (a: number) => classifyAxis(a) === "lad", hint: "I positive, II and aVF negative: between −30° and −90°." },
  { prompt: "Create right axis deviation.", check: (a: number) => classifyAxis(a) === "rad", hint: "I negative, aVF positive: beyond +90°." },
  { prompt: "Point the axis into the extreme quadrant.", check: (a: number) => classifyAxis(a) === "extreme", hint: "Both I and aVF negative: −90° to −180°." },
];

const C = 150;
const R = 110;
const pt = (deg: number, r: number) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];
function sector(a: number, b: number) {
  const [x1, y1] = pt(a, R);
  const [x2, y2] = pt(b, R);
  return `M${C} ${C}L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z`;
}

export function AxisExplorer() {
  const [axis, setAxis] = useState(60);
  const [ci, setCi] = useState(0);
  const [result, setResult] = useState<null | boolean>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const a = normalizeAngle(axis);
  const cls = classifyAxis(a);
  const note = axisBoundaryNote(a);
  const fig = useMemo(() => axisFigure(a), [a]);
  const [vx, vy] = pt(a, R * 0.88);
  const challenge = CHALLENGES[ci] ?? CHALLENGES[0];

  const fromPointer = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300 - C;
    const y = ((e.clientY - r.top) / r.height) * 300 - C;
    setAxis(normalizeAngle(Math.round((Math.atan2(y, x) * 180) / Math.PI)));
    setResult(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="w-full touch-none select-none rounded-lg border border-hairline bg-surface"
          role="img"
          aria-label={`Hexaxial reference: mean QRS vector at ${a} degrees, ${AXIS_LABEL[cls]}. Drag to rotate or use the slider.`}
          onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => e.buttons && fromPointer(e)}
        >
          <path d={sector(-30, 90)} fill="var(--emerald)" opacity="0.12" />
          <path d={sector(-90, -30)} fill="var(--amber)" opacity="0.14" />
          <path d={sector(90, 180)} fill="var(--cyan)" opacity="0.12" />
          <path d={sector(-180, -90)} fill="var(--crimson)" opacity="0.14" />
          {LIMB_LEADS.map((l) => {
            const [x1, y1] = pt(l.angle, R);
            const [x2, y2] = pt(l.angle + 180, R);
            const [tx, ty] = pt(l.angle, R + 22);
            return (
              <g key={l.id}>
                <line x1={C} y1={C} x2={x2} y2={y2} stroke="var(--muted-foreground)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
                <line x1={C} y1={C} x2={x1} y2={y1} stroke="var(--muted-foreground)" strokeWidth="1" />
                <text x={tx} y={ty} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="var(--foreground)" fontFamily="var(--font-mono)">
                  {l.id} {l.angle > 0 ? "+" : ""}{l.angle}°
                </text>
              </g>
            );
          })}
          <line x1={C} y1={C} x2={vx} y2={vy} stroke="var(--crimson)" strokeWidth="4" strokeLinecap="round" />
          <circle cx={vx} cy={vy} r="7" fill="var(--crimson)" />
          <circle cx={C} cy={C} r="3" fill="var(--foreground)" />
        </svg>

        <div className="rounded-md border border-hairline bg-background/55 p-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="axis-slider" className="text-[13px] font-medium text-foreground">Mean QRS axis</label>
            <span className="font-mono tabular-nums text-cyan">{a > 0 ? "+" : ""}{a}°</span>
          </div>
          <input id="axis-slider" type="range" min={-179} max={180} step={1} value={a} aria-valuetext={`${a} degrees, ${AXIS_LABEL[cls]}`}
            onChange={(e) => { setAxis(Number(e.target.value)); setResult(null); }} className="mt-3 w-full" />
          <p className="mt-2 font-semibold text-foreground">{AXIS_LABEL[cls]}</p>
          {note && <p className="mt-1 text-[12.5px] text-amber">{note}</p>}
          <p className="mt-2 font-mono text-[10.5px] text-muted-foreground">Normal −30° ≤ axis ≤ +90° · LAD −90° ≤ axis < −30° · RAD +90° < axis ≤ +180° · Extreme −180° < axis < −90°; ±180° assigned to RAD.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([label, v]) => (
            <Button variant="ghost" key={label} type="button" onClick={() => { setAxis(v); setResult(null); }}
              className="h-auto whitespace-normal min-h-11 rounded-md border border-hairline px-3 font-mono text-[11px] text-muted-foreground hover:border-cyan hover:text-foreground focus-visible:outline-2 focus-visible:outline-cyan">
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {LIMB_LEADS.map((l) => {
            const p = projection(a, l.angle);
            const pol = p > 0.1 ? "Positive" : p < -0.1 ? "Negative" : "Isoelectric";
            return (
              <li key={l.id} className="rounded-md border border-hairline bg-surface/60 p-3">
                <div className="flex items-baseline justify-between font-mono text-[12px]">
                  <span className="text-foreground">{l.id} <span className="text-muted-foreground">({l.angle > 0 ? "+" : ""}{l.angle}°)</span></span>
                  <span className={p > 0.1 ? "text-emerald" : p < -0.1 ? "text-crimson" : "text-amber"}>{pol} · {p.toFixed(2)}</span>
                </div>
                <div className="relative mt-2 h-1.5 rounded bg-secondary" aria-hidden>
                  <span className="absolute top-0 h-full rounded bg-cyan" style={{ left: p >= 0 ? "50%" : `${50 + p * 50}%`, width: `${Math.abs(p) * 50}%` }} />
                  <span className="absolute left-1/2 top-[-2px] h-2.5 w-px bg-foreground" />
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {pol === "Isoelectric"
                    ? `Vector is ~perpendicular to ${l.id}: equiphasic QRS.`
                    : `Vector is within ${pol === "Positive" ? "90° of" : "90° of the opposite of"} ${l.id}'s positive pole.`}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="font-mono text-[10.5px] text-muted-foreground">Net QRS = cos(axis − lead angle), in relative teaching units — not patient voltage.</p>
        <EcgPaper figure={fig} minWidth={300} />

        <div className="rounded-lg border border-hairline bg-surface/60 p-4" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Challenge {ci + 1} / {CHALLENGES.length}</p>
          <p className="mt-2 text-foreground">{challenge?.prompt}</p>
          {result !== null && (
            <p className={`mt-2 text-[13px] ${result ? "text-emerald" : "text-crimson"}`}>
              {result ? `Correct — ${a}° works.` : `Not yet (${a}°). Hint: ${challenge?.hint}`}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" type="button" onClick={() => setResult(challenge?.check(a) ?? false)} className="h-auto whitespace-normal min-h-11 rounded-md bg-cyan px-4 text-[13px] font-semibold text-primary-foreground">Check</Button>
            <Button variant="ghost" type="button" disabled={!result} onClick={() => { setCi((ci + 1) % CHALLENGES.length); setResult(null); }} className="h-auto whitespace-normal min-h-11 rounded-md border border-hairline px-4 text-[13px] text-foreground disabled:opacity-40">Next challenge</Button>
            <Button variant="ghost" type="button" onClick={() => { setCi(0); setAxis(60); setResult(null); }} className="h-auto whitespace-normal min-h-11 rounded-md border border-hairline px-4 text-[13px] text-muted-foreground">Reset</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
