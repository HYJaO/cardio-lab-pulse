/**
 * Data-driven arterial-wall cross-section.
 *
 * Renders a longitudinal section of an artery (lumen → endothelium → intima →
 * media → adventitia) and layers on the morphology of a given stage index of a
 * mechanism pathway. Purely presentational: any progression model can drive it
 * by passing a 0..1 severity plus feature flags.
 */
export type PlaqueFeatures = {
  /** 0 → 1 lesion severity, scales the plaque bulge. */
  severity: number;
  lipid?: boolean;
  monocytes?: boolean;
  foamCells?: boolean;
  cap?: boolean;
  necroticCore?: boolean;
  calcium?: boolean;
  rupture?: boolean;
  thrombus?: boolean;
  /** Highlight the endothelial layer (early injury). */
  injuredEndothelium?: boolean;
};

export const STAGE_FEATURES: Record<string, PlaqueFeatures> = {
  injury: { severity: 0.05, injuredEndothelium: true },
  "ldl-entry": { severity: 0.12, injuredEndothelium: true, lipid: true },
  oxidation: { severity: 0.18, injuredEndothelium: true, lipid: true },
  monocyte: { severity: 0.24, lipid: true, monocytes: true },
  foam: { severity: 0.34, lipid: true, foamCells: true, monocytes: true },
  "fatty-streak": { severity: 0.44, lipid: true, foamCells: true },
  smc: { severity: 0.56, lipid: true, foamCells: true, cap: true },
  "fibrous-plaque": { severity: 0.7, cap: true, necroticCore: true, foamCells: true },
  vulnerable: { severity: 0.82, cap: true, necroticCore: true, calcium: true, foamCells: true },
  rupture: {
    severity: 0.9,
    cap: true,
    necroticCore: true,
    calcium: true,
    rupture: true,
    thrombus: true,
  },
};

const W = 620;
const H = 260;
/** Wall geometry: y-coordinates of each layer boundary. */
const LUMEN_TOP = 96;
const INTIMA_TOP = 150;
const MEDIA_TOP = 176;
const ADV_TOP = 210;

function bulge(severity: number) {
  // Plaque protrudes upward into the lumen from the intima.
  const height = 8 + severity * 74;
  const left = 170;
  const right = 450;
  const mid = (left + right) / 2;
  const top = INTIMA_TOP - height;
  return { height, left, right, mid, top };
}

