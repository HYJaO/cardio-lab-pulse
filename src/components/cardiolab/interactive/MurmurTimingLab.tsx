import { getMurmur, phaseAt, S1_T, S2_T, type MurmurId } from "@/lib/murmurs";
import { MurmurPicker } from "./MurmurPicker";
import { PlaybackControls } from "./PlaybackControls";
import { useCycleClock } from "./useCycleClock";
import { ampAt, envelopePath, tracePath } from "./Phonocardiogram";

const W = 1000;
const H = 200;

const PHASES = [
  { label: "S1", t: S1_T },
  { label: "Systole", t: (S1_T + S2_T) / 2 },
  { label: "S2", t: S2_T },
  { label: "Early diastole", t: 0.55 },
  { label: "Late diastole", t: 0.94 },
];

export function MurmurTimingLab({
  value,
  onChange,
}: {
  value: MurmurId;
  onChange: (id: MurmurId) => void;
}) {
  const clock = useCycleClock(0.5);
  const m = getMurmur(value);
  const phase = phaseAt(clock.t);
  const audible = ampAt(m, clock.t) > 0.05;
  const color = m.phase === "diastolic" ? "var(--crimson)" : "var(--cyan)";

  return (
    <div className="console-panel space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
          Murmur timing lab · simplified phonocardiogram
        </h3>
        {m.phase === "diastolic" && (
          <span className="rounded border border-crimson/50 bg-crimson/10 px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-crimson">
            Diastolic — always pathologic
          </span>
        )}
      </div>

      <MurmurPicker value={value} onChange={onChange} />

      <figure>
        <svg
          viewBox={`0 0 ${W} ${H + 30}`}
          className="w-full"
          role="img"
          aria-label={`${m.name}: ${m.timing}, ${m.contour}`}
        >
          <rect x={S1_T * W} y={0} width={(S2_T - S1_T) * W} height={H} fill="var(--cyan)" opacity="0.05" />
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="var(--hairline)" />
          {m.envelope && m.phase !== "none" && (
            <path d={envelopePath(m, W, H)} fill="none" stroke={color} strokeOpacity="0.45" strokeDasharray="4 4" />
          )}
          <path d={tracePath(m, W, H)} fill="none" stroke={color} strokeWidth="1.2" />
          {[
            { t: S1_T, l: "S1" },
            { t: S2_T, l: "S2" },
            ...m.clicks.map((c) => ({ t: c.t, l: c.label })),
          ].map((s) => (
            <text key={s.l} x={s.t * W} y={H + 20} textAnchor="middle" className="fill-foreground font-mono text-[13px]">
              {s.l}
            </text>
          ))}
          <text x={((S1_T + S2_T) / 2) * W} y={14} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
            SYSTOLE
          </text>
          <text x={0.7 * W} y={14} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
            DIASTOLE
          </text>
          <line x1={clock.t * W} x2={clock.t * W} y1={0} y2={H} stroke="var(--amber)" strokeWidth="1.5" />
        </svg>
        <figcaption className="mt-1 font-mono text-[10.5px] text-muted-foreground">
          Original programmatic illustration — dashed line = intensity envelope. Simplified teaching
          representation, not a recording.
        </figcaption>
      </figure>

      <div className="space-y-3">
        <PlaybackControls
          playing={clock.playing}
          onToggle={clock.toggle}
          onRestart={clock.restart}
          speed={clock.speed}
          onSpeed={clock.setSpeed}
          label={`${phase} · ${audible ? "murmur audible" : "no murmur at this instant"}`}
        />
        <label className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          Scrub
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(clock.t * 1000)}
            onChange={(e) => {
              clock.setPlaying(false);
              clock.setT(Number(e.target.value) / 1000);
            }}
            aria-label="Scrub cardiac cycle"
            aria-valuetext={phase}
            className="flex-1 accent-cyan"
          />
        </label>
        <div role="group" aria-label="Jump to phase" className="flex flex-wrap gap-1.5">
          {PHASES.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                clock.setPlaying(false);
                clock.setT(p.t);
              }}
              className="rounded border border-hairline px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-amber/50 hover:text-amber"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <dl aria-live="polite" className="grid gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-[13px] sm:grid-cols-2">
        {[
          ["Timing", `${m.timing} · ${m.contour}`],
          ["Best location", m.siteLabel],
          ["Quality / pitch", `${m.quality} · ${m.pitch} pitch`],
          ["Radiation", m.radiation],
          ["Associated sound", m.associated],
          ["Mechanism", m.mechanism],
          ["High-yield association", m.association],
        ].map(([k, v]) => (
          <div key={k} className={k === "Mechanism" || k === "High-yield association" ? "sm:col-span-2" : ""}>
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">{k}</dt>
            <dd className="mt-0.5 leading-relaxed text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
