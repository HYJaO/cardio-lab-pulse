import { useState } from "react";
import { CONGESTION } from "@/lib/heart-failure";

/** Left vs right congestion: selectable sides, each sign tied to its upstream pressure. */
export function CongestionCompare() {
  const [side, setSide] = useState<"left" | "right">("left");
  const active = CONGESTION.find((c) => c.id === side)!;

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Congestion side" className="flex flex-wrap gap-2">
        {CONGESTION.map((c) => {
          const on = c.id === side;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setSide(c.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  setSide(side === "left" ? "right" : "left");
                }
              }}
              className={`rounded-md border px-3 py-2 font-mono text-[11.5px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 ${
                on
                  ? "border-cyan/60 bg-cyan/10 text-cyan"
                  : "border-hairline bg-surface/35 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <figure className="glass-panel rounded-xl p-4">
          <svg
            viewBox="0 0 320 240"
            className="h-[200px] w-full sm:h-[240px]"
            role="img"
            aria-label={`Schematic of ${active.label}: ${active.upstream}`}
          >
            {/* lungs */}
            <ellipse
              cx="112"
              cy="58"
              rx="52"
              ry="30"
              fill={side === "left" ? "var(--crimson)" : "var(--surface)"}
              fillOpacity={side === "left" ? 0.18 : 0.5}
              stroke={side === "left" ? "var(--crimson)" : "var(--hairline)"}
            />
            <text x="112" y="62" textAnchor="middle" fontSize="11" className="fill-[var(--muted-foreground)] font-mono">
              Pulmonary veins
            </text>
            {/* heart */}
            <rect
              x="70"
              y="106"
              width="84"
              height="54"
              rx="8"
              fill="var(--surface)"
              fillOpacity="0.6"
              stroke="var(--hairline)"
            />
            <line x1="112" y1="106" x2="112" y2="160" stroke="var(--hairline)" />
            <text x="91" y="137" textAnchor="middle" fontSize="10" className={`font-mono ${side === "right" ? "fill-[var(--crimson)]" : "fill-[var(--muted-foreground)]"}`}>
              R
            </text>
            <text x="133" y="137" textAnchor="middle" fontSize="10" className={`font-mono ${side === "left" ? "fill-[var(--crimson)]" : "fill-[var(--muted-foreground)]"}`}>
              L
            </text>
            {/* systemic veins */}
            <rect
              x="196"
              y="96"
              width="104"
              height="106"
              rx="10"
              fill={side === "right" ? "var(--crimson)" : "var(--surface)"}
              fillOpacity={side === "right" ? 0.18 : 0.5}
              stroke={side === "right" ? "var(--crimson)" : "var(--hairline)"}
            />
            <text x="248" y="140" textAnchor="middle" fontSize="11" className="fill-[var(--muted-foreground)] font-mono">
              Systemic
            </text>
            <text x="248" y="156" textAnchor="middle" fontSize="11" className="fill-[var(--muted-foreground)] font-mono">
              veins
            </text>
            {/* backward arrow */}
            <path
              d={side === "left" ? "M112 106 L112 92" : "M154 133 L192 133"}
              stroke="var(--crimson)"
              strokeWidth="2"
              markerEnd="url(#hf-arrow)"
            />
            <defs>
              <marker id="hf-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0 0 L7 3.5 L0 7 z" fill="var(--crimson)" />
              </marker>
            </defs>
            <text x="160" y="220" textAnchor="middle" fontSize="10" className="fill-[var(--crimson)] font-mono">
              Backward transmission of filling pressure
            </text>
          </svg>
        </figure>

        <div className="space-y-3">
          <div className="glass-panel rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">
              {active.upstream}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {active.upstreamDetail}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal">
                Forward ·{" "}
              </span>
              {active.forward}
            </p>
          </div>
          <ul className="space-y-2">
            {active.signs.map((s) => (
              <li key={s.sign} className="rounded-lg border border-hairline bg-surface/30 p-3">
                <p className="text-[13.5px] font-semibold text-foreground">{s.sign}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{s.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