export function ArteryCrossSection({
  features,
  zoom = false,
  animate = true,
  label,
}: {
  features: PlaqueFeatures;
  zoom?: boolean;
  animate?: boolean;
  label?: string;
}) {
  const b = bulge(features.severity);
  const capCurve = `C${b.left + 50} ${b.top} ${b.mid - 30} ${b.top} ${b.mid} ${b.top} C${b.mid + 30} ${b.top} ${b.right - 50} ${b.top} ${b.right} ${INTIMA_TOP}`;
  const capPath = `M${b.left} ${INTIMA_TOP} ${capCurve} Z`;
  const corePath = `M${b.left + 40} ${INTIMA_TOP - 4} C${b.left + 80} ${b.top + 16} ${b.mid} ${b.top + 12} ${b.mid + 60} ${b.top + 20} C${b.right - 60} ${b.top + 30} ${b.right - 50} ${INTIMA_TOP - 4} ${b.right - 40} ${INTIMA_TOP - 4} Z`;

  const scale = zoom ? 1.14 : 1;

  return (
    <figure className="rounded-lg border border-hairline bg-background/40 p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[190px] w-full sm:h-[240px]"
        role="img"
        aria-label={label ?? "Arterial wall cross-section"}
      >
        <g
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${b.mid}px ${INTIMA_TOP}px`,
            transition: animate ? "transform 500ms ease" : undefined,
          }}
        >
          {/* adventitia */}
          <rect
            x="0"
            y={ADV_TOP}
            width={W}
            height={H - ADV_TOP}
            fill="var(--surface, #12202f)"
            opacity="0.5"
          />
          {/* media */}
          <rect
            x="0"
            y={MEDIA_TOP}
            width={W}
            height={ADV_TOP - MEDIA_TOP}
            fill="var(--teal)"
            opacity="0.12"
          />
          {/* intima */}
          <rect
            x="0"
            y={INTIMA_TOP}
            width={W}
            height={MEDIA_TOP - INTIMA_TOP}
            fill="var(--cyan)"
            opacity="0.08"
          />
          <path d={`M0 ${MEDIA_TOP}h${W}`} stroke="var(--hairline)" />
          <path d={`M0 ${ADV_TOP}h${W}`} stroke="var(--hairline)" />

          {/* lipid pool / fatty streak */}
          {features.lipid && !features.necroticCore && (
            <path
              d={capPath}
              fill="var(--amber)"
              fillOpacity={0.18 + features.severity * 0.2}
              stroke="var(--amber)"
              strokeOpacity="0.5"
              style={{ transition: animate ? "all 500ms ease" : undefined }}
            />
          )}

          {/* fibrous cap over core */}
          {features.cap && (
            <path
              d={capPath}
              fill="var(--cyan)"
              fillOpacity="0.14"
              stroke="var(--cyan)"
              strokeOpacity="0.75"
              strokeWidth={features.rupture ? 1 : 1.6}
              strokeDasharray={features.rupture ? "26 12" : undefined}
              style={{ transition: animate ? "all 500ms ease" : undefined }}
            />
          )}
          {features.necroticCore && (
            <path d={corePath} fill="var(--oxblood, var(--crimson))" fillOpacity="0.35" />
          )}

          {/* foam cells */}
          {features.foamCells &&
            Array.from({ length: 12 }).map((_, i) => {
              const x = b.left + 30 + ((i * 37) % (b.right - b.left - 60));
              const y = INTIMA_TOP - 8 - ((i * 13) % Math.max(10, b.height - 14));
              return (
                <circle key={i} cx={x} cy={y} r="4.2" fill="var(--amber)" fillOpacity="0.55" />
              );
            })}

          {/* calcification */}
          {features.calcium && (
            <>
              <rect
                x={b.mid - 40}
                y={INTIMA_TOP - 14}
                width="26"
                height="7"
                rx="2"
                fill="var(--foreground)"
                opacity="0.55"
              />
              <rect
                x={b.mid + 16}
                y={INTIMA_TOP - 20}
                width="18"
                height="6"
                rx="2"
                fill="var(--foreground)"
                opacity="0.4"
              />
            </>
          )}

          {/* endothelium */}
          <path
            d={
              features.cap || features.lipid
                ? `M0 ${INTIMA_TOP}H${b.left} ${capPath.slice(1).replace(" Z", "")} H${W}`
                : `M0 ${INTIMA_TOP}H${W}`
            }
            fill="none"
            stroke={features.injuredEndothelium ? "var(--crimson)" : "var(--cyan)"}
            strokeWidth="1.6"
            strokeOpacity={features.rupture ? 0.45 : 0.9}
            strokeDasharray={features.injuredEndothelium ? "6 5" : undefined}
          />

          {/* monocytes rolling in the lumen */}
          {features.monocytes &&
            [0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={140 + i * 90}
                cy={INTIMA_TOP - b.height - 14 - (i % 2) * 10}
                r="5"
                fill="none"
                stroke="var(--electric)"
                strokeWidth="1.4"
              />
            ))}

          {/* rupture + thrombus */}
          {features.rupture && (
            <path
              d={`M${b.mid - 6} ${b.top + 2} l10 22 l-14 6`}
              fill="none"
              stroke="var(--crimson)"
              strokeWidth="1.8"
            />
          )}
          {features.thrombus && (
            <path
              d={`M${b.mid - 70} ${b.top + 6} C${b.mid - 40} ${b.top - 46} ${b.mid + 50} ${b.top - 40} ${b.mid + 78} ${b.top + 4} C${b.mid + 30} ${b.top + 18} ${b.mid - 30} ${b.top + 20} ${b.mid - 70} ${b.top + 6} Z`}
              fill="var(--crimson)"
              fillOpacity="0.4"
              stroke="var(--crimson)"
              strokeOpacity="0.8"
            />
          )}

          {/* lumen flow lines */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M12 ${LUMEN_TOP - 40 + i * 18}H${W - 12}`}
              stroke="var(--cyan)"
              strokeOpacity="0.18"
              strokeDasharray="18 14"
            />
          ))}
        </g>

        <g
          className="font-mono"
          fill="currentColor"
          fontSize="10"
          style={{ letterSpacing: "0.12em" }}
        >
          <text x="10" y="20" className="fill-muted-foreground">
            LUMEN
          </text>
          <text x="10" y={MEDIA_TOP - 6} className="fill-muted-foreground">
            INTIMA
          </text>
          <text x="10" y={ADV_TOP - 6} className="fill-muted-foreground">
            MEDIA
          </text>
          <text x="10" y={H - 8} className="fill-muted-foreground">
            ADVENTITIA
          </text>
        </g>
      </svg>
    </figure>
  );
}
