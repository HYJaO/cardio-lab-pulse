import { useMemo, useState } from "react";
import { EcgPaper } from "./EcgPaper";
import { ECG_PATTERNS, FINDING_LABEL, type FindingKey } from "@/lib/ecg-patterns";

const groups = [...new Set(ECG_PATTERNS.map((p) => p.group))];

export function PatternLibrary() {
  const [pid, setPid] = useState("sinus");
  const [vid, setVid] = useState<string | undefined>();
  const p = ECG_PATTERNS.find((x) => x.id === pid)!;
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  const fig = useMemo(() => v.figure(), [v]);
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label="ECG patterns" className="space-y-4">
        {groups.map((g) => (
          <div key={g}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{g}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 lg:flex-col">
              {ECG_PATTERNS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} type="button" aria-pressed={pid === x.id} onClick={() => { setPid(x.id); setVid(undefined); }}
                  className={`min-h-11 rounded-md border px-3 text-left text-[13px] focus-visible:outline-2 focus-visible:outline-cyan ${pid === x.id ? "border-cyan text-foreground" : "border-hairline text-muted-foreground hover:text-foreground"}`}>
                  {x.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="min-w-0 space-y-4" aria-live="polite">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{p.name}</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">{p.summary}</p>
        </div>
        {p.variants.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Variant">
            {p.variants.map((x) => (
              <button key={x.id} type="button" aria-pressed={v.id === x.id} onClick={() => setVid(x.id)}
                className={`min-h-11 rounded-md border px-3 font-mono text-[11px] ${v.id === x.id ? "border-crimson text-foreground" : "border-hairline text-muted-foreground"}`}>
                {x.label}
              </button>
            ))}
          </div>
        )}
        <EcgPaper figure={fig} />
        <dl className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(v.findings) as FindingKey[]).map((k) => (
            <div key={k} className="rounded-md border border-hairline bg-surface/60 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">{FINDING_LABEL[k]}</dt>
              <dd className="mt-1 text-[13.5px] text-foreground">{v.findings[k]}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded-md border border-hairline p-4 text-[13.5px] leading-relaxed text-muted-foreground">
          <p><span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-electric">Mechanism</span> {p.mechanism}</p>
          <p className="mt-3"><span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-crimson">Exam trap</span> {p.trap}</p>
        </div>
      </div>
    </div>
  );
}
