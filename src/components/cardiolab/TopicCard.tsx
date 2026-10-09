import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Signal } from "lucide-react";
import { TaxonomyBadge, type TaxonomyKind } from "./TaxonomyBadge";

export type Topic = {
  title: string;
  description: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  minutes: number;
  /** Exactly one primary taxonomy tag per topic. */
  taxonomy: TaxonomyKind;
  preview: "cycle" | "failure" | "plaque" | "block" | "starling" | "murmur";
  /** Present only when a real interactive lesson exists. */
  href?:
    | "/topics/cardiac-cycle"
    | "/topics/pv-loops"
    | "/topics/atherosclerosis"
    | "/topics/heart-failure"
    | "/topics/heart-murmurs";
};

function Preview({ kind }: { kind: Topic["preview"] }) {
  const common = "h-full w-full";
  switch (kind) {
    case "cycle":
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <path
            d="M8 62c18 0 22-40 44-40s26 40 46 40 24-34 44-34 26 34 50 34"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.4"
          />
          <path
            d="M8 70c20 0 24-22 44-22s28 22 46 22 26-14 44-14 26 14 50 14"
            fill="none"
            stroke="var(--crimson)"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "failure":
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <ellipse cx="80" cy="42" rx="34" ry="26" fill="none" stroke="var(--cyan)" />
          <ellipse
            cx="132"
            cy="42"
            rx="44"
            ry="32"
            fill="none"
            stroke="var(--crimson)"
            strokeDasharray="4 4"
          />
          <path d="M20 66h160" stroke="var(--hairline)" />
        </svg>
      );
    case "plaque":
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <path d="M6 26h188M6 58h188" stroke="var(--cyan)" strokeOpacity="0.6" />
          <path
            d="M60 58c14-2 18-16 34-16s22 14 36 16z"
            fill="var(--amber)"
            fillOpacity="0.25"
            stroke="var(--amber)"
          />
        </svg>
      );
    case "block":
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <path
            d="M4 54h26l6-12 8 26 8-40 8 46 8-20h22l6-12 8 26 8-40 8 46 8-20h72"
            fill="none"
            stroke="var(--electric)"
            strokeWidth="1.3"
          />
        </svg>
      );
    case "starling":
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <path d="M16 70V10M16 70h172" stroke="var(--hairline)" />
          <path d="M16 70C70 70 110 24 188 20" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
          <path
            d="M16 70C74 70 122 44 188 44"
            fill="none"
            stroke="var(--crimson)"
            strokeOpacity="0.6"
            strokeDasharray="4 4"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <path d="M6 40h30" stroke="var(--cyan)" />
          <path
            d="M36 40c8-24 16-24 24 0s16 24 24 0"
            fill="none"
            stroke="var(--violet)"
            strokeWidth="1.3"
          />
          <path d="M84 40h20" stroke="var(--cyan)" />
          <path
            d="M104 40c6-18 14-18 20 0s14 18 20 0"
            fill="none"
            stroke="var(--violet)"
            strokeWidth="1.3"
          />
          <path d="M144 40h50" stroke="var(--cyan)" />
        </svg>
      );
  }
}

export function TopicCard({ topic }: { topic: Topic }) {
  const body = (
    <>
      <div className="mb-5 h-24 overflow-hidden rounded-lg border border-hairline bg-background/40 p-3">
        <Preview kind={topic.preview} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TaxonomyBadge kind={topic.taxonomy} />
        {!topic.href && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            In development
          </span>
        )}
      </div>

      <h3 className="text-[17px] font-semibold text-foreground">{topic.title}</h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {topic.description}
      </p>

      <footer className="mt-5 flex items-center gap-4 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Signal className="h-3.5 w-3.5 text-teal" />
          {topic.difficulty}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-teal" />
          {topic.minutes} min
        </span>
        {topic.href && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-cyan">
            Open lab
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </footer>
    </>
  );

  if (topic.href) {
    return (
      <Link
        to={topic.href}
        className="glass-panel group flex flex-col rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40"
      >
        {body}
      </Link>
    );
  }

  return (
    <article className="glass-panel flex flex-col rounded-xl p-5 opacity-80">{body}</article>
  );
}
