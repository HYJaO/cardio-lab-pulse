import { Pause, Play, RotateCcw } from "lucide-react";
import { SPEEDS } from "./useCycleClock";

/** Reusable transport bar for any CardioLab timeline instrument. */
export function PlaybackControls({
  playing,
  onToggle,
  onRestart,
  speed,
  onSpeed,
  label,
}: {
  playing: boolean;
  onToggle: () => void;
  onRestart: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? "Pause animation" : "Play animation"}
        className="inline-flex items-center gap-2 rounded-md border border-hairline bg-surface/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-cyan/50 hover:text-cyan"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={onRestart}
        aria-label="Restart cycle"
        className="inline-flex items-center gap-2 rounded-md border border-hairline bg-surface/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-cyan/50 hover:text-cyan"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Restart
      </button>
      <div
        role="group"
        aria-label="Animation speed"
        className="ml-auto flex items-center gap-1 rounded-md border border-hairline bg-surface/40 p-1"
      >
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            className={`rounded px-2 py-1 font-mono text-[11px] transition-colors ${
              speed === s ? "bg-cyan/15 text-cyan" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
      {label && (
        <span className="w-full font-mono text-[11px] text-muted-foreground md:w-auto">{label}</span>
      )}
    </div>
  );
}
