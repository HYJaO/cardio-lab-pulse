import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Signal } from "lucide-react";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";

export type TopicPageSection = {
  /** Anchor id, also used by the section rail. */
  id: string;
  /** Short label for the section rail. */
  label: string;
  content: ReactNode;
};

export type TopicPageProps = {
  module: string;
  title: string;
  subtitle: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  minutes: number;
  sections: TopicPageSection[];
};

/**
 * Universal topic template. Every CardioLab topic renders through this
 * component so the learning architecture stays identical across the
 * curriculum: header → high-yield → visualization → mechanism →
 * clinical → diagnostic → USMLE → related → active recall.
 */
export function TopicPage({
  module,
  title,
  subtitle,
  difficulty,
  minutes,
  sections,
}: TopicPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="relative overflow-hidden border-b border-border/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {module}
          </Link>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold text-foreground md:text-6xl md:leading-[1.02]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5 text-teal" />
              {difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal" />
              {minutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              Interactive lesson
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-10">
        <div className="gap-12 lg:grid lg:grid-cols-[210px_minmax(0,1fr)]">
          <nav
            aria-label="On this page"
            className="hidden lg:block"
          >
            <ul className="sticky top-24 space-y-1 border-l border-border/60 py-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[12.5px] text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-12 pt-10 md:space-y-16 md:pt-14">
            {sections.map((s) => (
              <div key={s.id}>{s.content}</div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
