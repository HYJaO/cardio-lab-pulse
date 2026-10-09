import { S1_T, S2_T, type Murmur } from "@/lib/murmurs";

const N = 700;

/** Deterministic pseudo-vibration so the trace looks like a phonocardiogram. */
function jitter(i: number) {
  return 0.55 + 0.45 * Math.sin(i * 0.37) * Math.cos(i * 0.113);
}

export function tracePath(
  murmur: Murmur,
  W: number,
  H: number,
  opts: { gain?: number; clickShift?: number } = {},
) {
  const gain = opts.gain ?? 1;
  const shift = opts.clickShift ?? 0;
  const mid = H / 2;
  const freq = murmur.pitch === "low" ? 0.55 : murmur.pitch === "medium" ? 1.3 : 2.1;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const tm = t - shift;
    let amp = Math.min(1, murmur.envelope(tm) * gain);
    // shift-aware: for MVP keep the murmur ending at S2
    if (shift && t > S2_T) amp = 0;
    const s1 = Math.exp(-(((t - S1_T) / 0.008) ** 2)) * (murmur.id === "ms" ? 1 : 0.85);
    const s2 = Math.exp(-(((t - S2_T) / 0.007) ** 2)) * (murmur.id === "as" ? 0.5 : 0.75);
    let click = 0;
    for (const c of murmur.clicks) click += Math.exp(-(((t - c.t - shift) / 0.005) ** 2)) * 0.7;
    const a = Math.max(amp * jitter(i) * 0.75, s1, s2, click);
    const y = mid - a * Math.sin(i * freq) * (mid - 6);
    d += `${i ? "L" : "M"}${((t * W)).toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

export function envelopePath(murmur: Murmur, W: number, H: number, gain = 1, shift = 0) {
  const mid = H / 2;
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const a = t > S2_T && shift ? 0 : Math.min(1, murmur.envelope(t - shift) * gain);
    pts.push(`${(t * W).toFixed(1)} ${(mid - a * (mid - 6) * 0.75).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
}
