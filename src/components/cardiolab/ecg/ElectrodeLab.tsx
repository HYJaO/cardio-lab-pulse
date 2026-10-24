import { useState } from "react";

type E = { id: string; x: number; y: number; where: string; leads: string[] };
export const ELECTRODES: E[] = [
  { id: "RA", x: 35, y: 335, where: "Right wrist (inner forearm). Clinical variant: proximal right arm or right shoulder for monitoring/exercise testing — this changes limb-lead amplitudes slightly.", leads: ["I", "II", "aVR"] },
  { id: "LA", x: 325, y: 335, where: "Left wrist (inner forearm). Variant: proximal left arm or shoulder.", leads: ["I", "III", "aVL"] },
  { id: "RL", x: 145, y: 565, where: "Right ankle. Ground/reference electrode — it forms no lead. Variant: lower abdomen.", leads: [] },
  { id: "LL", x: 215, y: 565, where: "Left ankle. Variant: left lower abdomen/hip.", leads: ["II", "III", "aVF"] },
  { id: "V1", x: 166, y: 200, where: "4th intercostal space, right sternal border.", leads: ["V1"] },
  { id: "V2", x: 194, y: 200, where: "4th intercostal space, left sternal border.", leads: ["V2"] },
  { id: "V3", x: 214, y: 214, where: "Midway between V2 and V4.", leads: ["V3"] },
  { id: "V4", x: 235, y: 228, where: "5th intercostal space, left midclavicular line.", leads: ["V4"] },
  { id: "V5", x: 262, y: 228, where: "Left anterior axillary line, same horizontal level as V4.", leads: ["V5"] },
  { id: "V6", x: 287, y: 228, where: "Left midaxillary line, same horizontal level as V4.", leads: ["V6"] },
];
const LEADS = ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"];

export function ElectrodeLab() {
  const [sel, setSel] = useState("V1");
  const selected = ELECTRODES.find((x) => x.id === sel);
  const e = selected ? { ...selected, leads: ["RA", "LA", "LL"].includes(selected.id) ? LEADS.filter((lead) => !((selected.id === "RA" && lead === "III") || (selected.id === "LA" && lead === "II") || (selected.id === "LL" && lead === "I"))) : selected.leads } : undefined;
  if (!e) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <svg viewBox="0 0 360 600" className="mx-auto w-full max-w-[360px] rounded-lg border border-hairline bg-surface" role="img"
        aria-label={`Front view of a patient; patient's right is on the viewer's left. Selected electrode ${e.id}: ${e.where}`}>
        <circle cx="180" cy="50" r="28" fill="var(--surface-raised)" stroke="var(--hairline)" />
        <path d="M110 100C150 88 210 88 250 100L295 120Q300 200 292 300L270 380H90L68 300Q60 200 65 120Z" fill="var(--surface-raised)" stroke="var(--muted-foreground)" strokeOpacity="0.4" />
        <path d="M65 125L35 335M295 125L325 335M135 380L145 570M225 380L215 570" stroke="var(--surface-raised)" strokeWidth="24" strokeLinecap="round" />
        <line x1="180" y1="105" x2="180" y2="262" stroke="var(--muted-foreground)" strokeOpacity="0.5" />
        <line x1="130" y1="200" x2="230" y2="200" stroke="var(--muted-foreground)" strokeOpacity="0.35" strokeDasharray="3 3" />
        <line x1="130" y1="228" x2="292" y2="228" stroke="var(--muted-foreground)" strokeOpacity="0.35" strokeDasharray="3 3" />
        <line x1="235" y1="110" x2="235" y2="300" stroke="var(--cyan)" strokeOpacity="0.25" strokeDasharray="2 4" />
        <text x="236" y="122" fontSize="8" fill="var(--muted-foreground)">MCL</text>
        <text x="122" y="198" fontSize="8" textAnchor="end" fill="var(--muted-foreground)">4th ICS</text>
        <text x="122" y="231" fontSize="8" textAnchor="end" fill="var(--muted-foreground)">5th ICS</text>
        <text x="40" y="380" fontSize="9" fill="var(--muted-foreground)">Patient R</text>
        <text x="320" y="380" fontSize="9" textAnchor="end" fill="var(--muted-foreground)">Patient L</text>
        {ELECTRODES.map((x) => (
          <g key={x.id} onClick={() => setSel(x.id)} className="cursor-pointer" aria-hidden>
            <circle cx={x.x} cy={x.y} r={sel === x.id ? 11 : 8} fill={sel === x.id ? "var(--crimson)" : "var(--cyan)"} stroke="var(--background)" strokeWidth="2" />
            <text x={x.x} y={x.y - 14} fontSize="9" textAnchor="middle" fill="var(--foreground)" fontFamily="var(--font-mono)">{x.id}</text>
          </g>
        ))}
      </svg>
      <div className="min-w-0 space-y-4">
        <div role="radiogroup" aria-label="Electrodes" className="grid grid-cols-5 gap-2">
          {ELECTRODES.map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={sel === x.id} onClick={() => setSel(x.id)}
              className={`min-h-11 rounded-md border font-mono text-[12px] focus-visible:outline-2 focus-visible:outline-cyan ${sel === x.id ? "border-crimson text-foreground" : "border-hairline text-muted-foreground"}`}>
              {x.id}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-hairline bg-surface/60 p-4" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Electrode {e.id}</p>
          <p className="mt-2 text-foreground">{e.where}</p>
          <p className="mt-3 text-[12.5px] text-muted-foreground">Leads using this electrode:</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {LEADS.map((l) => (
              <li key={l} className={`rounded border px-2 py-1 font-mono text-[11px] ${e.leads.includes(l) ? "border-cyan text-cyan" : "border-hairline text-muted-foreground opacity-50"}`}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-hairline p-4 text-[13.5px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">10 electrodes → 12 leads</p>
          <p className="mt-2">An <strong className="text-foreground">electrode</strong> is the physical sticker. A <strong className="text-foreground">lead</strong> is a calculated viewpoint: the voltage between electrodes. The 4 limb electrodes give 6 limb leads (I, II, III bipolar; aVR, aVL, aVF augmented) — RL is only ground. Each of the 6 chest electrodes is compared with Wilson's central terminal (average of RA, LA, LL) to give V1–V6.</p>
        </div>
      </div>
    </div>
  );
}
