import { useEffect, useState } from "react";
import { formatCountdown } from "../../lib/gameStatus";

/**
 * Purely presentational countdown. It ticks down locally from
 * `seconds` for realistic UI/UX, but Developer 3's backend is the
 * source of truth for whether time has actually expired — this
 * component only calls `onFinish` once for the UI transition, it
 * never decides game outcomes.
 */
export default function GameCountdown({ seconds = 0, onFinish, size = "md", className = "" }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor(seconds)));

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor(seconds)));
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          onFinish?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [remaining <= 0]);

  let tone = "text-[var(--color-ink)]";
  let label = null;
  if (remaining <= 0) {
    tone = "text-[var(--color-danger)]";
    label = "TIME'S UP";
  } else if (remaining <= 5) {
    tone = "text-[var(--color-danger)] animate-pulse-dot";
  } else if (remaining <= 15) {
    tone = "text-[var(--color-warning)]";
  }

  const sizes = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={`font-display font-semibold tabular-nums ${sizes[size]} ${tone} ${className}`}>
      {formatCountdown(remaining)}
      {label && <div className="text-xs font-sans font-medium tracking-normal mt-1">{label}</div>}
    </div>
  );
}
