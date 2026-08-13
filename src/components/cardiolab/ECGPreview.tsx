import { Section } from "./Section";

const LEAD_PATH =
  "M0 60h30l8-4 6 8 10-24 12 46 10-30 8 4h18c10 0 12-14 22-14s12 14 22 14h20l8-4 6 8 10-24 12 46 10-30 8 4h18c10 0 12-14 22-14s12 14 22 14h26";

const LABELS = [
  { x: "16%", label: "P", note: "Atrial depolarization", color: "var(--teal)" },
  { x: "30%", label: "QRS", note: "Ventricular depolarization", color: "var(--crimson)" },
  { x: "46%", label: "T", note: "Repolarization", color: "var(--amber)" },
];

export function ECGPreview() {
  return (
    <Section
      id="ecg"
      eyebrow="ECG Laboratory"
      title="Read the trace, not the textbook"
      description="A calibrated 25 mm/s strip with wave-by-wave annotation. The full interactive laboratory arrives in the next phase."
    >
      <div className="glass-panel overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/60 px-5 py-3 font-mono text-[11px] text-muted-foreground">
          <span className="text-cyan">LEAD II</span>
          <span>25 mm/s</span>
          <span>10 mm/mV</span>
          <span>HR 72 bpm</span>
          <span className="ml-auto inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-cl-pulse rounded-full bg-emerald" />
            Sinus rhythm
          </span>
        </div>

        <div className="relative bg-background/60 px-2 py-6 sm:px-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklab, var(--crimson) 9%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--crimson) 9%, transparent) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <svg
            viewBox="0 0 400 120"
            className="relative h-40 w-full sm:h-56"
            role="img"
            aria-label="Normal sinus rhythm ECG tracing with P wave, QRS complex and T wave"
          >
            <path
              d={LEAD_PATH}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="3"
              strokeOpacity="0.18"
              strokeLinejoin="round"
              style={{ filter: "blur(3px)" }}
            />
            <path
              d={LEAD_PATH}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="animate-cl-trace"
            />
          </svg>

          <div className="relative mt-2 hidden sm:block">
            {LABELS.map((l) => (
              <div key={l.label} className="absolute -translate-x-1/2" style={{ left: l.x }}>
                <span
                  className="font-mono text-[11px] tracking-widest"
                  style={{ color: l.color }}
                >
                  {l.label}
                </span>
                <span className="ml-2 text-[11px] text-muted-foreground">{l.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-px border-t border-border/60 bg-border/40 sm:grid-cols-4">
          {[
            ["PR", "160 ms"],
            ["QRS", "88 ms"],
            ["QT", "384 ms"],
            ["Axis", "+40°"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface/70 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {k}
              </p>
              <p className="mt-1 font-display text-lg text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] text-muted-foreground sm:hidden">
        P · QRS · T annotated on wider screens
      </p>
    </Section>
  );
}
