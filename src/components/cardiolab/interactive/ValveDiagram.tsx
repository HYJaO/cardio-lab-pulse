import { VALVES, valveOpen, type ValveId } from "@/lib/cardiac-cycle";

type Props = {
  t: number;
  selected: ValveId | null;
  onSelect: (v: ValveId) => void;
};

const HOTSPOTS: Record<ValveId, { cx: number; cy: number; label: string }> = {
  tricuspid: { cx: 62, cy: 74, label: "TV" },
  pulmonic: { cx: 60, cy: 34, label: "PV" },
  mitral: { cx: 158, cy: 74, label: "MV" },
  aortic: { cx: 160, cy: 34, label: "AV" },
};

export function ValveDiagram({ t, selected, onSelect }: Props) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Four valves · live status
      </p>

      <svg
        viewBox="0 0 220 200"
        className="mt-3 h-52 w-full"
        role="img"
        aria-label="Right and left heart chambers with tricuspid, pulmonic, mitral and aortic valve status"
      >
        {/* great vessels */}
        <path d="M60 14v14" stroke="var(--hairline)" strokeWidth="16" strokeLinecap="round" />
        <path d="M160 14v14" stroke="var(--hairline)" strokeWidth="16" strokeLinecap="round" />
        <text x="60" y="10" textAnchor="middle" className="font-mono" fontSize="8" fill="var(--muted-foreground)">
          PA
        </text>
        <text x="160" y="10" textAnchor="middle" className="font-mono" fontSize="8" fill="var(--muted-foreground)">
          Ao
        </text>

        {/* atria */}
        <Chamber cx={62} cy={52} rx={30} ry={16} label="RA" tone="var(--electric)" />
        <Chamber cx={158} cy={52} rx={30} ry={16} label="LA" tone="var(--electric)" />

        {/* ventricles */}
        <Ventricle x={32} label="RV" tone="var(--teal)" />
        <Ventricle x={128} label="LV" tone="var(--crimson)" />

        {(Object.keys(HOTSPOTS) as ValveId[]).map((id) => {
          const open = valveOpen[id](t);
          const spot = HOTSPOTS[id];
          const color = open ? "var(--emerald)" : "var(--crimson)";
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={selected === id}
              aria-label={`${VALVES[id].name}, ${open ? "open" : "closed"}`}
              className="cursor-pointer focus:outline-none"
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
            >
              <circle cx={spot.cx} cy={spot.cy} r="14" fill="transparent" />
              {open ? (
                <>
                  <path
                    d={`M${spot.cx - 9} ${spot.cy - 6}l4 12`}
                    stroke={color}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${spot.cx + 9} ${spot.cy - 6}l-4 12`}
                    stroke={color}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <path
                  d={`M${spot.cx - 10} ${spot.cy}h20`}
                  stroke={color}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              )}
              <circle
                cx={spot.cx}
                cy={spot.cy}
                r="13"
                fill="none"
                stroke={selected === id ? "var(--cyan)" : "transparent"}
                strokeDasharray="3 3"
              />
              <text
                x={spot.cx}
                y={spot.cy + 24}
                textAnchor="middle"
                className="font-mono"
                fontSize="8"
                fill="var(--muted-foreground)"
              >
                {spot.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[11px]">
        {(Object.keys(HOTSPOTS) as ValveId[]).map((id) => (
          <ValveChip
            key={id}
            label={VALVES[id].short}
            open={valveOpen[id](t)}
            active={selected === id}
            onClick={() => onSelect(id)}
          />
        ))}
      </div>
    </div>
  );
}

function Chamber({
  cx,
  cy,
  rx,
  ry,
  label,
  tone,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label: string;
  tone: string;
}) {
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={`color-mix(in oklab, ${tone} 14%, transparent)`}
        stroke="var(--hairline)"
      />
      <text x={cx} y={cy + 3} textAnchor="middle" className="font-mono" fontSize="9" fill="var(--muted-foreground)">
        {label}
      </text>
    </g>
  );
}

function Ventricle({ x, label, tone }: { x: number; label: string; tone: string }) {
  return (
    <g>
      <path
        d={`M${x} 96c0-8 13-14 30-14s30 6 30 14c0 34-13 66-30 66s-30-32-30-66z`}
        fill={`color-mix(in oklab, ${tone} 14%, transparent)`}
        stroke="var(--hairline)"
      />
      <text x={x + 30} y={132} textAnchor="middle" className="font-mono" fontSize="10" fill="var(--muted-foreground)">
        {label}
      </text>
    </g>
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
      aria-pressed={active}
      className="flex min-h-11 items-center justify-between rounded-md border px-2.5 py-1.5 transition-colors"
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
