import { useState } from "react";
import { ChevronDown, ExternalLink, Microscope, ScanSearch } from "lucide-react";
import histologyAsset from "@/assets/atherosclerosis-histology.jpg.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type EvidenceStage = {
  id: "early" | "advanced" | "late";
  label: string;
  diagnosis: string;
  finding: string;
  mapStageId: string;
  mapStageLabel: string;
  position: string;
  labels: string[];
  alt: string;
};

const EVIDENCE_STAGES: EvidenceStage[] = [
  {
    id: "early",
    label: "Early",
    diagnosis: "Pathological intimal thickening",
    finding: "Extracellular lipid within a thickened intima, without true necrosis.",
    mapStageId: "ldl-entry",
    mapStageLabel: "LDL entry & retention",
    position: "center 0%",
    labels: ["Intima", "Extracellular lipid"],
    alt: "H&E-stained arterial section showing pathological intimal thickening and extracellular lipid without a necrotic core.",
  },
  {
    id: "advanced",
    label: "Advanced",
    diagnosis: "Fibrous-cap atheroma",
    finding: "A necrotic core lies beneath a thick fibrous cap.",
    mapStageId: "fibrous-plaque",
    mapStageLabel: "Fibrous plaque",
    position: "center 49%",
    labels: ["Fibrous cap", "Necrotic core"],
    alt: "H&E-stained arterial section showing a fibrous-cap atheroma with a thick fibrous cap over a necrotic core.",
  },
  {
    id: "late",
    label: "Late",
    diagnosis: "Fibrocalcific plaque",
    finding: "Prominent calcification, with or without a residual necrotic core.",
    mapStageId: "vulnerable",
    mapStageLabel: "Vulnerable plaque",
    position: "center 100%",
    labels: ["Intima", "Calcification", "Necrotic core may persist"],
    alt: "H&E-stained arterial section showing a late fibrocalcific plaque with prominent calcification.",
  },
];

const STUDY_URL = "https://doi.org/10.3389/fneur.2017.00488";
const ASSET_URL =
  "https://commons.wikimedia.org/wiki/File:Histopathology_of_progressive_atherosclerotic_lesions.jpg";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";

export function MicroscopicEvidence({
  onMapStage,
}: {
  onMapStage?: (stageId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<EvidenceStage["id"]>("early");
  const [detailOpen, setDetailOpen] = useState(false);
  const selected = EVIDENCE_STAGES.find((stage) => stage.id === selectedId) ?? EVIDENCE_STAGES[0];

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-6 border-t border-border/50 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-hairline bg-surface/50 text-cyan">
            <Microscope className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">Microscopic evidence</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">Representative H&amp;E sections</p>
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" aria-expanded={open} className="font-mono uppercase tracking-[0.1em]">
            {open ? "Hide histology" : "Show histology"}
            <ChevronDown className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none">
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface/25">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.75fr)]">
            <figure className="min-w-0 border-b border-hairline lg:border-b-0 lg:border-r">
              <div className="relative aspect-[16/7] min-h-48 overflow-hidden bg-muted sm:min-h-64">
                <img
                  src={histologyAsset.url}
                  alt={selected.alt}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: selected.position }}
                />
              </div>
              <figcaption className="border-t border-hairline px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">{selected.label} · H&amp;E</span>
                <p className="mt-1 text-[13px] font-semibold text-foreground">{selected.diagnosis}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{selected.finding}</p>
              </figcaption>
            </figure>

            <aside className="flex flex-col p-4 md:p-5" aria-label="Histology annotations">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">CardioLab labels</p>
              <ul className="mt-3 space-y-2">
                {selected.labels.map((label) => (
                  <li key={label} className="flex items-center gap-2 text-[12.5px] text-foreground">
                    <span className="h-px w-5 bg-cyan" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => onMapStage?.(selected.mapStageId)}
                >
                  Map stage: {selected.mapStageLabel}
                  <ExternalLink aria-hidden="true" />
                </Button>
                <Button size="sm" className="w-full" onClick={() => setDetailOpen(true)}>
                  <ScanSearch aria-hidden="true" />
                  Open detail
                </Button>
              </div>
            </aside>
          </div>

          <div className="grid gap-2 border-t border-hairline p-3 sm:grid-cols-3">
            {EVIDENCE_STAGES.map((stage) => {
              const active = stage.id === selected.id;
              return (
                <Button
                  key={stage.id}
                  type="button"
                  variant="outline"
                  aria-pressed={active}
                  onClick={() => setSelectedId(stage.id)}
                  className={`h-auto min-w-0 flex-col items-start whitespace-normal px-3 py-2 text-left ${active ? "border-cyan bg-cyan/10" : ""}`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">{stage.label}</span>
                  <span className="mt-1 text-[12px] leading-snug text-foreground">{stage.diagnosis}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Representative post-mortem histology; stage labels are a learning framework, not a real-time patient progression.
        </p>

        <details className="mt-3 rounded-md border border-hairline bg-surface/25 px-3 py-2 text-[11.5px] text-muted-foreground">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">Source &amp; licence</summary>
          <p className="mt-3 leading-relaxed">
            Histology: Yang WJ, Fisher M, Zheng L, et al., “Histological Characteristics of Intracranial Atherosclerosis in a Chinese Population” (2017), CC BY 4.0. Cropped and annotated by CardioLab; no endorsement implied.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            <a className="text-cyan underline-offset-4 hover:underline" href={STUDY_URL} target="_blank" rel="noreferrer">Study</a>
            <a className="text-cyan underline-offset-4 hover:underline" href={ASSET_URL} target="_blank" rel="noreferrer">Wikimedia asset</a>
            <a className="text-cyan underline-offset-4 hover:underline" href={LICENSE_URL} target="_blank" rel="noreferrer">CC BY 4.0 licence</a>
          </div>
        </details>
      </CollapsibleContent>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle>{selected.label}: {selected.diagnosis}</DialogTitle>
            <DialogDescription>{selected.finding} H&amp;E stain.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-md border border-hairline bg-muted">
            <img
              src={histologyAsset.url}
              alt={selected.alt}
              className="max-h-[65vh] w-full object-cover"
              style={{ objectPosition: selected.position }}
            />
          </div>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Representative post-mortem histology; stage labels are a learning framework, not a real-time patient progression.
          </p>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}