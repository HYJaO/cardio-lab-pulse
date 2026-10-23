import { useId, useMemo } from "react";
import { tracePath, type EcgFigure } from "@/lib/ecg";

/** Illustrative ECG paper: 1-mm fine grid, 5-mm major grid, 25 mm/s · 10 mm/mV. */
export function EcgPaper({ figure, minWidth }: { figure: EcgFigure; minWidth?: number }) {
  const id = "ecg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const rowH = figure.rowHeight ?? 25;
  const CAL = 8;
  const cd = figure.cellDuration;
  const cols = Math.max(...figure.rows.map((r) => r.length));
  const W = CAL + cols * cd * 25;
  const H = figure.rows.length * rowH + 6;
  const cells = useMemo(
    () =>
      figure.rows.flatMap((row, ri) => {
        const y0 = ri * rowH + rowH * 0.62;
        return row.map((tr, ci) => {
          const x = CAL + ci * cd * 25;
          return { key: `${ri}-${ci}`, label: tr.label, x, ri, y0, d: tracePath(tr.rhythm, cd, x, y0) };
        });
      }),
    [figure, rowH, cd],
  );
  return (
    <figure className="overflow-hidden rounded-md border border-hairline">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Educational ECG illustration. ${figure.description}`}
          className="block w-full"
          style={{ minWidth: minWidth ?? Math.round(W * 2.6), background: "var(--ecg-paper)" }}
        >
          <defs>
            <pattern id={`${id}f`} width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M1 0V1H0" fill="none" stroke="var(--ecg-grid-fine)" strokeWidth="0.06" />
            </pattern>
            <pattern id={`${id}m`} width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0V5H0" fill="none" stroke="var(--ecg-grid-major)" strokeWidth="0.16" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill={`url(#${id}f)`} />
          <rect width={W} height={H} fill={`url(#${id}m)`} />
          {figure.rows.map((_, ri) => {
            const y0 = ri * rowH + rowH * 0.62;
            return <path key={ri} d={`M0.5 ${y0}H2V${y0 - 10}H7V${y0}H8`} fill="none" stroke="var(--ecg-ink)" strokeWidth="0.3" />;
          })}
          {cells.map((c) => (
            <g key={c.key}>
              <path d={c.d} fill="none" stroke="var(--ecg-ink)" strokeWidth="0.3" strokeLinejoin="round" />
              <text x={c.x + 1.2} y={c.ri * rowH + 4} fontSize="3" fill="var(--ecg-ink)" fontFamily="var(--font-mono)">
                {c.label}
              </text>
            </g>
          ))}
          <text x="1" y={H - 1.5} fontSize="2.4" fill="var(--ecg-ink)" fontFamily="var(--font-mono)">
            25 mm/s · 10 mm/mV
          </text>
          <text x={W - 1} y={H - 1.5} fontSize="2.4" textAnchor="end" fill="var(--ecg-ink)" fontFamily="var(--font-mono)">
            Educational illustration — not patient data
          </text>
        </svg>
      </div>
      <figcaption className="sr-only">{figure.description}</figcaption>
    </figure>
  );
}
