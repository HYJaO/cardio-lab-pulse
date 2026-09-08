import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export type RecallItem = { q: string; a: string };

export function ActiveRecall({ items }: { items: RecallItem[] }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) =>
    setOpen((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const shown = open.includes(i);
        return (
          <div key={item.q} className="console-panel p-4 md:p-5">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 font-mono text-[11px] text-cyan">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-[14.5px] leading-relaxed text-foreground">{item.q}</p>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={shown}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cyan"
              >
                {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {shown ? "Hide" : "Reveal"}
              </button>
            </div>
            {shown && (
              <p className="mt-3 border-t border-border/50 pt-3 pl-8 text-[13.5px] leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
