import { aorticOpen, mitralOpen } from "@/lib/cardiac-cycle";

type ValveId = "mitral" | "aortic";

export function ValveDiagram({
  t,
  selected,
  onSelect,
}: {
  t: number;
  selected: ValveId | null;
  onSelect: (v: ValveId) => void;
}) {
  const mOpen = mitralOpen(t);
  const aOpen = aorticOpen(t);
  const fill = 1 - Math.min(1, Math.max(0, (t - 0.16) / 0.28)); // rough LV fullness cue

  const valveStroke = (open: boolean) => (open ? "var(--emerald)" : "var(--crimson)");

  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Left heart · valve status
      </p>

      <svg viewBox="0 0 220 190" className="mt-3 h-48 w-full" role="img" aria-label="Left atrium, left ventricle and aorta with mitral and aortic valve status">
        {/* aorta */}
        <path
          d="M150 20c0 34-22 40-22 52"
          fill="none"
          stroke="var(--hairline)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M150 20c0 34-22 40-22 52"
          fill="none"
          stroke={aOpen ? "var(--crimson)" : "var(--hairline)"}
          strokeOpacity={aOpen ? 0.35 : 0.6}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* left atrium */}
        <ellipse cx="62" cy="46" rx="34" ry="24" fill="color-mix(in oklab, var(--electric) 16%, transparent)" stroke="var(--hairline)" />
        <text x="62" y="50" textAnchor="middle" className="font-mono" fontSize="9" fill="var(--muted-foreground)">
          LA
        </text>

        {/* left ventricle */}
        <path
          d="M40 92c0-14 20-22 46-22s46 8 46 22c0 40-20 74-46 74s-46-34-46-74z"
          fill="color-mix(in oklab, var(--crimson) 14%, transparent)"
          stroke="var(--hairline)"
        />
        <path
          d="M40 92c0-14 20-22 46-22s46 8 46 22c0 40-20 74-46 74s-46-34-46-74z"
          fill="color-mix(in oklab, var(--crimson) 22%, transparent)"
          style={{ transformOrigin: "86px 166px", transform: `scaleY(${0.45 + fill * 0.55})` }}
          stroke="none"
        />
        <text x="86" y="126" textAnchor="middle" className="font-mono" fontSize="10" fill="var(--muted-foreground)">
          LV
        </text>

        {/* mitral valve */}
        <g
          role="button"
          tabIndex={0}
          aria-label={`Mitral valve, ${mOpen ? "open" : "closed"}`}
          className="cursor-pointer"
          onClick={() => onSelect("mitral")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("mitral")}
        >
          <rect x="42" y="62" width="52" height="18" rx="9" fill="transparent" />
          {mOpen ? (
            <>
              <path d="M50 66l6 16" stroke={valveStroke(true)} strokeWidth="2.4" strokeLinecap="round" />
              <path d="M86 66l-6 16" stroke={valveStroke(true)} strokeWidth="2.4" strokeLinecap="round" />
            </>
          ) : (
            <path d="M50 72h36" stroke={valveStroke(false)} strokeWidth="2.8" strokeLinecap="round" />
          )}
          <circle
            cx="68"
            cy="72"
            r="16"
            fill="none"
            stroke={selected === "mitral" ? "var(--cyan)" : "transparent"}
            strokeDasharray="3 3"
          />
        </g>

        {/* aortic valve */}
        <g
          role="button"
          tabIndex={0}
          aria-label={`Aortic valve, ${aOpen ? "open" : "closed"}`}
          className="cursor-pointer"
          onClick={() => onSelect("aortic")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("aortic")}
        >
          <rect x="108" y="58" width="42" height="20" rx="9" fill="transparent" />
          {aOpen ? (
            <>
              <path d="M118 60l4 16" stroke={valveStroke(true)} strokeWidth="2.4" strokeLinecap="round" />
              <path d="M142 62l-6 15" stroke={valveStroke(true)} strokeWidth="2.4" strokeLinecap="round" />
            </>
          ) : (
            <path d="M118 70l24-6" stroke={valveStroke(false)} strokeWidth="2.8" strokeLinecap="round" />
          )}
          <circle
            cx="130"
            cy="68"
            r="15"
            fill="none"
            stroke={selected === "aortic" ? "var(--cyan)" : "transparent"}
            strokeDasharray="3 3"
          />
        </g>

        <text x="188" y="26" textAnchor="middle" className="font-mono" fontSize="9" fill="var(--muted-foreground)">
          Ao
        </text>
      </svg>

      <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <ValveChip label="Mitral" open={mOpen} active={selected === "mitral"} onClick={() => onSelect("mitral")} />
        <ValveChip label="Aortic" open={aOpen} active={selected === "aortic"} onClick={() => onSelect("aortic")} />
      </div>
    </div>
  );
}

function ValveChip({
  label,
  open,
  active,
  onClick,
}: {
  label: string;
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const color = open ? "var(--emerald)" : "var(--crimson)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-md border px-2.5 py-1.5 transition-colors"
      style={{
        borderColor: active ? "var(--cyan)" : "var(--hairline)",
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
    >
      <span className="text-muted-foreground">{label}</span>
      <span style={{ color }}>{open ? "OPEN" : "CLOSED"}</span>
    </button>
  );
}

export const VALVE_NOTES: Record<ValveId, { title: string; body: string }> = {
  mitral: {
    title: "Mitral valve",
    body: "Closes when ventricular pressure exceeds atrial pressure (start of isovolumetric contraction, generating S1) and opens when ventricular pressure falls back below atrial pressure at the end of isovolumetric relaxation, beginning rapid filling. Mitral stenosis delays opening and raises left atrial pressure; mitral regurgitation abolishes true isovolumetric contraction.",
  },
  aortic: {
    title: "Aortic valve",
    body: "Opens when ventricular pressure exceeds aortic pressure (~80 mmHg), starting rapid ejection, and closes as ventricular pressure falls below aortic pressure, generating S2 and the dicrotic notch. Aortic stenosis creates a systolic pressure gradient across the open valve; aortic regurgitation allows backflow during diastole and widens pulse pressure.",
  },
};
