import {
  Baby,
  Boxes,
  Waves,
  Microscope,
  Pill,
  Activity,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Section } from "./Section";

type Stage = { title: string; descriptor: string; progress: number; icon: LucideIcon };

const STAGES: Stage[] = [
  { title: "Embryology", descriptor: "Heart tube to four chambers", progress: 100, icon: Baby },
  { title: "Anatomy", descriptor: "Chambers, valves, coronaries", progress: 72, icon: Boxes },
  { title: "Physiology", descriptor: "Cycle, output, pressure loops", progress: 44, icon: Waves },
  { title: "Pathology", descriptor: "Failure, ischemia, lesions", progress: 18, icon: Microscope },
  { title: "Pharmacology", descriptor: "Antihypertensives, inotropes", progress: 6, icon: Pill },
  { title: "ECG", descriptor: "Rhythms, blocks, infarcts", progress: 0, icon: Activity },
  { title: "Clinical", descriptor: "Reasoning and vignettes", progress: 0, icon: Stethoscope },
];

export function LearningPath() {
  return (
    <Section
      id="path"
      eyebrow="Curriculum"
      title="Your Cardiovascular Learning Path"
      description="Seven connected stages, sequenced the way cardiovascular medicine is actually built — from the embryonic heart tube to bedside reasoning."
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[52px] hidden lg:block"
        >
          <svg viewBox="0 0 1400 90" className="h-[90px] w-full" preserveAspectRatio="none">
            <path
              d="M60 46C260 -6 460 92 700 46s440-92 640-24"
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="1.5"
            />
            <path
              d="M60 46C260 -6 460 92 700 46"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          </svg>
        </div>

        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
          {STAGES.map((stage, i) => (
            <li
              key={stage.title}
              className="glass-panel group relative rounded-xl p-4 transition-colors hover:border-cyan/40"
              style={{ marginTop: `${(i % 2 === 0 ? 0 : 34) * 1}px` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-background/50">
                  <stage.icon className="h-4 w-4 text-cyan" strokeWidth={1.8} />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">{stage.title}</h3>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                {stage.descriptor}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-cyan"
                    style={{ width: `${stage.progress}%` }}
                  />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {stage.progress}%
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
