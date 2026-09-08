import { Activity } from "lucide-react";

const NAV = [
  ["Cycle", "/topics/cardiac-cycle"],
  ["PV Loops", "/topics/pv-loops"],
  ["Heart Failure", "/topics/heart-failure"],
  ["Atherosclerosis", "/topics/atherosclerosis"],
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-7 px-5 md:px-10"
      >
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-hairline bg-surface-raised">
            <Activity className="h-3.5 w-3.5 text-cyan" strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-cl-pulse rounded-full border border-background bg-crimson" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-foreground">
            CARDIOLAB
          </span>
        </a>

        <ul className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map(([item, href]) => (
            <li key={item}>
              <a
                href={href}
                className="rounded px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="flex items-center gap-2 rounded border border-hairline bg-surface/70 px-3 py-1.5">
            <span className="hidden text-[12px] text-muted-foreground sm:inline">Progress</span>
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
              <span className="block h-full w-[24%] rounded-full bg-cyan" />
            </span>
            <span className="font-mono text-[11px] text-cyan">24%</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
