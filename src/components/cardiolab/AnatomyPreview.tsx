import { Section } from "./Section";

const CONTROLS = ["Rotate", "Layers", "Coronaries", "Valves", "Chambers"];

export function AnatomyPreview() {
  return (
    <Section
      id="anatomy"
      eyebrow="Anatomy Laboratory"
      title="Explore the Heart"
      description="A layered anatomical workspace for chambers, valves and coronary territories. Interaction unlocks in the next phase."
      className="border-y border-border/50 bg-surface/25"
    >
      <div className="glass-panel grid overflow-hidden rounded-2xl lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border/60 p-5 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Controls
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col">
            {CONTROLS.map((c, i) => (
              <li key={c} className="lg:w-full">
                <button
                  type="button"
                  aria-disabled="true"
                  className="w-full rounded-lg border border-hairline bg-background/40 px-3.5 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:border-cyan/40 hover:text-foreground"
                >
                  <span className="mr-2 font-mono text-[10px] text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {c}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
            Interactive anatomy laboratory — coming next.
          </p>
        </aside>

        <div className="relative flex min-h-[340px] items-center justify-center bg-background/40 p-8">
          <div className="grid-field pointer-events-none absolute inset-0 opacity-50" />
          <svg
            viewBox="0 0 320 300"
            className="relative w-full max-w-[380px]"
            role="img"
            aria-label="Schematic anatomical heart with labelled chambers, valves and coronary vessels"
          >
            <defs>
              <linearGradient id="cl-anat" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--electric)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--crimson)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M160 258c-6-5-78-52-100-101-16-34-8-74 24-90 26-13 55-3 73 19 18-22 47-32 73-19 32 16 40 56 24 90-22 49-94 96-94 101z"
              fill="url(#cl-anat)"
              stroke="var(--cyan)"
              strokeOpacity="0.7"
            />
            <path
              d="M160 84v148M96 132c40 20 88 20 128 0"
              stroke="var(--cyan)"
              strokeOpacity="0.45"
              strokeDasharray="3 5"
              fill="none"
            />
            <path
              d="M160 100c-18 18-40 26-58 60M160 100c18 18 40 26 58 60"
              fill="none"
              stroke="var(--crimson)"
              strokeOpacity="0.7"
              strokeWidth="1.4"
            />
            {[
              [110, 112, "RA"],
              [212, 112, "LA"],
              [116, 186, "RV"],
              [208, 186, "LV"],
            ].map(([x, y, l]) => (
              <g key={l as string}>
                <circle cx={x as number} cy={y as number} r="12" fill="var(--background)" fillOpacity="0.7" stroke="var(--hairline)" />
                <text
                  x={x as number}
                  y={(y as number) + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--cyan)"
                  fontFamily="var(--font-mono)"
                >
                  {l}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </Section>
  );
}
