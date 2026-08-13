import type { ReactNode } from "react";
import { TaxonomyBadge, type TaxonomyKind } from "../TaxonomyBadge";

/**
 * A content block carries exactly ONE primary taxonomy tag.
 * The tag describes the epistemic role of the block, not its topic.
 */
export function ContentBlock({
  id,
  tag,
  title,
  lede,
  children,
}: {
  id?: string;
  tag: TaxonomyKind;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/50 pt-10 md:pt-14">
      <TaxonomyBadge kind={tag} />
      <h2 className="mt-4 text-2xl font-semibold text-foreground md:text-[2rem] md:leading-[1.15]">
        {title}
      </h2>
      {lede && (
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
      )}
      {children && <div className="mt-7">{children}</div>}
    </section>
  );
}
