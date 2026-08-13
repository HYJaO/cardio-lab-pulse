import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-5 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-hairline bg-surface-raised">
            <Activity className="h-3 w-3 text-cyan" strokeWidth={2.2} />
          </span>
          <span className="font-display text-[13px] font-semibold tracking-[0.18em]">
            CARDIOLAB
          </span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Medical Education Platform
        </p>
      </div>
    </footer>
  );
}
