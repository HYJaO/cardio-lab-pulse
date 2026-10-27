import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockStrip } from "./BlockStrip";
import { BLOCK_LABEL, buildStrip, type BlockKind } from "@/lib/heart-blocks";

const KINDS: BlockKind[] = ["normal", "first", "mobitz1", "mobitz2", "twoToOne", "third"];
const NOTES: Record<BlockKind, { site: string; key: string }> = {
  normal: { site: "Intact conduction", key: "PR 120–200 ms, every P conducts." },
  first: { site: "Usually AV node", key: "Fixed PR > 200 ms; every P still conducts — a delay, not a block." },
  mobitz1: { site: "Usually AV node", key: "PR lengthens beat to beat until a P drops; the R–R shortens before the pause (grouped beating)." },
  mobitz2: { site: "Usually His–Purkinje (infranodal)", key: "Fixed PR, then a sudden non-conducted P; often wide QRS. Risk of progression to complete block." },
  twoToOne: { site: "Nodal or infranodal", key: "Every other P drops, so no PR trend can be seen. QRS width and longer strips help; the strip alone can't settle the level." },
  third: { site: "Node or below", key: "No P reaches the ventricles: regular Ps and regular escape QRSs march independently (AV dissociation)." },
};

export function BlockLab() {
  const [kind, setKind] = useState<BlockKind>("mobitz1");
  const [rate, setRate] = useState(75);
  const [focus, setFocus] = useState(0);
  const strip = useMemo(() => buildStrip(kind, rate), [kind, rate]);
  const n = strip.beats.length;
  const fi = Math.min(focus, n - 1);
  const beat = strip.beats[fi];
  const note = NOTES[kind];
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Rhythm" className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Button key={k} variant="ghost" type="button" role="radio" aria-checked={kind === k} onClick={() => { setKind(k); setFocus(0); }}
            className={`h-auto min-h-11 whitespace-normal rounded-md border px-3 py-2 text-[12.5px] ${kind === k ? "border-cyan text-foreground" : "border-hairline text-muted-foreground"}`}>
            {BLOCK_LABEL[k]}
          </Button>
        ))}
      </div>
      <BlockStrip strip={strip} focus={fi} />
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Atrial (sinus) rate: <span className="text-cyan tabular-nums">{rate}/min</span></span>
          <input type="range" min={50} max={110} step={1} value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Atrial rate in beats per minute" className="mt-2 w-full accent-[var(--cyan)]" />
        </label>
        <div className="flex items-center gap-2">
          <Button variant="ghost" type="button" aria-label="Previous P wave" onClick={() => setFocus((f) => Math.max(0, Math.min(f, n - 1) - 1))} className="min-h-11 min-w-11 rounded-md border border-hairline"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-mono text-[12px] tabular-nums text-muted-foreground" aria-live="polite">P {fi + 1} / {n}</span>
          <Button variant="ghost" type="button" aria-label="Next P wave" onClick={() => setFocus((f) => Math.min(n - 1, f + 1))} className="min-h-11 min-w-11 rounded-md border border-hairline"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <dl className="grid gap-3 rounded-lg border border-hairline bg-surface/60 p-4 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Selected P wave</dt>
          <dd className="mt-1 text-foreground">{kind === "third" ? "Not conducted — QRS timing is independent" : beat?.pr !== undefined ? `Conducted · PR ${Math.round(beat.pr * 1000)} ms` : "Blocked — no QRS follows"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Atrial / ventricular</dt><dd className="mt-1 tabular-nums text-foreground">{strip.atrialRate} / ~{strip.ventricularRate} per min</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Typical level</dt><dd className="mt-1 text-foreground">{note.site}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">QRS</dt><dd className="mt-1 text-foreground">{strip.wide ? "Wide (drawn wide; may be narrow)" : "Narrow"}</dd></div>
      </dl>
      <p className="text-[14px] text-foreground">{note.key}</p>
      {kind === "third" && <p className="text-[13px] text-muted-foreground">Escape rate stays near 38/min whatever the atrial rate — move the slider and watch only the P waves change.</p>}
    </div>
  );
}
