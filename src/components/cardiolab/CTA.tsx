import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section
      className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div className="grid-field pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-6">Phase One</p>
        <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-[3rem]">
          Build Your Cardiovascular Knowledge
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          From anatomy and physiology to pathology, pharmacology, ECGs, and clinical reasoning.
        </p>
        <div className="mt-10 flex justify-center">
          <a
            href="#path"
            className="group inline-flex items-center gap-2 rounded-lg bg-cyan px-6 py-3.5 text-[14px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Start Learning
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
