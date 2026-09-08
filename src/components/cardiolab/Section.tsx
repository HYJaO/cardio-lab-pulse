import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`border-b border-border px-5 py-20 md:px-10 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-[1400px]">
        {(eyebrow || title) && (
          <header className="mb-12 grid gap-4 border-b border-border pb-7 md:mb-16 md:grid-cols-[minmax(0,0.8fr)_minmax(280px,0.55fr)] md:items-end">
            <div>{eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="text-3xl font-semibold text-foreground md:text-[2.8rem] md:leading-[1.05]">
                {title}
              </h2>
            )}</div>
            {description && (
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
