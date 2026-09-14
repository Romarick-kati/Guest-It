import markSrc from "../../assets/onpoint-mark.png";
import fullSrc from "../../assets/onpoint-full.png";

/**
 * The ON Point brand mark. This is a FIXED brand asset — it must look
 * identical no matter what theme (light/dark) or accent color is active.
 * Never recolor it with theme variables.
 *
 * - variant="mark"  → icon only, transparent. Reads fine on any surface,
 *   use in compact/inline spots.
 * - variant="full"  → icon + wordmark, transparent, white/blue text as
 *   designed. Only use directly on a surface that is ALWAYS dark
 *   (e.g. the splash screen), since the wordmark is white.
 * - variant="badge" → the full lockup on its own fixed dark chip, so it
 *   is safe on ANY background in ANY theme and never changes appearance
 *   when the user toggles light/dark. Use this in headers, sidebars, and
 *   any nav chrome that can appear on either a light or dark surface.
 */
export default function Logo({ variant = "mark", size = 32, animated = true, className = "" }) {
  if (variant === "badge") {
    return (
      <span
        className={`onpoint-logo-badge inline-flex items-center rounded-xl bg-[#0b0b0d] ${animated ? "onpoint-logo-animated" : ""} ${className}`}
        style={{ padding: `${size * 0.14}px ${size * 0.32}px` }}
      >
        <img
          src={fullSrc}
          alt="ON Point"
          draggable={false}
          style={{ height: size, width: "auto" }}
          className="onpoint-logo"
        />
      </span>
    );
  }

  const src = variant === "full" ? fullSrc : markSrc;
  return (
    <img
      src={src}
      alt="ON Point"
      draggable={false}
      style={{ height: size, width: "auto" }}
      className={`onpoint-logo ${animated ? "onpoint-logo-animated" : ""} ${className}`}
    />
  );
}
