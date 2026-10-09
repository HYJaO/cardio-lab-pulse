import { useRef, type KeyboardEvent } from "react";
import { LAB_MURMURS, type MurmurId } from "@/lib/murmurs";

/** Shared radiogroup for selecting the active murmur (arrow-key navigable). */
export function MurmurPicker({
  value,
  onChange,
  label = "Select murmur",
}: {
  value: MurmurId;
  onChange: (id: MurmurId) => void;
  label?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + LAB_MURMURS.length) % LAB_MURMURS.length;
    onChange(LAB_MURMURS[n].id);
    refs.current[n]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {LAB_MURMURS.map((m, i) => {
        const on = m.id === value;
        return (
          <button
            key={m.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(m.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
              on
                ? "border-cyan bg-cyan/15 text-cyan"
                : "border-hairline text-muted-foreground hover:border-cyan/40 hover:text-foreground"
            }`}
          >
            {m.name}
            {m.phase === "diastolic" && <span className="ml-1.5 text-crimson">●</span>}
          </button>
        );
      })}
    </div>
  );
}
