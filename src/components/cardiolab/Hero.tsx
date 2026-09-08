import { ArrowRight, HeartPulse } from "lucide-react";
import { HeartVisual } from "./HeartVisual";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden border-b border-border"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div className="grid-field pointer-events-none absolute inset-0 opacity-80" />
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5 lg:py-28">
        <div>
          <p className="eyebrow mb-6 inline-flex items-center gap-3"><span className="h-px w-8 bg-crimson" />Cardiovascular System</p>
          <h1 className="max-w-[12ch] text-[3rem] font-semibold leading-[0.98] text-foreground md:text-[4.8rem]">
            Master the <span className="text-cyan">Cardiovascular</span> System
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Transform complex cardiovascular concepts into visual, interactive learning
            experiences designed for high-yield USMLE preparation.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#topics"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-cyan px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Explore Cardiovascular Topics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#anatomy"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-hairline bg-surface/60 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur-md transition-colors hover:bg-surface-raised"
            >
              <HeartPulse className="h-4 w-4 text-crimson" />
              Explore the Heart
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded border border-hairline bg-border">
            {[
              ["7", "Learning stages"],
              ["240+", "High-yield concepts"],
              ["12-lead", "ECG laboratory"],
            ].map(([v, l]) => (
              <div key={l} className="bg-background/90 p-3 md:p-4">
                <dt className="telemetry-value text-lg text-cyan md:text-xl">{v}</dt>
                <dd className="mt-1 text-[10px] uppercase leading-snug text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="console-panel relative overflow-hidden p-3 md:p-5">
          <div className="telemetry-bar -mx-3 -mt-3 flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:-mx-5 md:-mt-5">
            <span className="text-crimson">Live cardiovascular model</span><span>SIM · 01</span>
          </div>
          <div className="monitor-viewport mt-3 md:mt-5">
            <HeartVisual className="mx-auto w-full max-w-[560px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
