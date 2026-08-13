import { Section } from "./Section";
import { TopicCard, type Topic } from "./TopicCard";

const TOPICS: Topic[] = [
  {
    title: "Cardiac Cycle",
    description:
      "Pressure–volume relationships across systole and diastole, mapped to heart sounds and valve events.",
    difficulty: "Foundational",
    minutes: 24,
    taxonomy: ["high-yield", "mechanism"],
    preview: "cycle",
  },
  {
    title: "Heart Failure",
    description:
      "Reduced versus preserved ejection fraction, compensatory neurohormonal loops and decompensation.",
    difficulty: "Intermediate",
    minutes: 32,
    taxonomy: ["high-yield", "classic-presentation"],
    preview: "failure",
  },
  {
    title: "Atherosclerosis",
    description:
      "Endothelial injury to fibrous cap rupture, with the plaque timeline examiners test most.",
    difficulty: "Intermediate",
    minutes: 28,
    taxonomy: ["mechanism", "clinical-pearl"],
    preview: "plaque",
  },
  {
    title: "Heart Blocks",
    description:
      "First, second and third degree conduction delay read directly from the rhythm strip.",
    difficulty: "Advanced",
    minutes: 26,
    taxonomy: ["high-yield", "usmle-trap"],
    preview: "block",
  },
  {
    title: "Starling Curve",
    description:
      "Preload, contractility and afterload shifts — and how each moves the ventricular function curve.",
    difficulty: "Foundational",
    minutes: 18,
    taxonomy: ["mechanism", "differential"],
    preview: "starling",
  },
  {
    title: "Heart Murmurs",
    description:
      "Timing, radiation and maneuvers that separate stenosis from regurgitation at the bedside.",
    difficulty: "Advanced",
    minutes: 30,
    taxonomy: ["classic-presentation", "differential"],
    preview: "murmur",
  },
];

export function HighYieldTopics() {
  return (
    <Section
      id="topics"
      eyebrow="Core Concepts"
      title="High-Yield Cardiovascular"
      description="Every concept is tagged with a consistent taxonomy so mechanism, presentation and exam traps stay visually distinct as you study."
      className="border-y border-border/50 bg-surface/25"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {TOPICS.map((t) => (
          <TopicCard key={t.title} topic={t} />
        ))}
      </div>
    </Section>
  );
}
