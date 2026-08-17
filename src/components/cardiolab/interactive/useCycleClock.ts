import { useCallback, useEffect, useRef, useState } from "react";
import { CYCLE_MS } from "@/lib/cardiac-cycle";

export const SPEEDS = [0.25, 0.5, 1, 2] as const;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Shared cycle clock for every CardioLab physiology instrument.
 * Normalized time 0 → 1 across one cardiac cycle, with play/pause,
 * speed, scrub, nudge and restart. Respects prefers-reduced-motion.
 */
export function useCycleClock(initialSpeed = 0.5) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!prefersReducedMotion()) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / (CYCLE_MS / speed);
        setT((prev) => (prev + dt) % 1);
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, [playing, speed]);

  const nudge = useCallback((delta: number) => {
    setPlaying(false);
    setT((prev) => ((prev + delta) % 1 + 1) % 1);
  }, []);

  const restart = useCallback(() => setT(0), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  return { t, setT, playing, setPlaying, toggle, speed, setSpeed, nudge, restart };
}
