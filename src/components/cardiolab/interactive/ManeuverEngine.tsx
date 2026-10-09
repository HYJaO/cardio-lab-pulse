import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { getMurmur, LAB_MURMURS, MANEUVERS, MURMURS, type Change, type ManeuverId, type MurmurId } from "@/lib/murmurs";
import { MurmurPicker } from "./MurmurPicker";
import { envelopePath, tracePath } from "./Phonocardiogram";

const W = 1000;
const H = 140;

const GAIN: Record<Change, number> = { up: 1.4, down: 0.55, none: 1 };

function ChangeTag({ c }: { c: Change }) {
  const map = {
    up: { Icon: ArrowUp, word: "Louder", cls: "text-crimson border-crimson/40 bg-crimson/10" },
    down: { Icon: ArrowDown, word: "Softer", cls: "text-cyan border-cyan/40 bg-cyan/10" },
    none: { Icon: Minus, word: "No reliable change", cls: "text-muted-foreground border-hairline" },
  }[c];
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10.5px] ${map.cls}`}>
      <map.Icon className="h-3 w-3" />
      {map.word}
    </span>
  );
}

function mvpShift(mv: ManeuverId) {
  return mv === "valsalva" ? -0.07 : mv === "squat" || mv === "handgrip" ? 0.06 : 0;
}

export function ManeuverEngine({
  value,
  onChange,
}: {
  value: MurmurId;
  onChange: (id: MurmurId) => void;
}) {
  const [mv, setMv] = useState<ManeuverId>("valsalva");
  const m = getMurmur(value);
  const maneuver = MANEUVERS.find((x) => x.id === mv)!;
  const change = m.maneuvers[mv];
  const shift = m.id === "mvp" ? mvpShift(mv) : 0;

  return (
    <div className="console-panel space-y-5 p-4 md:p-6">
      <MurmurPicker value={value} onChange={onChange} label="Murmur for maneuver" />
      <div role="radiogroup" aria-label="Maneuver" className="grid gap-2 sm:grid-cols-4">
        {MANEUVERS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={mv === x.id}
            onClick={() => setMv(x.id)}
            className={`rounded border p-3 text-left transition-colors ${
              mv === x.id ? "border-amber bg-amber/10" : "border-hairline hover:border-amber/50"
            }`}
          >
            <span className="block text-[13px] font-semibold text-foreground">{x.name}</span>
            <span className="mt-1 block font-mono text-[10.5px] text-amber">{x.effect}</span>
          </button>
        ))}
      </div>

      <figure>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${m.name} with ${maneuver.name}: ${change}`}>
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="var(--hairline)" />
          {m.phase !== "none" && (
            <path d={envelopePath(m, W, H)} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.6" strokeDasharray="4 4" />
          )}
          <path d={tracePath(m, W, H, { gain: GAIN[change], clickShift: shift })} fill="none" stroke="var(--amber)" strokeWidth="1.2" />
        </svg>
        <figcaption className="mt-1 font-mono text-[10.5px] text-muted-foreground">
          Grey dashes = baseline envelope · amber = during {maneuver.name.toLowerCase()} (schematic).
        </figcaption>
      </figure>

      <div aria-live="polite" className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-foreground">
            {m.name} <ChangeTag c={change} />
          </p>
          {m.notes?.[mv] && <p className="mt-2 text-[13px] leading-relaxed text-foreground">{m.notes[mv]}</p>}
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{maneuver.mechanism}</p>
        </div>
        <ul className="grid grid-cols-1 gap-1.5 text-[12.5px] sm:grid-cols-2">
          {MURMURS.filter((x) => x.id !== "normal").map((x) => (
            <li
              key={x.id}
              className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 ${
                x.id === m.id ? "border-cyan" : "border-hairline"
              }`}
            >
              <span className="font-mono text-foreground">{x.short}</span>
              <ChangeTag c={x.maneuvers[mv]} />
            </li>
          ))}
        </ul>
      </div>
      <p className="font-mono text-[10.5px] leading-relaxed text-muted-foreground">
        Exceptions to memorize: HCM and MVP get louder/longer with standing or Valsalva and softer
        with squatting. Handgrip: MR, AR, VSD ↑ · AS, HCM ↓. Inspiration: right-sided (TR) ↑.
        {LAB_MURMURS.length ? "" : ""}
      </p>
    </div>
  );
}
