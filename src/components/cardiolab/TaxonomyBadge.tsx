export type TaxonomyKind =
  | "high-yield"
  | "mechanism"
  | "clinical-pearl"
  | "classic-presentation"
  | "differential"
  | "usmle-trap";

const TAXONOMY: Record<TaxonomyKind, { label: string; color: string }> = {
  "high-yield": { label: "High-Yield", color: "var(--crimson)" },
  mechanism: { label: "Mechanism", color: "var(--electric)" },
  "clinical-pearl": { label: "Clinical Pearl", color: "var(--amber)" },
  "classic-presentation": { label: "Classic Presentation", color: "var(--emerald)" },
  differential: { label: "Differential", color: "var(--violet)" },
  "usmle-trap": { label: "USMLE Trap", color: "var(--oxblood)" },
};

export function TaxonomyBadge({ kind }: { kind: TaxonomyKind }) {
  const { label, color } = TAXONOMY[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em]"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
      }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export const TAXONOMY_KINDS = Object.keys(TAXONOMY) as TaxonomyKind[];
