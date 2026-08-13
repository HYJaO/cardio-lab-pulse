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
    <section id={id} className={`px-5 py-20 md:px-10 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-[1400px]">
        {(eyebrow || title) && (
          <header className="mb-12 max-w-2xl md:mb-16">
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="text-3xl font-semibold text-foreground md:text-[2.6rem] md:leading-[1.1]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
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
