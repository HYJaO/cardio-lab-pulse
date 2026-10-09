import { useState } from "react";
import { getMurmur, LANDMARKS, LAB_MURMURS, type LandmarkId, type MurmurId, type RadiationTarget } from "@/lib/murmurs";

const VB_W = 300;
const VB_H = 330;

const RAD: Record<Exclude<RadiationTarget, "none">, { x: number; y: number; label: string }> = {
  carotids: { x: 132, y: 40, label: "Carotid" },
  axilla: { x: 272, y: 196, label: "Axilla" },
  lsb: { x: 168, y: 230, label: "Down LSB" },
  rsb: { x: 130, y: 210, label: "Right sternal border" },
};

export function AuscultationMap({
  value,
  onChange,
}: {
  value: MurmurId;
  onChange: (id: MurmurId) => void;
}) {
  const m = getMurmur(value);
  const [focus, setFocus] = useState<LandmarkId>(m.site ?? "aortic");
  const site = LANDMARKS.find((l) => l.id === (m.site ?? focus));
  const focused = LANDMARKS.find((l) => l.id === focus)!;
  const heardHere = LAB_MURMURS.filter((x) => x.site === focus);

  return (
    <div className="console-panel grid gap-6 p-4 md:grid-cols-[minmax(0,320px)_1fr] md:p-6">
      <div className="relative mx-auto w-full max-w-[320px]">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" aria-hidden>
          {/* torso */}
          <path d="M60 60 Q150 20 240 60 L262 300 Q150 320 38 300 Z" fill="var(--surface)" stroke="var(--hairline)" />
          <path d="M118 40 Q150 30 182 40" fill="none" stroke="var(--hairline)" />
          {/* sternum */}
          <rect x={140} y={80} width={20} height={150} rx={6} fill="var(--surface-raised)" stroke="var(--hairline)" />
          {/* ribs */}
          {[100, 132, 164, 196, 228].map((y) => (
            <g key={y} stroke="var(--hairline)" fill="none">
              <path d={`M140 ${y} Q100 ${y + 6} 62 ${y + 22}`} />
              <path d={`M160 ${y} Q200 ${y + 6} 238 ${y + 22}`} />
            </g>
          ))}
          <text x={60} y={320} className="fill-muted-foreground font-mono text-[9px]">PATIENT R</text>
          <text x={198} y={320} className="fill-muted-foreground font-mono text-[9px]">PATIENT L</text>
          {site &&
            m.radiationTargets
              .filter((r): r is Exclude<RadiationTarget, "none"> => r !== "none")
              .map((r) => (
                <g key={r}>
                  <line x1={site.x} y1={site.y} x2={RAD[r].x} y2={RAD[r].y} stroke="var(--amber)" strokeWidth="2" strokeDasharray="5 4" />
                  <circle cx={RAD[r].x} cy={RAD[r].y} r={4} fill="var(--amber)" />
                  <text x={RAD[r].x} y={RAD[r].y - 8} textAnchor="middle" className="fill-amber font-mono text-[10px]">
                    {RAD[r].label}
                  </text>
                </g>
              ))}
        </svg>
        {LANDMARKS.map((l) => {
          const best = m.site === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setFocus(l.id)}
              aria-label={`${l.name} area — ${l.place}${best ? `. Best location for ${m.name}` : ""}`}
              aria-pressed={focus === l.id}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[9px] font-bold transition-colors ${
                best
                  ? "border-crimson bg-crimson/30 text-foreground motion-safe:animate-pulse"
                  : focus === l.id
                    ? "border-cyan bg-cyan/20 text-cyan"
                    : "border-hairline bg-background/80 text-muted-foreground hover:border-cyan"
              }`}
              style={{ left: `${(l.x / VB_W) * 100}%`, top: `${(l.y / VB_H) * 100}%` }}
            >
              {l.name[0]}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 text-[13.5px]">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-crimson">
            {m.name} · best heard
          </p>
          <p className="mt-1 leading-relaxed text-foreground">{m.siteLabel}</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">Radiation: {m.radiation}</p>
        </div>
        <div className="border-t border-border/60 pt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan">
            Selected landmark · {focused.name}
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">{focused.place}</p>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Classically best heard here
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {heardHere.length === 0 && (
              <span className="text-muted-foreground">
                None of this lab's lesions (pulmonic stenosis and flow murmurs live here).
              </span>
            )}
            {heardHere.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => onChange(x.id)}
                className="rounded border border-hairline px-2 py-1 font-mono text-[11px] text-muted-foreground hover:border-cyan hover:text-cyan"
              >
                {x.name}
              </button>
            ))}
          </div>
        </div>
        <p className="font-mono text-[10.5px] leading-relaxed text-muted-foreground">
          Red ring = best location for the selected murmur. Amber dashes = radiation. Tab to a
          landmark and press Enter to inspect it.
        </p>
      </div>
    </div>
  );
}
