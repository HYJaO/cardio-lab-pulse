import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { AssociationLink } from "@/lib/mechanism-map";
import { RichText } from "./RichText";

/** Clickable causal chain: each link expands its explanatory detail. */
export function AssociationChain({ links }: { links: AssociationLink[] }) {
  const [open, setOpen] = useState<string>(links[0]?.id ?? "");

  return (
    <div className="space-y-3">
      <ol className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-stretch">
        {links.map((l, i) => {
          const active = open === l.id;
          return (
            <li key={l.id} className="flex items-center gap-2">
              {i === 0 && (
                <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
                  {l.from}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(active ? "" : l.id)}
                aria-expanded={active}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 ${
                  active
                    ? "border-cyan/60 bg-cyan/10 text-cyan"
                    : "border-hairline bg-surface/35 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="md:hidden">{l.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>{l.to}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {links
        .filter((l) => l.id === open)
        .map((l) => (
          <p
            key={l.id}
            className="glass-panel rounded-xl p-4 text-[13.5px] leading-relaxed text-muted-foreground md:p-5"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
              {l.from} → {l.to}
            </span>
            <span className="mt-2 block">
              <RichText text={l.detail} />
            </span>
          </p>
        ))}
    </div>
  );
}
