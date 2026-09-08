/** Reusable labelled range control for physiology parameters. */
export function ParameterSlider({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-md border border-hairline bg-background/55 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
        <span className="telemetry-value text-[12px] text-cyan">
          {display ?? value} <span className="text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${display ?? value} ${unit}`}
        className="mt-3 w-full"
      />
      {hint && (
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
