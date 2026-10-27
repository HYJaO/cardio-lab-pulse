import { useId, useMemo } from "react";
import { tracePath, PAPER_SPEED } from "@/lib/ecg";
import type { BlockStrip as Strip } from "@/lib/heart-blocks";

/** Lead II rhythm strip on calibrated paper with optional beat annotations. */
export function BlockStrip({ strip, focus, annotate = true }: { strip: Strip; focus?: number; annotate?: boolean }) {
  const id = "hb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = strip.duration * PAPER_SPEED;
  const H = 34;
  const y0 = 24;
  const d = useMemo(() => tracePath(strip.rhythm, strip.duration, 0, y0), [strip]);
  const x = (t: number) => t * PAPER_SPEED;
  const f = focus === undefined ? undefined : strip.beats[focus];
  return (
    <figure className="overflow-hidden rounded-md border border-hairline">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Educational ECG illustration. ${strip.description}`} className="block w-full" style={{ minWidth: 640, background: "var(--ecg-paper)" }}>
          <defs>
            <pattern id={`${id}f`} width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0V1H0" fill="none" stroke="var(--ecg-grid-fine)" strokeWidth="0.06" /></pattern>
            <pattern id={`${id}m`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0V5H0" fill="none" stroke="var(--ecg-grid-major)" strokeWidth="0.16" /></pattern>
          </defs>
          <rect width={W} height={H} fill={`url(#${id}f)`} />
          <rect width={W} height={H} fill={`url(#${id}m)`} />
          {f && <rect x={x(f.p) - 1.5} y={1} width={Math.max(x((f.qrs ?? f.p) + 0.12) - x(f.p) + 1.5, 4)} height={H - 2} fill="var(--cyan)" fillOpacity="0.12" />}
          <path d={d} fill="none" stroke="var(--ecg-ink)" strokeWidth="0.3" strokeLinejoin="round" />
          <text x={1} y={4} fontSize="2.6" fill="var(--ecg-ink)" fontFamily="var(--font-mono)">II</text>
          {annotate && strip.beats.map((b, i) => (
            <g key={i} fontFamily="var(--font-mono)" fontSize="2">
              <text x={x(b.p)} y={y0 - 4} textAnchor="middle" fill={b.qrs === undefined ? "var(--crimson)" : "var(--ecg-ink)"}>P</text>
              {b.qrs === undefined && strip.kind !== "third" && <text x={x(b.p) + 4} y={y0 + 5} textAnchor="middle" fill="var(--crimson)">✕ no QRS</text>}
              {b.pr !== undefined && b.qrs !== undefined && (
                <>
                  <path d={`M${x(b.p) - 1} ${y0 + 3}H${x(b.qrs)}`} stroke="var(--ecg-ink)" strokeWidth="0.15" />
                  <text x={(x(b.p) + x(b.qrs)) / 2} y={y0 + 5.6} textAnchor="middle" fill="var(--ecg-ink)">{Math.round(b.pr * 1000)}</text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-hairline bg-surface px-3 py-2 font-mono text-[10px] text-muted-foreground">
        <span>Lead II · 25 mm/s · 10 mm/mV{annotate ? " · PR in ms" : ""}</span>
        <span>Educational illustration — not a clinical diagnostic tool</span>
      </figcaption>
    </figure>
  );
}
