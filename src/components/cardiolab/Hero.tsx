import { ArrowRight, HeartPulse } from "lucide-react";
import { HeartVisual } from "./HeartVisual";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border/50"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div className="grid-field pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-14 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-36">
        <div>
          <p className="eyebrow mb-6">Cardiovascular System</p>
          <h1 className="max-w-[15ch] text-[2.6rem] font-semibold leading-[1.05] text-foreground md:text-[4.2rem]">
            Master the <span className="text-gradient">Cardiovascular</span> System
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Transform complex cardiovascular concepts into visual, interactive learning
            experiences designed for high-yield USMLE preparation.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#topics"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-cyan px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Explore Cardiovascular Topics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#anatomy"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface/60 px-5 py-3 text-[14px] font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-surface-raised"
            >
              <HeartPulse className="h-4 w-4 text-crimson" />
              Explore the Heart
            </a>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-8">
            {[
              ["7", "Learning stages"],
              ["240+", "High-yield concepts"],
              ["12-lead", "ECG laboratory"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-xl text-foreground md:text-2xl">{v}</dt>
                <dd className="mt-1 text-[12px] leading-snug text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <HeartVisual className="mx-auto w-full max-w-[560px]" />
        </div>
      </div>
    </section>
  );
}
